'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Lock, Save } from 'lucide-react'
import { z } from 'zod'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Nome pessoal deve ter pelo menos 2 caracteres'),
  username: z.string().min(2, 'Nome de usuário deve ter pelo menos 2 caracteres'),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Senha atual é obrigatória'),
  new_password: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirm_password: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "As senhas não coincidem",
  path: ["confirm_password"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export function ProfileSettings() {
  const { profile, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    if (profile) {
      resetProfile({
        full_name: profile.full_name || '',
        username: profile.username || '',
      })
    }
  }, [profile, resetProfile])

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('Atualizando perfil:', { data, profileId: profile?.id })
      
      const { error } = await supabase
        .from('users')
        .update({
          full_name: data.full_name,
          username: data.username,
        })
        .eq('id', profile?.id)

      console.log('Resultado da atualização:', { error })

      if (error) {
        console.error('Erro ao atualizar perfil:', error)
        if (error.message.includes('duplicate key')) {
          setError('Este nome de usuário já está em uso. Tente outro.')
        } else {
          setError(`Erro ao atualizar perfil: ${error.message}`)
        }
        return
      }

      setSuccess('Perfil atualizado com sucesso!')
      await refreshProfile()
    } catch (err) {
      console.error('Erro geral:', err)
      setError(`Erro interno: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    try {
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: data.new_password
      })

      if (error) {
        setPasswordError(`Erro ao alterar senha: ${error.message}`)
        return
      }

      setPasswordSuccess('Senha alterada com sucesso!')
      resetPassword()
    } catch (err) {
      setPasswordError(`Erro interno: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setIsPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Pessoal</Label>
                <Input
                  id="full_name"
                  placeholder="Seu nome completo"
                  {...registerProfile('full_name')}
                  disabled={isLoading}
                />
                {profileErrors.full_name && (
                  <p className="text-sm text-red-500">{profileErrors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  placeholder="Seu nome de usuário"
                  {...registerProfile('username')}
                  disabled={isLoading}
                />
                {profileErrors.username && (
                  <p className="text-sm text-red-500">{profileErrors.username.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Altere sua senha de acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            {passwordError && (
              <Alert variant="destructive">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            {passwordSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{passwordSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="new_password">Nova Senha</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...registerPassword('new_password')}
                disabled={isPasswordLoading}
              />
              {passwordErrors.new_password && (
                <p className="text-sm text-red-500">{passwordErrors.new_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="Digite a senha novamente"
                {...registerPassword('confirm_password')}
                disabled={isPasswordLoading}
              />
              {passwordErrors.confirm_password && (
                <p className="text-sm text-red-500">{passwordErrors.confirm_password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isPasswordLoading} className="w-full md:w-auto">
              <Lock className="w-4 h-4 mr-2" />
              {isPasswordLoading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
