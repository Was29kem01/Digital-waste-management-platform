import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AvatarChip from './AvatarChip';
import { Bell, UserCircle, LogOut, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function DashboardHeader({ title, user }: { title: string, user: { name: string, role: string, branchName?: string, email?: string } }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-5 border-b relative z-[9999] transition-colors duration-300 ${isDarkMode ? 'border-[#2C2C2C]' : 'border-[#E4DDCE]/80'}`}>
      <div>
        <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-[#7A8272]'}`}>
          <span className={`font-bold ${isDarkMode ? 'text-[#B2FF3B]' : 'text-[#C4693C]'}`}>EcoLink OS</span>
          <span>/</span>
          <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#2F4B3C]'}`}>{user.role.replace('_', ' ')}</span>
        </div>
        <h1 className={`text-2xl md:text-3xl font-fraunces font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#21261F]'}`}>{title}</h1>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
        
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className={`relative p-2.5 rounded-xl transition-all shadow-xs border ${isDarkMode ? 'bg-[#1A1A1A] border-[#2C2C2C] text-gray-400 hover:text-white hover:border-gray-500' : 'bg-white border-[#E4DDCE] text-[#7A8272] hover:text-[#2F4B3C] hover:border-[#2F4B3C]/40'}`}
          title="Toggle Light/Dark Mode"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-xl transition-all shadow-xs border ${isDarkMode ? 'bg-[#1A1A1A] border-[#2C2C2C] text-gray-400 hover:text-white hover:border-gray-500' : 'bg-white border-[#E4DDCE] text-[#7A8272] hover:text-[#2F4B3C] hover:border-[#2F4B3C]/40'}`}
          >
            <Bell size={18} />
            <span className={`absolute top-2 right-2 w-2 h-2 rounded-full border border-white ${isDarkMode ? 'bg-[#B2FF3B] border-[#1A1A1A]' : 'bg-[#C4693C] border-white'}`}></span>
          </button>
          
          {/* Notification Modal Overlay (Portaled) */}
          {showNotifications && typeof window !== 'undefined' && createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#21261F]/50 backdrop-blur-xs animate-fade-slide-up">
              <div className="card-theme rounded-2xl p-6 max-w-sm w-full shadow-2xl relative border border-[#E4DDCE]">
                <button 
                  onClick={() => setShowNotifications(false)} 
                  className="absolute top-5 right-5 text-[#7A8272] hover:text-[#21261F] transition-colors p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </button>
                
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-theme">
                  <Bell size={20} className="text-theme-muted" />
                  <h2 className="text-xl font-fraunces font-bold text-theme">Notifications</h2>
                </div>
                
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <Bell size={48} className="text-theme-muted opacity-50 mb-4" />
                  <p className="text-lg font-bold text-theme font-fraunces">No new notifications</p>
                  <p className="text-sm text-theme-muted mt-1 font-mono">You're all caught up!</p>
                </div>

                <div className="flex justify-end pt-3 border-t border-[#E4DDCE]">
                  <button 
                    onClick={() => setShowNotifications(false)} 
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F4EFE6] text-[#7A8272] hover:bg-[#E4DDCE] hover:text-[#21261F] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* User Profile Avatar Chip */}
        <div className="border-l border-[#E4DDCE] pl-4">
          <div onClick={() => setShowProfile(!showProfile)}>
            <AvatarChip name={user.name} role={user.role} branchName={user.branchName} />
          </div>
          
          {/* Profile Modal Overlay */}
          {showProfile && typeof window !== 'undefined' && createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#21261F]/50 backdrop-blur-xs animate-fade-slide-up">
              <div className="card-theme rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-[#E4DDCE]">
                <button 
                  onClick={() => setShowProfile(false)} 
                  className="absolute top-5 right-5 text-[#7A8272] hover:text-[#21261F] transition-colors p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </button>
                
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-theme">
                  <ShieldCheck size={20} className="text-theme-muted" />
                  <h2 className="text-xl font-fraunces font-bold text-theme">EcoLink Profile</h2>
                </div>
                
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#2F4B3C] text-white flex items-center justify-center mb-3 shadow-md">
                    <UserCircle size={36} />
                  </div>
                  <p className="font-fraunces font-bold text-lg text-theme">{user.name}</p>
                  <p className={`font-mono text-xs font-bold mt-0.5 uppercase tracking-wider ${isDarkMode ? 'text-[#B2FF3B]' : 'text-[#2F4B3C]'}`}>{user.role.replace('_', ' ')}</p>
                </div>

                <div className="space-y-3 mb-6 bg-theme-secondary p-4 rounded-xl border border-theme text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-theme-muted uppercase font-mono">Email Address</span>
                    <span className="font-medium text-theme">{user.email || (user.name.toLowerCase().replace(' ', '') + '@ecolink.cm')}</span>
                  </div>
                  <div className="w-full h-px bg-[#E4DDCE]/30"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-theme-muted uppercase font-mono">Assigned Branch</span>
                    <span className="font-medium text-theme">
                      {user.branchName || (user.role === 'SUPER_ADMIN' ? 'National HQ Command' : 'Yaoundé Central Branch')}
                    </span>
                  </div>
                  <div className="w-full h-px bg-[#E4DDCE]/30"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-theme-muted uppercase font-mono">System Clearance</span>
                    <span className={`font-bold px-2.5 py-1 rounded-md font-mono ${isDarkMode ? 'text-[#B2FF3B] bg-[#B2FF3B]/10' : 'text-[#2F4B3C] bg-[#2F4B3C]/10'}`}>
                      {user.role === 'SUPER_ADMIN' ? 'Platform Administrator' : 
                       user.role === 'ADMIN' ? 'Regional Administrator' : 
                       user.role === 'STATION_ADMIN' ? 'Station Dispatch Controller' : 
                       user.role === 'STATION_MANAGER' ? 'Station Operations Manager' : 'Field Operations Staff'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-theme">
                  <button 
                    onClick={() => setShowProfile(false)} 
                    className="px-4 py-2 rounded-xl text-xs font-bold text-theme-muted hover:bg-theme-secondary transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={logout} 
                    className="flex items-center gap-2 px-4 py-2 bg-[#C4693C]/10 text-[#C4693C] hover:bg-[#C4693C] hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </header>
  );
}
