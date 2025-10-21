'use client'

import { useState, useEffect, useCallback } from 'react'
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

  const fetchActiveCampaign = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true)
      
      console.log(`Tentativa ${retryCount + 1} de carregar campanha ativa...`)
      
      if (!user) {
        console.log('Usuário não autenticado')
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
        console.log('Nenhuma campanha ativa encontrada:', participationError.message)
        setActiveCampaign(null)
        return
      }

      if (participation && participation.campaigns) {
        const campaign = participation.campaigns as unknown as Campaign
        console.log('Campanha ativa encontrada:', campaign.name)
        
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
        console.log(`Tentando novamente em 2 segundos... (tentativa ${retryCount + 2}/3)`)
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
    if (user) {
      console.log('Usuário mudou, buscando campanha ativa...', user.id)
      fetchActiveCampaign()
    } else {
      console.log('Usuário não autenticado, limpando campanha ativa')
      setActiveCampaign(null)
      setLoading(false)
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
