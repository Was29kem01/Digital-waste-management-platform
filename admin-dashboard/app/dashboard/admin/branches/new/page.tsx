'use client';

import React, { useState, useRef, useEffect } from 'react';
import DashboardHeader from '../../../../components/DashboardHeader';
import { useAuth } from '../../../../context/AuthContext';
import { useTheme } from '../../../../context/ThemeContext';
import { MapPin, Building2, User, ChevronLeft, Map } from 'lucide-react';
import mapboxgl from 'mapbox-gl';

import Link from 'next/link';
import AdvancedMapEditor from '../../../../components/AdvancedMapEditor';
import * as turf from '@turf/turf';

export default function NewBranchPage() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    managerId: '',
    trucks: 1,
    agents: 1
  });
  
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  
  // Default bounds for Yaoundé
  const [bounds, setBounds] = useState({
    north: 3.8680,
    south: 3.8280,
    east: 11.5221,
    west: 11.4821
  });
  
  const [coverageStats, setCoverageStats] = useState<{areaSqKm: string, estPopulation: string, requiredTrucks: string, geometry: any}>({
    areaSqKm: '0',
    estPopulation: '0',
    requiredTrucks: '0 Trucks',
    geometry: null
  });

  // We now use AdvancedMapEditor for map logic
  const handleBoundsChange = (data: any) => {
    // If the data has features, we can update our local bounds approximation or just keep the GeoJSON.
    if (data && data.features && data.features.length > 0) {
      const feature = data.features[0];
      if (feature.geometry.type === 'Polygon') {
        const areaSqMeters = turf.area(feature);
        const areaSqKm = (areaSqMeters / 1000000).toFixed(1);
        const pop = Math.round((areaSqMeters / 1000000) * 9000).toLocaleString();
        const trucks = Math.ceil((areaSqMeters / 1000000) * 1.2);
        setCoverageStats({
          areaSqKm: `${areaSqKm}`,
          estPopulation: `${pop} residents`,
          requiredTrucks: `${trucks} Trucks required`,
          geometry: feature
        });
      }
    }
  };
  if (!user) return null;
  const availableAdmins = [
    { id: '1', name: 'John Doe (Station Admin - Douala)' },
    { id: '2', name: 'Jane Smith (Station Admin - Yaoundé)' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem('saved_branches') || '[]');
    
    // Create new branch matching the BranchItem interface from branches/page.tsx
    const newBranch = {
      id: Date.now(),
      name: formData.name,
      address: formData.address,
      manager: formData.managerId ? availableAdmins.find(m => m.id === formData.managerId)?.name.split(' (')[0] : 'Unassigned',
      agentsCount: formData.agents, 
      status: 'ACTIVE',
      // Store the drawn bounds geometry so the map can zoom back exactly to it
      boundsGeometry: coverageStats.geometry 
    };
    
    localStorage.setItem('saved_branches', JSON.stringify([...existing, newBranch]));
    alert(`Branch ${formData.name} initialized with ${formData.trucks} assigned trucks and ${coverageStats.areaSqKm} km² coverage!`);
    window.location.href = '/dashboard/admin/branches';
  };

  const mapCenter = {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="relative z-50 animate-fade-slide-up" style={{ animationDelay: '0ms', opacity: 0 }}>
        <DashboardHeader title="Create New Branch" user={{ name: user.name, role: user.role, branchName: user.branchName }} />
      </div>

      <div className="mb-6 animate-fade-slide-up" style={{ animationDelay: '100ms', opacity: 0 }}>
        <Link href="/dashboard/admin/branches" className="inline-flex items-center gap-2 text-theme-muted font-space font-bold hover:underline">
          <ChevronLeft size={18} /> Back to Branches
        </Link>
      </div>

      <div className="card-theme rounded-3xl shadow-sm border border-theme overflow-hidden animate-fade-slide-up" style={{ animationDelay: '200ms', opacity: 0 }}>
        <div className="p-8 border-b border-theme bg-theme-secondary">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-[#2F4B3C]/10 text-theme-muted rounded-xl">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-fraunces text-theme font-bold">Branch & Spatial Zone Setup</h2>
              <p className="text-sm text-theme-muted font-space mt-1">Configure branch operational details and define map coverage boundaries.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-theme-muted uppercase tracking-wider mb-2 font-space">Branch Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted" size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. HYSACAM Douala Sud" 
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-theme card-theme font-space text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4B3C]/20 transition-all text-theme"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-muted uppercase tracking-wider mb-2 font-space">Physical Station Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted" size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="e.g. Avenue De Gaulle, Bonanjo" 
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-theme card-theme font-space text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4B3C]/20 transition-all text-theme"
                />
              </div>
            </div>
          </div>

          {/* SPATIAL COVERAGE PREVIEW */}
          <div className="space-y-4 pt-4 border-t border-theme">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-fraunces font-bold text-theme flex items-center gap-2"><Map size={20} className="text-[#C4693C]"/> Define Spatial Coverage</h3>
                <p className="text-xs text-theme-muted font-space">Mapbox coverage preview mapped to base coordinates.</p>
              </div>
            </div>

            <div className="w-full">
              <AdvancedMapEditor onBoundsChange={handleBoundsChange} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-3 card-theme rounded-xl border border-theme">
                <div className="text-[10px] uppercase font-bold font-space text-theme-muted">Calculated Area</div>
                <div className="text-sm font-bold font-mono text-theme mt-0.5">{coverageStats.areaSqKm} km²</div>
              </div>
              <div className="p-3 card-theme rounded-xl border border-theme">
                <div className="text-[10px] uppercase font-bold font-space text-theme-muted">Est. Population</div>
                <div className="text-sm font-bold font-mono text-theme mt-0.5">{coverageStats.estPopulation}</div>
              </div>
              <div className="p-3 card-theme rounded-xl border border-theme flex flex-col justify-between">
                <label className="text-[10px] uppercase font-bold font-space text-theme-muted">Assigned Trucks</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={formData.trucks}
                  onChange={(e) => setFormData({...formData, trucks: parseInt(e.target.value) || 0})}
                  className="w-full mt-1 px-2 py-1 bg-theme-secondary border border-theme rounded text-sm font-bold font-mono text-[#C4693C] focus:outline-none"
                />
              </div>
              <div className="p-3 card-theme rounded-xl border border-theme flex flex-col justify-between">
                <label className="text-[10px] uppercase font-bold font-space text-theme-muted">Assigned Agents</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={formData.agents}
                  onChange={(e) => setFormData({...formData, agents: parseInt(e.target.value) || 0})}
                  className="w-full mt-1 px-2 py-1 bg-theme-secondary border border-theme rounded text-sm font-bold font-mono text-theme focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-theme-muted uppercase tracking-wider mb-2 font-space">Assign Station Admin (Optional)</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted" size={18} />
              <select 
                value={formData.managerId}
                onChange={(e) => setFormData({...formData, managerId: e.target.value})}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-theme font-space text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4B3C]/20 transition-all appearance-none card-theme text-theme cursor-pointer"
              >
                <option className="bg-[#1A1A1A] text-white" value="">Leave Unassigned</option>
                {availableAdmins.map(m => (
                  <option className="bg-[#1A1A1A] text-white" key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-theme flex justify-end gap-4">
            <Link href="/dashboard/admin/branches" className="px-6 py-3 rounded-xl font-space font-bold text-theme-muted hover:bg-theme-secondary/50 transition-colors">
              Cancel
            </Link>
            <button type="submit" className="px-8 py-3 rounded-xl font-space font-bold text-white bg-[#2F4B3C] hover:bg-[#1D3128] shadow-md transition-all hover:-translate-y-0.5">
              Initialize Branch
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
