import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AvatarChip from './AvatarChip';
import { Bell, UserCircle, LogOut, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardHeader({ title, user }: { title: string, user: { name: string, role: string, branchName?: string, email?: string } }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout } = useAuth();

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-5 border-b border-[#E4DDCE]/80 relative z-[9999]">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#7A8272] uppercase tracking-wider mb-1">
          <span className="font-bold text-[#C4693C]">EcoLink OS</span>
          <span>/</span>
          <span className="text-[#2F4B3C] font-bold">{user.role.replace('_', ' ')}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-fraunces font-bold text-[#21261F] tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto justify-end">

        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-white border border-[#E4DDCE] rounded-xl text-[#7A8272] hover:text-[#2F4B3C] hover:border-[#2F4B3C]/40 transition-all shadow-xs"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#C4693C] rounded-full border border-white"></span>
          </button>
          
          {/* Notification Popover */}
          {showNotifications && (
            <div className="absolute right-0 top-14 w-64 bg-white border border-[#E4DDCE] rounded-xl shadow-2xl z-[999] p-4 animate-fade-slide-up">
              <div className="flex flex-col items-center justify-center text-center py-4">
                <Bell size={24} className="text-[#E4DDCE] mb-2" />
                <p className="text-sm font-bold text-[#21261F] font-fraunces">No new notifications</p>
                <p className="text-xs text-[#7A8272] mt-1 font-mono">You're all caught up!</p>
              </div>
            </div>
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
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-[#E4DDCE]">
                <button 
                  onClick={() => setShowProfile(false)} 
                  className="absolute top-5 right-5 text-[#7A8272] hover:text-[#21261F] transition-colors p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </button>
                
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E4DDCE]">
                  <ShieldCheck size={20} className="text-[#2F4B3C]" />
                  <h2 className="text-xl font-fraunces font-bold text-[#21261F]">EcoLink Profile</h2>
                </div>
                
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#2F4B3C] text-white flex items-center justify-center mb-3 shadow-md">
                    <UserCircle size={36} />
                  </div>
                  <p className="font-fraunces font-bold text-lg text-[#21261F]">{user.name}</p>
                  <p className="font-mono text-xs font-bold text-[#2F4B3C] mt-0.5 uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
                </div>

                <div className="space-y-3 mb-6 bg-[#F4EFE6]/50 p-4 rounded-xl border border-[#E4DDCE] text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#7A8272] uppercase font-mono">Email Address</span>
                    <span className="font-medium text-[#21261F]">{user.email || (user.name.toLowerCase().replace(' ', '') + '@ecolink.cm')}</span>
                  </div>
                  <div className="w-full h-px bg-[#E4DDCE]"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#7A8272] uppercase font-mono">Assigned Branch</span>
                    <span className="font-medium text-[#21261F]">
                      {user.branchName || (user.role === 'SUPER_ADMIN' ? 'National HQ Command' : 'Yaoundé Central Branch')}
                    </span>
                  </div>
                  <div className="w-full h-px bg-[#E4DDCE]"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#7A8272] uppercase font-mono">System Clearance</span>
                    <span className="font-bold text-[#2F4B3C] bg-[#2F4B3C]/10 px-2.5 py-1 rounded-md font-mono">
                      {user.role === 'SUPER_ADMIN' ? 'Platform Administrator' : 
                       user.role === 'ADMIN' ? 'Regional Administrator' : 
                       user.role === 'STATION_ADMIN' ? 'Station Dispatch Controller' : 
                       user.role === 'STATION_MANAGER' ? 'Station Operations Manager' : 'Field Operations Staff'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#E4DDCE]">
                  <button 
                    onClick={() => setShowProfile(false)} 
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#7A8272] hover:bg-[#F4EFE6] transition-colors"
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
