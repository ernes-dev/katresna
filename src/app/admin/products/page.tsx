export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Product } from '@/lib/types'
import ProductsTable from './ProductsTable'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-gray-900">Produk</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl font-semibold hover:bg-brand-dark active:scale-[0.97] transition shadow-sm shadow-brand/20"
        >
          <Plus size={18} />
          Tambah Produk
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#f0e8dc] shadow-soft">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-500">Belum ada produk</p>
          <Link
            href="/admin/products/new"
            className="mt-4 inline-block bg-brand text-white px-6 py-2 rounded-xl font-semibold hover:bg-brand-dark active:scale-[0.97] transition shadow-sm shadow-brand/20"
          >
            Tambah Produk Pertama
          </Link>
        </div>
      ) : (
        <ProductsTable products={products as Product[]} />
      )}
    </div>
  )
}
