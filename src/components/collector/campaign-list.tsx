'use client'

import { useState } from 'react'
import { useCampaigns } from '@/hooks/use-campaigns'
import { useActiveCampaign } from '@/hooks/use-active-campaign'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function CampaignList() {
  const { campaigns, loading, error, refetch } = useCampaigns()
  const { activeCampaign, setActiveCampaignId } = useActiveCampaign()
  const [joining, setJoining] = useState<string | null>(null)

  const handleJoinCampaign = async (campaignId: string) => {
    setJoining(campaignId)
    try {
      await setActiveCampaignId(campaignId)
    } catch (error) {
      console.error('Error joining campaign:', error)
    } finally {
      setJoining(null)
    }
  }

  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active')

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Campanhas Disponíveis</h2>
        <Card>
          <CardContent className="text-center py-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Erro ao carregar campanhas</h3>
                <p className="text-gray-500 mt-1">{error}</p>
              </div>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Campanhas Disponíveis</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (activeCampaigns.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Campanhas Disponíveis</h2>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhuma campanha ativa no momento</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Campanhas Disponíveis</h2>
      <div className="space-y-3">
        {activeCampaigns.map((campaign) => {
          const isActive = activeCampaign?.id === campaign.id
          const isJoining = joining === campaign.id

          return (
            <Card key={campaign.id} className={isActive ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {campaign.location}
                    </CardDescription>
                  </div>
                  {isActive && (
                    <Badge variant="default" className="bg-blue-600">
                      Ativa
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(campaign.start_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })} - {' '}
                      {format(new Date(campaign.end_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{campaign.participants.length} participantes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{campaign.contact_count || 0} contatos coletados</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleJoinCampaign(campaign.id)}
                  disabled={isJoining || isActive}
                  className="w-full"
                  variant={isActive ? 'secondary' : 'default'}
                >
                  {isJoining ? 'Entrando...' : isActive ? 'Campanha Ativa' : 'Entrar na Campanha'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
