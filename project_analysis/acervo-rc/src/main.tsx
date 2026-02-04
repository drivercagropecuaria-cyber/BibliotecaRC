import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { GlobalErrorOverlay } from './components/GlobalErrorOverlay.tsx'
import './index.css'
import App from './App.tsx'

// QueryClient com configurações otimizadas para estabilidade
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minuto - dados considerados "frescos"
      gcTime: 300000, // 5 minutos - tempo no cache
      retry: 1,
      refetchOnWindowFocus: false, // Evita refetch ao trocar abas
      refetchOnReconnect: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
        <Toaster richColors position="top-right" />
        <GlobalErrorOverlay />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)
