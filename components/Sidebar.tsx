
import React from 'react';
import type { ViewType, User } from '../types';
import { DashboardIcon, PatientsIcon, DoctorsIcon, CasesIcon, LogoIcon, LogoutIcon } from './IconComponents';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  user: User | null;
  onLogout: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 transform rounded-lg ${
      isActive
        ? 'bg-brand-accent text-white'
        : 'text-gray-300 hover:bg-brand-secondary hover:text-white'
    }`}
  >
    {icon}
    <span className="mx-4">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, user, onLogout }) => {
  const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
    { id: 'patients', label: 'My Patients', icon: <PatientsIcon className="w-5 h-5" /> },
    { id: 'doctors', label: 'Find Specialists', icon: <DoctorsIcon className="w-5 h-5" /> },
    { id: 'cases', label: 'Active Cases', icon: <CasesIcon className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen px-4 py-8 bg-brand-secondary overflow-y-auto border-r rtl:border-r-0 rtl:border-l">
      <div className="flex items-center justify-center mb-8">
        <LogoIcon className="w-8 h-8 text-white" />
        <h2 className="ml-2 text-2xl font-semibold text-white">MedConnect</h2>
      </div>

      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav className="flex-grow">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={currentView === item.id}
              onClick={() => setCurrentView(item.id)}
            />
          ))}
        </nav>
        
        <div className="border-t border-gray-700 pt-4 mt-4">
          <div className="px-2 py-2">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            {user?.specialty && user?.country && (
              <p className="text-xs text-gray-400 truncate mt-1">{user.specialty}, {user.country}</p>
            )}
          </div>
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
          >
            <LogoutIcon className="w-5 h-5" />
            <span className="mx-4">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
