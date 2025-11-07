
import React from 'react';
import { PatientsIcon, DoctorsIcon, CasesIcon } from './IconComponents';
import type { Case, CaseStatus, User } from '../types';

interface DashboardProps {
  patientsCount: number;
  doctorsCount: number;
  cases: Case[];
  user: User | null;
  onSelectCase: (selectedCase: Case) => void;
}

const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: number;
    color: string;
}> = ({ icon, title, value, color }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md border-t-4 ${color} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
        <div className="flex items-center space-x-4">
            {icon}
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

const getStatusStyles = (status: CaseStatus) => {
    switch (status) {
        case 'Closed':
        case 'Archived':
             return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500', fill: 'bg-green-500' };
        case 'Pending Review': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500', fill: 'bg-yellow-500' };
        case 'Assigned':
        case 'In Progress':
             return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500', fill: 'bg-blue-500' };
        default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500', fill: 'bg-gray-500' };
    }
};

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

export const Dashboard: React.FC<DashboardProps> = ({ patientsCount, doctorsCount, cases, user, onSelectCase }) => {
    
    const statusCounts = cases.reduce((acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
    }, {} as Record<CaseStatus, number>);

    const recentActivities = [...cases].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Welcome Back, {user?.name || 'Doctor'}!</h1>
                <p className="text-gray-600 mt-1">Here's your activity overview on MedConnect Global.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                    icon={<PatientsIcon className="w-10 h-10 text-blue-500" />} 
                    title="Patients Under Care" 
                    value={patientsCount}
                    color="border-blue-500"
                />
                <StatCard 
                    icon={<DoctorsIcon className="w-10 h-10 text-green-500" />} 
                    title="Indian Specialists" 
                    value={doctorsCount}
                    color="border-green-500"
                />
                <StatCard 
                    icon={<CasesIcon className="w-10 h-10 text-purple-500" />} 
                    title="Active Cases" 
                    value={cases.length}
                    color="border-purple-500"
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                    {recentActivities.length > 0 ? (
                        <ul className="space-y-2">
                            {recentActivities.map(c => {
                                const statusStyle = getStatusStyles(c.status);
                                return (
                                    <li key={c.id}>
                                        <button onClick={() => onSelectCase(c)} className="w-full text-left flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className={`w-2 h-10 rounded-full ${statusStyle.fill}`}></div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-700">
                                                    Case for <span className="text-brand-primary">{c.patient.name}</span> assigned to <span className="text-brand-primary">{c.assignedTo.name}</span>
                                                </p>
                                                <p className="text-sm text-gray-500">{timeSince(c.createdAt)}</p>
                                            </div>
                                            <div>
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                         <div className="text-center py-10">
                            <CasesIcon className="w-16 h-16 mx-auto text-gray-300" />
                            <h3 className="mt-2 text-lg font-semibold text-gray-800">No Recent Activity</h3>
                            <p className="mt-1 text-sm text-gray-500">Create a new case to get started.</p>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Case Status Overview</h2>
                    <div className="space-y-4">
                        {(Object.keys(statusCounts) as CaseStatus[]).length > 0 ? (Object.keys(statusCounts) as CaseStatus[]).map(status => {
                             const statusStyle = getStatusStyles(status);
                             const count = statusCounts[status] || 0;
                             const percentage = cases.length > 0 ? (count / cases.length) * 100 : 0;
                             return (
                                 <div key={status}>
                                     <div className="flex justify-between mb-1">
                                         <span className={`text-sm font-medium ${statusStyle.text}`}>{status}</span>
                                         <span className={`text-sm font-medium ${statusStyle.text}`}>{count}</span>
                                     </div>
                                     <div className="w-full bg-gray-200 rounded-full h-2.5">
                                         <div className={`${statusStyle.fill} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                     </div>
                                 </div>
                             );
                        }) : (
                            <p className="text-sm text-gray-500 text-center py-8">No cases to show status.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
