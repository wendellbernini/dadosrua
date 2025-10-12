'use client'

import { useState } from 'react'
import { useActiveCampaign } from '@/hooks/use-active-campaign'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export function ActiveCampaign() {
  const { activeCampaign, loading, leaveActiveCampaign } = useActiveCampaign()
  const [leaving, setLeaving] = useState(false)

  const handleLeaveCampaign = async () => {
    setLeaving(true)
    try {
      await leaveActiveCampaign()
    } catch (error) {
      console.error('Error leaving campaign:', error)
    } finally {
      setLeaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </CardContent>
      </Card>
    )
  }

  if (!activeCampaign) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Nenhuma campanha ativa</h3>
              <p className="text-gray-500 mt-1">
                Escolha uma campanha abaixo para começar a coletar dados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Campanha Ativa
            </CardTitle>
            <CardDescription className="text-blue-700 mt-1">
              {activeCampaign.name}
            </CardDescription>
          </div>
          <Badge variant="default" className="bg-blue-600">
            Ativa
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <MapPin className="w-4 h-4" />
            <span>{activeCampaign.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Calendar className="w-4 h-4" />
            <span>
              {format(new Date(activeCampaign.start_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })} - {' '}
              {format(new Date(activeCampaign.end_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Users className="w-4 h-4" />
            <span>{activeCampaign.participants.length} participantes</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/collector/add-contact" className="flex-1">
            <Button className="w-full" size="lg">
              Adicionar Contato
            </Button>
          </Link>
          <Link href="/collector/my-contacts" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              Ver Meus Contatos
            </Button>
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaveCampaign}
            disabled={leaving}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {leaving ? 'Saindo...' : 'Sair da Campanha'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
