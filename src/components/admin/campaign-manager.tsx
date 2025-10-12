'use client'

import { useState } from 'react'
import { useCampaigns } from '@/hooks/use-campaigns'
import { useExport } from '@/hooks/use-export'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CreateCampaignForm } from './create-campaign-form'
import { EditCampaignForm } from './edit-campaign-form'
import { Calendar, MapPin, Users, Clock, Plus, Edit, Eye, Download } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function CampaignManager() {
  const { campaigns, loading, finishCampaign } = useCampaigns()
  const { exportCampaignContacts, exporting } = useExport()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<{ id: string; name: string; location: string; start_date: string; end_date: string } | null>(null)
  const [finishing, setFinishing] = useState<string | null>(null)

  const handleFinishCampaign = async (campaignId: string) => {
    setFinishing(campaignId)
    try {
      await finishCampaign(campaignId)
    } catch (error) {
      console.error('Error finishing campaign:', error)
    } finally {
      setFinishing(null)
    }
  }

  const handleEditCampaign = (campaign: { id: string; name: string; location: string; start_date: string; end_date: string }) => {
    setSelectedCampaign(campaign)
    setEditDialogOpen(true)
  }

  const handleExportCampaign = async (campaign: { id: string; name: string }) => {
    try {
      await exportCampaignContacts(campaign.id, campaign.name)
    } catch (error) {
      console.error('Error exporting campaign:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Campanhas</h2>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campanhas</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Campanha</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova campanha de coleta
              </DialogDescription>
            </DialogHeader>
            <CreateCampaignForm onSuccess={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhuma campanha criada ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {campaign.location}
                    </CardDescription>
                  </div>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                    {campaign.status === 'active' ? 'Ativa' : 'Finalizada'}
                  </Badge>
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

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCampaign(campaign)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCampaign(campaign)}
                    disabled={exporting}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {exporting ? 'Exportando...' : 'Exportar'}
                  </Button>

                  {campaign.status === 'active' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleFinishCampaign(campaign.id)}
                      disabled={finishing === campaign.id}
                    >
                      {finishing === campaign.id ? 'Finalizando...' : 'Finalizar'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Campaign Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Campanha</DialogTitle>
            <DialogDescription>
              Atualize os dados da campanha
            </DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <EditCampaignForm
              campaign={selectedCampaign}
              onSuccess={() => {
                setEditDialogOpen(false)
                setSelectedCampaign(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
