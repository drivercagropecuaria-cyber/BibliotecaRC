import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Leaf } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireEditor?: boolean
}

export function ProtectedRoute({ children, requireAdmin, requireEditor }: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin, isEditor } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-green mb-4 animate-pulse">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 text-neutral-600">
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

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-neutral-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Acesso Restrito</h1>
          <p className="text-neutral-600 mb-4">Você precisa ser administrador para acessar esta página.</p>
          <a href="/" className="text-primary-600 hover:underline">Voltar ao início</a>
        </div>
      </div>
    )
  }

  if (requireEditor && !isEditor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-neutral-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✋</div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Permissão Necessária</h1>
          <p className="text-neutral-600 mb-4">Você precisa ser editor para acessar esta página.</p>
          <a href="/" className="text-primary-600 hover:underline">Voltar ao início</a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
