export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import { Product, Category, StoreSettings } from '@/lib/types'
import CustomerMenu from '@/components/CustomerMenu'
import StoreHeroCarousel from '@/components/StoreHeroCarousel'

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

        <StoreHeroCarousel store={store} productCount={productCount} />

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
