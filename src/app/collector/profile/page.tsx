import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { ProfileSettings } from '@/components/collector/profile-settings'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is collector
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'collector') {
    redirect('/admin')
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
        <p className="text-gray-600 mt-2">
          Gerencie suas informações pessoais e configurações
        </p>
      </div>

      <ProfileSettings />
    </div>
  )
}
