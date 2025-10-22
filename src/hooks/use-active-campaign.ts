'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Database } from '@/lib/supabase'
import { useAuth } from './use-auth'

type Campaign = Database['public']['Tables']['campaigns']['Row']
type CampaignParticipant = Database['public']['Tables']['campaign_participants']['Row']

export interface ActiveCampaign extends Campaign {
  participants: CampaignParticipant[]
}

export function useActiveCampaign() {
  const [activeCampaign, setActiveCampaign] = useState<ActiveCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()
  const lastUserId = useRef<string | null>(null)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

      const fetchActiveCampaign = useCallback(async (retryCount = 0) => {
        try {
          setLoading(true)
          
          if (retryCount === 0) {
            console.log('Carregando campanha ativa...')
          }
          
          if (!user) {
            setActiveCampaign(null)
            return
          }

      // Get user's current campaign participation using a simpler query
      const { data: participation, error: participationError } = await supabase
        .from('campaign_participants')
        .select(`
          campaign_id,
          campaigns(*)
        `)
        .eq('user_id', user.id)
        .eq('campaigns.status', 'active')
        .order('joined_at', { ascending: false })
        .limit(1)
        .single()

          if (participationError) {
            setActiveCampaign(null)
            return
          }

          if (participation && participation.campaigns) {
            const campaign = participation.campaigns as unknown as Campaign
        
        // Get campaign participants
        const { data: participants, error: participantsError } = await supabase
          .from('campaign_participants')
          .select('*')
          .eq('campaign_id', participation.campaign_id)

        if (participantsError) {
          console.error('Erro ao buscar participantes:', participantsError)
        }

        const campaignWithParticipants = {
          ...campaign,
          participants: participants || []
        } as ActiveCampaign

        setActiveCampaign(campaignWithParticipants)
      } else {
        setActiveCampaign(null)
      }
    } catch (error) {
      console.error('Erro ao buscar campanha ativa:', error)
      
          // Retry automático até 3 vezes
          if (retryCount < 2) {
            setTimeout(() => {
              fetchActiveCampaign(retryCount + 1)
            }, 2000)
            return
          }
      
      setActiveCampaign(null)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  const setActiveCampaignId = async (campaignId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Leave current campaign if any
      if (activeCampaign) {
        await supabase
          .from('campaign_participants')
          .delete()
          .eq('campaign_id', activeCampaign.id)
          .eq('user_id', user.id)
      }

      // Join new campaign
      const { error } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: campaignId,
          user_id: user.id,
        })

      if (error) throw error

      await fetchActiveCampaign()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao trocar de campanha')
    }
  }

  const leaveActiveCampaign = async () => {
    if (!activeCampaign) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('campaign_participants')
        .delete()
        .eq('campaign_id', activeCampaign.id)
        .eq('user_id', user.id)

      if (error) throw error

      setActiveCampaign(null)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao sair da campanha')
    }
  }

      useEffect(() => {
        const currentUserId = user?.id || null
        
        // Só buscar se o usuário realmente mudou
        if (currentUserId !== lastUserId.current) {
          lastUserId.current = currentUserId
          
          // Limpar timeout anterior se existir
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current)
          }
          
          if (user) {
            // Debounce para evitar múltiplas chamadas
            fetchTimeoutRef.current = setTimeout(() => {
              fetchActiveCampaign()
            }, 100)
          } else {
            setActiveCampaign(null)
            setLoading(false)
          }
        }
        
        return () => {
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current)
          }
        }
      }, [user, fetchActiveCampaign])

  return {
    activeCampaign,
    loading,
    setActiveCampaignId,
    leaveActiveCampaign,
    refetch: fetchActiveCampaign,
  }
}
