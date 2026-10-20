export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('store_settings').select('*').eq('id', 1).single()

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-gray-900 mb-6">Pengaturan Toko</h1>
      <div className="bg-white rounded-3xl p-6 border border-[#f0e8dc] shadow-soft max-w-2xl">
        <SettingsForm initialData={settings} />
      </div>
    </div>
  )
}
