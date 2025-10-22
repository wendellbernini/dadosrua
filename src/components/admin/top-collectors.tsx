'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Trophy, Medal, Award } from 'lucide-react'

interface TopCollector {
  id: string
  username: string
  full_name: string | null
  contact_count: number
  campaign_count: number
}

export function TopCollectors() {
  const [collectors, setCollectors] = useState<TopCollector[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTopCollectors = async () => {
      try {
        // Verificar se é admin primeiro
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Usuário não autenticado')
        
        const { data: currentUser } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (currentUser?.role !== 'admin') {
          throw new Error('Acesso negado - apenas administradores')
        }
        
        // Buscar coletores diretamente
        const { data, error } = await supabase
          .from('users')
          .select(`
            id,
            username,
            full_name
          `)
          .eq('role', 'collector')
          .order('created_at', { ascending: false })

        if (error) throw error


        // Buscar contagem de contatos para cada coletor
        const collectorsWithCounts = await Promise.all(
          data?.map(async (collector) => {
            const { count: contactCount } = await supabase
              .from('contacts')
              .select('*', { count: 'exact', head: true })
              .eq('collector_id', collector.id)

            const { count: campaignCount } = await supabase
              .from('campaign_participants')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', collector.id)

            return {
              id: collector.id,
              username: collector.username,
              full_name: collector.full_name,
              contact_count: contactCount || 0,
              campaign_count: campaignCount || 0,
            }
          }) || []
        )

        const sortedCollectors = collectorsWithCounts
          .sort((a, b) => b.contact_count - a.contact_count)
          .slice(0, 5)

        setCollectors(sortedCollectors)
      } catch (error) {
        console.error('Error fetching top collectors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopCollectors()
  }, [supabase])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <Users className="w-5 h-5 text-gray-400" />
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-50 border-yellow-200'
      case 1:
        return 'bg-gray-50 border-gray-200'
      case 2:
        return 'bg-amber-50 border-amber-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Coletores</CardTitle>
          <CardDescription>Ranking de produtividade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Coletores</CardTitle>
        <CardDescription>Ranking de produtividade</CardDescription>
      </CardHeader>
      <CardContent>
        {collectors.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum coletor cadastrado ainda
          </p>
        ) : (
          <div className="space-y-3">
            {collectors.map((collector, index) => (
              <div
                key={collector.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${getRankColor(index)}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getRankIcon(index)}
                    <span className="font-medium text-lg">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{collector.full_name || collector.username}</h4>
                    <p className="text-sm text-gray-600">
                      {collector.campaign_count} campanha{collector.campaign_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-lg font-bold">
                    {collector.contact_count}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">contatos</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
