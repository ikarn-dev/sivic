import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      {/* Main content area - offset for sidebar on desktop, offset for header on mobile */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
