'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MitraKycPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/mitra/login')
        return
      }
      setUserId(user.id)
      setAuthLoading(false)
    }
    check()
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !userId) {
      alert('Pilih foto KTP terlebih dahulu.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${timestamp}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('kyc-photos')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      alert('Gagal upload foto: ' + uploadError.message)
      setLoading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('kyc-photos').getPublicUrl(path)
    const photoUrl = urlData.publicUrl

    const { error: updateError } = await supabase
      .from('resellers')
      .update({ kyc_photo_url: photoUrl, kyc_status: 'pending' })
      .eq('user_id', userId)

    if (updateError) {
      alert('Gagal menyimpan data KYC: ' + updateError.message)
      setLoading(false)
      return
    }

    router.replace('/mitra/bank')
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Verifikasi Identitas</h1>
          <p className="mt-1 text-sm text-gray-500">Langkah 1 dari 2</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 rounded-xl bg-brand-light p-4">
            <p className="text-sm font-medium text-brand">Petunjuk Foto KTP</p>
            <ul className="mt-2 space-y-1 text-xs text-brand">
              <li>• Gunakan kamera belakang ponsel Anda</li>
              <li>• Pastikan KTP terlihat jelas dan tidak buram</li>
              <li>• Semua teks di KTP harus terbaca</li>
              <li>• Hindari pantulan cahaya di KTP</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {preview ? (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview KTP" className="w-full object-cover" />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition hover:border-brand hover:text-brand"
              >
                <svg className="mb-2 h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">Ambil Foto KTP</span>
                <span className="text-xs">Ketuk untuk membuka kamera</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {preview && (
              <button
                type="button"
                onClick={() => { setPreview(null); setFile(null) }}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                Ambil Ulang
              </button>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? 'Mengunggah...' : 'Lanjutkan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
