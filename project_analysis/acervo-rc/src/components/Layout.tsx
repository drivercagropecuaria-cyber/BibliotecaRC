import { ReactNode } from 'react'
import { Sidebar, SidebarProvider } from './Sidebar'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-rc-bg text-rc-text">
        <Sidebar />
        <main className="pt-16 lg:pt-0 lg:ml-64 min-h-screen relative overflow-hidden bg-rc-bg">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.12), transparent 45%),' +
                'radial-gradient(circle at 80% 0%, rgba(26, 95, 26, 0.18), transparent 50%),' +
                'linear-gradient(180deg, #080a08 0%, #0c100c 100%)'
            }}
          />
          <div className="pointer-events-none absolute -top-36 right-12 h-[420px] w-[420px] rounded-full bg-rc-green/20 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-8 left-10 h-[320px] w-[320px] rounded-full bg-rc-gold/15 blur-[140px]" />
          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            <div className="rounded-2xl border border-rc-border bg-rc-surface/70 backdrop-blur-xl shadow-rc-card p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
