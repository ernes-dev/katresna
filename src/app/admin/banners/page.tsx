'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Trash2, Upload, ImageIcon, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Banner } from '@/lib/types'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('order_index')
      .order('created_at')
    setBanners((data as Banner[]) || [])
    setLoading(false)
  }

  useEffect(() => { fetchBanners() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = 5 - banners.length
    if (remaining <= 0) {
      alert('Maksimal 5 flyer. Hapus yang lama dulu.')
      return
    }

    setUploading(true)
    const toUpload = files.slice(0, remaining)

    for (const file of toUpload) {
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data: uploaded, error } = await supabase.storage
        .from('banners')
        .upload(filename, file, { cacheControl: '3600', upsert: false })

      if (error || !uploaded) continue

      const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(uploaded.path)

      await supabase.from('banners').insert({
        image_url: publicUrl,
        order_index: banners.length,
        is_active: true,
      })
    }

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    await fetchBanners()
  }

  const handleDelete = async (banner: Banner) => {
    if (!confirm('Hapus flyer ini?')) return
    const filename = banner.image_url.split('/').pop()
    if (filename) await supabase.storage.from('banners').remove([filename])
    await supabase.from('banners').delete().eq('id', banner.id)
    await fetchBanners()
  }

  const handleToggleActive = async (banner: Banner) => {
    await supabase.from('banners').update({ is_active: !banner.is_active }).eq('id', banner.id)
    await fetchBanners()
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= banners.length) return

    const a = banners[index]
    const b = banners[swapIndex]

    await Promise.all([
      supabase.from('banners').update({ order_index: swapIndex }).eq('id', a.id),
      supabase.from('banners').update({ order_index: index }).eq('id', b.id),
    ])
    await fetchBanners()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Flyer Carousel</h1>
          <p className="text-sm text-gray-500 mt-0.5">Maksimal 5 flyer, tampil di halaman utama</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{banners.length}/5</span>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading || banners.length >= 5}
            className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-dark transition disabled:opacity-40"
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            Upload Flyer
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : banners.length === 0 ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl h-44 flex flex-col items-center justify-center gap-3 text-gray-400 cursor-pointer hover:border-brand hover:text-brand transition"
        >
          <ImageIcon size={40} />
          <div className="text-center">
            <p className="font-semibold">Belum ada flyer</p>
            <p className="text-sm mt-0.5">Klik untuk upload gambar</p>
          </div>
          <p className="text-xs text-gray-300">JPG, PNG, WebP • Rasio 16:9 direkomendasikan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, i) => (
            <div key={banner.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex gap-0">
              {/* Preview */}
              <div className="relative w-40 h-24 shrink-0 bg-gray-100">
                <Image
                  src={banner.image_url}
                  alt={`Flyer ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Info & controls */}
              <div className="flex-1 p-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Flyer {i + 1}</p>
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      banner.is_active
                        ? 'bg-green-50 text-green-600 border border-green-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  >
                    {banner.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(i, 'up')}
                    disabled={i === 0}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500 disabled:opacity-30"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    onClick={() => handleMove(i, 'down')}
                    disabled={i === banners.length - 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500 disabled:opacity-30"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {banners.length < 5 && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-4 flex items-center justify-center gap-2 text-gray-400 hover:border-brand hover:text-brand transition text-sm font-medium"
            >
              <Upload size={16} />
              Tambah flyer ({5 - banners.length} slot tersisa)
            </button>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700">Tips:</p>
        <p>• Gunakan gambar rasio 16:9 (misal: 1280×720px atau 1920×1080px)</p>
        <p>• Format: JPG, PNG, atau WebP</p>
        <p>• Klik badge Aktif/Nonaktif untuk tampil/sembunyikan flyer</p>
        <p>• Geser urutan dengan tombol panah</p>
      </div>
    </div>
  )
}
