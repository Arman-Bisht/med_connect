
export enum Specialty {
  CARDIOLOGY = 'Cardiology',
  NEUROLOGY = 'Neurology',
  ONCOLOGY = 'Oncology',
  ORTHOPEDICS = 'Orthopedics',
  PEDIATRICS = 'Pediatrics',
  RADIOLOGY = 'Radiology',
  PATHOLOGY = 'Pathology',
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: string;
  medicalHistory: string[];
  currentMedications: string[];
  doctorNotes: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  specialty: Specialty;
  country: 'USA' | 'India';
  profileImageUrl: string;
  experience: number;
  availability: 'Available' | 'Busy';
  bio?: string;
  // Potentially other fields from signup
}

// Doctor is now a User from India
export type Doctor = User;

export type CaseStatus = 'Assigned' | 'In Progress' | 'Pending Review' | 'Closed' | 'Archived';

export interface Attachment {
  name: string;
  url: string; // For images, this will be a data URL. For other files, it can be a blob URL or similar.
  type: 'image' | 'file';
  size: number; // in bytes
}

export interface ChatMessage {
    id: string;
    senderId: string;
    content: string; // Can be an empty string if it's just an attachment
    createdAt: Date;
    isOwnMessage?: boolean; // UI helper property
    attachment?: Attachment;
}

export type VideoCallScheduleStatus = 'Proposed' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface VideoCallSchedule {
  id: string;
  requesterId: string;
  responderId: string;
  proposedSlots: Date[];
  confirmedSlot?: Date;
  status: VideoCallScheduleStatus;
}


export interface Case {
  id: string;
  patient: Patient;
  createdBy: User; // US Doctor
  assignedTo: Doctor; // Indian Doctor
  createdAt: Date;
  status: CaseStatus;
  summary: string;
  chat: ChatMessage[];
  videoCalls?: VideoCallSchedule[];
  finalReportUrl?: string;
  closedAt?: Date;
}

export interface PreferredNetwork {
    usDoctorId: string;
    indianDoctorId: string;
}

export type ViewType = 'dashboard' | 'patients' | 'doctors' | 'cases';
export type AuthViewType = 'login' | 'signup';