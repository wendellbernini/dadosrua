import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { CampaignList } from '@/components/collector/campaign-list'
import { ActiveCampaign } from '@/components/collector/active-campaign'

export default async function CollectorDashboard() {
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
        <h1 className="text-2xl font-bold text-gray-900">Campanhas Ativas</h1>
        <p className="text-gray-600 mt-2">
          Escolha uma campanha para começar a coletar dados
        </p>
      </div>

      <ActiveCampaign />
      <CampaignList />
    </div>
  )
}
