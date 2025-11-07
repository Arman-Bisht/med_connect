
import React, { useState } from 'react';
import type { Case, User, VideoCallSchedule } from '../types';
import { CloseIcon, VideoCallIcon } from './IconComponents';

interface VideoCallModalProps {
  caseData: Case;
  currentUser: User;
  onClose: () => void;
  onUpdateCase: (updatedCase: Case) => void;
}

const formatDateWithTimezones = (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return "Invalid Date";
    }

    const istFormatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
    });
    
    const etFormatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/New_York',
    });

    return `${istFormatter.format(date)} (IST) / ${etFormatter.format(date)} (US-ET)`;
};


export const VideoCallModal: React.FC<VideoCallModalProps> = ({ caseData, currentUser, onClose, onUpdateCase }) => {
    const [proposedSlots, setProposedSlots] = useState<(string | undefined)[]>([undefined, undefined, undefined]);
    const [isProposing, setIsProposing] = useState(false);
    
    const handleProposeSlots = (e: React.FormEvent) => {
        e.preventDefault();
        const validSlots = proposedSlots.filter(s => s).map(s => new Date(s!));
        if (validSlots.length === 0) return;

        const newSchedule: VideoCallSchedule = {
            id: `VC-${Date.now()}`,
            requesterId: currentUser.id,
            responderId: currentUser.id === caseData.createdBy.id ? caseData.assignedTo.id : caseData.createdBy.id,
            proposedSlots: validSlots,
            status: 'Proposed',
        };

        const updatedCase: Case = {
            ...caseData,
            videoCalls: [...(caseData.videoCalls || []), newSchedule]
        };

        onUpdateCase(updatedCase);
        setIsProposing(false);
        setProposedSlots([undefined, undefined, undefined]);
    };

    const handleConfirmSlot = (scheduleId: string, slot: Date) => {
        const updatedVideoCalls = (caseData.videoCalls || []).map(vc => {
            if (vc.id === scheduleId) {
                return { ...vc, status: 'Confirmed' as 'Confirmed', confirmedSlot: slot };
            }
            return vc;
        });

        const updatedCase: Case = { ...caseData, videoCalls: updatedVideoCalls };
        onUpdateCase(updatedCase);
    };

    const handleSlotChange = (index: number, value: string) => {
        const newSlots = [...proposedSlots];
        newSlots[index] = value;
        setProposedSlots(newSlots);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-3">
                        <VideoCallIcon className="w-6 h-6 text-brand-primary" />
                        <h2 className="text-xl font-bold text-gray-800">Video Call Scheduling</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <CloseIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </header>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* List of existing schedules */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">Scheduled & Proposed Calls</h3>
                        {(caseData.videoCalls && caseData.videoCalls.length > 0) ? (
                             caseData.videoCalls.map(vc => (
                                <div key={vc.id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                {vc.status === 'Confirmed' ? 'Confirmed Call' : 'Proposed Call'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Requested by {vc.requesterId === caseData.createdBy.id ? caseData.createdBy.name : caseData.assignedTo.name}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${vc.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {vc.status}
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        {vc.status === 'Confirmed' && vc.confirmedSlot && (
                                            <div className="bg-green-100 border-l-4 border-green-500 p-3 rounded">
                                                <p className="font-semibold text-green-800">Scheduled for:</p>
                                                <p className="text-sm text-green-700 font-medium">{formatDateWithTimezones(vc.confirmedSlot)}</p>
                                            </div>
                                        )}
                                        {vc.status === 'Proposed' && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-600">Suggested times:</p>
                                                {vc.proposedSlots.map((slot, i) => (
                                                    <div key={i} className="flex flex-wrap justify-between items-center bg-white p-3 rounded-md">
                                                        <span className="text-gray-800 text-sm">{formatDateWithTimezones(slot)}</span>
                                                        {vc.responderId === currentUser.id && (
                                                            <button 
                                                                onClick={() => handleConfirmSlot(vc.id, slot)}
                                                                className="mt-2 sm:mt-0 ml-auto px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                                                                Confirm
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                             ))
                        ) : (
                            <p className="text-center text-gray-500 py-4">No video calls have been scheduled or proposed for this case yet.</p>
                        )}
                    </div>
                    
                    {/* Propose new call form */}
                    {isProposing ? (
                        <form onSubmit={handleProposeSlots} className="p-4 border-t pt-6 space-y-4">
                            <h3 className="font-semibold text-gray-700">Propose New Call Times</h3>
                            <p className="text-sm text-gray-500">Please enter times in your local timezone. The system will show it to the other user in their timezone.</p>
                            {[0, 1, 2].map(i => (
                                <div key={i}>
                                    <label htmlFor={`slot-${i}`} className="text-sm font-medium text-gray-600">Time Slot {i + 1}</label>
                                    <input 
                                        type="datetime-local" 
                                        id={`slot-${i}`}
                                        value={proposedSlots[i] || ''}
                                        onChange={e => handleSlotChange(i, e.target.value)}
                                        className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-primary"
                                        required={i === 0} // only the first is required
                                    />
                                </div>
                            ))}
                             <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsProposing(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent">Submit Proposal</button>
                            </div>
                        </form>
                    ) : (
                        <div className="border-t pt-6 text-center">
                            <button onClick={() => setIsProposing(true)} className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition">
                                Propose a New Video Call
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
