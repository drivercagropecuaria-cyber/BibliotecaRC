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

function App() {
  if (supabaseConfigError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-glass p-6 text-center">
          <h1 className="text-xl font-bold text-neutral-900 mb-2">Configuração ausente</h1>
          <p className="text-neutral-600">As variáveis de ambiente do Supabase não foram carregadas. Atualize a página ou verifique a configuração do Vercel.</p>
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
              <ProtectedRoute>
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
