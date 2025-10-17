'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  location: string
  start_date: string
  end_date: string
  status: 'active' | 'finished'
  created_at: string
  contact_count: number
  participant_count: number
}

export function RecentCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select(`
            *,
            contacts(count),
            participants:campaign_participants(count)
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error

        const campaignsWithCounts = data?.map(campaign => ({
          ...campaign,
          contact_count: campaign.contacts?.[0]?.count || 0,
          participant_count: campaign.participants?.[0]?.count || 0,
        })) || []

        setCampaigns(campaignsWithCounts)
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [supabase])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Recentes</CardTitle>
          <CardDescription>Últimas campanhas criadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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
        <CardTitle>Campanhas Recentes</CardTitle>
        <CardDescription>Últimas campanhas criadas</CardDescription>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhuma campanha criada ainda
          </p>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <Link 
                key={campaign.id} 
                href={`/admin/campaigns/${campaign.id}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 truncate">{campaign.name}</h4>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="shrink-0">
                        {campaign.status === 'active' ? 'Ativa' : 'Finalizada'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{campaign.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{format(new Date(campaign.start_date), 'dd/MM', { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 shrink-0" />
                        <span>{campaign.participant_count} participantes</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {campaign.contact_count} contatos coletados
                    </p>
                  </div>
                  <div className="ml-3 shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/admin/campaigns">
              Ver Todas as Campanhas
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
