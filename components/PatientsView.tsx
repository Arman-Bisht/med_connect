
import React from 'react';
import type { Patient } from '../types';

interface PatientsViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({ patients, onSelectPatient }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Patients</h1>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Patient Name</th>
                <th scope="col" className="px-6 py-3">Age</th>
                <th scope="col" className="px-6 py-3">Gender</th>
                <th scope="col" className="px-6 py-3">Blood Type</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{patient.name}</td>
                  <td className="px-6 py-4">{patient.age}</td>
                  <td className="px-6 py-4">{patient.gender}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-red-100 text-red-800 px-2 py-1 rounded">{patient.bloodType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onSelectPatient(patient)}
                      className="font-medium text-brand-primary hover:underline"
                    >
                      View & Share Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
