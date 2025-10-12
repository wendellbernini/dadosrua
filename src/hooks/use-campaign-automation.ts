'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export function useCampaignAutomation() {
  const [running, setRunning] = useState(false)
  const supabase = createClient()

  const finishExpiredCampaigns = async () => {
    setRunning(true)
    try {
      const { data, error } = await supabase.functions.invoke('finish-campaigns')

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error finishing campaigns:', error)
      throw error
    } finally {
      setRunning(false)
    }
  }

  return {
    running,
    finishExpiredCampaigns,
  }
}
