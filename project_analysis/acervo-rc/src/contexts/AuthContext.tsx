/* eslint-disable react-refresh/only-export-components */
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
  deleted_at?: string | null
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
  isActive: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)

  const isInvalidRefreshToken = (err: any) => {
    const message = err?.message?.toLowerCase?.() || ''
    return message.includes('invalid refresh token') || message.includes('refresh token not found')
  }

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
          role: 'viewer',
          deleted_at: null
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
        role: 'viewer',
        deleted_at: null
      })
      setProfileLoaded(true)
    }
  }

  useEffect(() => {
    let mounted = true
    const initTimeout = setTimeout(() => {
      if (!mounted) return
      setSession(null)
      setUser(null)
      setProfile(null)
      setProfileLoaded(false)
      setLoading(false)
      if (import.meta.env.DEV) {
        console.warn('[Auth] Timeout ao iniciar sessão. Forçando login.')
      }
    }, 8000)

    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!mounted) return

        if (error && isInvalidRefreshToken(error)) {
          await supabase.auth.signOut()
          setSession(null)
          setUser(null)
          setProfile(null)
          setProfileLoaded(false)
          setLoading(false)
          return
        }

        setSession(data.session)
        setUser(data.session?.user ?? null)

        if (data.session?.user?.id) {
          void fetchProfile(data.session.user.id, data.session.user.email || '')
        }

        setLoading(false)
        clearTimeout(initTimeout)
      } catch (err) {
        if (isInvalidRefreshToken(err)) {
          await supabase.auth.signOut()
        }
        setSession(null)
        setUser(null)
        setProfile(null)
        setProfileLoaded(false)
        setLoading(false)
        clearTimeout(initTimeout)
      }
    }

    initSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (import.meta.env.DEV) {
        console.info('[Auth]', event)
      }

      setSession(nextSession)
      setUser(nextSession?.user ?? null)

      if (nextSession?.user?.id) {
        void fetchProfile(nextSession.user.id, nextSession.user.email || '')
      } else {
        setProfile(null)
        setProfileLoaded(false)
      }
    })

    return () => {
      mounted = false
      clearTimeout(initTimeout)
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data?.user) {
      setSession(data.session)
      setUser(data.user)
      void fetchProfile(data.user.id, data.user.email || '')
    }
    return { error: error as Error | null }
  }

  const signUp = async (_email: string, _password: string, _nome?: string) => {
    return { error: new Error('Cadastro desativado. Solicite um administrador.') }
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
  const isActive = !profile?.deleted_at
  const isAdmin = isActive && profile?.role === 'admin'
  const isEditor = isActive && (profile?.role === 'editor' || isAdmin)
  const canEdit = isEditor

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      signIn, signUp, signOut, updateProfile,
      isAdmin, isEditor, canEdit, isActive
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
