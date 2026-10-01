'use client';

import React, { useEffect, useState } from 'react';
import DashboardHeader from '../../../components/DashboardHeader';
import { ReportStatus, PriorityLevel, Report, User } from '../../../../lib/types';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { fetchApi } from '../../../../lib/api';
import { CheckCircle2, Search, MapPin, AlertTriangle, XCircle, ExternalLink, Compass, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import mapboxgl from 'mapbox-gl';

export default function AssignReportsPage() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [selectedMapReport, setSelectedMapReport] = useState<any | null>(null);
  const [showPinDetails, setShowPinDetails] = useState(false);
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);

  React.useEffect(() => {
    if (selectedMapReport) {
      setTimeout(() => {
        if (mapContainerRef.current && !mapRef.current) {
          mapboxgl.accessToken = "pk.eyJ1Ijoid2FzMjlrZW0wMSIsImEiOiJjbXVncHdwZjkwb3p4MnpzZWZkeGd6d214In0.bSxWbFb9NqUQ5Gve5xT67g";
          const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/outdoors-v12',
            center: [selectedMapReport.longitude, selectedMapReport.latitude],
            zoom: 15
          });
          mapRef.current = map;

          map.on('load', () => {
            map.resize();
            new mapboxgl.Marker({ color: '#C4693C' })
              .setLngLat([selectedMapReport.longitude, selectedMapReport.latitude])
              .addTo(map);
          });
        }
      }, 100);
    } else {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    }
  }, [selectedMapReport, isDarkMode]);

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
        <div className="fixed inset-0 z-[100] flex flex-col card-theme overflow-hidden animate-fade-slide-up">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-theme flex justify-between items-center shadow-sm bg-[#2F4B3C] text-white z-10">
             <div>
                <h2 className="text-xl font-fraunces font-bold flex items-center gap-2">
                  <MapPin className="text-[#C4693C]" size={20} /> Location GPS Preview - Report #{selectedMapReport.id.toString().padStart(4, '0')}
                </h2>
             </div>
             <button onClick={() => { setSelectedMapReport(null); setShowPinDetails(false); }} className="text-white/80 hover:text-white p-2 rounded-full transition-colors">
               <X size={24} />
             </button>
          </div>

          <div className="flex-shrink-0 bg-theme-secondary p-5 border-b border-theme flex gap-6 z-10 shadow-sm">
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="font-mono font-bold text-theme-muted uppercase mb-1">Sector Address</p>
                    <div className="font-mono text-theme card-theme px-3 py-2.5 rounded-lg border border-theme font-bold">
                      {getSectorAddress(selectedMapReport.id, selectedMapReport.latitude, selectedMapReport.longitude)}
                    </div>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-theme-muted uppercase mb-1">Timestamp</p>
                    <p className="font-mono text-theme card-theme px-3 py-2.5 rounded-lg border border-theme font-bold">
                      {new Date(selectedMapReport.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-theme-muted uppercase mb-1">Status</p>
                    <div className="font-mono text-theme card-theme px-3 py-2.5 rounded-lg border border-theme font-bold">
                      {selectedMapReport.status}
                    </div>
                  </div>
              </div>
          </div>

          <div className="flex-1 relative flex bg-[#EAE5D9] overflow-hidden">
             <div className="absolute inset-0 bg-theme-secondary flex items-center justify-center">
                <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} className="absolute inset-0" />
                <button onClick={() => setShowPinDetails(true)} className="absolute bottom-6 right-6 z-40 px-4 py-3 shadow-lg bg-theme border border-theme text-theme font-mono text-xs font-bold rounded-xl hover:bg-theme-secondary transition-transform hover:-translate-y-1">View Pin Details</button>
             </div>

             <div className={`absolute top-0 left-0 h-full w-80 card-theme shadow-2xl z-30 transform transition-transform duration-300 flex flex-col ${showPinDetails ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-32 w-full bg-[#2F4B3C] relative flex items-center justify-center">
                  <MapPin size={40} className="text-white/30" />
                  <button onClick={() => setShowPinDetails(false)} className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">
                    <XCircle size={20} />
                  </button>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto">
                  <h3 className="text-xl font-fraunces font-bold text-theme mb-1">
                    Report Location Details
                  </h3>
                  <p className="text-sm font-mono text-theme-muted mb-4">
                    {getSectorAddress(selectedMapReport.id, selectedMapReport.latitude, selectedMapReport.longitude)}
                  </p>

                  <div className="flex justify-around mb-6 pb-6 border-b border-theme">
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-[#0E6C9D] flex items-center justify-center text-white group-hover:bg-[#0A527A] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
                      </div>
                      <span className="text-[10px] font-bold text-[#0E6C9D]">Directions</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-theme-muted mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-theme">GPS Coordinates</p>
                        <p className="text-[11px] font-mono text-theme-muted">{selectedMapReport.latitude}, {selectedMapReport.longitude}</p>
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
      
      <div className="card-theme rounded-xl shadow-xs border border-theme overflow-hidden animate-fade-slide-up">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-theme flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-theme-secondary">
          <div>
            <h2 className="text-lg font-fraunces text-theme font-bold">Verified Incident Dispatch</h2>
            <p className="text-xs text-theme-muted font-mono mt-0.5">Assign active field agents to collect verified waste locations.</p>
          </div>
          
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search Sector or Report ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-theme font-mono text-xs focus:outline-none focus:border-theme transition-all card-theme"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-theme-secondary border-b border-theme font-mono text-theme-muted uppercase font-bold">
                <th className="py-3.5 px-5">Report ID</th>
                <th className="py-3.5 px-5">Sector & Coordinates</th>
                <th className="py-3.5 px-5">Priority</th>
                <th className="py-3.5 px-5">Agent Assignment</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#E4DDCE]/30 dark:divide-[#2C2C2C]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center font-mono text-theme-muted">
                    Loading verified reports...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-theme-muted">
                    <CheckCircle2 size={32} className="mx-auto text-[#4E8B5C] mb-2" />
                    <p className="font-bold text-theme text-sm font-space">All Verified Reports Assigned!</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => {
                  const sectorAddr = getSectorAddress(r.id, r.latitude, r.longitude);
                  return (
                    <tr key={r.id} className="hover:bg-theme-secondary transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-theme">
                        #{r.id.toString().padStart(4, '0')}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-theme">
                        <div>
                          <div className="font-bold text-theme-muted flex items-center gap-1">
                            {sectorAddr}
                            <button 
                              onClick={() => setSelectedMapReport(r)}
                              className="text-[#C4693C] hover:text-[#9E3E2A] p-0.5"
                              title="Open interactive location map"
                            >
                              <ExternalLink size={13} />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-theme-muted mt-0.5">
                            <MapPin size={12} className="text-theme-muted" />
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
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-theme-secondary text-theme-muted">
                            NORMAL
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-mono">
                        <div className="flex items-center gap-2">
                          {assigningId === r.id ? (
                             <span className="text-theme-muted font-bold text-xs">Assigning...</span>
                          ) : r.assignedToId ? (
                            <div className="flex items-center gap-2 bg-theme-secondary border border-theme rounded-lg px-2.5 py-1">
                              <span className="text-theme font-bold text-xs">
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
                              className="border border-theme rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-theme bg-transparent text-theme cursor-pointer"
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val) assignAgent(r.id, parseInt(val));
                              }}
                              value=""
                            >
                              <option className="bg-theme-secondary" value="" disabled>Select Field Agent...</option>
                              {displayAgents.map(agent => (
                                <option className="bg-theme-secondary" key={agent.id} value={agent.id}>{agent.name}</option>
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
