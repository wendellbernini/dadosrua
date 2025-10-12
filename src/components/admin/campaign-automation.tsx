'use client'

import { useState } from 'react'
import { useCampaignAutomation } from '@/hooks/use-campaign-automation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Play, CheckCircle, AlertCircle } from 'lucide-react'

export function CampaignAutomation() {
  const { running, finishExpiredCampaigns } = useCampaignAutomation()
  const [result, setResult] = useState<{ message: string; campaigns?: Array<{ id: string; name: string }> } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFinishCampaigns = async () => {
    setError(null)
    setResult(null)
    
    try {
      const data = await finishExpiredCampaigns()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar campanhas')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Automação de Campanhas
        </CardTitle>
        <CardDescription>
          Finalize campanhas expiradas automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              {result.message}
              {result.campaigns && result.campaigns.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Campanhas finalizadas:</p>
                  <ul className="list-disc list-inside mt-1">
                    {result.campaigns.map((campaign) => (
                      <li key={campaign.id}>{campaign.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Esta função verifica todas as campanhas ativas e finaliza aquelas que 
            passaram da data/hora de fim definida.
          </p>
          <p className="text-sm text-gray-600">
            <strong>Nota:</strong> Esta função também é executada automaticamente 
            via cron job no servidor.
          </p>
        </div>

        <Button
          onClick={handleFinishCampaigns}
          disabled={running}
          className="w-full"
        >
          <Play className="w-4 h-4 mr-2" />
          {running ? 'Executando...' : 'Finalizar Campanhas Expiradas'}
        </Button>
      </CardContent>
    </Card>
  )
}
