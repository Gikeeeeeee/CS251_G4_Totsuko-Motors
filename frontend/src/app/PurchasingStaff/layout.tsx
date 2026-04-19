'use client'
import React from 'react'
import SidebarPS from '@/components/SidebarPS'
import TopNavPS from '@/components/TopNavPS'

export default function PurchasingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar: ล็อกความกว้าง (w-64) */}
      <aside className="w-64 flex-shrink-0 z-20 bg-white">
        <SidebarPS />
      </aside>

      {/* ฝั่งขวา: TopNav + พื้นที่ Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* TopNav: อยู่บนสุดเสมอ */}
        <header className="flex-shrink-0 z-10">
          <TopNavPS />
        </header>
        
        {/* Main Content: ใช้ overflow-y-auto เพื่อให้ Scroll ได้เฉพาะส่วนนี้ */}
        <main className="flex-1 overflow-y-auto">
          <div className="pt-28 pb-12 px-12 max-w-[1440px] mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  )
}