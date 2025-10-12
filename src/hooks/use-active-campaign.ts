'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Database } from '@/lib/supabase'

type Campaign = Database['public']['Tables']['campaigns']['Row']
type CampaignParticipant = Database['public']['Tables']['campaign_participants']['Row']

export interface ActiveCampaign extends Campaign {
  participants: CampaignParticipant[]
}

export function useActiveCampaign() {
  const [activeCampaign, setActiveCampaign] = useState<ActiveCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchActiveCampaign = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user's current campaign participation
      const { data: participation } = await supabase
        .from('campaign_participants')
        .select(`
          campaign_id,
          campaigns!inner(*)
        `)
        .eq('user_id', user.id)
        .eq('campaigns.status', 'active')
        .order('joined_at', { ascending: false })
        .limit(1)
        .single()

      if (participation?.campaigns) {
        setActiveCampaign(participation.campaigns as unknown as ActiveCampaign)
      } else {
        setActiveCampaign(null)
      }
    } catch (error) {
      console.error('Error fetching active campaign:', error)
      setActiveCampaign(null)
    } finally {
      setLoading(false)
    }
  }

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
    fetchActiveCampaign()
  }, [])

  return {
    activeCampaign,
    loading,
    setActiveCampaignId,
    leaveActiveCampaign,
    refetch: fetchActiveCampaign,
  }
}
