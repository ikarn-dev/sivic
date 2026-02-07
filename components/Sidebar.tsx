'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { socialLinks } from './Footer';
import Logo from './Logo';

// Import SVG icons from separate component files
import {
  DashboardIcon,
  ScanIcon,
  ShieldIcon,
  ChecklistIcon,
  DatabaseIcon,
} from './icons';

// Navigation items
const navigationItems = [
  { name: 'Overview', href: '/', Icon: DashboardIcon },
  { name: 'Exploit Detector', href: '/exploit-detector', Icon: ShieldIcon },
  { name: 'MEV Shield', href: '/mev-shield', Icon: ScanIcon },
  { name: 'Pre-Audit', href: '/pre-audit', Icon: ChecklistIcon },
  { name: 'Exploit Database', href: '/reports', Icon: DatabaseIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Unified nav item renderer for desktop
  const renderNavItem = (item: typeof navigationItems[0], isActive: boolean) => {
    const containerClasses = isActive
      ? 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]'
      : 'bg-transparent border-transparent hover:bg-[rgba(255,255,255,0.03)]';

    const textClasses = isActive
      ? 'text-white'
      : 'text-[#9ca3af] group-hover:text-white';

    return (
      <Link
        href={item.href}
        className={`group flex items-center gap-3 w-full rounded-lg transition-all duration-200 border ${containerClasses} px-3 py-2.5`}
      >
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <item.Icon active={isActive} />
        </div>
        <span className={`text-[14px] font-medium transition-colors font-satoshi ${textClasses}`}>
          {item.name}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen sidebar-glass flex-col fixed left-0 top-0 z-50 overflow-y-auto">
        {/* Logo with Shield Icon */}
        <div className="px-5 pt-6 pb-4 flex justify-center">
          <Logo size="lg" />
        </div>

        {/* Gap */}
        <div className="h-4" />

        {/* Navigation */}
        <nav className="flex-1 px-3">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  {renderNavItem(item, isActive)}
                </li>
              );
            })}
          </ul>

          {/* Docs Section */}
          <div className="mt-6">
            <div className="text-[11px] font-medium text-gray-500 px-3 mb-2 font-satoshi uppercase tracking-wider">
              Resources
            </div>
            <Link
              href="https://github.com/ikarn-dev/sivic/tree/main/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 w-full rounded-lg transition-all duration-200 border bg-transparent border-transparent hover:bg-[rgba(255,255,255,0.03)] px-3 py-2.5"
            >
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 text-gray-500 group-hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-[14px] font-medium transition-colors font-satoshi text-[#9ca3af] group-hover:text-white">
                Docs
              </span>
            </Link>
          </div>
        </nav>

        {/* Social Links at Bottom */}
        <div className="px-3 pb-6">
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center justify-center gap-3">
              {socialLinks.slice(0, 4).map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/5"
                  aria-label={social.name}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header with Logo */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-center h-14 px-4">
          <Logo size="md" />
        </div>
      </header>

      {/* Mobile Bottom Tab Navbar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/10 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'text-white bg-white/10'
                  : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                <div className="w-5 h-5">
                  <item.Icon active={isActive} />
                </div>
                <span className={`text-[10px] font-medium font-satoshi ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {item.name.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
