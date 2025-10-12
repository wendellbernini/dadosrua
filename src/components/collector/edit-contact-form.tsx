'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContacts } from '@/hooks/use-contacts'
import { updateContactSchema, type UpdateContactInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { NeighborhoodAutocomplete } from '@/components/ui/neighborhood-autocomplete'
import { PhoneInput } from '@/components/ui/phone-input'
import { Input } from '@/components/ui/input'

interface EditContactFormProps {
  contact: { id: string; neighborhood: string; first_name: string; phone: string; demand?: string | null }
  onSuccess: () => void
}

export function EditContactForm({ contact, onSuccess }: EditContactFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updateContact } = useContacts()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateContactInput>({
    resolver: zodResolver(updateContactSchema),
    defaultValues: {
      neighborhood: contact.neighborhood,
      first_name: contact.first_name,
      phone: contact.phone,
      demand: contact.demand || '',
    },
  })

  const watchedNeighborhood = watch('neighborhood')
  const watchedPhone = watch('phone')

  const onSubmit = async (data: UpdateContactInput) => {
    setIsLoading(true)
    setError(null)

    try {
      await updateContact(contact.id, data)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar contato')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        />
        {errors.demand && (
          <p className="text-sm text-red-500">{errors.demand.message}</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Atualizando...' : 'Atualizar Contato'}
        </Button>
      </div>
    </form>
  )
}
