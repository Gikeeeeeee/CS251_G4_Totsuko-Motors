'use client'

import { usePathname } from 'next/navigation'
import styles from './SidebarTech.module.css'

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
]

export default function SidebarTech() {
  const pathname = usePathname()

  return (
    <nav className={styles.sidebar}>
      <div>
        <div className={styles.logoSection}>
          <img src="/logo.png" alt="Totsuko Motors" className={styles.logo} />
        </div>
        <div className={styles.navLinks}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <a
                key={item.href}
                href={item.href}
                className={`${styles.link} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.icon}>{item.icon}</span>
                {item.label}
              </a>
            )
          })}
        </div>
      </div>

      <div className={styles.logoutSection}>
        <button className={styles.logoutLink}>
          <span className={styles.icon}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 3H3C2.45 3 2 3.45 2 4V14C2 14.55 2.45 15 3 15H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 6L16 9L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          Logout
        </button>
      </div>
    </nav>
  )
}
