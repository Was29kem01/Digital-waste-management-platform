'use client';

import React, { useState } from 'react';
import DashboardHeader from '../../../components/DashboardHeader';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { MapPin, Plus, MoreVertical, Building2, Edit, Users, Trash2, XCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import mapboxgl from 'mapbox-gl';
import AdvancedMapEditor from '../../../components/AdvancedMapEditor';

interface BranchItem {
  id: number;
  name: string;
  address: string;
  manager: string;
  agentsCount: number;
  status: 'ACTIVE' | 'OPTIMAL' | 'DEACTIVATED';
}

export default function AdminBranchesDashboard() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [search, setSearch] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  // Modal states
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [reassigningBranch, setReassigningBranch] = useState<BranchItem | null>(null);
  const [deactivatingBranch, setDeactivatingBranch] = useState<BranchItem | null>(null);

  // Edit Map States
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  // We now use AdvancedMapEditor for map logic


  const [branches, setBranches] = useState<BranchItem[]>([]);
  React.useEffect(() => {
    const defaultBranches: BranchItem[] = [
      { id: 1, name: 'Yaoundé Central', address: 'Bastos, Yaoundé', manager: 'Rigobert Song', agentsCount: 18, status: 'ACTIVE' },
      { id: 2, name: 'Yaoundé North', address: 'Etoudi, Yaoundé', manager: 'Patrick Mboma', agentsCount: 14, status: 'ACTIVE' },
      { id: 3, name: 'Douala Littoral', address: 'Akwa, Douala', manager: 'Samuel Eto', agentsCount: 11, status: 'OPTIMAL' },
    ];
    
    const saved = localStorage.getItem('saved_branches');
    if (saved) {
      setBranches([...defaultBranches, ...JSON.parse(saved)]);
    } else {
      setBranches(defaultBranches);
    }
  }, []);

  const [editForm, setEditForm] = useState({ name: '', address: '' });
  const [selectedManager, setSelectedManager] = useState('');

  const availableManagers = [
    'Rigobert Song',
    'Patrick Mboma',
    'Samuel Eto',
    'Andre Onana',
    'M. Kamga (HYSACAM Lead)'
  ];

  if (!user) return null;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    setBranches(branches.map(b => b.id === editingBranch.id ? { ...b, name: editForm.name, address: editForm.address } : b));
    setEditingBranch(null);
  };

  const handleSaveReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningBranch || !selectedManager) return;
    setBranches(branches.map(b => b.id === reassigningBranch.id ? { ...b, manager: selectedManager } : b));
    setReassigningBranch(null);
  };

  const handleToggleDeactivate = (id: number) => {
    setBranches(branches.map(b => {
      if (b.id === id) {
        const nextStatus = b.status === 'DEACTIVATED' ? 'ACTIVE' : 'DEACTIVATED';
        return { ...b, status: nextStatus as any };
      }
      return b;
    }));
    setDeactivatingBranch(null);
  };

  return (
    <div className="space-y-8 pb-12 relative">
      <div className="animate-fade-slide-up">
        <DashboardHeader title="Branch Infrastructure Management" user={{ name: user.name, role: user.role, branchName: user.branchName }} />
      </div>

      <div className="card-theme rounded-xl shadow-xs border border-theme overflow-hidden animate-fade-slide-up">
        <div className="p-5 border-b border-theme flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-theme-secondary/50">
          <div>
            <h2 className="text-lg font-fraunces text-theme-muted font-bold">Regional Operating Base Directory</h2>
            <p className="text-xs text-theme-muted font-mono mt-0.5">Oversee all active EcoLink regional stations and assigned station managers.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Filter branch name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56 px-3 py-1.5 rounded-lg border border-theme font-mono text-xs focus:outline-none focus:border-[#2F4B3C] card-theme text-theme"
            />
            <Link 
              href="/dashboard/admin/branches/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2F4B3C] text-white hover:bg-[#1D3128] shadow-sm transition-all"
            >
              <Plus size={16} /> Initialize Branch
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-theme-secondary/40 border-b border-theme font-mono text-theme-muted uppercase font-bold">
                <th className="py-3.5 px-5">Branch Code</th>
                <th className="py-3.5 px-5">Regional Base</th>
                <th className="py-3.5 px-5">Station Admin</th>
                <th className="py-3.5 px-5">Field Staff</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DDCE]/60">
              {branches.filter(b => b.name.toLowerCase().includes(search.toLowerCase())).map((branch, index, arr) => (
                <tr key={branch.id} className="hover:bg-[#F9F7F2]/60 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-theme">
                    BR-{branch.id.toString().padStart(3, '0')}
                  </td>
                  <td className="py-4 px-5">
                    <p className="font-bold text-theme flex items-center gap-1.5">
                      <Building2 size={16} className="text-theme-muted" /> {branch.name}
                    </p>
                    <p className="font-mono text-[11px] text-theme-muted">{branch.address}</p>
                  </td>
                  <td className="py-4 px-5 font-bold text-theme">
                    {branch.manager}
                  </td>
                  <td className="py-4 px-5 font-mono text-theme">
                    {branch.agentsCount} Agents
                  </td>
                  <td className="py-4 px-5 font-mono">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      branch.status === 'DEACTIVATED' ? 'bg-red-500/10 text-red-600' : 'bg-[#4E8B5C]/10 text-[#4E8B5C]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${branch.status === 'DEACTIVATED' ? 'bg-red-600' : 'bg-[#4E8B5C]'}`}></span>
                      {branch.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === branch.id ? null : branch.id)}
                      className="p-1.5 text-theme-muted hover:text-theme transition-colors focus:outline-none"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {activeDropdown === branch.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)}></div>
                        <div className={`absolute right-6 ${index >= arr.length - 2 && arr.length > 2 ? 'bottom-8' : 'top-10'} w-48 card-theme border border-theme rounded-xl shadow-lg z-50 overflow-hidden text-xs font-mono`}>
                          <button 
                            onClick={() => {
                              setEditingBranch(branch);
                              setEditForm({ name: branch.name, address: branch.address });
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-3.5 py-2.5 text-theme hover:bg-theme-secondary flex items-center gap-2"
                          >
                            <Edit size={14} className="text-theme-muted" /> Edit Details
                          </button>
                          
                          <button 
                            onClick={() => {
                              setReassigningBranch(branch);
                              setSelectedManager(branch.manager);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-3.5 py-2.5 text-theme hover:bg-theme-secondary flex items-center gap-2 border-t border-theme/60"
                          >
                            <Users size={14} className="text-theme-muted" /> Reassign Admin
                          </button>
                          
                          <button 
                            onClick={() => {
                              setDeactivatingBranch(branch);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-3.5 py-2.5 font-bold text-[#C4693C] hover:bg-[#C4693C]/10 flex items-center gap-2 border-t border-theme/60"
                          >
                            <Trash2 size={14} /> {branch.status === 'DEACTIVATED' ? 'Reactivate' : 'Deactivate'}
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT BRANCH MODAL */}
      {editingBranch && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#21261F]/60 backdrop-blur-xs animate-fade-slide-up">
          <div className="card-theme rounded-3xl p-8 max-w-4xl w-full shadow-2xl relative border border-theme max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingBranch(null)} className="absolute top-6 right-6 text-theme-muted hover:text-theme transition-colors p-1 z-20">
              <XCircle size={22} />
            </button>

            <h2 className="text-xl font-fraunces font-bold text-theme mb-1">Edit Branch Details & Spatial Coverage</h2>
            <p className="text-xs font-mono text-theme-muted mb-6 pb-3 border-b border-theme">Updating configuration for {editingBranch.name}</p>

            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-theme-muted uppercase mb-1">Branch Name</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.name} 
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-theme font-space text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4B3C]/20 bg-transparent text-theme"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-theme-muted uppercase mb-1">Physical Location Address</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.address} 
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-theme font-space text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4B3C]/20 bg-transparent text-theme"
                  />
                </div>
              </div>

               <div>
                 <label className="block text-xs font-mono font-bold text-theme-muted uppercase mb-2">Edit Spatial Coverage</label>
                 <p className="text-[11px] text-theme-muted font-space mb-2">Use the Map Tools to redraw or edit the boundaries.</p>
                 <AdvancedMapEditor 
                   initialGeoJSON={(editingBranch as any).boundsGeometry}
                   onBoundsChange={() => {}} 
                 />
              </div>

              <div className="pt-4 border-t border-theme flex justify-end gap-3">
                <button type="button" onClick={() => setEditingBranch(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-theme-muted hover:bg-theme-secondary">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2F4B3C] text-white hover:bg-[#1D3128]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* REASSIGN MANAGER MODAL */}
      {reassigningBranch && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#21261F]/60 backdrop-blur-xs animate-fade-slide-up">
          <div className="card-theme rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-theme">
            <button onClick={() => setReassigningBranch(null)} className="absolute top-6 right-6 text-theme-muted hover:text-theme transition-colors p-1">
              <XCircle size={22} />
            </button>

            <h2 className="text-xl font-fraunces font-bold text-theme mb-1">Reassign Station Admin</h2>
            <p className="text-xs font-mono text-theme-muted mb-6 pb-3 border-b border-theme">Select a new station lead for {reassigningBranch.name}</p>

            <form onSubmit={handleSaveReassign} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-theme-muted uppercase mb-1">Select Station Admin</label>
                <select 
                  value={selectedManager}
                  onChange={e => setSelectedManager(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-theme font-space text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4B3C]/20 card-theme text-theme"
                >
                  {availableManagers.map(m => (
                    <option className="bg-[#1A1A1A] text-white" key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-theme flex justify-end gap-3">
                <button type="button" onClick={() => setReassigningBranch(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-theme-muted hover:bg-theme-secondary">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2F4B3C] text-white hover:bg-[#1D3128]">Confirm Reassignment</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* DEACTIVATE / REACTIVATE CONFIRMATION MODAL */}
      {deactivatingBranch && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#21261F]/60 backdrop-blur-xs animate-fade-slide-up">
          <div className="card-theme rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-theme text-center">
            <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
              deactivatingBranch.status === 'DEACTIVATED' ? 'bg-[#4E8B5C]/10 text-[#4E8B5C]' : 'bg-[#B7503A]/10 text-[#B7503A]'
            }`}>
              <ShieldAlert size={28} />
            </div>
            <h2 className="text-lg font-fraunces font-bold text-theme mb-2">
              {deactivatingBranch.status === 'DEACTIVATED' ? 'Reactivate Branch' : 'Deactivate Branch'}
            </h2>
            <p className="text-xs font-space text-theme-muted mb-6">
              Are you sure you want to {deactivatingBranch.status === 'DEACTIVATED' ? 'reactivate' : 'deactivate'} <strong className="text-theme">{deactivatingBranch.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeactivatingBranch(null)}
                className="flex-1 py-2.5 rounded-xl font-mono text-xs font-bold text-theme-muted hover:bg-theme-secondary border border-theme transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleToggleDeactivate(deactivatingBranch.id)}
                className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 ${
                  deactivatingBranch.status === 'DEACTIVATED' ? 'bg-[#4E8B5C] hover:bg-[#3D7248]' : 'bg-[#B7503A] hover:bg-[#96402E]'
                }`}
              >
                {deactivatingBranch.status === 'DEACTIVATED' ? 'Confirm Reactivate' : 'Confirm Deactivate'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
