'use client'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProductActions({ productId }: { productId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Hapus produk ini?')) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', productId)
    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
      >
        <Pencil size={16} />
      </Link>
      <button
        onClick={handleDelete}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
