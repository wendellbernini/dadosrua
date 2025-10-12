import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { UserManager } from '@/components/admin/user-manager'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    redirect('/collector')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
        <p className="text-gray-600 mt-2">
          Gerencie usuários e permissões do sistema
        </p>
      </div>

      <UserManager />
    </div>
  )
}
