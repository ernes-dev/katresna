export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import ProductActions from './ProductActions'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-dark transition"
        >
          <Plus size={18} />
          Tambah Produk
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-500">Belum ada produk</p>
          <Link
            href="/admin/products/new"
            className="mt-4 inline-block bg-brand text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-dark transition"
          >
            Tambah Produk Pertama
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Produk</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Kategori</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Harga</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product: Product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🍱</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.weight_gram}g</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">
                      {(product as any).category?.name || '—'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-brand">{formatPrice(product.price)}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.is_available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.is_available ? 'Tersedia' : 'Tidak tersedia'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <ProductActions productId={product.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
