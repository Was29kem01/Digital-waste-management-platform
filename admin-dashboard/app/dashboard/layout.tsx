'use client';

import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  if (!user) return null;

  return (
    <div className={`flex h-screen overflow-hidden antialiased font-space transition-colors duration-300 ${isDarkMode ? 'bg-[#09090B] text-white' : 'bg-[#FAF7F2] text-[#21261F]'}`}>
      <Sidebar userRole={user.role} />
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#09090B]' : 'bg-[#FAF7F2]'}`}>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
