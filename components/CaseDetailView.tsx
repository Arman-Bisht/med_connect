
import React, { useState, useRef, useEffect } from 'react';
import type { Case, User, ChatMessage, CaseStatus, Attachment } from '../types';
import { CloseIcon, SendIcon, VideoCallIcon, ArchiveBoxIcon, PaperClipIcon, PhotoIcon, DocumentIcon } from './IconComponents';
import { VideoCallModal } from './VideoCallModal';
import { db } from '../services/firebase';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';


interface CaseDetailViewProps {
  caseData: Case;
  currentUser: User;
  onClose: () => void;
  onUpdateCase: (updatedCase: Case) => void;
}

const ChatBubble: React.FC<{ message: ChatMessage; sender?: User }> = ({ message, sender }) => {
    const isOwnMessage = message.isOwnMessage;
    const { attachment } = message;
    
    if (!sender) {
        return null; // Don't render if sender is not found
    }

    return (
        <div className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            {!isOwnMessage && (
                 <img src={sender.profileImageUrl} alt={sender.name} className="w-8 h-8 rounded-full" />
            )}
            <div className={`px-4 py-2 rounded-2xl max-w-sm md:max-w-md ${isOwnMessage ? 'bg-brand-primary text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                {attachment && (
                    <div className="mb-2">
                        {attachment.type === 'image' ? (
                            <img src={attachment.url} alt={attachment.name} className="rounded-lg max-w-xs max-h-64 object-cover cursor-pointer" onClick={() => window.open(attachment.url)} />
                        ) : (
                            <a href={attachment.url} download={attachment.name} className={`p-3 rounded-lg flex items-center gap-3 transition-colors ${
                                isOwnMessage ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                            }`}>
                                <PaperClipIcon className={`w-6 h-6 flex-shrink-0 ${isOwnMessage ? 'text-white' : 'text-gray-700'}`} />
                                <div className="overflow-hidden">
                                    <p className={`font-semibold text-sm truncate ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>{attachment.name}</p>
                                    <p className={`text-xs ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                                        {(attachment.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </a>
                        )}
                    </div>
                )}
                {message.content && <p className="text-sm" style={{overflowWrap: 'break-word'}}>{message.content}</p>}
                 <p className={`text-xs mt-1 text-right ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>{new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
             {isOwnMessage && (
                 <img src={sender.profileImageUrl} alt={sender.name} className="w-8 h-8 rounded-full" />
            )}
        </div>
    );
};

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({ caseData, currentUser, onClose, onUpdateCase }) => {
    const [newMessage, setNewMessage] = useState('');
    const [attachmentPreview, setAttachmentPreview] = useState<Attachment | null>(null);
    const [isScheduling, setIsScheduling] = useState(false);
    const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachmentMenuRef = useRef<HTMLDivElement>(null);
    
    const participants = {
        [caseData.createdBy.id]: caseData.createdBy,
        [caseData.assignedTo.id]: caseData.assignedTo,
        [currentUser.id]: currentUser, // Ensure current user is always available for rendering messages
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [caseData.chat]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
                setIsAttachmentMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [attachmentMenuRef]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const reader = new FileReader();
        reader.onload = (event) => {
            setAttachmentPreview({
                name: file.name,
                url: event.target?.result as string,
                type: isImage ? 'image' : 'file',
                size: file.size,
            });
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Allow selecting the same file again
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' && !attachmentPreview) return;

        const newChatMessage: ChatMessage = {
            id: `M-${Date.now()}`,
            senderId: currentUser.id,
            content: newMessage,
            createdAt: new Date(),
            attachment: attachmentPreview || undefined,
        };
        
        const messageForFirestore = {
            ...newChatMessage,
            createdAt: Timestamp.fromDate(newChatMessage.createdAt),
        };
        const caseRef = doc(db, 'cases', caseData.id);
        try {
            await updateDoc(caseRef, {
                chat: arrayUnion(messageForFirestore),
                status: 'In Progress'
            });
            // State will be updated by the onSnapshot listener in App.tsx
        } catch (error) {
            console.error("Error sending message:", error);
        }

        setNewMessage('');
        setAttachmentPreview(null);
    };


    const handleStatusChange = (newStatus: CaseStatus) => {
        const updatedCase: Case = {
            ...caseData,
            status: newStatus,
            closedAt: newStatus === 'Closed' ? new Date() : undefined
        };
        onUpdateCase(updatedCase);
    };

    const isCaseActive = caseData.status !== 'Closed' && caseData.status !== 'Archived';
    const isIndianDoctor = currentUser.country === 'India';
    const isUSDoctor = currentUser.country === 'USA';

    const renderActionButtons = () => {
        if (!isCaseActive) return null;
        
        return (
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setIsScheduling(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg shadow-sm hover:bg-blue-600 transition-colors"
                    title="Request Video Call"
                >
                    <VideoCallIcon className="w-5 h-5"/>
                </button>
                
                {isIndianDoctor && (caseData.status === 'Assigned' || caseData.status === 'In Progress') && (
                    <button
                        onClick={() => handleStatusChange('Pending Review')}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-lg shadow-sm hover:bg-yellow-600 transition-colors"
                    >
                       <ArchiveBoxIcon className="w-5 h-5" />
                       <span>Mark as Ready for Review</span>
                    </button>
                )}
                {isUSDoctor && caseData.status === 'Pending Review' && (
                     <button
                        onClick={() => handleStatusChange('Closed')}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 transition-colors"
                    >
                        <ArchiveBoxIcon className="w-5 h-5" />
                        <span>Accept & Close Case</span>
                    </button>
                )}
            </div>
        )
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-2xl flex flex-col h-full max-h-[calc(100vh-80px)] overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-gray-800 truncate">Case: {caseData.patient.name}</h2>
                        <p className="text-sm text-gray-500">
                            Status: <span className="font-semibold text-brand-primary">{caseData.status}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 ml-4">
                        {renderActionButtons()}
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <CloseIcon className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </header>

                <div className="flex-grow grid md:grid-cols-3 overflow-hidden">
                    {/* Left Panel: Case Details */}
                    <div className="md:col-span-1 border-r p-6 overflow-y-auto space-y-6">
                        <div>
                            <h3 className="font-bold text-lg text-brand-secondary mb-3">Patient Details</h3>
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div className="text-gray-500 font-medium">Name</div>
                                    <div className="font-semibold text-gray-900">{caseData.patient.name}</div>
                                    <div className="text-gray-500 font-medium">Age</div>
                                    <div className="font-semibold text-gray-900">{caseData.patient.age}</div>
                                    <div className="text-gray-500 font-medium">Gender</div>
                                    <div className="font-semibold text-gray-900">{caseData.patient.gender}</div>
                                    <div className="text-gray-500 font-medium">Blood Type</div>
                                    <div className="font-semibold text-gray-900">
                                        <span className="font-mono text-xs bg-red-100 text-red-800 px-2 py-1 rounded">{caseData.patient.bloodType}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500 font-medium">Medical History</div>
                                    <ul className="list-disc list-inside mt-1 text-gray-900">
                                        {caseData.patient.medicalHistory.map(h => <li key={h}>{h}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <div className="text-gray-500 font-medium">Current Medications</div>
                                    <ul className="list-disc list-inside mt-1 text-gray-900">
                                        {caseData.patient.currentMedications.map(m => <li key={m}>{m}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-bold text-lg text-brand-secondary mb-2">Participants</h3>
                            <div className="space-y-3">
                                {[caseData.createdBy, caseData.assignedTo].map(p => (
                                    <div key={p.id} className="flex items-center gap-3">
                                        <img src={p.profileImageUrl} alt={p.name} className="w-10 h-10 rounded-full"/>
                                        <div>
                                            <p className="font-semibold text-gray-800">{p.name}</p>
                                            <p className="text-sm text-gray-500">{p.specialty}, {p.country}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h3 className="font-bold text-lg text-brand-secondary mb-2">AI Summary</h3>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border-l-4 border-brand-accent italic">{caseData.summary}</p>
                        </div>
                    </div>

                    {/* Right Panel: Chat */}
                    <div className="md:col-span-2 flex flex-col h-full bg-gray-100">
                        <div className="flex-grow p-6 space-y-4 overflow-y-auto">
                            {caseData.chat.map(msg => (
                               <ChatBubble key={msg.id} message={{...msg, isOwnMessage: msg.senderId === currentUser.id}} sender={participants[msg.senderId]} />
                            ))}
                             <div ref={chatEndRef} />
                        </div>
                        {isCaseActive ? (
                            <div className="bg-white border-t flex-shrink-0">
                                {attachmentPreview && (
                                    <div className="p-3 border-b border-gray-200">
                                        <div className="bg-gray-100 p-2 rounded-lg flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {attachmentPreview.type === 'image' ? <PhotoIcon className="w-5 h-5 text-gray-600 flex-shrink-0"/> : <PaperClipIcon className="w-5 h-5 text-gray-600 flex-shrink-0"/>}
                                                <span className="truncate text-gray-700 font-medium">{attachmentPreview.name}</span>
                                            </div>
                                            <button type="button" onClick={() => setAttachmentPreview(null)} className="p-1 rounded-full text-gray-500 hover:bg-gray-300 hover:text-gray-700">
                                                <CloseIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-4">
                                    <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                                    
                                    <div className="relative" ref={attachmentMenuRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsAttachmentMenuOpen(prev => !prev)}
                                            className="p-2 text-gray-500 hover:text-brand-primary rounded-full hover:bg-gray-100 transition-colors"
                                            title="Attach file or photo"
                                        >
                                            <PaperClipIcon className="w-6 h-6" />
                                        </button>
                                        {isAttachmentMenuOpen && (
                                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10 overflow-hidden animate-fade-in-up">
                                                <button
                                                    type="button"
                                                    onClick={() => { imageInputRef.current?.click(); setIsAttachmentMenuOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    <PhotoIcon className="w-5 h-5 text-gray-500" />
                                                    <span>Photo</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { fileInputRef.current?.click(); setIsAttachmentMenuOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    <DocumentIcon className="w-5 h-5 text-gray-500" />
                                                    <span>File</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-grow px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-gray-800 placeholder-gray-500"
                                    />
                                    <button type="submit" className="p-3 bg-brand-primary text-white rounded-full hover:bg-brand-accent transition-colors disabled:bg-gray-400 disabled:opacity-50" disabled={!newMessage.trim() && !attachmentPreview}>
                                       <SendIcon className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-200 text-center text-gray-600 font-semibold">
                                This case is closed. The chat is read-only.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isScheduling && (
                <VideoCallModal
                    caseData={caseData}
                    currentUser={currentUser}
                    onClose={() => setIsScheduling(false)}
                    onUpdateCase={onUpdateCase}
                />
            )}
        </>
    );
};
