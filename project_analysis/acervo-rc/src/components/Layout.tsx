import { ReactNode } from 'react'
import { Sidebar, SidebarProvider } from './Sidebar'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        <Sidebar />
        <main className="pt-16 lg:pt-0 lg:ml-64 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
