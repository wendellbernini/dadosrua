'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCampaigns } from '@/hooks/use-campaigns'
import { updateCampaignSchema, type UpdateCampaignInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface EditCampaignFormProps {
  campaign: { id: string; name: string; location: string; start_date: string; end_date: string }
  onSuccess: () => void
}

export function EditCampaignForm({ campaign, onSuccess }: EditCampaignFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updateCampaign } = useCampaigns()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateCampaignInput>({
    resolver: zodResolver(updateCampaignSchema),
    defaultValues: {
      name: campaign.name,
      location: campaign.location,
      start_date: new Date(campaign.start_date).toISOString().slice(0, 16),
      end_date: new Date(campaign.end_date).toISOString().slice(0, 16),
    },
  })

  const onSubmit = async (data: UpdateCampaignInput) => {
    setIsLoading(true)
    setError(null)

    try {
      await updateCampaign(campaign.id, data)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar campanha')
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
        <Label htmlFor="name">Nome da Campanha</Label>
        <Input
          id="name"
          placeholder="Ex: Recreio - Segunda 15/10"
          {...register('name')}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Local/Bairro</Label>
        <Input
          id="location"
          placeholder="Ex: Recreio dos Bandeirantes"
          {...register('location')}
          disabled={isLoading}
        />
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="start_date">Data e Hora de Início</Label>
        <Input
          id="start_date"
          type="datetime-local"
          {...register('start_date')}
          disabled={isLoading}
        />
        {errors.start_date && (
          <p className="text-sm text-red-500">{errors.start_date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="end_date">Data e Hora de Fim</Label>
        <Input
          id="end_date"
          type="datetime-local"
          {...register('end_date')}
          disabled={isLoading}
        />
        {errors.end_date && (
          <p className="text-sm text-red-500">{errors.end_date.message}</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Atualizando...' : 'Atualizar Campanha'}
        </Button>
      </div>
    </form>
  )
}
