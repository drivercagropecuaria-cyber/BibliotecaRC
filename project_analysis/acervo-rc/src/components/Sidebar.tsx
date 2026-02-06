/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext, ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, Upload, GitBranch, Menu, X, Settings, LogOut, Shield, Edit3, Eye, Search, Briefcase } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const SidebarContext = createContext<{ isOpen: boolean; toggle: () => void }>({ isOpen: false, toggle: () => {} })

export function useSidebar() {
  return useContext(SidebarContext)
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(!isOpen)
  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar() {
  const { isOpen, toggle } = useSidebar()
  const navigate = useNavigate()
  const { profile, signOut, isAdmin, isEditor } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  // Itens de navegação baseados em permissões
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Painel Principal', show: isEditor },
    { to: '/busca', icon: Search, label: 'Busca', show: true },
    { to: '/acervo', icon: FolderOpen, label: 'Acervo', show: true },
    { to: '/trabalho', icon: Briefcase, label: 'Pastas Selecionadas', show: true },
    { to: '/upload', icon: Upload, label: 'Upload', show: isEditor },
    { to: '/workflow', icon: GitBranch, label: 'Workflow', show: isEditor },
    { to: '/admin', icon: Settings, label: 'Configuracoes', show: isAdmin },
  ].filter(item => item.show)

  const getRoleIcon = () => {
    if (isAdmin) return <Shield className="w-3 h-3" />
    if (isEditor) return <Edit3 className="w-3 h-3" />
    return <Eye className="w-3 h-3" />
  }

  const getRoleLabel = () => {
    if (isAdmin) return 'Admin'
    if (isEditor) return 'Editor'
    return 'Viewer'
  }

  const getRoleColor = () => {
    if (isAdmin) return 'bg-red-500/20 text-red-400'
    if (isEditor) return 'bg-amber-500/20 text-amber-400'
    return 'bg-accent-500/20 text-accent-400'
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-dark border-b border-rc-border flex items-center justify-between px-4 z-40 shadow-sm">
        <div className="flex items-center">
          <button
            onClick={toggle}
            className="p-2 -ml-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all touch-manipulation"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <h1 className="ml-3 text-lg font-semibold text-rc-text">RC Acervo</h1>
        </div>
        {profile && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rc-gold flex items-center justify-center text-rc-black font-bold text-sm">
              {profile.nome?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen flex flex-col z-50
        w-64 lg:w-64
        glass-dark
        border-r border-rc-border
        shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-5 border-b border-rc-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rc-gold flex items-center justify-center shadow-rc-card">
              <FolderOpen className="w-4 h-4 text-rc-black" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-rc-text">RC Acervo</h1>
              <p className="text-xs text-rc-gray500">Biblioteca RC</p>
            </div>
          </div>
          <button
            onClick={toggle}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-rc-gray500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => isOpen && toggle()}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-rc-pill transition-all duration-200 touch-manipulation ${
                  isActive
                    ? 'bg-rc-gold/90 text-rc-black'
                    : 'text-rc-gray500 hover:bg-white/10 hover:text-rc-text'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        {profile && (
          <div className="p-4 border-t border-rc-border">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-3">
              <div className="w-9 h-9 rounded-full bg-rc-gold flex items-center justify-center text-rc-black font-bold shadow-lg">
                {profile.nome?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-rc-text truncate">
                  {profile.nome || profile.email.split('@')[0]}
                </p>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getRoleColor()}`}>
                  {getRoleIcon()}
                  {getRoleLabel()}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
