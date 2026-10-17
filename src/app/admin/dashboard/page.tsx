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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          settings?.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <Power size={14} />
          {settings?.is_open ? 'Toko Buka' : 'Toko Tutup'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-brand-light p-3 rounded-xl">
              <Package size={20} className="text-brand" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Produk</p>
              <p className="text-2xl font-bold">{productCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Tag size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Kategori</p>
              <p className="text-2xl font-bold">{categoryCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Store size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Nama Toko</p>
              <p className="text-lg font-bold">{settings?.store_name || 'Katresna'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Kontrol Cepat</h2>
        <PickupToggle
          initialPickup={settings?.pickup_enabled || false}
          initialOpen={settings?.is_open || false}
        />
      </div>
    </div>
  )
}
