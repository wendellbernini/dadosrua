'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Clock, ArrowLeft, Download, Edit, Trash2, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useExport } from '@/hooks/use-export'

interface Campaign {
  id: string
  name: string
  location: string
  start_date: string
  end_date: string
  status: 'active' | 'finished'
  created_by: string
  created_at: string
  participants: Array<{
    id: string
    user_id: string
    joined_at: string
    users: {
      username: string
    }
  }>
  contacts: Array<{
    id: string
    neighborhood: string
    first_name: string
    phone: string
    demand?: string
    created_at: string
    users: {
      username: string
    }
  }>
}

export default function CampaignDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { exportCampaignContacts, exporting } = useExport()
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const campaignId = params.id as string

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails()
    }
  }, [campaignId])

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          participants:campaign_participants(
            id,
            user_id,
            joined_at,
            users:user_id(username)
          ),
          contacts(
            id,
            neighborhood,
            first_name,
            phone,
            demand,
            created_at,
            users:collector_id(username)
          )
        `)
        .eq('id', campaignId)
        .single()

      if (error) throw error
      setCampaign(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar campanha')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: 'active' | 'finished') => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaignId)

      if (error) throw error
      
      setCampaign(prev => prev ? { ...prev, status: newStatus } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar campanha')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteCampaign = async () => {
    if (!confirm('Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.')) {
      return
    }
    
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)

      if (error) throw error
      
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir campanha')
    } finally {
      setUpdating(false)
    }
  }

  const handleExportCampaign = async () => {
    if (!campaign) return
    
    try {
      await exportCampaignContacts(campaign.id, campaign.name)
    } catch (error) {
      console.error('Error exporting campaign:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500 mb-4">{error || 'Campanha não encontrada'}</p>
            <Button onClick={() => router.push('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <p className="text-gray-600">{campaign.location}</p>
          </div>
        </div>
        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
          {campaign.status === 'active' ? 'Ativa' : 'Finalizada'}
        </Badge>
      </div>

      {/* Campaign Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Campanha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Período</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(campaign.start_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })} - {' '}
                  {format(new Date(campaign.end_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Participantes</p>
                <p className="text-sm text-gray-600">{campaign.participants.length} pessoas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium">Contatos Coletados</p>
                <p className="text-sm text-gray-600">{campaign.contacts.length} contatos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium">Local</p>
                <p className="text-sm text-gray-600">{campaign.location}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleExportCampaign}
              disabled={exporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exportando...' : 'Exportar Dados'}
            </Button>

            {campaign.status === 'active' ? (
              <Button
                variant="destructive"
                onClick={() => handleUpdateStatus('finished')}
                disabled={updating}
              >
                {updating ? 'Finalizando...' : 'Finalizar Campanha'}
              </Button>
            ) : (
              <Button
                onClick={() => handleUpdateStatus('active')}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {updating ? 'Reabrindo...' : 'Reabrir Campanha'}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleDeleteCampaign}
              disabled={updating}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle>Participantes ({campaign.participants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {campaign.participants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum participante ainda</p>
          ) : (
            <div className="space-y-2">
              {campaign.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{participant.users.username}</p>
                    <p className="text-sm text-gray-600">
                      Entrou em {format(new Date(participant.joined_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Contatos Coletados ({campaign.contacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {campaign.contacts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum contato coletado ainda</p>
          ) : (
            <div className="space-y-3">
              {campaign.contacts.map((contact) => (
                <div key={contact.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{contact.first_name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {contact.neighborhood}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        📞 {contact.phone}
                      </p>
                      {contact.demand && (
                        <p className="text-sm text-gray-600 mb-1">
                          💬 {contact.demand}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Coletado por {contact.users.username} em {' '}
                        {format(new Date(contact.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
