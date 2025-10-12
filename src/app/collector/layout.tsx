import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { CollectorNavbar } from '@/components/collector/collector-navbar'
import { MobileNavigation } from '@/components/collector/mobile-navigation'

export default async function CollectorLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    <div className="min-h-screen bg-gray-50">
      <CollectorNavbar />
      <main className="pb-20">
        {children}
      </main>
      <MobileNavigation />
    </div>
  )
}
