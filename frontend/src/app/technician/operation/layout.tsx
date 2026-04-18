import SidebarTech from '@/components/SidebarTech'
import TopNavTech from '@/components/TopNavTech'

export default function OperationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#F3FAFF', minHeight: '100vh' }}>
      <SidebarTech />
      <div style={{ marginLeft: '256px' }}>
        <TopNavTech />
        <main style={{ padding: '96px 32px 48px', zoom: 1.25 }}>
          {children}
        </main>
      </div>
    </div>
  )
}