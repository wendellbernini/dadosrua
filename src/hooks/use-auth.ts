'use client'

import { useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-client'

export interface UserProfile {
  id: string
  email: string
  username: string
  full_name: string | null
  role: 'admin' | 'collector'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const isInitialized = useRef(false)
  const lastUserId = useRef<string | null>(null)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Primeiro, tentar obter a sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError)
        }
        
        if (session?.user) {
          setUser(session.user)
          lastUserId.current = session.user.id

          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (mounted) {
            setProfile(profile)
          }
        } else {
          // Se não há sessão, tentar obter usuário diretamente
          const { data: { user }, error } = await supabase.auth.getUser()
          
          if (error) {
            console.error('Erro ao obter usuário:', error)
            setUser(null)
            setProfile(null)
          } else {
            setUser(user)
            lastUserId.current = user?.id || null

            if (user) {
              const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()
              
              if (mounted) {
                setProfile(profile)
              }
            }
          }
        }

        if (mounted) {
          setLoading(false)
          isInitialized.current = true
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          isInitialized.current = true
        }
      }
    }

    initializeAuth()

    // Listener para quando a página volta do background (importante no mobile)
    const handleVisibilityChange = () => {
      if (!document.hidden && isInitialized.current) {
        // Página voltou do background, verificar se a sessão ainda é válida
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user && session.user.id !== lastUserId.current) {
            console.log('Sessão restaurada após voltar do background')
            lastUserId.current = session.user.id
            setUser(session.user)
          }
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        const currentUserId = session?.user?.id || null
        
        // Só processar se o usuário realmente mudou ou se é um evento significativo
        if (currentUserId !== lastUserId.current || 
            event === 'SIGNED_IN' || 
            event === 'SIGNED_OUT' || 
            event === 'TOKEN_REFRESHED') {
          
          console.log('Auth state changed:', event, currentUserId)
          lastUserId.current = currentUserId
          
          setUser(session?.user ?? null)
          
          if (session?.user) {
            try {
              const { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              if (error) {
                console.error('Erro ao buscar perfil:', error)
                if (mounted) setProfile(null)
              } else {
                if (mounted) setProfile(profile)
              }
            } catch (err) {
              console.error('Erro geral ao buscar perfil:', err)
              if (mounted) setProfile(null)
            }
          } else {
            if (mounted) setProfile(null)
          }
        }
        
        if (mounted && isInitialized.current) {
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = async () => {
    if (user) {
      console.log('Atualizando perfil no hook...')
      try {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        console.log('Perfil atualizado:', { profile, error })
        
        if (error) {
          console.error('Erro ao atualizar perfil:', error)
          return
        }
        
        setProfile(profile)
        
        // Forçar uma verificação de autenticação para garantir que o estado está consistente
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser) {
          setUser(currentUser)
        }
      } catch (err) {
        console.error('Erro geral ao atualizar perfil:', err)
      }
    }
  }

  return {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    isAdmin: profile?.role === 'admin',
    isCollector: profile?.role === 'collector',
  }
}
