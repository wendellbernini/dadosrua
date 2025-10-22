'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Shield, User, Crown, Mail, Calendar, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UserData {
  id: string
  username: string
  full_name: string | null
  email: string
  role: 'admin' | 'collector'
  created_at: string
  contact_count: number
  campaign_count: number
}

export function UserManager() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Primeiro verificar se o usuário atual é admin
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const { data: currentUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (currentUser?.role !== 'admin') {
        throw new Error('Acesso negado - apenas administradores')
      }
      
      // Buscar todos os usuários diretamente (admin tem acesso)
      const { data: usersData, error } = await supabase
        .from('users')
        .select(`
          id,
          username,
          full_name,
          role,
          created_at
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error

      // Buscar contagem de contatos e campanhas para cada usuário
      const usersWithCounts = await Promise.all(
        usersData?.map(async (user) => {
          const { count: contactCount } = await supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .eq('collector_id', user.id)

          const { count: campaignCount } = await supabase
            .from('campaign_participants')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          return {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            email: `${user.username}@supabase.co`, // Email fake para exibição
            role: user.role,
            created_at: user.created_at,
            contact_count: contactCount || 0,
            campaign_count: campaignCount || 0,
          }
        }) || []
      )

      setUsers(usersWithCounts)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'admin' | 'collector') => {
    setUpdating(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      await fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
    } finally {
      setUpdating(null)
    }
  }

  const deleteUser = async (userId: string, username: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${username}"? Esta ação não pode ser desfeita.`)) {
      return
    }
    
    setDeleting(userId)
    try {
      // Primeiro excluir participações em campanhas
      await supabase
        .from('campaign_participants')
        .delete()
        .eq('user_id', userId)

      // Depois excluir contatos coletados pelo usuário
      await supabase
        .from('contacts')
        .delete()
        .eq('collector_id', userId)

      // Finalmente excluir o usuário
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      await fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erro ao excluir usuário. Tente novamente.')
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Usuários</h2>
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
        <h2 className="text-xl font-semibold">Usuários</h2>
        <div className="text-sm text-gray-600">
          {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
        </div>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhum usuário cadastrado ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user, index) => (
            <Card key={user.id || `user-${index}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {user.role === 'admin' ? (
                        <Crown className="w-5 h-5 text-blue-600" />
                      ) : (
                        <User className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.full_name || user.username}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Administrador' : 'Coletor'}
                    </Badge>
                    {user.id !== '516e6649-be96-4e74-a2ec-c43f93ffb046' && (
                      <button
                        onClick={() => deleteUser(user.id, user.full_name || user.username)}
                        disabled={deleting === user.id}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Cadastrado em {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {user.contact_count} contatos coletados em {user.campaign_count} campanha{user.campaign_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Função:</span>
                  <Select
                    value={user.role}
                    onValueChange={(value: 'admin' | 'collector') => updateUserRole(user.id, value)}
                    disabled={updating === user.id || user.id === '516e6649-be96-4e74-a2ec-c43f93ffb046'}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="collector">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Coletor
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Administrador
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {updating === user.id && (
                    <span className="text-sm text-blue-600">Atualizando...</span>
                  )}
                  {user.id === '516e6649-be96-4e74-a2ec-c43f93ffb046' && (
                    <span className="text-sm text-gray-500">(Principal)</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
