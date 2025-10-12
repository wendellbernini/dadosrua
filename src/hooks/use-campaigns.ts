'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Database } from '@/lib/supabase'

type Campaign = Database['public']['Tables']['campaigns']['Row']
type CampaignParticipant = Database['public']['Tables']['campaign_participants']['Row']

export interface CampaignWithParticipants extends Campaign {
  participants: CampaignParticipant[]
  contact_count?: number
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignWithParticipants[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          participants:campaign_participants(*),
          contacts(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const campaignsWithCounts = data?.map(campaign => ({
        ...campaign,
        contact_count: campaign.contacts?.[0]?.count || 0
      })) || []

      setCampaigns(campaignsWithCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar campanhas')
    } finally {
      setLoading(false)
    }
  }

  const createCampaign = async (campaignData: {
    name: string
    location: string
    start_date: string
    end_date: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...campaignData,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      await fetchCampaigns()
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar campanha')
    }
  }

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchCampaigns()
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar campanha')
    }
  }

  const finishCampaign = async (id: string) => {
    return updateCampaign(id, { status: 'finished' })
  }

  const joinCampaign = async (campaignId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: campaignId,
          user_id: user.id,
        })

      if (error) throw error

      await fetchCampaigns()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao entrar na campanha')
    }
  }

  const leaveCampaign = async (campaignId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('campaign_participants')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)

      if (error) throw error

      await fetchCampaigns()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao sair da campanha')
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  return {
    campaigns,
    loading,
    error,
    createCampaign,
    updateCampaign,
    finishCampaign,
    joinCampaign,
    leaveCampaign,
    refetch: fetchCampaigns,
  }
}
