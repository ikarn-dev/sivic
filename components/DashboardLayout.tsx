import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      {/* Main content area - flex column to push footer to bottom */}
      <div className="main-content flex flex-col pt-20 lg:pt-0">
        <main className="flex-1">
          {children}
        </main>
        {/* Footer - hidden on mobile due to bottom navbar */}
        <div className="hidden lg:block mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}
