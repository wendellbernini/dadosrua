'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useActiveCampaign } from '@/hooks/use-active-campaign'
import { useContacts } from '@/hooks/use-contacts'
import { createContactSchema, type CreateContactInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { NeighborhoodAutocomplete } from '@/components/ui/neighborhood-autocomplete'
import { PhoneInput } from '@/components/ui/phone-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CheckCircle, AlertCircle } from 'lucide-react'

export function AddContactForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { activeCampaign } = useActiveCampaign()
  const { createContact } = useContacts()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateContactInput>({
    resolver: zodResolver(createContactSchema),
  })

  const watchedNeighborhood = watch('neighborhood')
  const watchedPhone = watch('phone')

  const onSubmit = async (data: CreateContactInput) => {
    if (!activeCampaign) {
      setError('Você precisa estar em uma campanha ativa para adicionar contatos')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await createContact({
        campaign_id: activeCampaign.id,
        neighborhood: data.neighborhood,
        first_name: data.first_name,
        phone: data.phone,
        demand: data.demand,
      })

      setSuccess(true)
      reset()
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        router.push('/collector/my-contacts')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar contato')
    } finally {
      setIsLoading(false)
    }
  }

  if (!activeCampaign) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Nenhuma campanha ativa</h3>
              <p className="text-gray-500 mt-1">
                Você precisa entrar em uma campanha para adicionar contatos
              </p>
            </div>
            <Button onClick={() => router.push('/collector')}>
              Ver Campanhas
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Contato salvo com sucesso!</h3>
              <p className="text-gray-500 mt-1">
                Redirecionando para seus contatos...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Contato</CardTitle>
        <CardDescription>
          Campanha: {activeCampaign.name} - {activeCampaign.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro *</Label>
            <NeighborhoodAutocomplete
              value={watchedNeighborhood}
              onValueChange={(value) => setValue('neighborhood', value)}
              placeholder="Selecione o bairro..."
            />
            {errors.neighborhood && (
              <p className="text-sm text-red-500">{errors.neighborhood.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="first_name">Nome *</Label>
            <Input
              id="first_name"
              placeholder="Primeiro nome da pessoa"
              {...register('first_name')}
              disabled={isLoading}
              className="h-12 text-base"
            />
            {errors.first_name && (
              <p className="text-sm text-red-500">{errors.first_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <PhoneInput
              value={watchedPhone}
              onChange={(value) => setValue('phone', value)}
              disabled={isLoading}
              className="h-12 text-base"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="demand">Demanda (opcional)</Label>
            <Textarea
              id="demand"
              placeholder="Descreva a demanda ou pedido da pessoa..."
              {...register('demand')}
              disabled={isLoading}
              rows={3}
              className="text-base"
            />
            {errors.demand && (
              <p className="text-sm text-red-500">{errors.demand.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/collector')}
              className="flex-1 h-12 text-base"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 h-12 text-base">
              {isLoading ? 'Salvando...' : 'Salvar Contato'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
