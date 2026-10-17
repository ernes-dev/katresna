'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import ProductActions from './ProductActions'

const PAGE_SIZES = [10, 20, 50, 100]

export default function ProductsTable({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(1)

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p as any).category?.name?.toLowerCase().includes(query.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleQuery = (v: string) => { setQuery(v); setPage(1) }
  const handlePageSize = (v: number) => { setPageSize(v); setPage(1) }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama produk atau kategori…"
            value={query}
            onChange={e => handleQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={e => handlePageSize(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white"
          >
            {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>per halaman</span>
        </div>
        <span className="text-sm text-gray-400 shrink-0">{filtered.length} produk</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {paginated.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>Produk tidak ditemukan</p>
          </div>
        ) : (
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
              {paginated.map((product: Product) => (
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
                  <td className="p-4 text-sm text-gray-600">{(product as any).category?.name || '—'}</td>
                  <td className="p-4 font-semibold text-brand">{formatPrice(product.price)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Halaman {page} dari {totalPages}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | '...')[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i-1] as number) > 1) acc.push('...')
                acc.push(n)
                return acc
              }, [])
              .map((n, i) => n === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 py-1.5">…</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n as number)}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    page === n ? 'bg-brand text-white border-brand' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ))
            }
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
