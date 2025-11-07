
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PatientsView } from './components/PatientsView';
import { FindDoctorsView } from './components/FindDoctorsView';
import { CasesView } from './components/CasesView';
import { PatientRecordModal } from './components/PatientRecordModal';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { CaseDetailView } from './components/CaseDetailView';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, addDoc, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import type { Patient, User, Case, ViewType, AuthViewType, ChatMessage } from './types';

const App: React.FC = () => {
  const [authView, setAuthView] = useState<AuthViewType>('login');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCurrentUser({ id: userDocSnap.id, ...userDocSnap.data() } as User);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // This effect handles real-time data fetching
    if (!currentUser) return;
    
    const handleError = (error: Error, collectionName: string) => {
        console.error(`Error fetching ${collectionName}:`, error);
    };

    const patientsUnsub = onSnapshot(collection(db, "patients"), (snapshot) => {
        const patientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
        setPatients(patientsData);
    }, (error) => handleError(error, 'patients'));

    const usersUnsub = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersData);
    }, (error) => handleError(error, 'users'));

    const casesUnsub = onSnapshot(collection(db, "cases"), (snapshot) => {
      const casesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate(),
          closedAt: (data.closedAt as Timestamp)?.toDate(),
          chat: data.chat?.map((msg: any) => ({
            ...msg,
            createdAt: (msg.createdAt as Timestamp)?.toDate(),
          })) || [],
          videoCalls: data.videoCalls?.map((vc: any) => ({
            ...vc,
            proposedSlots: vc.proposedSlots?.map((slot: Timestamp) => slot.toDate()) || [],
            confirmedSlot: (vc.confirmedSlot as Timestamp)?.toDate() || undefined,
          })) || [],
        } as Case;
      });
      setCases(casesData);
    }, (error) => handleError(error, 'cases'));

    return () => {
      patientsUnsub();
      usersUnsub();
      casesUnsub();
    };

  }, [currentUser]);


  const handleAuthSuccess = useCallback(() => {
    setAuthView('login');
    setCurrentView('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    signOut(auth);
    setCurrentUser(null);
    setFirebaseUser(null);
    setAuthView('login');
  }, []);

  const handleSelectPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPatient(null);
  }, []);
  
  const handleSetCurrentView = useCallback((view: ViewType) => {
      setSelectedCase(null);
      setCurrentView(view);
  }, []);

  const handleCreateCase = useCallback(async (patient: Patient, doctor: User, summary: string) => {
    if (!currentUser) return;

    const newChatMessage: ChatMessage = {
        id: `M-${Date.now()}`,
        senderId: currentUser.id,
        content: `Case created for ${patient.name}. Summary: ${summary}`,
        createdAt: new Date(),
    };

    const newCaseForFirestore = {
      patient,
      createdBy: currentUser,
      assignedTo: doctor,
      createdAt: Timestamp.now(),
      status: 'Assigned',
      summary,
      chat: [{ ...newChatMessage, createdAt: Timestamp.fromDate(newChatMessage.createdAt) }]
    };
    await addDoc(collection(db, 'cases'), newCaseForFirestore);
    
    handleCloseModal();
    setCurrentView('cases');
  }, [currentUser, handleCloseModal]);

 const handleUpdateCase = useCallback(async (updatedCase: Case) => {
    const caseRef = doc(db, 'cases', updatedCase.id);
    const caseToUpdate = {
        ...updatedCase,
        createdAt: Timestamp.fromDate(updatedCase.createdAt),
        closedAt: updatedCase.closedAt ? Timestamp.fromDate(updatedCase.closedAt) : undefined,
        chat: updatedCase.chat.map(msg => ({
            ...msg,
            createdAt: msg.createdAt instanceof Date ? Timestamp.fromDate(msg.createdAt) : msg.createdAt,
        })),
        videoCalls: updatedCase.videoCalls?.map(vc => ({
            ...vc,
            proposedSlots: vc.proposedSlots.map(slot => slot instanceof Date ? Timestamp.fromDate(slot) : slot),
            confirmedSlot: vc.confirmedSlot && vc.confirmedSlot instanceof Date ? Timestamp.fromDate(vc.confirmedSlot) : vc.confirmedSlot,
        })),
    };
    delete (caseToUpdate as any).id;
    await updateDoc(caseRef, caseToUpdate);
    
    // Also update the selectedCase if it's the one being changed
    setSelectedCase(currentSelectedCase => {
        if (currentSelectedCase && currentSelectedCase.id === updatedCase.id) {
            return updatedCase;
        }
        return currentSelectedCase;
    });
}, []);


  const indianDoctors = useMemo(() => users.filter(u => u.country === 'India'), [users]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const renderView = () => {
    if (selectedCase && currentUser) {
        return <CaseDetailView 
            caseData={selectedCase} 
            currentUser={currentUser}
            onClose={() => setSelectedCase(null)}
            onUpdateCase={handleUpdateCase}
        />
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
                  user={currentUser}
                  patientsCount={patients.length} 
                  doctorsCount={indianDoctors.length} 
                  cases={cases} 
                  onSelectCase={setSelectedCase}
                />;
      case 'patients':
        return <PatientsView patients={patients} onSelectPatient={handleSelectPatient} />;
      case 'doctors':
        return <FindDoctorsView doctors={indianDoctors} />;
      case 'cases':
        return <CasesView cases={cases} onSelectCase={setSelectedCase} />;
      default:
        return <Dashboard 
                  user={currentUser}
                  patientsCount={patients.length} 
                  doctorsCount={indianDoctors.length} 
                  cases={cases} 
                  onSelectCase={setSelectedCase}
                />;
    }
  };

  if (!firebaseUser) {
    if (authView === 'login') {
      return <LoginPage onLoginSuccess={handleAuthSuccess} onSwitchToSignUp={() => setAuthView('signup')} />;
    }
    return <SignUpPage onSignUpSuccess={handleAuthSuccess} onSwitchToLogin={() => setAuthView('login')} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={handleSetCurrentView}
        user={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-6 sm:p-8 md:p-10 overflow-y-auto">
        {renderView()}
      </main>
      {selectedPatient && (
        <PatientRecordModal 
          patient={selectedPatient} 
          doctors={indianDoctors}
          onClose={handleCloseModal}
          onCreateCase={handleCreateCase}
        />
      )}
    </div>
  );
};

export default App;
