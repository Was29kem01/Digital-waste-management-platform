'use client';

import React, { useState } from 'react';
import DashboardHeader from '../../../components/DashboardHeader';
import { useAuth } from '../../../context/AuthContext';
import { Search, ShieldAlert, ArrowUpCircle, XCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function AdminAgentsDashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [userToBan, setUserToBan] = useState<any | null>(null);
  
  if (!user) return null;

  const agents = [
    { id: 1, name: 'Samuel Eto', email: 'samuel@propre.com', role: 'FIELD_AGENT', branch: 'Douala North', status: 'ACTIVE' },
    { id: 2, name: 'Rigobert Song', email: 'rigobert@propre.com', role: 'STATION_MANAGER', branch: 'Yaounde Central', status: 'ACTIVE' },
    { id: 3, name: 'Andre Onana', email: 'andre@propre.com', role: 'FIELD_AGENT', branch: 'Douala South', status: 'ACTIVE' },
    { id: 4, name: 'Patrick Mboma', email: 'patrick@propre.com', role: 'STATION_ADMIN', branch: 'Yaounde Central', status: 'ACTIVE' },
  ];

  const getPromotionOptions = (currentRole: string) => {
    if (currentRole === 'FIELD_AGENT') return ['STATION_MANAGER', 'STATION_ADMIN'];
    if (currentRole === 'STATION_MANAGER') return ['STATION_ADMIN'];
    return [];
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="relative z-50 animate-fade-slide-up" style={{ animationDelay: '0ms', opacity: 0 }}>
        <DashboardHeader title="Staff & Agent Roster" user={{ name: user.name, role: user.role, branchName: user.branchName }} />
      </div>

      <div className="card-theme rounded-2xl shadow-sm border border-theme overflow-hidden animate-fade-slide-up" style={{ animationDelay: '200ms', opacity: 0 }}>
        
        <div className="p-6 border-b border-theme flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-theme-secondary/50">
          <div>
            <h2 className="text-xl font-fraunces text-theme font-bold">Manage Personnel</h2>
            <p className="text-sm text-theme-muted font-space mt-1">Review, promote, or restrict access for agents in your regions.</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search Personnel..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-theme font-space text-sm focus:outline-none focus:ring-2 focus:ring-moss/20 focus:border-moss transition-all card-theme text-theme"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-theme-secondary/30 border-b border-theme">
                <th className="py-4 px-6 text-xs uppercase tracking-wider font-bold text-theme-muted font-space">Name & Email</th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider font-bold text-theme-muted font-space">Current Role</th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider font-bold text-theme-muted font-space">Assigned Branch</th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider font-bold text-theme-muted font-space text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {agents.filter(a => a.name.toLowerCase().includes(search.toLowerCase())).map((agent, i) => (
                <tr key={agent.id} className="hover:bg-theme-secondary/20 transition-colors animate-fade-slide-up group" style={{ animationDelay: `${300 + (i * 50)}ms`, opacity: 0 }}>
                  <td className="py-4 px-6">
                    <p className="font-space font-bold text-theme">{agent.name}</p>
                    <p className="font-space text-sm text-theme-muted">{agent.email}</p>
                  </td>
                  <td className="py-4 px-6">
                    {(() => {
                      let style = 'bg-theme-secondary text-theme border-theme';
                      let dot = 'bg-theme';
                      
                      if (agent.role === 'SUPER_ADMIN') {
                        style = 'bg-red/10 text-red border-red/20'; dot = 'bg-red';
                      } else if (agent.role === 'STATION_ADMIN') {
                        style = 'bg-amber/10 text-[#D7A24A] border-[#D7A24A]/20'; dot = 'bg-[#D7A24A]';
                      } else if (agent.role === 'STATION_MANAGER') {
                        style = 'bg-[#4E8B5C]/10 text-[#4E8B5C] border-[#4E8B5C]/20'; dot = 'bg-[#4E8B5C]';
                      } else if (agent.role === 'FIELD_AGENT') {
                        style = 'bg-moss/10 text-moss border-moss/20'; dot = 'bg-moss';
                      }
                      
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold border shadow-sm ${style}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} style={{ animationDuration: '3s' }} />
                          {agent.role.replace('_', ' ')}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-4 px-6 font-space font-medium text-theme">
                    {agent.branch}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {getPromotionOptions(agent.role).length > 0 && (
                        <button 
                          onClick={() => setSelectedAgent(agent)}
                          className="px-4 py-1.5 bg-moss/10 text-theme font-space text-sm font-bold rounded-lg hover:bg-moss hover:text-white transition-colors tooltip flex items-center gap-2"
                          title="Promote User"
                        >
                          <ArrowUpCircle size={16} /> Promote
                        </button>
                      )}
                      <button 
                        onClick={() => setUserToBan(agent)}
                        className="p-1.5 bg-red/10 text-red hover:bg-red hover:text-white rounded-lg transition-colors tooltip ml-2" 
                        title="Ban User"
                      >
                        <ShieldAlert size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotion Modal */}
      {selectedAgent && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-slide-up" style={{ animationDuration: '0.2s' }}>
          <div className="card-theme rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-theme">
            <button 
              onClick={() => setSelectedAgent(null)} 
              className="absolute top-6 right-6 text-theme-muted hover:text-theme transition-colors"
            >
              <XCircle size={24} />
            </button>
            
            <h2 className="text-2xl font-fraunces font-bold text-theme mb-2">Promote Personnel</h2>
            <p className="font-space text-sm text-theme-muted mb-6 pb-4 border-b border-theme">
              Select a new operational clearance level for <strong className="text-theme">{selectedAgent.name}</strong>.
            </p>
            
            <div className="space-y-3 mb-8">
              {getPromotionOptions(selectedAgent.role).map(role => (
                <button 
                  key={role}
                  onClick={() => {
                    const newPromo = {
                      id: Date.now(),
                      name: selectedAgent.name,
                      previousRole: selectedAgent.role.replace('_', ' '),
                      newRole: role.replace('_', ' '),
                      branch: selectedAgent.branch,
                      date: new Date().toISOString(),
                      promotedBy: user.email || 'admin@propre.com'
                    };
                    const existing = JSON.parse(localStorage.getItem('promoAudits') || '[]');
                    localStorage.setItem('promoAudits', JSON.stringify([newPromo, ...existing]));
                    alert(`${selectedAgent.name} promoted to ${role.replace('_', ' ')}! This action has been logged in Promotion Audits.`);
                    setSelectedAgent(null);
                  }}
                  className="w-full p-4 border border-theme rounded-xl hover:border-moss hover:bg-moss/5 transition-all text-left flex justify-between items-center group"
                >
                  <div>
                    <p className="font-space font-bold text-theme text-lg">{role.replace('_', ' ')}</p>
                    <p className="font-space text-xs text-theme-muted mt-1">Grant full access privileges for this role.</p>
                  </div>
                  <ArrowUpCircle size={20} className="text-theme opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-theme">
              <button 
                onClick={() => setSelectedAgent(null)} 
                className="w-full py-3 rounded-xl font-space font-bold text-theme-muted hover:bg-theme-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Ban Confirmation Modal */}
      {userToBan && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-slide-up" style={{ animationDuration: '0.2s' }}>
          <div className="card-theme rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-theme text-center">
            <div className="mx-auto w-16 h-16 bg-red/10 text-red rounded-full flex items-center justify-center mb-4">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-fraunces font-bold text-theme mb-2">Ban User</h2>
            <p className="font-space text-sm text-theme-muted mb-8">
              Are you sure you want to ban <strong className="text-theme">{userToBan.name}</strong>? This will immediately revoke their system access.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setUserToBan(null)}
                className="flex-1 py-3 rounded-xl font-space font-bold text-theme-muted hover:bg-theme-secondary transition-colors border border-theme"
              >
                Cancel
              </button>
              <button 
                onClick={() => setUserToBan(null)} // Add actual ban logic later
                className="flex-1 py-3 rounded-xl font-space font-bold text-white bg-red hover:bg-red/90 transition-all shadow-md"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
