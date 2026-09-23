'use client';

import React, { useState } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Users, Activity, ArrowRight, BarChart3, TrendingUp, Building, Calendar, XCircle, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';
import Link from 'next/link';
import { createPortal } from 'react-dom';

interface DayDetail {
  day: string;
  fullDate: string;
  reportsCollected: number;
  outOfCoverage: number;
  activeAgents: number;
  tonnesCollected: number;
  efficiency: number;
}

export default function AdminOverviewDashboard() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<DayDetail | null>(null);

  if (!user) return null;

  const weeklyData: DayDetail[] = [
    { day: 'Mon', fullDate: 'Sept 8, 2026', reportsCollected: 142, outOfCoverage: 6, activeAgents: 18, tonnesCollected: 4.8, efficiency: 94 },
    { day: 'Tue', fullDate: 'Sept 9, 2026', reportsCollected: 168, outOfCoverage: 8, activeAgents: 20, tonnesCollected: 5.2, efficiency: 92 },
    { day: 'Wed', fullDate: 'Sept 10, 2026', reportsCollected: 195, outOfCoverage: 4, activeAgents: 22, tonnesCollected: 6.1, efficiency: 96 },
    { day: 'Thu', fullDate: 'Sept 11, 2026', reportsCollected: 154, outOfCoverage: 9, activeAgents: 19, tonnesCollected: 4.9, efficiency: 91 },
    { day: 'Fri', fullDate: 'Sept 12, 2026', reportsCollected: 210, outOfCoverage: 5, activeAgents: 24, tonnesCollected: 7.3, efficiency: 97 },
    { day: 'Sat', fullDate: 'Sept 13, 2026', reportsCollected: 180, outOfCoverage: 7, activeAgents: 21, tonnesCollected: 5.8, efficiency: 93 },
    { day: 'Sun', fullDate: 'Sept 14, 2026', reportsCollected: 110, outOfCoverage: 3, activeAgents: 14, tonnesCollected: 3.4, efficiency: 95 },
  ];

  const maxReports = Math.max(...weeklyData.map(d => d.reportsCollected));

  const branchStats = [
    { name: 'Douala North', reports: 1245, resolved: 89, agents: 14, status: 'Active' },
    { name: 'Douala South', reports: 980, resolved: 92, agents: 11, status: 'Active' },
    { name: 'Yaoundé Central', reports: 1530, resolved: 78, agents: 18, status: 'Optimal' },
  ];

  return (
    <div className="space-y-8 pb-12 relative">
      <div className="animate-fade-slide-up">
        <DashboardHeader title="Regional Operations Center" user={{ name: user.name, role: user.role, branchName: user.branchName }} />
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Operating Branches', value: '3', trend: '+1 new', icon: MapPin, color: 'text-[#2F4B3C]', bg: 'bg-[#2F4B3C]/10' },
          { label: 'Active Field Force', value: '43 Agents', trend: '+4 this month', icon: Users, color: 'text-[#21261F]', bg: 'bg-[#F4EFE6]' },
          { label: 'Total Incidents Logged', value: '3,755', trend: '+14% YoY', icon: BarChart3, color: 'text-[#D7A24A]', bg: 'bg-[#D7A24A]/10' },
          { label: 'System Resolution Rate', value: '86.4%', trend: 'High Efficiency', icon: Activity, color: 'text-[#4E8B5C]', bg: 'bg-[#4E8B5C]/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-[#E4DDCE] shadow-xs hover:shadow-md transition-all animate-fade-slide-up">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[11px] font-mono font-bold text-[#4E8B5C] bg-[#4E8B5C]/10 px-2 py-0.5 rounded">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-2xl font-fraunces font-bold text-[#21261F]">{stat.value}</p>
              <p className="text-xs font-mono text-[#7A8272] mt-1 uppercase tracking-wider font-semibold">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Collection Activity Chart (Interactive Day Click) */}
      <div className="bg-white rounded-xl p-6 border border-[#E4DDCE] shadow-xs animate-fade-slide-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b border-[#E4DDCE]">
          <div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#2F4B3C]" />
              <h2 className="text-lg font-fraunces font-bold text-[#21261F]">Weekly Collection Activity</h2>
            </div>
            <p className="text-xs text-[#7A8272] font-mono mt-0.5">Click on any day bar to view detailed metrics.</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#2F4B3C] bg-[#2F4B3C]/10 px-3 py-1 rounded-full">
            Sept 8 - Sept 14, 2026
          </span>
        </div>

        <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-48 pt-4">
          {weeklyData.map((item) => {
            const heightPercent = Math.round((item.reportsCollected / maxReports) * 100);
            return (
              <div 
                key={item.day}
                onClick={() => setSelectedDay(item)}
                className="flex flex-col items-center gap-2 group cursor-pointer h-full justify-end"
              >
                <span className="text-[10px] font-mono font-bold text-[#7A8272] opacity-0 group-hover:opacity-100 transition-opacity bg-[#21261F] text-white px-1.5 py-0.5 rounded">
                  {item.reportsCollected}
                </span>
                <div className="w-full bg-[#F4EFE6] rounded-t-lg h-36 relative overflow-hidden border border-[#E4DDCE] flex items-end">
                  <div 
                    className="w-full bg-[#2F4B3C] group-hover:bg-[#C4693C] transition-all rounded-t-sm"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
                <span className="text-xs font-mono font-bold text-[#21261F] group-hover:text-[#C4693C]">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branch Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-[#E4DDCE] overflow-hidden animate-fade-slide-up">
          <div className="p-5 border-b border-[#E4DDCE] flex justify-between items-center bg-[#F9F7F2]">
            <div>
              <h2 className="text-lg font-fraunces text-[#2F4B3C] font-bold">Branch Performance Ledger</h2>
              <p className="text-xs text-[#7A8272] font-mono mt-0.5">Live monitoring across assigned regional sectors.</p>
            </div>
            <Link href="/dashboard/admin/branches" className="text-[#2F4B3C] font-mono font-bold text-xs hover:underline flex items-center gap-1">
              Manage All <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4EFE6]/40 border-b border-[#E4DDCE] font-mono text-[#7A8272] uppercase font-bold">
                  <th className="py-3.5 px-5">Branch Name</th>
                  <th className="py-3.5 px-5">Field Agents</th>
                  <th className="py-3.5 px-5">Reports Logged</th>
                  <th className="py-3.5 px-5">Resolution %</th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DDCE]/60">
                {branchStats.map((branch, i) => (
                  <tr key={i} className="hover:bg-[#F9F7F2]/60 transition-colors">
                    <td className="py-4 px-5 font-bold text-[#21261F] flex items-center gap-2">
                      <Building size={16} className="text-[#2F4B3C]" />
                      {branch.name}
                    </td>
                    <td className="py-4 px-5 font-mono text-[#21261F]">{branch.agents} Agents</td>
                    <td className="py-4 px-5 font-mono text-[#21261F]">{branch.reports.toLocaleString()}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-24 bg-[#E4DDCE] rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full ${branch.resolved > 85 ? 'bg-[#4E8B5C]' : 'bg-[#D7A24A]'}`} style={{ width: `${branch.resolved}%` }}></div>
                        </div>
                        <span className="font-mono font-bold text-[#21261F]">{branch.resolved}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#4E8B5C] bg-[#4E8B5C]/10 px-2.5 py-1 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4E8B5C]"></span>
                        {branch.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-white rounded-xl shadow-xs border border-[#E4DDCE] overflow-hidden animate-fade-slide-up flex flex-col">
          <div className="p-5 border-b border-[#E4DDCE] bg-[#F9F7F2]">
            <h2 className="text-lg font-fraunces text-[#2F4B3C] font-bold">Administrative Actions</h2>
            <p className="text-xs text-[#7A8272] font-mono mt-0.5">Management tools & system audits.</p>
          </div>
          
          <div className="p-5 flex-1 flex flex-col justify-center gap-3">
            <Link href="/dashboard/admin/branches/new" className="group p-4 rounded-xl border border-[#E4DDCE] bg-[#FAF7F2] hover:border-[#2F4B3C] hover:bg-white transition-all flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#2F4B3C]/10 text-[#2F4B3C] rounded-lg">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-fraunces font-bold text-sm text-[#21261F]">Initialize New Branch</h3>
                  <p className="text-xs font-mono text-[#7A8272]">Deploy regional infrastructure.</p>
                </div>
              </div>
              <ArrowRight className="text-[#2F4B3C] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={18} />
            </Link>

            <Link href="/dashboard/admin/promotions" className="group p-4 rounded-xl border border-[#E4DDCE] bg-[#FAF7F2] hover:border-[#2F4B3C] hover:bg-white transition-all flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#2F4B3C]/10 text-[#2F4B3C] rounded-lg">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="font-fraunces font-bold text-sm text-[#21261F]">Audit Staff Promotions</h3>
                  <p className="text-xs font-mono text-[#7A8272]">Review role clearance changes.</p>
                </div>
              </div>
              <ArrowRight className="text-[#2F4B3C] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* DAY DETAILS MODAL */}
      {selectedDay && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#21261F]/60 backdrop-blur-xs animate-fade-slide-up">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border border-[#E4DDCE]">
            <button 
              onClick={() => setSelectedDay(null)}
              className="absolute top-6 right-6 text-[#7A8272] hover:text-[#21261F] transition-colors p-1"
            >
              <XCircle size={24} />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E4DDCE]">
              <div className="p-3 bg-[#2F4B3C]/10 text-[#2F4B3C] rounded-2xl">
                <Calendar size={24} />
              </div>
              <div>
                <h2 className="text-xl font-fraunces font-bold text-[#21261F]">{selectedDay.day} Breakdown</h2>
                <p className="text-xs font-mono text-[#C4693C] font-bold mt-0.5">{selectedDay.fullDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#F4EFE6]/60 p-4 rounded-2xl border border-[#E4DDCE]">
                <div className="flex items-center gap-2 text-[#4E8B5C] mb-1">
                  <CheckCircle2 size={16} />
                  <span className="text-[10px] font-mono font-bold uppercase">Reports Collected</span>
                </div>
                <p className="text-2xl font-fraunces font-bold text-[#21261F]">{selectedDay.reportsCollected}</p>
                <p className="text-[10px] font-mono text-[#7A8272] mt-0.5">Verified & Resolved</p>
              </div>

              <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <AlertTriangle size={16} />
                  <span className="text-[10px] font-mono font-bold uppercase">Out of Coverage</span>
                </div>
                <p className="text-2xl font-fraunces font-bold text-red-700">{selectedDay.outOfCoverage}</p>
                <p className="text-[10px] font-mono text-red-600/70 mt-0.5">Outside Station Radius</p>
              </div>

              <div className="bg-[#2F4B3C]/10 p-4 rounded-2xl border border-[#2F4B3C]/20">
                <div className="flex items-center gap-2 text-[#2F4B3C] mb-1">
                  <Truck size={16} />
                  <span className="text-[10px] font-mono font-bold uppercase">Active Field Agents</span>
                </div>
                <p className="text-2xl font-fraunces font-bold text-[#2F4B3C]">{selectedDay.activeAgents}</p>
                <p className="text-[10px] font-mono text-[#7A8272] mt-0.5">On Active Patrol</p>
              </div>

              <div className="bg-[#D7A24A]/10 p-4 rounded-2xl border border-[#D7A24A]/20">
                <div className="flex items-center gap-2 text-[#D7A24A] mb-1">
                  <Activity size={16} />
                  <span className="text-[10px] font-mono font-bold uppercase">Waste Volume</span>
                </div>
                <p className="text-2xl font-fraunces font-bold text-[#21261F]">{selectedDay.tonnesCollected} T</p>
                <p className="text-[10px] font-mono text-[#7A8272] mt-0.5">Metric Tonnes Processed</p>
              </div>
            </div>

            <div className="bg-[#F9F7F2] p-4 rounded-2xl border border-[#E4DDCE] flex items-center justify-between mb-6">
              <span className="text-xs font-mono font-bold text-[#7A8272] uppercase">Day Efficiency Index</span>
              <span className="text-sm font-mono font-bold text-[#4E8B5C] bg-[#4E8B5C]/10 px-3 py-1 rounded-full border border-[#4E8B5C]/20">
                {selectedDay.efficiency}% Optimal
              </span>
            </div>

            <div className="pt-2 border-t border-[#E4DDCE] flex justify-end">
              <button 
                onClick={() => setSelectedDay(null)}
                className="w-full py-3 rounded-xl font-mono text-xs font-bold bg-[#121A15] text-white hover:bg-[#233A2E] transition-all shadow-md"
              >
                Close Day Details
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
