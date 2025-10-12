'use client'

import { useState } from 'react'
import { useActiveCampaign } from '@/hooks/use-active-campaign'
import { useContacts } from '@/hooks/use-contacts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EditContactForm } from './edit-contact-form'
import { MapPin, Phone, MessageSquare, Edit, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export function MyContactsList() {
  const { activeCampaign } = useActiveCampaign()
  const { contacts, loading, deleteContact } = useContacts(activeCampaign?.id)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<{ id: string; neighborhood: string; first_name: string; phone: string; demand?: string | null } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleEditContact = (contact: { id: string; neighborhood: string; first_name: string; phone: string; demand?: string | null }) => {
    setSelectedContact(contact)
    setEditDialogOpen(true)
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Tem certeza que deseja excluir este contato?')) return

    setDeleting(contactId)
    try {
      await deleteContact(contactId)
    } catch (error) {
      console.error('Error deleting contact:', error)
    } finally {
      setDeleting(null)
    }
  }

  if (!activeCampaign) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Nenhuma campanha ativa</h3>
              <p className="text-gray-500 mt-1">
                Você precisa estar em uma campanha para ver seus contatos
              </p>
            </div>
            <Link href="/collector">
              <Button>Ver Campanhas</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Contatos Coletados</h2>
          <Link href="/collector/add-contact">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Contato
            </Button>
          </Link>
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

  const myContacts = contacts.filter(contact => 
    contact.collector_id === activeCampaign.participants.find(p => p.user_id === contact.collector_id)?.user_id
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Contatos Coletados</h2>
          <p className="text-sm text-gray-600">
            {myContacts.length} contato{myContacts.length !== 1 ? 's' : ''} na campanha {activeCampaign.name}
          </p>
        </div>
        <Link href="/collector/add-contact">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Contato
          </Button>
        </Link>
      </div>

      {myContacts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Nenhum contato coletado</h3>
                <p className="text-gray-500 mt-1">
                  Comece coletando dados na campanha ativa
                </p>
              </div>
              <Link href="/collector/add-contact">
                <Button>Adicionar Primeiro Contato</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myContacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{contact.first_name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {contact.neighborhood}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {format(new Date(contact.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{contact.phone}</span>
                  </div>
                  {contact.demand && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 mt-0.5" />
                      <span className="flex-1">{contact.demand}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditContact(contact)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteContact(contact.id)}
                    disabled={deleting === contact.id}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting === contact.id ? 'Excluindo...' : 'Excluir'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Contact Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
            <DialogDescription>
              Atualize os dados do contato
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <EditContactForm
              contact={selectedContact}
              onSuccess={() => {
                setEditDialogOpen(false)
                setSelectedContact(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
