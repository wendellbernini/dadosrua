'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, Users, Clock, Save } from 'lucide-react'
import { CampaignAutomation } from './campaign-automation'

interface AppSettings {
  id: string
  registration_open: boolean
  default_campaign_end_time: string
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single()

      if (error) throw error
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async () => {
    if (!settings) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('app_settings')
        .update({
          registration_open: settings.registration_open,
          default_campaign_end_time: settings.default_campaign_end_time,
        })
        .eq('id', settings.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Erro ao carregar configurações</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações Gerais
          </CardTitle>
          <CardDescription>
            Configure as opções principais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>Configurações salvas com sucesso!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="registration" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Registro de Novos Usuários
                </Label>
                <p className="text-sm text-gray-600">
                  Permite que novos usuários se cadastrem no sistema
                </p>
              </div>
              <Switch
                id="registration"
                checked={settings.registration_open}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, registration_open: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário Padrão de Fim de Campanha
              </Label>
              <p className="text-sm text-gray-600">
                Horário padrão para finalizar campanhas automaticamente
              </p>
              <Input
                id="end_time"
                type="time"
                value={settings.default_campaign_end_time}
                onChange={(e) =>
                  setSettings({ ...settings, default_campaign_end_time: e.target.value })
                }
                className="w-40"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={updateSettings} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>
            Dados sobre o uso atual do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {settings.registration_open ? 'Aberto' : 'Fechado'}
              </div>
              <div className="text-sm text-gray-600">Registro de Usuários</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {settings.default_campaign_end_time}
              </div>
              <div className="text-sm text-gray-600">Fim Padrão de Campanhas</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                Ativo
              </div>
              <div className="text-sm text-gray-600">Status do Sistema</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CampaignAutomation />
    </div>
  )
}
