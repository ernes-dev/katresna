export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('store_settings').select('*').eq('id', 1).single()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan Toko</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm max-w-2xl">
        <SettingsForm initialData={settings} />
      </div>
    </div>
  )
}
