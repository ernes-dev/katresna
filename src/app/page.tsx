export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import { Product, Category, StoreSettings, Banner } from '@/lib/types'
import CustomerMenu from '@/components/CustomerMenu'
import StoreHeroCarousel from '@/components/StoreHeroCarousel'
import { MapPin } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: products }, { data: categories }, { data: settings }, { data: banners }] = await Promise.all([
    supabase.from('products').select('*, category:categories(*)').eq('is_available', true).order('created_at'),
    supabase.from('categories').select('*').order('name'),
    supabase.from('store_settings').select('*').eq('id', 1).single(),
    supabase.from('banners').select('*').eq('is_active', true).order('order_index').order('created_at').limit(5),
  ])

  const store = settings as StoreSettings | null

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 pb-32">

        <StoreHeroCarousel banners={(banners as Banner[]) || []} />

        {/* Store info strip */}
        <div className="mt-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              store?.is_open
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-red-50 text-red-500 border border-red-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${store?.is_open ? 'bg-green-500' : 'bg-red-500'}`} />
              {store?.is_open ? 'Buka' : 'Tutup'}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0">
              <MapPin size={11} className="shrink-0 text-brand" />
              <span className="truncate">{store?.address || 'Bandung'}</span>
            </div>
          </div>
          {store?.instagram_url && (
            <a
              href={store.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              <span className="hidden sm:inline">Instagram</span>
            </a>
          )}
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
