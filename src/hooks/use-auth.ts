'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    let mounted = true

    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!mounted) return
        
        setUser(user)

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

        if (mounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error('Erro ao obter usuário:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('Auth state changed:', event, session?.user?.id)
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
              console.log('Perfil carregado:', profile)
              if (mounted) setProfile(profile)
            }
          } catch (err) {
            console.error('Erro geral ao buscar perfil:', err)
            if (mounted) setProfile(null)
          }
        } else {
          if (mounted) setProfile(null)
        }
        
        if (mounted) {
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
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
