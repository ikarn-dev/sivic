'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// Import SVG icons from separate component files
import {
  DashboardIcon,
  ScanIcon,
  ShieldIcon,
  ChecklistIcon,
  DatabaseIcon,
  AnalyticsIcon,
} from './icons';

// Chevron icon for expand/collapse
const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
  >
    <path
      d="M6 4l4 4-4 4"
      stroke="#9ca3af"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Navigation items - Overview first, then alphabetical
const navigationItems = [
  { name: 'Overview', href: '/', Icon: DashboardIcon },
  { name: 'Analytics', href: '/analytics', Icon: AnalyticsIcon },
  { name: 'Exploit Detector', href: '/exploit-detector', Icon: ShieldIcon },
  { name: 'MEV Shield', href: '/mev-shield', Icon: ScanIcon },
  { name: 'Pre-Audit', href: '/pre-audit', Icon: ChecklistIcon },
  { name: 'Exploit Database', href: '/reports', Icon: DatabaseIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  // Unified nav item renderer - same style for ALL items
  const renderNavItem = (item: typeof navigationItems[0], isActive: boolean, isExpanded: boolean = true) => {
    // Active: subtle glass background with border
    // Inactive: transparent, gray icon and text
    const containerClasses = isActive
      ? 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]'
      : 'bg-transparent border-transparent hover:bg-[rgba(255,255,255,0.03)]';

    const textClasses = isActive
      ? 'text-white'
      : 'text-[#9ca3af] group-hover:text-white';

    return (
      <Link
        href={item.href}
        className={`group flex items-center gap-3 w-full rounded-lg transition-all duration-200 border ${containerClasses} ${isExpanded ? 'px-3 py-2.5' : 'justify-center p-2.5'}`}
      >
        {/* Icon - same size for all, color changes based on active state */}
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <item.Icon active={isActive} />
        </div>
        {isExpanded && (
          <span className={`text-[14px] font-medium transition-colors ${textClasses}`}>
            {item.name}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen sidebar-glass flex-col fixed left-0 top-0 z-50 overflow-y-auto">
        {/* Logo/Brand Area - Centered */}
        <div className="px-5 pt-6 pb-4 flex justify-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Sivic</h1>
        </div>

        {/* Gap between logo and menu */}
        <div className="h-4" />

        {/* Main Navigation - Unified styling for all items */}
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
        </nav>

        {/* Bottom spacing */}
        <div className="h-6" />
      </aside>

      {/* Mobile Overlay Backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile/Tablet Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen sidebar-glass flex flex-col z-50 overflow-y-auto transition-all duration-300 ease-out ${expanded ? 'w-64' : 'w-16'
          }`}
      >
        {/* Toggle Button / Logo */}
        <div className="flex items-center justify-center h-16 px-3 gap-2">
          <h1 className={`font-bold text-white tracking-tight ${expanded ? 'text-xl flex-1 text-center' : 'text-sm'}`}>
            {expanded ? 'Sivic' : 'S'}
          </h1>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronIcon expanded={expanded} />
          </button>
        </div>

        {/* Gap between logo and menu */}
        <div className="h-3" />

        {/* Main Navigation - All items unified */}
        <nav className="flex-1 px-2">
          <ul className={`space-y-1 ${expanded ? '' : 'flex flex-col items-center'}`}>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name} className="w-full">
                  <div onClick={() => expanded && setExpanded(false)}>
                    {renderNavItem(item, isActive, expanded)}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
