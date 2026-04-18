'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Logo from '@/public/Logo.png';
import UserAvatar from '@/public/User.png';

const navItems = [
  {
    label: 'Request & Checking',
    href: '/request',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: 'Operating',
    href: '/operation',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 11.5L3.5 7.5H14.5L16 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="1.5" y="11.5" width="15" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="5" cy="13.5" r="1" fill="currentColor"/>
        <circle cx="13" cy="13.5" r="1" fill="currentColor"/>
        <path d="M6 7.5L7 4H11L12 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function OperationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F3FAFF', zoom: 1.25 }}>
      {/* Sidebar */}
      <aside className="w-56 bg-[#F1F5F9] flex flex-col shadow-sm shrink-0">
        {/* Logo */}
        <div className="flex flex-col items-center pt-6 pb-5 border-b border-slate-100">
          <Image src={Logo} alt="Totsuko Motors" width={180} height={90} style={{ width: '100%', height: 'auto' }} />
        </div>

        {/* Nav Items */}{/* #FAEFFF */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-b-sm text-xs font-medium transition-colors relative"
                style={{
                  backgroundColor: isActive ? '#FFFFFF' : '#F1F5F9',
                  color: isActive ? '#1D4ED8' : '#64748B',
                  borderRight: isActive ? '3px solid #1D4ED8' : '3px solid transparent',
                }}
              >
                {item.icon}
                <span className="leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4">
          <button
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs font-medium w-full transition-colors"
            style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 3H3C2.45 3 2 3.45 2 4V14C2 14.55 2.45 15 3 15H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 6L16 9L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex justify-end items-center px-6 py-3 bg-white border-b border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-semibold" style={{ color: '#1E3A8A' }}>Theethad Pooad</div>
              <div className="text-xs text-slate-500">Technician</div>
            </div>
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <Image src={UserAvatar} alt="User" width={40} height={40} className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 pt-6 pb-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
