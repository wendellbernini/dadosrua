'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Database } from '@/lib/supabase'
import { useAuth } from './use-auth'

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
  const { user } = useAuth()
  const supabase = createClient()

  const fetchCampaigns = async (retryCount = 0) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(`Tentativa ${retryCount + 1} de carregar campanhas...`)
      
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          participants:campaign_participants(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar campanhas:', error)
        throw error
      }

      console.log('Campanhas carregadas:', data?.length || 0)

      const campaignsWithCounts = data?.map(campaign => ({
        ...campaign,
        contact_count: 0 // Simplified for now
      })) || []

      setCampaigns(campaignsWithCounts)
    } catch (err) {
      console.error('Erro ao carregar campanhas:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar campanhas'
      setError(errorMessage)
      
      // Retry automático até 3 vezes
      if (retryCount < 2) {
        console.log(`Tentando novamente em 2 segundos... (tentativa ${retryCount + 2}/3)`)
        setTimeout(() => {
          fetchCampaigns(retryCount + 1)
        }, 2000)
        return
      }
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

      // Converter as datas para o formato correto do PostgreSQL
      const startDate = new Date(campaignData.start_date).toISOString()
      const endDate = new Date(campaignData.end_date).toISOString()
      
      const campaignToInsert = {
        name: campaignData.name,
        location: campaignData.location,
        start_date: startDate,
        end_date: endDate,
        created_by: user.id,
      }

      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaignToInsert)
        .select()
        .single()

      if (error) throw error

      // Atualizar lista localmente em vez de refetch completo
      setCampaigns(prev => [data, ...prev])
      
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

      // Atualizar lista localmente
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === id ? { ...campaign, ...data } : campaign
      ))
      
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar campanha')
    }
  }

  const finishCampaign = async (id: string) => {
    return updateCampaign(id, { status: 'finished' })
  }

  const reopenCampaign = async (id: string) => {
    return updateCampaign(id, { status: 'active' })
  }

  const deleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remover da lista localmente
      setCampaigns(prev => prev.filter(campaign => campaign.id !== id))
      
      return true
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao excluir campanha')
    }
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
    if (user) {
      console.log('Usuário mudou, buscando campanhas...', user.id)
      fetchCampaigns()
    } else {
      console.log('Usuário não autenticado, limpando campanhas')
      setCampaigns([])
      setLoading(false)
    }
  }, [user])

  return {
    campaigns,
    loading,
    error,
    createCampaign,
    updateCampaign,
    finishCampaign,
    reopenCampaign,
    deleteCampaign,
    joinCampaign,
    leaveCampaign,
    refetch: fetchCampaigns,
  }
}
