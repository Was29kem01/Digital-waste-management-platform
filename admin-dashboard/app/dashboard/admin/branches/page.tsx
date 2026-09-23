'use client';

import React, { useState } from 'react';
import DashboardHeader from '../../../components/DashboardHeader';
import { useAuth } from '../../../context/AuthContext';
import { MapPin, Plus, MoreVertical, Building2, Edit, Users, Trash2, XCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { GoogleMap, Rectangle, LoadScript } from '@react-google-maps/api';

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
  const [search, setSearch] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  // Modal states
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [reassigningBranch, setReassigningBranch] = useState<BranchItem | null>(null);
  const [deactivatingBranch, setDeactivatingBranch] = useState<BranchItem | null>(null);

  // Edit Map States
  const [editBounds, setEditBounds] = useState({
    north: 3.8680,
    south: 3.8280,
    east: 11.5221,
    west: 11.4821
  });
  const [currentArea, setCurrentArea] = useState('0');

  const onEditBoundsChanged = (rect: google.maps.Rectangle | null) => {
    if (rect) {
      const newBounds = rect.getBounds();
      if (newBounds) {
        const ne = newBounds.getNorthEast();
        const sw = newBounds.getSouthWest();
        
        setEditBounds({
          north: ne.lat(),
          south: sw.lat(),
          east: ne.lng(),
          west: sw.lng()
        });

        const widthKm = Math.abs(ne.lng() - sw.lng()) * 111.32; 
        const heightKm = Math.abs(ne.lat() - sw.lat()) * 110.57;
        setCurrentArea((widthKm * heightKm).toFixed(1));
      }
    }
  };

  const [branches, setBranches] = useState<BranchItem[]>([
    { id: 1, name: 'Yaoundé Central', address: 'Bastos, Yaoundé', manager: 'Rigobert Song', agentsCount: 18, status: 'ACTIVE' },
    { id: 2, name: 'Yaoundé North', address: 'Etoudi, Yaoundé', manager: 'Patrick Mboma', agentsCount: 14, status: 'ACTIVE' },
    { id: 3, name: 'Douala Littoral', address: 'Akwa, Douala', manager: 'Samuel Eto', agentsCount: 11, status: 'OPTIMAL' },
  ]);

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

      <div className="bg-white rounded-xl shadow-xs border border-[#E4DDCE] overflow-hidden animate-fade-slide-up">
        <div className="p-5 border-b border-[#E4DDCE] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F9F7F2]">
          <div>
            <h2 className="text-lg font-fraunces text-[#2F4B3C] font-bold">Regional Operating Base Directory</h2>
            <p className="text-xs text-[#7A8272] font-mono mt-0.5">Oversee all active EcoLink regional stations and assigned station managers.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Filter branch name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56 px-3 py-1.5 rounded-lg border border-[#E4DDCE] font-mono text-xs focus:outline-none focus:border-[#2F4B3C] bg-white"
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
              <tr className="bg-[#F4EFE6]/40 border-b border-[#E4DDCE] font-mono text-[#7A8272] uppercase font-bold">
                <th className="py-3.5 px-5">Branch Code</th>
                <th className="py-3.5 px-5">Regional Base</th>
                <th className="py-3.5 px-5">Station Manager</th>
                <th className="py-3.5 px-5">Field Staff</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DDCE]/60">
              {branches.filter(b => b.name.toLowerCase().includes(search.toLowerCase())).map((branch) => (
                <tr key={branch.id} className="hover:bg-[#F9F7F2]/60 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-[#21261F]">
                    BR-{branch.id.toString().padStart(3, '0')}
                  </td>
                  <td className="py-4 px-5">
                    <p className="font-bold text-[#21261F] flex items-center gap-1.5">
                      <Building2 size={16} className="text-[#2F4B3C]" /> {branch.name}
                    </p>
                    <p className="font-mono text-[11px] text-[#7A8272]">{branch.address}</p>
                  </td>
                  <td className="py-4 px-5 font-bold text-[#21261F]">
                    {branch.manager}
                  </td>
                  <td className="py-4 px-5 font-mono text-[#21261F]">
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
                      className="p-1.5 text-[#7A8272] hover:text-[#21261F] transition-colors focus:outline-none"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {activeDropdown === branch.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)}></div>
                        <div className="absolute right-6 top-10 w-48 bg-white border border-[#E4DDCE] rounded-xl shadow-lg z-50 overflow-hidden text-xs font-mono">
                          <button 
                            onClick={() => {
                              setEditingBranch(branch);
                              setEditForm({ name: branch.name, address: branch.address });
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-3.5 py-2.5 text-[#21261F] hover:bg-[#F4EFE6] flex items-center gap-2"
                          >
                            <Edit size={14} className="text-[#2F4B3C]" /> Edit Details
                          </button>
                          
                          <button 
                            onClick={() => {
                              setReassigningBranch(branch);
                              setSelectedManager(branch.manager);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-3.5 py-2.5 text-[#21261F] hover:bg-[#F4EFE6] flex items-center gap-2 border-t border-[#E4DDCE]/60"
                          >
                            <Users size={14} className="text-[#2F4B3C]" /> Reassign Manager
                          </button>
                          
                          <button 
                            onClick={() => {
                              setDeactivatingBranch(branch);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-3.5 py-2.5 font-bold text-[#C4693C] hover:bg-[#C4693C]/10 flex items-center gap-2 border-t border-[#E4DDCE]/60"
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
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl relative border border-[#E4DDCE] max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingBranch(null)} className="absolute top-6 right-6 text-[#7A8272] hover:text-[#21261F] transition-colors p-1 z-20">
              <XCircle size={22} />
            </button>

            <h2 className="text-xl font-fraunces font-bold text-[#21261F] mb-1">Edit Branch Details & Spatial Coverage</h2>
            <p className="text-xs font-mono text-[#7A8272] mb-6 pb-3 border-b border-[#E4DDCE]">Updating configuration for {editingBranch.name}</p>

            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#7A8272] uppercase mb-1">Branch Name</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.name} 
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4DDCE] font-space text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4B3C]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#7A8272] uppercase mb-1">Physical Location Address</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.address} 
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4DDCE] font-space text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4B3C]/20"
                  />
                </div>
              </div>

               <div>
                 <label className="block text-xs font-mono font-bold text-[#7A8272] uppercase mb-2">Edit Spatial Coverage</label>
                 <p className="text-[11px] text-muted font-space mb-2">Drag the corners of the rectangle to adjust the coverage boundaries.</p>
                 <div className="relative h-64 rounded-xl border border-line overflow-hidden bg-gray-100">
                    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={{ lat: (editBounds.north + editBounds.south) / 2, lng: (editBounds.east + editBounds.west) / 2 }}
                        zoom={13}
                      >
                        <Rectangle
                          bounds={editBounds}
                          editable={true}
                          draggable={true}
                          onBoundsChanged={function(this: google.maps.Rectangle) { onEditBoundsChanged(this) }}
                          options={{
                            fillColor: "rgba(47, 75, 60, 0.3)",
                            strokeColor: "#2F4B3C",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                          }}
                        />
                      </GoogleMap>
                    </LoadScript>
                 </div>
                 <div className="mt-2 text-xs font-mono text-[#2F4B3C] font-bold">
                    Current Area: {currentArea} km²
                 </div>
              </div>

              <div className="pt-4 border-t border-[#E4DDCE] flex justify-end gap-3">
                <button type="button" onClick={() => setEditingBranch(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-[#7A8272] hover:bg-[#F4EFE6]">Cancel</button>
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
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-[#E4DDCE]">
            <button onClick={() => setReassigningBranch(null)} className="absolute top-6 right-6 text-[#7A8272] hover:text-[#21261F] transition-colors p-1">
              <XCircle size={22} />
            </button>

            <h2 className="text-xl font-fraunces font-bold text-[#21261F] mb-1">Reassign Station Manager</h2>
            <p className="text-xs font-mono text-[#7A8272] mb-6 pb-3 border-b border-[#E4DDCE]">Select a new station lead for {reassigningBranch.name}</p>

            <form onSubmit={handleSaveReassign} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#7A8272] uppercase mb-1">Select Station Manager</label>
                <select 
                  value={selectedManager}
                  onChange={e => setSelectedManager(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E4DDCE] font-space text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4B3C]/20 bg-white"
                >
                  {availableManagers.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-[#E4DDCE] flex justify-end gap-3">
                <button type="button" onClick={() => setReassigningBranch(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-[#7A8272] hover:bg-[#F4EFE6]">Cancel</button>
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
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-[#E4DDCE] text-center">
            <div className="mx-auto w-14 h-14 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert size={28} />
            </div>
            <h2 className="text-lg font-fraunces font-bold text-[#21261F] mb-2">
              {deactivatingBranch.status === 'DEACTIVATED' ? 'Reactivate Branch' : 'Deactivate Branch'}
            </h2>
            <p className="text-xs font-space text-[#7A8272] mb-6">
              Are you sure you want to {deactivatingBranch.status === 'DEACTIVATED' ? 'reactivate' : 'deactivate'} <strong className="text-[#21261F]">{deactivatingBranch.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeactivatingBranch(null)}
                className="flex-1 py-2.5 rounded-xl font-mono text-xs font-bold text-[#7A8272] hover:bg-[#F4EFE6] border border-[#E4DDCE]"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleToggleDeactivate(deactivatingBranch.id)}
                className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold text-white shadow-md ${
                  deactivatingBranch.status === 'DEACTIVATED' ? 'bg-[#4E8B5C] hover:bg-[#3D7248]' : 'bg-red-600 hover:bg-red-700'
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
