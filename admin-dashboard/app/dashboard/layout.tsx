'use client';

import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#F4EFE6]/40 text-[#21261F] overflow-hidden antialiased font-space">
      <Sidebar userRole={user.role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAF7F2]">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
