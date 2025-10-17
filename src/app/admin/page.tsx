import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { DashboardStats } from '@/components/admin/dashboard-stats'
import { RecentCampaigns } from '@/components/admin/recent-campaigns'
import { TopCollectors } from '@/components/admin/top-collectors'

export default async function AdminDashboard() {
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
        <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-600 mt-2">
          Acompanhe o desempenho das campanhas e dados coletados
        </p>
      </div>

      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentCampaigns />
        <TopCollectors />
      </div>
    </div>
  )
}
