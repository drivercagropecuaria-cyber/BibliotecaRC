import { Loader2, Leaf } from 'lucide-react'

export function PageLoader() {
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
