'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase-client'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registrationOpen, setRegistrationOpen] = useState(true) // Temporarily force open
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  // Check if registration is open
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('registration_open')
          .single()
        
        console.log('Registration status:', data, error)
        setRegistrationOpen(data?.registration_open ?? true) // Default to true if error
      } catch (err) {
        console.error('Error checking registration status:', err)
        setRegistrationOpen(true) // Default to true if error
      }
    }

    checkRegistrationStatus()
  }, [supabase])

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    setError(null)

    try {
      // Generate a unique email for Supabase Auth (they require email)
      const fakeEmail = `${data.username}@supabase.co`
      
      console.log('Tentando criar usuário com:', { username: data.username, fakeEmail })
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: data.password,
      })

      console.log('Resultado do signUp:', { authData, authError })

      if (authError) {
        console.error('Erro no signUp:', authError)
        if (authError.message.includes('already registered')) {
          setError('Este nome de usuário já está em uso. Tente outro.')
        } else if (authError.message.includes('password')) {
          setError('A senha deve ter pelo menos 6 caracteres.')
        } else {
          setError(`Erro na criação da conta: ${authError.message}`)
        }
        return
      }

      if (authData.user) {
        console.log('Usuário criado no auth, confirmando email automaticamente...')
        
        // Confirm email automatically since we're using fake emails
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          authData.user.id,
          { email_confirm: true }
        )

        if (confirmError) {
          console.error('Erro ao confirmar email:', confirmError)
          // Continue anyway, user can still be created
        }

        console.log('Email confirmado, criando perfil...')
        
        // Create user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            username: data.username,
            role: 'collector',
          })
          .select()

        console.log('Resultado da criação do perfil:', { profileData, profileError })

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError)
          if (profileError.message.includes('duplicate key')) {
            setError('Este nome de usuário já está em uso. Tente outro.')
          } else {
            setError(`Erro ao criar perfil: ${profileError.message}`)
          }
          return
        }

        console.log('Conta criada com sucesso!')
        router.push('/collector')
      } else {
        console.error('authData.user é null')
        setError('Erro: usuário não foi criado')
      }
    } catch (err) {
      console.error('Erro geral:', err)
      setError(`Erro interno: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!registrationOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600">
              Registro Fechado
            </CardTitle>
            <CardDescription>
              O registro de novas contas está temporariamente fechado
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Voltar ao Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">
            Criar Conta
          </CardTitle>
          <CardDescription>
            Crie sua conta para acessar o sistema de coleta de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                placeholder="Seu nome de usuário"
                {...register('username')}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>


            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
