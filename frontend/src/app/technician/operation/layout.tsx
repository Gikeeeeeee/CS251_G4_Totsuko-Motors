import SidebarTech from '@/components/Sidebar'
import TopNavTech from '@/components/TopNav'

export default function OperationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', background: '#F3FAFF', minHeight: '100vh' }}>
      <SidebarTech />
      <div style={{ flex: 1 }}>
        <TopNavTech />
        <main style={{ padding: '76px 28px 48px 230px', zoom: 1.25 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
