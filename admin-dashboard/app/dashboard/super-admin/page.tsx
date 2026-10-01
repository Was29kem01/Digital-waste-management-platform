'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Users, TrendingUp, ShieldAlert } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [userToBan, setUserToBan] = useState<any | null>(null);
  
  if (!user) return null;

  const activeUsers = [
    { id: 1, name: 'HYSACAM Cameroon', role: 'FRANCHISE_ADMIN', branch: 'National Head Office' },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Users Modal Overlay */}
      {showUsersModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#21261F]/50 backdrop-blur-xs animate-fade-slide-up">
          <div className="card-theme rounded-2xl p-6 max-w-3xl w-full shadow-2xl relative border border-theme flex flex-col max-h-[80vh]">
            <button 
              onClick={() => setShowUsersModal(false)}
              className="absolute top-5 right-5 text-theme-muted hover:text-theme transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </button>
            
            <h2 className="text-xl font-fraunces font-bold text-theme mb-1">Active Franchise Administrators</h2>
            <p className="font-mono text-xs text-theme-muted mb-5 border-b border-theme pb-3">Licensed regional administrators across the network.</p>
            
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-theme-secondary border-b border-theme font-mono text-theme-muted uppercase font-bold sticky top-0">
                    <th className="py-3.5 px-4">Administrator</th>
                    <th className="py-3.5 px-4">Role Clearance</th>
                    <th className="py-3.5 px-4">Franchise Sector</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DDCE]/30 dark:divide-[#2C2C2C]">
                  {activeUsers.map(u => (
                    <tr key={u.id} className="hover:bg-theme-secondary transition-colors">
                      <td className="py-3.5 px-4 font-bold text-theme">{u.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-mono font-bold bg-[#D7A24A]/20 px-2 py-0.5 rounded text-[#D7A24A]">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-theme-muted">{u.branch}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          onClick={() => setUserToBan(u)}
                          className="p-1 bg-[#B7503A]/10 text-[#B7503A] hover:bg-[#B7503A] hover:text-white rounded-md transition-colors" 
                          title="Revoke License"
                        >
                          <ShieldAlert size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-theme mt-4">
              <button 
                onClick={() => setShowUsersModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2F4B3C] hover:bg-[#1D3128] transition-colors"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="animate-fade-slide-up">
        <DashboardHeader title="System Governance & Infrastructure" user={{ name: user.name, role: user.role, branchName: user.branchName }} />
      </div>
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 gap-5">
        {[
          { id: 'users', label: 'Active Franchise Admins', value: activeUsers.length.toString(), icon: Users, trend: `${activeUsers.length} Active`, color: 'text-theme-muted', bg: 'bg-theme-secondary', onClick: () => setShowUsersModal(true) },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={stat.onClick}
            className="card-theme rounded-xl p-5 border border-theme shadow-xs hover:shadow-md hover:border-theme cursor-pointer transition-all animate-fade-slide-up"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[11px] font-mono font-bold text-[#4E8B5C] bg-[#4E8B5C]/10 px-2 py-0.5 rounded">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-2xl font-fraunces font-bold text-theme">{stat.value}</h3>
            <p className="text-xs font-mono text-theme-muted mt-1 font-semibold uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card-theme rounded-xl p-8 border border-theme shadow-xs animate-fade-slide-up text-center">
        <ShieldCheck size={44} className="mx-auto text-theme-muted mb-3" />
        <h2 className="text-xl font-fraunces font-bold text-theme mb-2">Super Admin Control Authority</h2>
        <p className="text-xs font-space text-theme-muted max-w-lg mx-auto leading-relaxed">
          Welcome to the top-level Ecolink OS overview. Oversee all nationwide branches, inspect system health audits, and manage administrative role clearances.
        </p>
      </div>

      {/* Revoke Confirmation Modal */}
      {userToBan && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#21261F]/50 backdrop-blur-xs animate-fade-slide-up">
          <div className="card-theme rounded-2xl p-6 max-w-sm w-full shadow-2xl relative border border-theme text-center">
            <div className="mx-auto w-12 h-12 bg-[#B7503A]/10 text-[#B7503A] rounded-xl flex items-center justify-center mb-3">
              <ShieldAlert size={24} />
            </div>
            <h2 className="text-lg font-fraunces font-bold text-theme mb-1">Revoke License</h2>
            <p className="font-space text-xs text-theme-muted mb-6">
              Are you sure you want to revoke <strong className="text-theme">{userToBan.name}</strong>'s franchise clearance?
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setUserToBan(null)}
                className="flex-1 py-2 rounded-xl font-mono text-xs font-bold text-theme-muted hover:bg-theme-secondary border border-theme"
              >
                Cancel
              </button>
              <button 
                onClick={() => setUserToBan(null)}
                className="flex-1 py-2 rounded-xl font-mono text-xs font-bold text-white bg-[#B7503A] hover:bg-[#9E3E2A] transition-all"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
