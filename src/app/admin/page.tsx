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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          Acompanhe o desempenho das campanhas e dados coletados
        </p>
      </div>

      <DashboardStats />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <RecentCampaigns />
        <TopCollectors />
      </div>
    </div>
  )
}
