
import React, { useState } from 'react';
import { LogoIcon, ChevronDownIcon, ChevronUpIcon } from './IconComponents';
import type { User, Specialty } from '../types';
import { Specialty as SpecialtyEnum } from '../types';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


interface SignUpPageProps {
  onSignUpSuccess: () => void;
  onSwitchToLogin: () => void;
}

// Helper component for form inputs
const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div>
    <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">{props.label}</label>
    <input {...props} className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
  </div>
);

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, children: React.ReactNode }) => (
  <div>
    <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">{props.label}</label>
    <select {...props} className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
        {props.children}
    </select>
  </div>
);

const CollapsibleSection: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }> = ({ title, isOpen, onToggle, children }) => (
    <div className="border border-gray-200 rounded-lg">
        <button type="button" onClick={onToggle} className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-t-lg transition">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {isOpen ? <ChevronUpIcon className="w-6 h-6 text-gray-600" /> : <ChevronDownIcon className="w-6 h-6 text-gray-600" />}
        </button>
        {isOpen && <div className="p-6 border-t border-gray-200 space-y-4">{children}</div>}
    </div>
);

export const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUpSuccess, onSwitchToLogin }) => {
    // State for collapsible sections
    const [openSection, setOpenSection] = useState<'verification' | 'profile' | null>('profile');

    // Account Info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [country, setCountry] = useState<'USA' | 'India' | ''>('');

    // Verification Details
    const [primarySpecialty, setPrimarySpecialty] = useState<Specialty>(SpecialtyEnum.RADIOLOGY);
    
    // Professional Background
    const [bio, setBio] = useState('');
    const [experience, setExperience] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }

        // Enforce password complexity
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters and contain one letter, one number, and one special character (e.g., @, $, !, *, #, ?, &).');
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            const newUserProfile: Omit<User, 'id'> = {
                name: `Dr. ${name}`,
                email,
                country: country as 'USA' | 'India',
                specialty: primarySpecialty,
                bio,
                experience: parseInt(experience, 10) || 5,
                availability: 'Available',
                profileImageUrl: `https://picsum.photos/seed/${firebaseUser.uid}/200/200`
            };
            
            // Create a document in the 'users' collection with the UID as the document ID
            await setDoc(doc(db, "users", firebaseUser.uid), newUserProfile);
            
            onSignUpSuccess();

        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                setError('This email address is already in use.');
            } else if (error.code === 'auth/weak-password') {
                setError('The password is too weak. It should be at least 6 characters.');
            } else {
                setError('An unexpected error occurred during sign up.');
            }
            console.error("Firebase signup error:", error);
        }
        setIsLoading(false);
    };

    const specialties = Object.values(SpecialtyEnum);
    
    const toggleSection = (section: 'verification' | 'profile') => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className="min-h-screen bg-brand-light flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-fade-in">
                <div className="flex flex-col items-center">
                    <LogoIcon className="w-12 h-12 text-brand-primary" />
                    <h2 className="mt-4 text-center text-3xl font-extrabold text-brand-secondary">Create Your Professional Account</h2>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* --- Account Information --- */}
                    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Full Name" id="name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
                            <FormInput label="Email Address" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
                            <FormInput label="Password" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                            <FormInput label="Confirm Password" id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
                            <FormSelect label="Country" id="country" value={country} onChange={e => setCountry(e.target.value as 'USA' | 'India' | '')} required>
                                <option value="" disabled>Select your country</option>
                                <option value="USA">United States</option>
                                <option value="India">India</option>
                            </FormSelect>
                             <FormSelect label="Primary Medical Specialty" id="specialty" value={primarySpecialty} onChange={e => setPrimarySpecialty(e.target.value as Specialty)} required>
                                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                            </FormSelect>
                        </div>
                    </div>
                    
                    {country && (
                        <>
                            {/* --- Professional Background --- */}
                            <CollapsibleSection title="Professional Background (Optional)" isOpen={openSection === 'profile'} onToggle={() => toggleSection('profile')}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput label="Years of Experience" id="experience" type="number" value={experience} onChange={e => setExperience(e.target.value)} placeholder="10" />
                                    <div className="md:col-span-2">
                                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Brief Professional Bio</label>
                                        <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={4} className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="A short paragraph describing your experience..."></textarea>
                                    </div>
                                </div>
                            </CollapsibleSection>
                        </>
                    )}

                    {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}

                    <div>
                        <button type="submit" disabled={!country || isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-primary hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button onClick={onSwitchToLogin} className="font-medium text-brand-primary hover:text-brand-accent">Sign in</button>
                </p>
            </div>
        </div>
    );
};
