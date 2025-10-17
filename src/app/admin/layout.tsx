import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { AdminNavbar } from '@/components/admin/admin-navbar'

export default async function AdminLayout({
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
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {children}
      </main>
    </div>
  )
}
