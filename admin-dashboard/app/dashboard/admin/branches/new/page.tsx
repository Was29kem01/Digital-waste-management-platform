'use client';

import React, { useState, useRef, useEffect } from 'react';
import DashboardHeader from '../../../../components/DashboardHeader';
import { useAuth } from '../../../../context/AuthContext';
import { MapPin, Building2, User, ChevronLeft, Map } from 'lucide-react';
import { GoogleMap, Rectangle, LoadScript } from '@react-google-maps/api';
import Link from 'next/link';

export default function NewBranchPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    managerId: ''
  });
  
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  
  // Default bounds for Yaoundé
  const [bounds, setBounds] = useState({
    north: 3.8680,
    south: 3.8280,
    east: 11.5221,
    west: 11.4821
  });
  
  const [coverageStats, setCoverageStats] = useState({
    areaSqKm: '0',
    estPopulation: '0',
    requiredTrucks: '0 Trucks'
  });

  const onBoundsChanged = (rect: google.maps.Rectangle | null) => {
    if (rect) {
      const newBounds = rect.getBounds();
      if (newBounds) {
        const ne = newBounds.getNorthEast();
        const sw = newBounds.getSouthWest();
        
        setBounds({
          north: ne.lat(),
          south: sw.lat(),
          east: ne.lng(),
          west: sw.lng()
        });

        const widthKm = Math.abs(ne.lng() - sw.lng()) * 111.32; 
        const heightKm = Math.abs(ne.lat() - sw.lat()) * 110.57;
        
        const area = (widthKm * heightKm).toFixed(1);
        const pop = Math.round((widthKm * heightKm) * 9000).toLocaleString();
        const trucks = Math.ceil(widthKm * heightKm * 1.2);

        setCoverageStats({
          areaSqKm: `${area}`,
          estPopulation: `${pop} residents`,
          requiredTrucks: `${trucks} Trucks required`
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Branch ${formData.name} initialized with ${coverageStats.areaSqKm} km² coverage zone!`);
  };

  if (!user) return null;

  const availableManagers = [
    { id: '1', name: 'John Doe (Station Manager - Douala)' },
    { id: '2', name: 'Jane Smith (Station Manager - Yaoundé)' }
  ];

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
        <Link href="/dashboard/admin/branches" className="inline-flex items-center gap-2 text-moss font-space font-bold hover:underline">
          <ChevronLeft size={18} /> Back to Branches
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-line overflow-hidden animate-fade-slide-up" style={{ animationDelay: '200ms', opacity: 0 }}>
        <div className="p-8 border-b border-line bg-gray-50/50">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-moss/10 text-moss rounded-xl">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-fraunces text-ink font-bold">Branch & Spatial Zone Setup</h2>
              <p className="text-sm text-muted font-space mt-1">Configure branch operational details and define Google Maps coverage boundaries.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2 font-space">Branch Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. HYSACAM Douala Sud" 
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-line font-space text-sm focus:outline-none focus:ring-2 focus:ring-moss/20 focus:border-moss transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2 font-space">Physical Station Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="e.g. Avenue De Gaulle, Bonanjo" 
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-line font-space text-sm focus:outline-none focus:ring-2 focus:ring-moss/20 focus:border-moss transition-all"
                />
              </div>
            </div>
          </div>

          {/* GOOGLE MAPS INTERACTIVE ZONE DRAGGER */}
          <div className="space-y-4 pt-4 border-t border-line">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-fraunces font-bold text-ink flex items-center gap-2"><Map size={20} className="text-[#C4693C]"/> Define Spatial Coverage</h3>
                <p className="text-xs text-muted font-space">Drag the corners of the rectangle to adjust the coverage boundaries. You can use Satellite view and enlarge the map.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsMapExpanded(true)}
                className="px-4 py-2 rounded-lg text-xs font-bold font-mono bg-moss/10 text-moss hover:bg-moss/20 transition-colors"
              >
                Enlarge Map ⛶
              </button>
            </div>

            <div className={isMapExpanded ? "fixed inset-0 z-[100] bg-white flex flex-col" : "relative h-96 rounded-2xl border border-line overflow-hidden bg-gray-100"}>
              {isMapExpanded && (
                <div className="p-4 border-b border-line flex justify-between items-center bg-white z-50">
                   <div>
                     <h3 className="font-fraunces font-bold text-lg">Expanded Map View</h3>
                     <p className="text-xs text-muted">Adjust branch coverage bounds.</p>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setIsMapExpanded(false)} 
                     className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
                   >
                     Close & Save
                   </button>
                </div>
              )}
              <div className="relative flex-1">
                <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={13}
                  >
                    <Rectangle
                      bounds={bounds}
                      editable={true}
                      draggable={true}
                      onBoundsChanged={function(this: google.maps.Rectangle) { onBoundsChanged(this) }}
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
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-white rounded-xl border border-line">
                <div className="text-[10px] uppercase font-bold font-space text-muted">Calculated Area</div>
                <div className="text-sm font-bold font-mono text-moss mt-0.5">{coverageStats.areaSqKm} km²</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-line">
                <div className="text-[10px] uppercase font-bold font-space text-muted">Est. Population inside zone</div>
                <div className="text-sm font-bold font-mono text-moss mt-0.5">{coverageStats.estPopulation}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-line">
                <div className="text-[10px] uppercase font-bold font-space text-muted">Required Logistics</div>
                <div className="text-sm font-bold font-mono text-clay mt-0.5">{coverageStats.requiredTrucks}</div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2 font-space">Assign Station Manager (Optional)</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <select 
                value={formData.managerId}
                onChange={(e) => setFormData({...formData, managerId: e.target.value})}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-line font-space text-sm focus:outline-none focus:ring-2 focus:ring-moss/20 focus:border-moss transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="">Leave Unassigned</option>
                {availableManagers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-line flex justify-end gap-4">
            <Link href="/dashboard/admin/branches" className="px-6 py-3 rounded-xl font-space font-bold text-muted hover:bg-sand transition-colors">
              Cancel
            </Link>
            <button type="submit" className="px-8 py-3 rounded-xl font-space font-bold text-white bg-moss hover:bg-moss-dark shadow-md transition-all hover:-translate-y-0.5">
              Initialize Branch
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
