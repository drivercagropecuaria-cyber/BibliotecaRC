import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

type ErrorInfo = {
  message: string
  stack?: string
  source?: string
}

const isAbortError = (reason: any) => {
  const name = reason?.name || ''
  const message = reason?.message || ''
  return name === 'AbortError' || /operation was aborted/i.test(message)
}

const formatReason = (reason: any): ErrorInfo => {
  if (reason instanceof Error) {
    return { message: reason.message, stack: reason.stack }
  }
  if (typeof reason === 'string') {
    return { message: reason }
  }
  try {
    return { message: JSON.stringify(reason) }
  } catch {
    return { message: 'Erro desconhecido' }
  }
}

export function GlobalErrorOverlay() {
  const [error, setError] = useState<ErrorInfo | null>(null)

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isAbortError(event.error)) return
      setError({
        message: event.message || 'Erro não tratado',
        stack: event.error?.stack,
        source: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined,
      })
    }

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isAbortError(event.reason)) return
      const info = formatReason(event.reason)
      setError(info)
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  if (!error) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full glass-card border border-red-500/30 p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-red-200">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-semibold">Erro não tratado no aplicativo</h2>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded hover:bg-white/5 text-rc-text-muted"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-rc-text mb-2">{error.message}</p>
        {error.source && (
          <p className="text-xs text-rc-text-muted mb-2">{error.source}</p>
        )}
        {error.stack && (
          <pre className="text-xs bg-neutral-950/60 p-3 rounded overflow-x-auto max-h-64 text-rc-text-muted">{error.stack}</pre>
        )}
      </div>
    </div>
  )
}