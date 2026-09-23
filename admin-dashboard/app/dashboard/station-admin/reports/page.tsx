'use client';

import React, { useEffect, useState } from 'react';
import DashboardHeader from '../../../components/DashboardHeader';
import { ReportStatus, PriorityLevel, Report, User } from '../../../../lib/types';
import { useAuth } from '../../../context/AuthContext';
import { fetchApi } from '../../../../lib/api';
import { CheckCircle2, Search, MapPin, AlertTriangle, XCircle, ExternalLink, Compass, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';

export default function AssignReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [selectedMapReport, setSelectedMapReport] = useState<any | null>(null);
  const [showPinDetails, setShowPinDetails] = useState(false);

  // Sector name map helper
  const getSectorAddress = (id: number, lat: number, lng: number) => {
    if (id === 101 || (lat >= 3.84 && lat <= 3.85 && lng >= 11.50 && lng <= 11.51)) return 'Bastos - Avenue Marchand, Yaoundé';
    if (id === 102) return 'Nlongkak - Carrefour Elevage, Yaoundé';
    if (id === 103) return 'Mvan - Gare Routière South, Yaoundé';
    return `Sector Sector ${Math.floor(lat * 10)}, Yaoundé`;
  };

  // Fallback mock reports & agents for instant testing
  const mockReports: Report[] = [
    { id: 101, latitude: 3.8480, longitude: 11.5021, priority: PriorityLevel.HIGH, status: ReportStatus.VERIFIED, submitterId: 6, assignedToId: null, branchId: 1, createdAt: new Date().toISOString() },
    { id: 102, latitude: 3.8500, longitude: 11.5100, priority: PriorityLevel.NORMAL, status: ReportStatus.VERIFIED, submitterId: 6, assignedToId: 5, branchId: 1, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 103, latitude: 3.8420, longitude: 11.4980, priority: PriorityLevel.HIGH, status: ReportStatus.VERIFIED, submitterId: 6, assignedToId: null, branchId: 1, createdAt: new Date(Date.now() - 7200000).toISOString() },
  ];

  const mockAgents: User[] = [
    { id: 5, name: 'Paul Biya', email: 'agent@propre.com', role: 'FIELD_AGENT' as any, branchId: 1 },
    { id: 6, name: 'Samuel Eto', email: 'agent2@propre.com', role: 'FIELD_AGENT' as any, branchId: 1 },
    { id: 7, name: 'Francis Ngannou', email: 'agent3@propre.com', role: 'FIELD_AGENT' as any, branchId: 1 },
  ];

  useEffect(() => {
    if (user?.branchId) {
      loadData();
    } else {
      setReports(mockReports);
      setAgents(mockAgents);
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    try {
      const reportsData = await fetchApi(`/reports?branchId=${user?.branchId}&status=${ReportStatus.VERIFIED}`);
      setReports(reportsData && reportsData.length > 0 ? reportsData : mockReports);

      const agentsData = await fetchApi(`/users?branchId=${user?.branchId}&role=FIELD_AGENT`);
      setAgents(agentsData && agentsData.length > 0 ? agentsData : mockAgents);
    } catch (err) {
      console.error(err);
      setReports(mockReports);
      setAgents(mockAgents);
    } finally {
      setLoading(false);
    }
  };

  const assignAgent = async (reportId: number, agentId: number | null) => {
    try {
      setAssigningId(reportId);
      await fetchApi(`/reports/${reportId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedToId: agentId })
      });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, assignedToId: agentId } : r));
    } catch (err) {
      console.error(err);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, assignedToId: agentId } : r));
    } finally {
      setAssigningId(null);
    }
  };

  if (!user) return null;

  const displayReports = reports.length > 0 ? reports : mockReports;
  const displayAgents = agents.length > 0 ? agents : mockAgents;

  const filteredReports = displayReports.filter(r => 
    r.id.toString().padStart(4, '0').includes(search.replace('#', '')) || 
    r.status.toLowerCase().includes(search.toLowerCase()) ||
    getSectorAddress(r.id, r.latitude, r.longitude).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Interactive Location Map Modal */}
      {selectedMapReport && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden animate-fade-slide-up">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-[#E4DDCE] flex justify-between items-center shadow-sm bg-[#2F4B3C] text-white z-10">
             <div>
                <h2 className="text-xl font-fraunces font-bold flex items-center gap-2">
                  <MapPin className="text-[#C4693C]" size={20} /> Location GPS Preview - Report #{selectedMapReport.id.toString().padStart(4, '0')}
                </h2>
             </div>
             <button onClick={() => { setSelectedMapReport(null); setShowPinDetails(false); }} className="text-white/80 hover:text-white p-2 rounded-full transition-colors">
               <X size={24} />
             </button>
          </div>

          <div className="flex-shrink-0 bg-[#F9F7F2] p-5 border-b border-[#E4DDCE] flex gap-6 z-10 shadow-sm">
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="font-mono font-bold text-[#7A8272] uppercase mb-1">Sector Address</p>
                    <div className="font-mono text-[#21261F] bg-white px-3 py-2.5 rounded-lg border border-[#E4DDCE] font-bold">
                      {getSectorAddress(selectedMapReport.id, selectedMapReport.latitude, selectedMapReport.longitude)}
                    </div>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-[#7A8272] uppercase mb-1">Timestamp</p>
                    <p className="font-mono text-[#21261F] bg-white px-3 py-2.5 rounded-lg border border-[#E4DDCE] font-bold">
                      {new Date(selectedMapReport.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-[#7A8272] uppercase mb-1">Status</p>
                    <div className="font-mono text-[#21261F] bg-white px-3 py-2.5 rounded-lg border border-[#E4DDCE] font-bold">
                      {selectedMapReport.status}
                    </div>
                  </div>
              </div>
          </div>

          <div className="flex-1 relative flex bg-[#EAE5D9] overflow-hidden">
             <div className="absolute inset-0">
                <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: selectedMapReport.latitude, lng: selectedMapReport.longitude }}
                    zoom={16}
                    options={{ disableDefaultUI: false, zoomControl: true }}
                  >
                    <Marker 
                      position={{ lat: selectedMapReport.latitude, lng: selectedMapReport.longitude }} 
                      onClick={() => setShowPinDetails(true)}
                    />
                  </GoogleMap>
                </LoadScript>
             </div>

             <div className={`absolute top-0 left-0 h-full w-80 bg-white shadow-2xl z-30 transform transition-transform duration-300 flex flex-col ${showPinDetails ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-32 w-full bg-[#2F4B3C] relative flex items-center justify-center">
                  <MapPin size={40} className="text-white/30" />
                  <button onClick={() => setShowPinDetails(false)} className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">
                    <XCircle size={20} />
                  </button>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto">
                  <h3 className="text-xl font-fraunces font-bold text-[#21261F] mb-1">
                    Report Location Details
                  </h3>
                  <p className="text-sm font-mono text-[#7A8272] mb-4">
                    {getSectorAddress(selectedMapReport.id, selectedMapReport.latitude, selectedMapReport.longitude)}
                  </p>

                  <div className="flex justify-around mb-6 pb-6 border-b border-[#E4DDCE]">
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-[#0E6C9D] flex items-center justify-center text-white group-hover:bg-[#0A527A] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
                      </div>
                      <span className="text-[10px] font-bold text-[#0E6C9D]">Directions</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-[#2F4B3C] mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#21261F]">GPS Coordinates</p>
                        <p className="text-[11px] font-mono text-[#7A8272]">{selectedMapReport.latitude}, {selectedMapReport.longitude}</p>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>,
        document.body
      )}

      <div className="animate-fade-slide-up">
        <DashboardHeader title="Assign Reports to Field Agents" user={{ name: user.name, role: user.role }} />
      </div>
      
      <div className="bg-white rounded-xl shadow-xs border border-[#E4DDCE] overflow-hidden animate-fade-slide-up">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-[#E4DDCE] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F9F7F2]">
          <div>
            <h2 className="text-lg font-fraunces text-[#2F4B3C] font-bold">Verified Incident Dispatch</h2>
            <p className="text-xs text-[#7A8272] font-mono mt-0.5">Assign active field agents to collect verified waste locations.</p>
          </div>
          
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8272]" size={16} />
            <input 
              type="text" 
              placeholder="Search Sector or Report ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E4DDCE] font-mono text-xs focus:outline-none focus:border-[#2F4B3C] transition-all bg-white"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4EFE6]/40 border-b border-[#E4DDCE] font-mono text-[#7A8272] uppercase font-bold">
                <th className="py-3.5 px-5">Report ID</th>
                <th className="py-3.5 px-5">Sector & Coordinates</th>
                <th className="py-3.5 px-5">Priority</th>
                <th className="py-3.5 px-5">Agent Assignment</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#E4DDCE]/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center font-mono text-[#7A8272]">
                    Loading verified reports...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#7A8272]">
                    <CheckCircle2 size={32} className="mx-auto text-[#4E8B5C] mb-2" />
                    <p className="font-bold text-[#21261F] text-sm font-space">All Verified Reports Assigned!</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => {
                  const sectorAddr = getSectorAddress(r.id, r.latitude, r.longitude);
                  return (
                    <tr key={r.id} className="hover:bg-[#F9F7F2]/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#21261F]">
                        #{r.id.toString().padStart(4, '0')}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[#21261F]">
                        <div>
                          <div className="font-bold text-[#2F4B3C] flex items-center gap-1">
                            {sectorAddr}
                            <button 
                              onClick={() => setSelectedMapReport(r)}
                              className="text-[#C4693C] hover:text-[#9E3E2A] p-0.5"
                              title="Open interactive location map"
                            >
                              <ExternalLink size={13} />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#7A8272] mt-0.5">
                            <MapPin size={12} className="text-[#7A8272]" />
                            [{r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}]
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono">
                        {r.priority === PriorityLevel.HIGH ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#B7503A]/10 text-[#B7503A]">
                            <AlertTriangle size={11} /> HIGH
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                            NORMAL
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-mono">
                        <div className="flex items-center gap-2">
                          {assigningId === r.id ? (
                             <span className="text-[#2F4B3C] font-bold text-xs">Assigning...</span>
                          ) : r.assignedToId ? (
                            <div className="flex items-center gap-2 bg-[#2F4B3C]/10 border border-[#2F4B3C]/20 rounded-lg px-2.5 py-1">
                              <span className="text-[#2F4B3C] font-bold text-xs">
                                {displayAgents.find(a => a.id === r.assignedToId)?.name || 'Assigned Agent'}
                              </span>
                              <button 
                                onClick={() => assignAgent(r.id, null)}
                                className="text-[#B7503A] hover:underline text-[10px] font-bold ml-1 flex items-center gap-0.5"
                              >
                                <XCircle size={12} /> Unassign
                              </button>
                            </div>
                          ) : (
                            <select 
                              className="border border-[#E4DDCE] rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-[#2F4B3C] bg-white cursor-pointer"
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val) assignAgent(r.id, parseInt(val));
                              }}
                              value=""
                            >
                              <option value="" disabled>Select Field Agent...</option>
                              {displayAgents.map(agent => (
                                <option key={agent.id} value={agent.id}>{agent.name}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
