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
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ userRole }: { userRole: Role }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isDarkMode } = useTheme();

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
    <aside className={`w-64 h-screen p-5 flex flex-col shadow-lg z-20 select-none flex-shrink-0 transition-colors duration-300 ${isDarkMode ? 'bg-[#1A1A1A] text-white border-r border-[#2C2C2C]' : 'bg-[#173321] text-white border-r border-[#173321]'}`}>
      {/* Official EcoLink Brand Header */}
      <div className={`flex flex-col items-center text-center gap-2 mb-6 mt-2 px-2 pb-5 border-b ${isDarkMode ? 'border-[#2C2C2C]' : 'border-[#1E402D]'}`}>
        <img src="/logo.png" alt="EcoLink" className="h-20 w-auto object-contain max-w-full drop-shadow-md" />
        <p className={`text-xs sm:text-sm font-mono font-bold tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-[#D1A075]'}`}>
          "Report waste, see it through"
        </p>
      </div>

      {/* Role Badge Pill */}
      <div className="mb-6 px-2">
        <div className={`rounded-lg px-3 py-2 flex items-center justify-between border ${isDarkMode ? 'bg-[#242424] border-[#2C2C2C]' : 'bg-[#1E402D] border-[#265039]'}`}>
          <span className={`text-[10px] uppercase font-bold tracking-wider font-mono ${isDarkMode ? 'text-[#B2FF3B]' : 'text-[#D1A075]'}`}>Role Level</span>
          <span className="text-xs font-bold uppercase text-white">{formattedRole}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className={`text-[10px] uppercase tracking-widest font-mono font-bold mb-3 px-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        Navigation
      </div>

      <nav className="flex flex-col gap-1 flex-grow">
        {links.map((link) => {
          const isActive = pathname === link.path;
          const inactiveClass = isDarkMode ? 'hover:bg-[#242424] text-gray-400 hover:text-white' : 'hover:bg-[#1E402D] text-gray-300 hover:text-white';
          const activeClass = isDarkMode ? 'bg-[#B2FF3B] text-black shadow-sm font-bold' : 'bg-[#C15B32] text-white shadow-sm font-bold';
          
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-150 text-xs font-semibold ${
                isActive ? activeClass : inactiveClass
              }`}
            >
              <span className={isActive ? (isDarkMode ? 'text-black' : 'text-white') : (isDarkMode ? 'text-gray-400' : 'text-gray-300')}>{link.icon}</span>
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status & Logout */}
      <div className="mt-auto pt-4 border-t border-[#E4DDCE]">
        <button 
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2.5 w-full text-left rounded-lg transition-colors text-xs font-bold text-[#B7503A] hover:bg-[#B7503A]/10"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
