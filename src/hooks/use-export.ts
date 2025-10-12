'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { exportContactsToExcel, exportCampaignContactsToExcel, exportAllDataToExcel, type ContactExportData } from '@/lib/excel-export'

export function useExport() {
  const [exporting, setExporting] = useState(false)
  const supabase = createClient()

  const exportAllContacts = async () => {
    setExporting(true)
    try {
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select(`
          *,
          campaign:campaigns(name, location),
          collector:users!contacts_collector_id_fkey(username)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const exportData: ContactExportData[] = contacts?.map(contact => ({
        id: contact.id,
        campaign_name: contact.campaign?.name || 'N/A',
        campaign_location: contact.campaign?.location || 'N/A',
        collector_name: contact.collector?.username || 'N/A',
        neighborhood: contact.neighborhood,
        first_name: contact.first_name,
        phone: contact.phone,
        demand: contact.demand,
        created_at: contact.created_at,
      })) || []

      exportContactsToExcel(exportData)
    } catch (error) {
      console.error('Error exporting contacts:', error)
      throw error
    } finally {
      setExporting(false)
    }
  }

  const exportCampaignContacts = async (campaignId: string, campaignName: string) => {
    setExporting(true)
    try {
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select(`
          *,
          campaign:campaigns(name, location),
          collector:users!contacts_collector_id_fkey(username)
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const exportData: ContactExportData[] = contacts?.map(contact => ({
        id: contact.id,
        campaign_name: contact.campaign?.name || 'N/A',
        campaign_location: contact.campaign?.location || 'N/A',
        collector_name: contact.collector?.username || 'N/A',
        neighborhood: contact.neighborhood,
        first_name: contact.first_name,
        phone: contact.phone,
        demand: contact.demand,
        created_at: contact.created_at,
      })) || []

      exportCampaignContactsToExcel(campaignName, exportData)
    } catch (error) {
      console.error('Error exporting campaign contacts:', error)
      throw error
    } finally {
      setExporting(false)
    }
  }

  const exportAllData = async () => {
    setExporting(true)
    try {
      // Fetch campaigns
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          *,
          participants:campaign_participants(count),
          contacts(count)
        `)
        .order('created_at', { ascending: false })

      if (campaignsError) throw campaignsError

      // Fetch contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          *,
          campaign:campaigns(name, location),
          collector:users!contacts_collector_id_fkey(username)
        `)
        .order('created_at', { ascending: false })

      if (contactsError) throw contactsError

      const exportData: ContactExportData[] = contacts?.map(contact => ({
        id: contact.id,
        campaign_name: contact.campaign?.name || 'N/A',
        campaign_location: contact.campaign?.location || 'N/A',
        collector_name: contact.collector?.username || 'N/A',
        neighborhood: contact.neighborhood,
        first_name: contact.first_name,
        phone: contact.phone,
        demand: contact.demand,
        created_at: contact.created_at,
      })) || []

      exportAllDataToExcel(campaigns || [], exportData)
    } catch (error) {
      console.error('Error exporting all data:', error)
      throw error
    } finally {
      setExporting(false)
    }
  }

  return {
    exporting,
    exportAllContacts,
    exportCampaignContacts,
    exportAllData,
  }
}
