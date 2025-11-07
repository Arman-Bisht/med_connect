
import React, { useState, useCallback } from 'react';
import type { Patient, User } from '../types';
import { summarizePatientRecord } from '../services/geminiService';
import { CloseIcon, SparklesIcon } from './IconComponents';

interface PatientRecordModalProps {
  patient: Patient;
  doctors: User[];
  onClose: () => void;
  onCreateCase: (patient: Patient, doctor: User, summary: string) => void;
}

const RecordDetail: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <h4 className="text-sm font-semibold text-gray-500 uppercase">{label}</h4>
        <div className="text-gray-800 mt-1">{value}</div>
    </div>
);

export const PatientRecordModal: React.FC<PatientRecordModalProps> = ({ patient, doctors, onClose, onCreateCase }) => {
    const [summary, setSummary] = useState<string>('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [error, setError] = useState<string>('');
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    
    const handleGenerateSummary = useCallback(async () => {
        setIsLoadingSummary(true);
        setError('');
        try {
            const result = await summarizePatientRecord(patient);
            setSummary(result);
            if(result.startsWith("Error:")) {
                setError(result);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoadingSummary(false);
        }
    }, [patient]);

    const handleShare = () => {
        const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
        if (selectedDoctor && summary) {
            onCreateCase(patient, selectedDoctor, summary);
        } else {
            setError("Please select a doctor to share with and ensure a summary is generated.");
        }
    };

    const availableDoctors = doctors.filter(d => d.availability === 'Available' && d.country === 'India');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Patient Record: {patient.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <CloseIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </header>

                <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Patient Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-brand-primary border-b pb-2 mb-4">Patient Information</h3>
                        <RecordDetail label="Age" value={patient.age} />
                        <RecordDetail label="Gender" value={patient.gender} />
                        <RecordDetail label="Blood Type" value={<span className="font-mono text-sm bg-red-100 text-red-800 px-2 py-1 rounded">{patient.bloodType}</span>} />
                        <RecordDetail label="Medical History" value={<ul className="list-disc list-inside">{patient.medicalHistory.map(h => <li key={h}>{h}</li>)}</ul>} />
                        <RecordDetail label="Current Medications" value={<ul className="list-disc list-inside">{patient.currentMedications.map(m => <li key={m}>{m}</li>)}</ul>} />
                        <RecordDetail label="Doctor's Notes" value={<p className="text-gray-700 italic bg-gray-50 p-3 rounded-md border-l-4 border-brand-accent">{patient.doctorNotes}</p>} />
                    </div>

                    {/* AI Summary and Sharing Section */}
                    <div className="space-y-4">
                         <h3 className="text-lg font-bold text-brand-primary border-b pb-2 mb-4">Consultation Details</h3>
                        {!summary && !isLoadingSummary && (
                             <button onClick={handleGenerateSummary} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300">
                                <SparklesIcon className="w-5 h-5" />
                                Generate AI Summary for Specialist
                            </button>
                        )}
                        {isLoadingSummary && (
                            <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                                <p className="ml-3 text-gray-600">Generating summary...</p>
                            </div>
                        )}
                        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-sm">{error}</p>}
                        {summary && !error && (
                            <div className="space-y-4">
                                <RecordDetail label="AI-Generated Summary" value={
                                    <textarea readOnly value={summary} className="w-full h-48 p-2 border rounded-md bg-gray-50 text-sm font-mono" />
                                } />

                                <select
                                    value={selectedDoctorId}
                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-primary"
                                >
                                    <option value="" disabled>-- Select a Specialist --</option>
                                    {availableDoctors.map(doc => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.name} ({doc.specialty})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                    <button 
                        onClick={handleShare}
                        disabled={!summary || !selectedDoctorId || isLoadingSummary}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Create Case & Share
                    </button>
                </footer>
            </div>
        </div>
    );
};
