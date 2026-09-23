'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '../../lib/types';
import { 
  LayoutDashboard, 
  MapPin, 
  FileText, 
  Users, 
  ShieldCheck, 
  LogOut,
  PieChart,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ userRole }: { userRole: Role }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const getLinks = () => {
    switch (userRole) {
      case Role.STATION_MANAGER:
        return [
          { name: 'Reports Overview', path: '/dashboard/station-manager', icon: <MapPin size={18} /> },
        ];
      case Role.STATION_ADMIN:
        return [
          { name: 'Dashboard', path: '/dashboard/station-admin', icon: <LayoutDashboard size={18} /> },
          { name: 'Manage Reports', path: '/dashboard/station-admin/reports', icon: <FileText size={18} /> },
        ];
      case Role.ADMIN:
        return [
          { name: 'Regional Overview', path: '/dashboard/admin', icon: <PieChart size={18} /> },
          { name: 'Branches & Operations', path: '/dashboard/admin/branches', icon: <MapPin size={18} /> },
          { name: 'Agent Roster', path: '/dashboard/admin/agents', icon: <Users size={18} /> },
          { name: 'Promotion Audits', path: '/dashboard/admin/promotions', icon: <TrendingUp size={18} /> },
        ];
      case Role.SUPER_ADMIN:
        return [
          { name: 'System Overview', path: '/dashboard/super-admin', icon: <LayoutDashboard size={18} /> }
        ];
      default:
        return [];
    }
  };

  const links = getLinks();
  const formattedRole = userRole ? userRole.replace('_', ' ') : 'USER';

  return (
    <aside className="w-64 bg-[#121A15] text-[#E4DDCE] h-screen p-5 flex flex-col border-r border-[#24352B] shadow-lg z-20 select-none flex-shrink-0">
      {/* Official EcoLink Brand Header */}
      <div className="flex flex-col items-center text-center gap-1.5 mb-6 mt-2 px-2 pb-4 border-b border-[#24352B]">
        <img src="/logo.png" alt="EcoLink" className="h-12 w-auto object-contain max-w-full drop-shadow-sm" />
        <p className="text-[11px] text-[#C4693C] font-mono font-bold tracking-wide">
          "Report waste, see it through"
        </p>
      </div>

      {/* Role Badge Pill */}
      <div className="mb-6 px-2">
        <div className="bg-[#1C2922] border border-[#2B3E32] rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#4E8B5C] tracking-wider font-mono">Role Level</span>
          <span className="text-xs font-bold text-white uppercase">{formattedRole}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="text-[10px] uppercase tracking-widest text-[#7A8272] font-mono font-bold mb-3 px-3">
        Navigation
      </div>

      <nav className="flex flex-col gap-1 flex-grow">
        {links.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-150 text-xs font-semibold ${
                isActive 
                  ? 'bg-[#2F4B3C] text-white shadow-sm border border-[#48765B]/50 font-bold' 
                  : 'hover:bg-[#1A261F] text-[#9AA393] hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-[#7A8272]'}>{link.icon}</span>
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status & Logout */}
      <div className="mt-auto pt-4 border-t border-[#24352B]">
        <button 
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2.5 w-full text-left rounded-lg transition-colors text-xs font-bold text-[#C4693C] hover:bg-[#C4693C]/10 hover:text-[#E87948]"
        >
          <LogOut size={16} />
          Sign Out System
        </button>
      </div>
    </aside>
  );
}
