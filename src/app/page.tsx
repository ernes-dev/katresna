export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import { Product, Category, StoreSettings } from '@/lib/types'
import { MapPin, Clock } from 'lucide-react'
import CustomerMenu from '@/components/CustomerMenu'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: products }, { data: categories }, { data: settings }] = await Promise.all([
    supabase.from('products').select('*, category:categories(*)').eq('is_available', true).order('created_at'),
    supabase.from('categories').select('*').order('name'),
    supabase.from('store_settings').select('*').eq('id', 1).single(),
  ])

  const store = settings as StoreSettings | null
  const productCount = (products || []).length

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 pb-32">

        {/* Store hero card - GrabMart style */}
        <div className="mt-4 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          {/* Green top strip */}
          <div className="bg-gradient-to-r from-brand to-brand-dark h-2" />

          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">{store?.store_name || 'Bolen Katresna'}</h1>
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    store?.is_open
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-red-50 text-red-500 border border-red-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${store?.is_open ? 'bg-green-500' : 'bg-red-500'}`} />
                    {store?.is_open ? 'Buka' : 'Tutup'}
                  </div>
                </div>

                <p className="text-gray-500 text-xs mt-0.5">Bolen Pisang Khas Bandung</p>

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} className="text-brand" />
                    <span>{store?.address || 'Bandung'}</span>
                  </div>
                  {store?.pickup_enabled && (
                    <div className="flex items-center gap-1 text-xs text-brand font-medium">
                      <Clock size={12} />
                      <span>Ambil di Outlet</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-50">
              <div className="text-center">
                <p className="text-brand font-bold text-base">{productCount}</p>
                <p className="text-gray-400 text-xs">Menu</p>
              </div>
              <div className="text-center border-x border-gray-100">
                <p className="text-gray-900 font-bold text-base">Tersedia</p>
                <p className="text-gray-400 text-xs">Pengiriman</p>
              </div>
              <div className="text-center">
                <p className="text-gray-900 font-bold text-base">{store?.pickup_enabled ? 'Gratis' : '—'}</p>
                <p className="text-gray-400 text-xs">Ambil di Outlet</p>
              </div>
            </div>
          </div>
        </div>

        {!store?.is_open && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-center text-sm font-medium">
            ⚠️ Toko sedang tutup. Silakan kembali nanti.
          </div>
        )}

        <CustomerMenu
          products={(products as Product[]) || []}
          categories={(categories as Category[]) || []}
        />
      </main>
    </>
  )
}
