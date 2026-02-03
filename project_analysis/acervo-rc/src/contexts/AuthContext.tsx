import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type UserRole = 'admin' | 'editor' | 'viewer'

export interface UserProfile {
  id: string
  email: string
  nome: string | null
  avatar_url: string | null
  role: UserRole
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, nome?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>
  isAdmin: boolean
  isEditor: boolean
  canEdit: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)

  const fetchProfile = async (userId: string, userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        // Criar perfil mínimo como viewer se não existir
        const defaultProfile: UserProfile = {
          id: userId,
          email: userEmail,
          nome: userEmail.split('@')[0],
          avatar_url: null,
          role: 'viewer'
        }
        setProfile(defaultProfile)
        setProfileLoaded(true)
        
        // Tentar inserir no banco
        await supabase.from('user_profiles').insert(defaultProfile)
        return
      }
      
      if (data) {
        setProfile(data as UserProfile)
        setProfileLoaded(true)
      }
    } catch (err) {
      // Fallback: perfil mínimo local sem elevar privilégios
      setProfile({
        id: userId,
        email: userEmail,
        nome: userEmail.split('@')[0],
        avatar_url: null,
        role: 'viewer'
      })
      setProfileLoaded(true)
    }
  }

  useEffect(() => {
    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth timeout - finalizando loading')
        setLoading(false)
      }
    }, 5000)

    // Verificar sessão atual
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email || '')
      }
      setLoading(false)
    }).catch((err) => {
      console.error('Erro ao obter sessão:', err)
      setLoading(false)
    })

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email || '')
        } else {
          setProfile(null)
          setProfileLoaded(false)
        }
        setLoading(false)
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  const signUp = async (email: string, password: string, nome?: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
      if (!supabaseUrl) {
        return { error: new Error('VITE_SUPABASE_URL não configurada') }
      }
      // Usar edge function para criar usuário já confirmado
      const response = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nome })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { error: new Error(data.error || 'Erro ao criar conta') }
      }
      
      // Fazer login automaticamente após criar
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      return { error: signInError as Error | null }
    } catch (err: any) {
      return { error: err as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Não autenticado') }
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...data } : null)
    }
    return { error: error as Error | null }
  }

  // Se usuário está autenticado, garantir acesso (app interno)
  const isAdmin = profile?.role === 'admin'
  const isEditor = profile?.role === 'editor' || isAdmin
  const canEdit = isEditor

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      signIn, signUp, signOut, updateProfile,
      isAdmin, isEditor, canEdit
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
