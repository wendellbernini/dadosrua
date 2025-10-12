'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Database } from '@/lib/supabase'

type Contact = Database['public']['Tables']['contacts']['Row']

export interface ContactWithDetails extends Contact {
  campaign?: {
    name: string
    location: string
  }
  collector?: {
    username: string
  }
}

export function useContacts(campaignId?: string) {
  const [contacts, setContacts] = useState<ContactWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchContacts = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('contacts')
        .select(`
          *,
          campaign:campaigns(name, location),
          collector:users!contacts_collector_id_fkey(username)
        `)
        .order('created_at', { ascending: false })

      if (campaignId) {
        query = query.eq('campaign_id', campaignId)
      }

      const { data, error } = await query

      if (error) throw error
      setContacts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contatos')
    } finally {
      setLoading(false)
    }
  }

  const createContact = async (contactData: {
    campaign_id: string
    neighborhood: string
    first_name: string
    phone: string
    demand?: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contactData,
          collector_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      await fetchContacts()
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar contato')
    }
  }

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchContacts()
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar contato')
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchContacts()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao excluir contato')
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [campaignId])

  return {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts,
  }
}
