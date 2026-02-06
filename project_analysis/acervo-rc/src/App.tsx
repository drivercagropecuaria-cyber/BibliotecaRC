import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { PageLoader } from './components/PageLoader'
import { supabaseConfigError } from './lib/supabase'

// Lazy load das páginas - Code Splitting para reduzir bundle inicial
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AcervoPage = lazy(() => import('./pages/AcervoPage').then(m => ({ default: m.AcervoPage })))
const LocalidadePage = lazy(() => import('./pages/LocalidadePage').then(m => ({ default: m.LocalidadePage })))
const UploadPage = lazy(() => import('./pages/UploadPage').then(m => ({ default: m.UploadPage })))
const WorkflowPage = lazy(() => import('./pages/WorkflowPage').then(m => ({ default: m.WorkflowPage })))
const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage').then(m => ({ default: m.ItemDetailPage })))
const EditItemPage = lazy(() => import('./pages/EditItemPage').then(m => ({ default: m.EditItemPage })))
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })))
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })))
const WorkspacePage = lazy(() => import('./pages/WorkspacePage').then(m => ({ default: m.WorkspacePage })))

function App() {
  if (supabaseConfigError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-neutral-950 to-emerald-950/20 p-6">
        <div className="max-w-lg w-full glass-card p-6 text-center">
          <h1 className="text-xl font-semibold text-rc-text mb-2">Configuração ausente</h1>
          <p className="text-rc-text-muted">As variáveis de ambiente do Supabase não foram carregadas. Atualize a página ou verifique a configuração do Vercel.</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Rotas protegidas */}
            <Route path="/" element={
              <ProtectedRoute requireEditor>
                <Layout><DashboardPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/acervo" element={
              <ProtectedRoute>
                <Layout><AcervoPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/acervo/:localidade" element={
              <ProtectedRoute>
                <Layout><LocalidadePage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/busca" element={
              <ProtectedRoute>
                <Layout><SearchPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/trabalho" element={
              <ProtectedRoute>
                <Layout><WorkspacePage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute requireEditor>
                <Layout><UploadPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/workflow" element={
              <ProtectedRoute requireEditor>
                <Layout><WorkflowPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/item/:id" element={
              <ProtectedRoute>
                <Layout><ItemDetailPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/item/:id/edit" element={
              <ProtectedRoute requireEditor>
                <Layout><EditItemPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <Layout><AdminPage /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
