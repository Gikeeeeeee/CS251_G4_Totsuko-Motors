'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { authService } from '@/services/auth.service';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('employee_id');
    router.push('/Login');
  };

  const menuItems = [
    {
      name: 'Request & Checking',
      href: '/technician/request-list',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'Operating',
      href: '/technician/operation',
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

  return (
    <aside className="fixed top-0 left-0 w-[256px] min-h-screen bg-[#F1F5F9] border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 h-[127px]">
        <div className="flex items-center gap-2 justify-center">
          <Image 
            src="/logo.png" 
            alt="Totsuko Motors" 
            width={140} 
            height={96}
            className="object-contain"
          />
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors
                    ${isActive 
                      ? 'bg-[#ffffff] text-blue-600 border-blue-600 rounded-l-lg border-r-5' 
                      : 'text-gray-600 hover:bg-[#ffffff] rounded-lg'
                    }
                  `}
                >

                  <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                    {item.icon}
                  </span>

                  <span className={isActive ? 'font-bold text-sm' : 'font-medium text-sm' }>
                    {item.name}
                    </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors w-full"
          onClick={handleLogout}
        >
            
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>

          <span className="font-medium">Logout</span>

        </button>
      </div>
    </aside>
  );
}
