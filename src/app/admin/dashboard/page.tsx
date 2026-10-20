export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { Package, Tag, Power, Store } from 'lucide-react'
import PickupToggle from './PickupToggle'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ count: productCount }, { count: categoryCount }, { data: settings }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('store_settings').select('*').eq('id', 1).single(),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          settings?.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <Power size={14} />
          {settings?.is_open ? 'Toko Buka' : 'Toko Tutup'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Hero stat */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-5 text-white shadow-lg shadow-brand/25">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute right-4 top-16 h-20 w-20 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-3">
            <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-sm">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Produk</p>
              <p className="text-3xl font-bold tracking-tight">{productCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#f0e8dc] shadow-soft">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Tag size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Kategori</p>
              <p className="text-2xl font-bold text-gray-900">{categoryCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#f0e8dc] shadow-soft">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-2xl">
              <Store size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Nama Toko</p>
              <p className="text-lg font-bold text-gray-900">{settings?.store_name || 'Katresna'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#f0e8dc] shadow-soft">
        <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">Kontrol Cepat</h2>
        <PickupToggle
          initialPickup={settings?.pickup_enabled || false}
          initialOpen={settings?.is_open || false}
        />
      </div>
    </div>
  )
}
