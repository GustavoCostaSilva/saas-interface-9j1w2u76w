import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Sidebar } from '@/components/Sidebar'
import { useMediaQuery } from '@/hooks/use-media-query'

export default function Layout() {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Header />
      <div className="flex flex-1">
        {isDesktop && (
          <aside className="w-60 border-r bg-background p-4">
            <Sidebar />
          </aside>
        )}
        <main className="flex-1 bg-background">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
