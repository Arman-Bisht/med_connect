
import React, { useState } from 'react';
import type { User, Specialty } from '../types';
import { Specialty as SpecialtyEnum } from '../types';
import { ChevronDownIcon } from './IconComponents';


interface FindDoctorsViewProps {
  doctors: User[];
}

const DoctorCard: React.FC<{ doctor: User }> = ({ doctor }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300">
        <img src={doctor.profileImageUrl} alt={`Dr. ${doctor.name}`} className="w-24 h-24 rounded-full mb-4 ring-4 ring-offset-2 ring-brand-primary" />
        <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
        <p className="text-brand-primary font-semibold">{doctor.specialty}</p>
        <p className="text-gray-500 text-sm mt-1">{doctor.experience} years of experience</p>
        <div className="mt-4 flex items-center space-x-2">
            <span className={`h-3 w-3 rounded-full ${doctor.availability === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600">{doctor.availability}</span>
        </div>
    </div>
);


export const FindDoctorsView: React.FC<FindDoctorsViewProps> = ({ doctors }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | 'All'>('All');

  const filteredDoctors = selectedSpecialty === 'All'
    ? doctors
    : doctors.filter(d => d.specialty === selectedSpecialty);

  const specialties = Object.values(SpecialtyEnum);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">Find a Specialist in India</h1>
          <div className="relative">
              <select 
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value as Specialty | 'All')}
                className="appearance-none w-full sm:w-48 bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-brand-primary"
              >
                <option value="All">All Specialties</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="w-4 h-4" />
              </div>
          </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredDoctors.map(doctor => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
        {filteredDoctors.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-md">
                <p className="text-gray-500">No doctors found for the selected specialty.</p>
            </div>
        )}
      </div>
    </div>
  );
};
