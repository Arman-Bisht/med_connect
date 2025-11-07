
import React from 'react';
import type { Case, CaseStatus } from '../types';

interface CasesViewProps {
  cases: Case[];
  onSelectCase: (selectedCase: Case) => void;
}

const StatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
  const colorClasses = {
    'Assigned': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-indigo-100 text-indigo-800',
    'Pending Review': 'bg-yellow-100 text-yellow-800',
    'Closed': 'bg-green-100 text-green-800',
    'Archived': 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${colorClasses[status]}`}>
      {status}
    </span>
  );
};

export const CasesView: React.FC<CasesViewProps> = ({ cases, onSelectCase }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Active & Past Cases</h1>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Patient Name</th>
                <th scope="col" className="px-6 py-3">Specialist Assigned</th>
                <th scope="col" className="px-6 py-3">Specialty</th>
                <th scope="col" className="px-6 py-3">Date Created</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.patient.name}</td>
                  <td className="px-6 py-4">{c.assignedTo.name}</td>
                  <td className="px-6 py-4">{c.assignedTo.specialty}</td>
                  <td className="px-6 py-4">{c.createdAt.toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-4">
                     <button 
                      onClick={() => onSelectCase(c)}
                      className="font-medium text-brand-primary hover:underline"
                    >
                      View Case & Chat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cases.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                <p>No cases have been created yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
