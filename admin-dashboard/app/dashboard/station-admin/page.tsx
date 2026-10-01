'use client';

import React, { useState } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Activity, Truck, AlertTriangle, TrendingUp, TrendingDown, Clock, CheckCircle2, Calendar } from 'lucide-react';

export default function StationAdminDashboard() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  if (!user) return null;

  return (
    <div className="space-y-8 pb-12">
      <div className="animate-fade-slide-up">
        <DashboardHeader title="Station Analytics Overview" user={{ name: user.name, role: user.role }} />
      </div>
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Reports Collected (Today)', value: '142', icon: Truck, trend: '+12%', color: 'text-theme-muted', bg: 'bg-theme-secondary' },
          { label: 'Out of Coverage Areas', value: '18', icon: AlertTriangle, trend: '-5%', color: 'text-[#B7503A]', bg: 'bg-[#B7503A]/10' },
          { label: 'Active Field Agents', value: '45', icon: Activity, trend: '+2 online', color: 'text-theme-muted', bg: 'bg-theme-secondary' },
          { label: 'Avg. Resolution Time', value: '4.2h', icon: Clock, trend: '-1.1h faster', color: 'text-[#D7A24A]', bg: 'bg-[#D7A24A]/10' },
        ].map((stat, i) => (
          <div key={i} className="card-theme rounded-xl p-5 border border-theme shadow-xs hover:shadow-md transition-all animate-fade-slide-up">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-mono font-bold ${stat.trend.startsWith('+') ? 'text-[#4E8B5C]' : 'text-[#B7503A]'}`}>
                {stat.trend.startsWith('+') ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.trend}
              </div>
            </div>
            <h3 className="text-2xl font-fraunces font-bold text-theme">{stat.value}</h3>
            <p className="text-xs font-mono text-theme-muted mt-1 font-semibold uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Charts & Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart Container */}
        <div className="lg:col-span-2 card-theme rounded-xl p-6 border border-theme shadow-xs animate-fade-slide-up relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-fraunces text-lg font-bold text-theme">Weekly Collection Activity</h3>
              <p className="text-xs font-mono text-theme-muted mt-0.5">Verified vs collected reports volume</p>
            </div>
            
            <div className="relative">
              <select className="appearance-none bg-theme-secondary hover:bg-theme-secondary border border-theme rounded-lg px-3 py-1.5 text-xs font-mono font-semibold text-theme focus:outline-none cursor-pointer">
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
          </div>
          
          {/* Chart Graphic */}
          <div className="h-60 w-full flex items-end justify-between gap-4 border-b border-theme pb-3 relative mt-4 px-2">
            {[
              { collected: 40, verified: 60, day: 'Mon' },
              { collected: 70, verified: 80, day: 'Tue' },
              { collected: 45, verified: 55, day: 'Wed' },
              { collected: 90, verified: 95, day: 'Thu' },
              { collected: 65, verified: 75, day: 'Fri' },
              { collected: 85, verified: 90, day: 'Sat' },
              { collected: 100, verified: 100, day: 'Sun' }
            ].map((data, i) => (
              <div 
                key={i} 
                className="w-full flex flex-col justify-end items-center group relative h-full cursor-pointer"
                onClick={() => setSelectedDay(selectedDay === data.day ? null : data.day)}
              >
                <div className={`w-full max-w-[36px] ${selectedDay === data.day ? 'bg-[#C4D0C0] ring-2 ring-theme-muted ring-offset-1' : 'bg-theme-secondary'} rounded-t-md relative overflow-hidden transition-all group-hover:bg-[#DEE7DC] dark:group-hover:bg-[#2C2C2C]`} style={{ height: `${data.verified}%` }}>
                  <div className={`absolute bottom-0 left-0 w-full bg-[#4E8B5C] rounded-t-md transition-all ${selectedDay === data.day ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'}`} style={{ height: `${(data.collected / data.verified) * 100}%` }}></div>
                </div>
                <span className={`text-[11px] font-mono font-semibold mt-2 uppercase ${selectedDay === data.day ? 'text-theme' : 'text-theme-muted'}`}>{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Field Agent Feed */}
        <div className="card-theme rounded-xl p-6 border border-theme shadow-xs animate-fade-slide-up">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-fraunces text-lg font-bold text-theme mb-0.5">Live Agent Activity</h3>
              <p className="text-xs font-mono text-theme-muted">
                {selectedDay ? `Activity log for ${selectedDay}` : 'Real-time resolution log'}
              </p>
            </div>
            {selectedDay && (
              <button 
                onClick={() => setSelectedDay(null)}
                className="text-[10px] uppercase font-mono font-bold bg-theme-secondary px-2 py-1 rounded text-theme-muted hover:text-theme transition-colors border border-theme"
              >
                Clear Filter
              </button>
            )}
          </div>
          
          <div className="flex flex-col gap-5 text-xs">
            {[
              { agent: 'Jean Paul', action: 'Collected Report #0012', time: '10:45 AM', day: 'Mon' },
              { agent: 'Marie Claire', action: 'Marked #0045 Out of Bounds', time: '2:15 PM', warning: true, day: 'Tue' },
              { agent: 'Field Agent 007', action: 'Collected Report #0023', time: '11:30 AM', day: 'Wed' },
              { agent: 'Jean Paul', action: 'Collected Report #0011', time: '4:20 PM', day: 'Wed' },
              { agent: 'Marie Claire', action: 'Collected Report #0050', time: '9:10 AM', day: 'Thu' },
              { agent: 'Field Agent 007', action: 'Marked #0055 Out of Bounds', time: '3:45 PM', warning: true, day: 'Fri' },
              { agent: 'Jean Paul', action: 'Collected Report #0062', time: '1:20 PM', day: 'Sat' },
            ]
            .filter(feed => !selectedDay || feed.day === selectedDay)
            .map((feed, i) => (
              <div key={i} className="flex gap-3 items-start animate-fade-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${feed.warning ? 'bg-[#B7503A]/10 text-[#B7503A]' : 'bg-[#4E8B5C]/10 text-[#4E8B5C]'}`}>
                  {feed.warning ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                </div>
                <div>
                  <p className="font-bold text-theme">{feed.agent}</p>
                  <p className={`text-xs ${feed.warning ? 'text-[#B7503A] font-semibold' : 'text-theme-muted'}`}>{feed.action}</p>
                  <p className="flex items-center gap-1 font-mono text-[10px] text-theme-muted mt-0.5">
                    <Calendar size={10} /> {feed.day} • {feed.time}
                  </p>
                </div>
              </div>
            ))}
            
            {[
              { agent: 'Jean Paul', action: 'Collected Report #0012', time: '10:45 AM', day: 'Mon' },
              { agent: 'Marie Claire', action: 'Marked #0045 Out of Bounds', time: '2:15 PM', warning: true, day: 'Tue' },
              { agent: 'Field Agent 007', action: 'Collected Report #0023', time: '11:30 AM', day: 'Wed' },
              { agent: 'Jean Paul', action: 'Collected Report #0011', time: '4:20 PM', day: 'Wed' },
              { agent: 'Marie Claire', action: 'Collected Report #0050', time: '9:10 AM', day: 'Thu' },
              { agent: 'Field Agent 007', action: 'Marked #0055 Out of Bounds', time: '3:45 PM', warning: true, day: 'Fri' },
              { agent: 'Jean Paul', action: 'Collected Report #0062', time: '1:20 PM', day: 'Sat' },
            ].filter(feed => !selectedDay || feed.day === selectedDay).length === 0 && (
              <div className="text-center py-6">
                <p className="text-theme-muted font-mono text-xs">No activity logged for {selectedDay}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
