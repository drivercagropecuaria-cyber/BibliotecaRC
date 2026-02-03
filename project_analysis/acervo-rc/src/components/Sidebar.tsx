import { useState, createContext, useContext, ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, Upload, GitBranch, Menu, X, Settings, LogOut, User, Shield, Edit3, Eye } from 'lucide-react'
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
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', show: true },
    { to: '/acervo', icon: FolderOpen, label: 'Acervo', show: true },
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
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-b border-neutral-200/50 flex items-center justify-between px-4 z-40 shadow-sm">
        <div className="flex items-center">
          <button
            onClick={toggle}
            className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 active:scale-95 transition-all touch-manipulation"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 text-neutral-700" />
          </button>
          <h1 className="ml-3 text-lg font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
            RC Acervo
          </h1>
        </div>
        {profile && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
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
        bg-gradient-to-b from-neutral-800 to-neutral-900
        shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-green">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">RC Acervo</h1>
                <p className="text-xs text-neutral-400">Sistema de Marketing</p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => isOpen && toggle()}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 touch-manipulation ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-green'
                    : 'text-neutral-400 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110`} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        {profile && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-lg">
                {profile.nome?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
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
