import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Leaf } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireEditor?: boolean
}

export function ProtectedRoute({ children, requireAdmin, requireEditor }: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin, isEditor, isActive } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-emerald-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-300 rounded-2xl shadow-green mb-4 animate-pulse">
            <Leaf className="w-8 h-8 text-neutral-900" />
          </div>
          <div className="flex items-center justify-center gap-2 text-rc-text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Carregando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-amber-950/20 flex items-center justify-center p-4">
        <div className="glass-card p-6 text-center max-w-lg w-full">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-2xl font-semibold text-rc-text mb-2">Acesso Desativado</h1>
          <p className="text-rc-text-muted mb-4">Seu usuario foi desativado. Fale com o administrador.</p>
          <a href="/login" className="text-rc-gold hover:underline">Voltar ao login</a>
        </div>
      </div>
    )
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-red-950/20 flex items-center justify-center p-4">
        <div className="glass-card p-6 text-center max-w-lg w-full">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-semibold text-rc-text mb-2">Acesso Restrito</h1>
          <p className="text-rc-text-muted mb-4">Você precisa ser administrador para acessar esta página.</p>
          <a href="/" className="text-rc-gold hover:underline">Voltar ao início</a>
        </div>
      </div>
    )
  }

  if (requireEditor && !isEditor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-amber-950/20 flex items-center justify-center p-4">
        <div className="glass-card p-6 text-center max-w-lg w-full">
          <div className="text-6xl mb-4">✋</div>
          <h1 className="text-2xl font-semibold text-rc-text mb-2">Permissão Necessária</h1>
          <p className="text-rc-text-muted mb-4">Você precisa ser editor para acessar esta página.</p>
          <a href="/" className="text-rc-gold hover:underline">Voltar ao início</a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
