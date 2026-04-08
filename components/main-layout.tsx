import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Sidebar />
      <Header />
      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
