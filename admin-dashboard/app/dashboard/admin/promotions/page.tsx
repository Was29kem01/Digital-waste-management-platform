'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../../components/DashboardHeader';
import { useAuth } from '../../../context/AuthContext';
import { TrendingUp, Search, Calendar, XCircle, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function AdminPromotionsDashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedPromo, setSelectedPromo] = useState<any | null>(null);
  
  if (!user) return null;

  const [promotions, setPromotions] = useState<any[]>([]);

  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem('promoAudits') || '[]');
    setPromotions([
      ...existing,
      { id: 1, name: 'Samuel Eto', previousRole: 'Field Agent', newRole: 'Station Manager', branch: 'Douala North', date: '2026-08-25', promotedBy: 'admin@propre.com' },
      { id: 2, name: 'Rigobert Song', previousRole: 'Station Manager', newRole: 'Station Admin', branch: 'Yaounde Central', date: '2026-08-28', promotedBy: 'admin@propre.com' },
    ]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="relative z-50 animate-fade-slide-up" style={{ animationDelay: '0ms', opacity: 0 }}>
        <DashboardHeader title="Promotion History" user={{ name: user.name, role: user.role, branchName: user.branchName }} />
      </div>

      <div className="card-theme rounded-2xl shadow-sm border border-theme overflow-hidden animate-fade-slide-up" style={{ animationDelay: '200ms', opacity: 0 }}>
        
        <div className="p-6 border-b border-theme flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-theme-secondary/50">
          <div>
            <h2 className="text-xl font-fraunces text-theme font-bold">Promotion Log</h2>
            <p className="text-sm text-theme-muted font-space mt-1">A historical record of all personnel level-ups within your regions.</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search Candidate..." 
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
                <th className="py-4 px-6 text-xs uppercase tracking-wider font-bold text-theme-muted font-space">Promoted Personnel</th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider font-bold text-theme-muted font-space">Branch</th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider font-bold text-theme-muted font-space">Role Advancement</th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider font-bold text-theme-muted font-space text-right">Date & Authorizer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {promotions.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((promo, i) => (
                <tr 
                  key={promo.id} 
                  onClick={() => setSelectedPromo(promo)}
                  className="hover:bg-theme-secondary/30 transition-colors animate-fade-slide-up group cursor-pointer" 
                  style={{ animationDelay: `${300 + (i * 50)}ms`, opacity: 0 }}
                >
                  <td className="py-4 px-6">
                    <p className="font-space font-bold text-theme">{promo.name}</p>
                  </td>
                  <td className="py-4 px-6 font-space font-medium text-theme">
                    {promo.branch}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className="font-space text-sm text-theme-muted line-through opacity-70">{promo.previousRole}</span>
                      <TrendingUp size={16} className="text-theme" />
                      <span className="font-space text-sm font-bold text-theme bg-moss/10 px-2 py-0.5 rounded-md">{promo.newRole}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="font-space font-bold text-theme flex items-center justify-end gap-1"><Calendar size={14} className="text-theme-muted" /> {new Date(promo.date).toLocaleDateString()}</p>
                    <p className="font-space text-xs text-theme-muted">by {promo.promotedBy}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotion Details Modal */}
      {selectedPromo && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-slide-up" style={{ animationDuration: '0.2s' }}>
          <div className="card-theme rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border border-theme">
            <button 
              onClick={() => setSelectedPromo(null)}
              className="absolute top-6 right-6 text-theme-muted hover:text-theme transition-colors"
            >
              <XCircle size={24} />
            </button>
            
            <h2 className="text-2xl font-fraunces font-bold text-theme mb-6 border-b border-theme pb-4">Promotion Record</h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1 font-space">Employee Name</p>
                <p className="font-space font-medium text-theme text-lg">{selectedPromo.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-theme-secondary/30 p-4 rounded-xl border border-theme">
                  <p className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-2 font-space">Previous Role</p>
                  <p className="font-space font-bold text-theme">{selectedPromo.previousRole}</p>
                </div>
                
                <div className="bg-moss/10 p-4 rounded-xl border border-moss/20 relative">
                  <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 card-theme rounded-full p-1 border border-theme shadow-sm">
                    <ArrowRight size={16} className="text-theme" />
                  </div>
                  <p className="text-xs font-bold text-theme uppercase tracking-wider mb-2 font-space">New Role</p>
                  <p className="font-space font-bold text-theme">{selectedPromo.newRole}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-theme">
                <div>
                  <p className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1 font-space">Assigned Branch</p>
                  <p className="font-space font-medium text-theme">{selectedPromo.branch}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1 font-space">Date Promoted</p>
                  <p className="font-space font-medium text-theme">{new Date(selectedPromo.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1 font-space">Authorized By</p>
                  <p className="font-space font-medium text-theme">{selectedPromo.promotedBy}</p>
                </div>
                <div className="p-2 card-theme rounded-lg border border-theme shadow-sm">
                  <TrendingUp size={20} className="text-theme" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-theme">
              <button 
                onClick={() => setSelectedPromo(null)}
                className="px-6 py-2.5 rounded-xl font-space font-bold text-white bg-ink hover:bg-ink/80 transition-all shadow-md"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
