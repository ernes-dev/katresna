'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, X, Loader2, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category, Product, ProductVariant } from '@/lib/types'

interface Props {
  categories: Category[]
  initialData?: Partial<Product>
  productId?: string
}

export default function ProductForm({ categories, initialData, productId }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [price, setPrice] = useState(String(initialData?.price || ''))
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '')
  const [weightGram, setWeightGram] = useState(String(initialData?.weight_gram ?? 0))
  const [isAvailable, setIsAvailable] = useState(initialData?.is_available !== false)
  const [variants, setVariants] = useState<{ name: string; price: string }[]>(
    initialData?.variants?.map(v => ({ name: v.name, price: String(v.price) })) || []
  )
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(initialData?.image_url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    setImageUrl('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const uploadImage = async (file: File): Promise<string> => {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(filename, file)
    if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(filename)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Nama produk wajib diisi'); return }
    if (!price || isNaN(Number(price))) { setError('Harga tidak valid'); return }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      let finalImageUrl = imageUrl

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile)
        if (initialData?.image_url && productId) {
          const oldPath = initialData.image_url.split('/product-images/')[1]
          if (oldPath) await supabase.storage.from('product-images').remove([oldPath])
        }
      }

      const validVariants: ProductVariant[] = variants
        .filter(v => v.name.trim() && v.price && !isNaN(Number(v.price)))
        .map(v => ({ name: v.name.trim(), price: Number(v.price) }))

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        price: Number(price),
        category_id: categoryId || null,
        weight_gram: Number(weightGram) || 0,
        is_available: isAvailable,
        image_url: finalImageUrl || null,
        variants: validVariants.length > 0 ? validVariants : null,
        updated_at: new Date().toISOString(),
      }

      if (productId) {
        await supabase.from('products').update(payload).eq('id', productId)
      } else {
        await supabase.from('products').insert(payload)
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand text-sm"

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Foto Produk</label>
        <div className="relative">
          {imagePreview ? (
            <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gray-100">
              <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-brand hover:bg-brand-light transition text-gray-400"
            >
              <Upload size={32} />
              <span className="text-sm">Klik untuk upload foto</span>
              <span className="text-xs">JPG, PNG, WebP (maks 5MB)</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Produk *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="contoh: Bolen Pisang Keju"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Deskripsi singkat produk..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga (Rp) *</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0"
            min="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Berat (gram)</label>
          <input
            type="number"
            value={weightGram}
            onChange={e => setWeightGram(e.target.value)}
            placeholder="0"
            min="0"
            className={inputClass}
          />
        </div>
      </div>

      {/* Variants */}
      <div className="border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-medium text-gray-900 text-sm">Pilihan Kemasan</p>
            <p className="text-xs text-gray-400">Isi 4, Isi 8, dll. Kosongkan jika tidak ada.</p>
          </div>
          <button
            type="button"
            onClick={() => setVariants(v => [...v, { name: '', price: '' }])}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark transition"
          >
            <Plus size={14} />
            Tambah
          </button>
        </div>
        {variants.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">Belum ada kemasan</p>
        ) : (
          <div className="space-y-2">
            {variants.map((v, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={v.name}
                  onChange={e => setVariants(prev => prev.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))}
                  placeholder="Nama (cth: Isi 4)"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <input
                  type="number"
                  value={v.price}
                  onChange={e => setVariants(prev => prev.map((x, i) => i === idx ? { ...x, price: e.target.value } : x))}
                  placeholder="Harga"
                  min="0"
                  className="w-32 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <button
                  type="button"
                  onClick={() => setVariants(prev => prev.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-600 transition p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          <option value="">Tanpa kategori</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="font-medium text-gray-900 text-sm">Tersedia untuk dijual</p>
          <p className="text-xs text-gray-500">Tampilkan produk di menu customer</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAvailable(!isAvailable)}
          className={`relative w-12 h-6 rounded-full transition-colors ${isAvailable ? 'bg-brand' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isAvailable ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {productId ? 'Simpan Perubahan' : 'Tambah Produk'}
        </button>
      </div>
    </form>
  )
}
