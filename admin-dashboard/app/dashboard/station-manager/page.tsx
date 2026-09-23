'use client';

import React, { useEffect, useState } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { ReportStatus, PriorityLevel, Report } from '../../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../../lib/api';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Search, Filter, MapPin, FileText, ExternalLink } from 'lucide-react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';

export default function StationManagerDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showPinDetails, setShowPinDetails] = useState(false);

  useEffect(() => {
    if (user?.branchId) {
      loadReports();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getApproximateLocation = (lat: number, lng: number) => {
    // Basic mock logic to represent real locations from coordinates in Yaoundé
    if (lat > 4.1) return "Bastos, Avenue Charles de Gaulle";
    if (lat < 3.8) return "Mvan, Nsam Area";
    if (lng > 11.53) return "Omnisports, Ahmadou Ahidjo";
    return "Mvog-Mbi, Central District";
  };

  const loadReports = async () => {
    try {
      const data = await fetchApi(`/reports?branchId=${user?.branchId}`);
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: ReportStatus) => {
    try {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      await fetchApi(`/reports/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error(err);
      loadReports();
    }
  };

  const updatePriority = async (id: number, priority: PriorityLevel) => {
    try {
      setReports(prev => prev.map(r => r.id === id ? { ...r, priority } : r));
      await fetchApi(`/reports/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ priority })
      });
    } catch (err) {
      console.error(err);
      loadReports();
    }
  };

  if (!user) return null;

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.id.toString().padStart(4, '0').includes(search.replace('#', '')) || 
                          r.status.toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'HIGH_PRIORITY') matchesFilter = r.priority === PriorityLevel.HIGH;
    if (filter === 'PENDING') matchesFilter = r.status === ReportStatus.PENDING || r.status === ReportStatus.RECEIVED;
    if (filter === 'VERIFIED') matchesFilter = r.status === ReportStatus.VERIFIED;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Review Modal Overlay - Full Screen */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden animate-fade-slide-up">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-[#E4DDCE] flex justify-between items-center shadow-sm bg-white z-10">
             <div>
                <h2 className="text-2xl font-fraunces font-bold text-[#21261F] flex items-center gap-4">
                  Citizen Incident Report Details #{selectedReport.id.toString().padStart(4, '0')}
                  
                  <button 
                    onClick={() => {
                        const newPriority = selectedReport.priority === PriorityLevel.HIGH ? PriorityLevel.NORMAL : PriorityLevel.HIGH;
                        updatePriority(selectedReport.id, newPriority);
                        setSelectedReport({...selectedReport, priority: newPriority});
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${selectedReport.priority === PriorityLevel.HIGH ? 'bg-[#B7503A]/10 text-[#B7503A] border-[#B7503A]/30 hover:bg-[#B7503A] hover:text-white' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                  >
                    <AlertTriangle size={14} /> {selectedReport.priority === PriorityLevel.HIGH ? 'HIGH PRIORITY' : 'MARK HIGH'}
                  </button>
                </h2>
             </div>
             <button onClick={() => setSelectedReport(null)} className="text-[#7A8272] hover:text-[#21261F] p-2 bg-[#F4EFE6] rounded-full transition-colors">
               <XCircle size={24} />
             </button>
          </div>

          {/* Details Bar */}
          <div className="flex-shrink-0 bg-[#F9F7F2] p-5 border-b border-[#E4DDCE] flex gap-6 z-10 shadow-sm">
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="font-mono font-bold text-[#7A8272] uppercase mb-1">Real Location</p>
                    <div className="font-mono text-[#21261F] bg-white px-3 py-2.5 rounded-lg border border-[#E4DDCE] font-bold">
                      {getApproximateLocation(selectedReport.latitude, selectedReport.longitude)}
                    </div>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-[#7A8272] uppercase mb-1">Timestamp</p>
                    <p className="font-mono text-[#21261F] bg-white px-3 py-2.5 rounded-lg border border-[#E4DDCE] font-bold">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-[#7A8272] uppercase mb-1">Status</p>
                    <div className="font-mono text-[#21261F] bg-white px-3 py-2.5 rounded-lg border border-[#E4DDCE] font-bold">
                      {selectedReport.status}
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                      {(selectedReport.status === ReportStatus.PENDING || selectedReport.status === ReportStatus.RECEIVED) ? (
                        <div className="flex gap-2 h-[38px]">
                          <button 
                            onClick={() => { updateStatus(selectedReport.id, ReportStatus.RESOLVED_ALREADY_CLEAN); setSelectedReport(null); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#B7503A]/10 text-[#B7503A] hover:bg-[#B7503A] hover:text-white transition-all border border-[#B7503A]/20"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                          <button 
                            onClick={() => { updateStatus(selectedReport.id, ReportStatus.VERIFIED); setSelectedReport(null); }}
                            className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#2F4B3C] text-white hover:bg-[#1D3128] transition-all shadow-md"
                          >
                            <CheckCircle2 size={14} /> Send to Station Admin
                          </button>
                        </div>
                      ) : (
                         <div className="h-[38px] flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 font-bold font-mono text-xs border border-gray-200">
                            Already Processed
                         </div>
                      )}
                  </div>
              </div>
          </div>

          {/* Main Map Content */}
          <div className="flex-1 relative flex bg-[#EAE5D9] overflow-hidden">
             <div className="absolute inset-0">
                <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: selectedReport.latitude, lng: selectedReport.longitude }}
                    zoom={16}
                    options={{ disableDefaultUI: true, zoomControl: true }}
                  >
                    <Marker 
                      position={{ lat: selectedReport.latitude, lng: selectedReport.longitude }} 
                      onClick={() => setShowPinDetails(true)}
                    />
                  </GoogleMap>
                </LoadScript>
             </div>

             {/* Location Details Container (Like Google Maps Sidebar) */}
             <div className={`absolute top-0 left-0 h-full w-80 bg-white shadow-2xl z-30 transform transition-transform duration-300 flex flex-col ${showPinDetails ? 'translate-x-0' : '-translate-x-full'}`}>
                {selectedReport.photoUrl ? (
                  <div className="h-40 w-full relative">
                    <img src={selectedReport.photoUrl} alt="Location" className="w-full h-full object-cover" />
                    <button onClick={() => setShowPinDetails(false)} className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors">
                      <XCircle size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="h-32 w-full bg-[#2F4B3C] relative flex items-center justify-center">
                    <MapPin size={40} className="text-white/30" />
                    <button onClick={() => setShowPinDetails(false)} className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">
                      <XCircle size={20} />
                    </button>
                  </div>
                )}
                
                <div className="p-5 flex-1 overflow-y-auto">
                  <h3 className="text-xl font-fraunces font-bold text-[#21261F] mb-1">
                    Report Location
                  </h3>
                  <p className="text-sm font-mono text-[#7A8272] mb-4">
                    {getApproximateLocation(selectedReport.latitude, selectedReport.longitude)}
                  </p>

                  <div className="flex justify-around mb-6 pb-6 border-b border-[#E4DDCE]">
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-[#0E6C9D] flex items-center justify-center text-white group-hover:bg-[#0A527A] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
                      </div>
                      <span className="text-[10px] font-bold text-[#0E6C9D]">Directions</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-[#F4EFE6] flex items-center justify-center text-[#0E6C9D] border border-[#0E6C9D]/20 group-hover:bg-[#E4DDCE] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                      </div>
                      <span className="text-[10px] font-bold text-[#0E6C9D]">Save</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-[#F4EFE6] flex items-center justify-center text-[#0E6C9D] border border-[#0E6C9D]/20 group-hover:bg-[#E4DDCE] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                      </div>
                      <span className="text-[10px] font-bold text-[#0E6C9D]">Share</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-[#2F4B3C] mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#21261F]">GPS Coordinates</p>
                        <p className="text-[11px] font-mono text-[#7A8272]">{selectedReport.latitude}, {selectedReport.longitude}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={18} className="text-[#2F4B3C] mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#21261F]">Reported At</p>
                        <p className="text-[11px] font-mono text-[#7A8272]">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className="text-[#2F4B3C] mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#21261F]">Report Status</p>
                        <p className="text-[11px] font-mono font-bold text-[#B7503A]">{selectedReport.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
              
              {/* Overlay Photo Window (Only show if details panel is closed or if it's placed differently) */}
              {!showPinDetails && selectedReport.photoUrl && (
                  <div className="absolute bottom-8 right-8 w-64 h-64 bg-white rounded-xl shadow-2xl border-4 border-white overflow-hidden flex flex-col group z-10">
                     <p className="text-[10px] font-mono font-bold p-1.5 bg-[#21261F] text-white text-center uppercase tracking-widest z-10 shadow-sm relative">Citizen Evidence</p>
                     <img src={selectedReport.photoUrl} alt="Evidence" className="flex-1 object-cover transition-transform group-hover:scale-105 duration-500" />
                  </div>
              )}
              
              {!showPinDetails && !selectedReport.photoUrl && (
                  <div className="absolute bottom-8 right-8 w-64 h-32 bg-white rounded-xl shadow-2xl border border-[#E4DDCE] flex flex-col items-center justify-center p-4 z-10">
                     <FileText size={32} className="text-[#2F4B3C]/50 mb-2" />
                     <p className="text-xs font-bold text-[#21261F]">No Citizen Photo</p>
                     <p className="text-[10px] text-[#7A8272] text-center mt-1">Submitted without image evidence.</p>
                  </div>
              )}
          </div>
        </div>
      )}

      <div className="animate-fade-slide-up">
        <DashboardHeader title="Reports Audit & Verification" user={{ name: user.name, role: user.role, branchName: user.branchName }} />
      </div>
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Pending Verification', value: reports.filter(r => r.status === 'PENDING').length, icon: Clock, color: 'text-[#D7A24A]', bg: 'bg-[#D7A24A]/10' },
          { label: 'High Priority Reports', value: reports.filter(r => r.priority === 'HIGH').length, icon: AlertTriangle, color: 'text-[#B7503A]', bg: 'bg-[#B7503A]/10' },
          { label: 'Verified Incidents', value: reports.filter(r => r.status === 'VERIFIED').length, icon: CheckCircle2, color: 'text-[#4E8B5C]', bg: 'bg-[#4E8B5C]/10' },
          { label: 'Total Logs Scanned', value: reports.length, icon: MapPin, color: 'text-[#2F4B3C]', bg: 'bg-[#2F4B3C]/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-[#E4DDCE] shadow-xs hover:shadow-md transition-all animate-fade-slide-up">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-fraunces font-bold text-[#21261F]">{stat.value}</p>
              <p className="text-xs font-mono text-[#7A8272] mt-1 uppercase tracking-wider font-semibold">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-[#E4DDCE] overflow-hidden animate-fade-slide-up">
        
        {/* Table Toolbar */}
        <div className="p-5 border-b border-[#E4DDCE] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F9F7F2]">
          <div>
            <h2 className="text-lg font-fraunces text-[#2F4B3C] font-bold">Incoming Incident Ledger</h2>
            <p className="text-xs text-[#7A8272] font-mono mt-0.5">Audit citizen-submitted waste reports for your branch.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8272]" size={16} />
              <input 
                type="text" 
                placeholder="Filter ID or status..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E4DDCE] font-mono text-xs focus:outline-none focus:border-[#2F4B3C] transition-all bg-white"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg font-mono text-xs font-semibold transition-colors ${filter !== 'ALL' ? 'border-[#2F4B3C] bg-[#2F4B3C]/10 text-[#2F4B3C]' : 'border-[#E4DDCE] text-[#21261F] bg-white hover:bg-[#F4EFE6]'}`}
              >
                <Filter size={14} />
                {filter === 'ALL' ? 'All Filters' : filter.replace('_', ' ')}
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 top-10 w-44 bg-white border border-[#E4DDCE] rounded-xl shadow-lg z-30 py-1 text-xs">
                  <button onClick={() => { setFilter('ALL'); setShowFilterDropdown(false); }} className="w-full text-left px-3 py-1.5 font-mono hover:bg-[#F4EFE6]">All Reports</button>
                  <button onClick={() => { setFilter('PENDING'); setShowFilterDropdown(false); }} className="w-full text-left px-3 py-1.5 font-mono hover:bg-[#F4EFE6]">Pending Only</button>
                  <button onClick={() => { setFilter('VERIFIED'); setShowFilterDropdown(false); }} className="w-full text-left px-3 py-1.5 font-mono hover:bg-[#F4EFE6]">Verified Only</button>
                  <button onClick={() => { setFilter('HIGH_PRIORITY'); setShowFilterDropdown(false); }} className="w-full text-left px-3 py-1.5 font-mono hover:bg-[#F4EFE6]">High Priority</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4EFE6]/40 border-b border-[#E4DDCE] font-mono text-[#7A8272] uppercase font-bold">
                <th className="py-3.5 px-5">Report ID</th>
                <th className="py-3.5 px-5">Date Logged</th>
                <th className="py-3.5 px-5">Coordinates</th>
                <th className="py-3.5 px-5">Priority</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#E4DDCE]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center font-mono text-[#7A8272]">
                    Loading station reports...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7A8272]">
                    <p className="font-bold text-[#21261F] text-sm font-space">No matching reports found</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F9F7F2]/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#21261F]">
                      #{r.id.toString().padStart(4, '0')}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#7A8272]">
                      {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#21261F] text-[11px] font-bold">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#2F4B3C]" />
                        {getApproximateLocation(r.latitude, r.longitude)}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono">
                      <button 
                        onClick={() => updatePriority(r.id, r.priority === PriorityLevel.HIGH ? PriorityLevel.NORMAL : PriorityLevel.HIGH)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${r.priority === PriorityLevel.HIGH ? 'bg-[#B7503A]/10 text-[#B7503A] border-[#B7503A]/20 hover:bg-[#B7503A] hover:text-white' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                        title="Toggle High Priority"
                      >
                        {r.priority === PriorityLevel.HIGH ? (
                          <><AlertTriangle size={11} /> HIGH</>
                        ) : (
                          'MARK HIGH'
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 font-mono">
                      {r.status === ReportStatus.PENDING || r.status === ReportStatus.RECEIVED ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#D7A24A]/10 text-[#D7A24A]">
                          <Clock size={11} /> PENDING
                        </span>
                      ) : r.status === ReportStatus.VERIFIED ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#4E8B5C]/10 text-[#4E8B5C]">
                          <CheckCircle2 size={11} /> VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                          {r.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => setSelectedReport(r)} 
                          className="px-3 py-1 bg-[#2F4B3C] text-white font-mono text-[11px] font-bold rounded-md hover:bg-[#1D3128] transition-colors shadow-xs"
                        >
                          Review
                        </button>
                        {(r.status === ReportStatus.PENDING || r.status === ReportStatus.RECEIVED) && (
                          <button 
                            onClick={() => updateStatus(r.id, ReportStatus.VERIFIED)} 
                            className="p-1 bg-[#4E8B5C]/10 text-[#4E8B5C] hover:bg-[#4E8B5C] hover:text-white rounded-md transition-colors"
                            title="Verify"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
