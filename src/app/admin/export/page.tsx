import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { ExportPanel } from '@/components/admin/export-panel'

export default async function AdminExportPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Exportar Dados</h1>
        <p className="text-gray-600 mt-2">
          Exporte todos os dados coletados para análise externa
        </p>
      </div>

      <ExportPanel />
    </div>
  )
}
