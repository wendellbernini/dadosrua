'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Megaphone, MapPin, TrendingUp } from 'lucide-react'

interface DashboardStats {
  totalContacts: number
  totalCampaigns: number
  activeCampaigns: number
  totalUsers: number
  contactsToday: number
  contactsThisWeek: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalUsers: 0,
    contactsToday: 0,
    contactsThisWeek: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total contacts
        const { count: totalContacts } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })

        // Total campaigns
        const { count: totalCampaigns } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })

        // Active campaigns
        const { count: activeCampaigns } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')

        // Total users
        const { count: totalUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        // Contacts today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const { count: contactsToday } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString())

        // Contacts this week
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const { count: contactsThisWeek } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgo.toISOString())

        setStats({
          totalContacts: totalContacts || 0,
          totalCampaigns: totalCampaigns || 0,
          activeCampaigns: activeCampaigns || 0,
          totalUsers: totalUsers || 0,
          contactsToday: contactsToday || 0,
          contactsThisWeek: contactsThisWeek || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalContacts}</div>
          <p className="text-xs text-muted-foreground">
            {stats.contactsToday} coletados hoje
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
          <Megaphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeCampaigns} ativas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            Coletores cadastrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.contactsThisWeek}</div>
          <p className="text-xs text-muted-foreground">
            Contatos coletados
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
