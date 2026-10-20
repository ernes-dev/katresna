'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Camera, ShieldCheck, RotateCcw, ArrowRight } from 'lucide-react'

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
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-5">
        <Image src="https://lh3.googleusercontent.com/d/1TpFd2rJxeYrmtmyjl6L-6cQrX9sQI1fi" className="mx-auto h-12 w-auto object-contain" unoptimized alt="Katresna" width={120} height={48} />

        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-light">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-brand to-brand-dark" />
          </div>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200" />
        </div>
        <p className="text-center text-xs font-medium text-gray-400">Langkah 1 dari 2 — Verifikasi KTP</p>

        <div className="rounded-3xl border border-[#f0e8dc] bg-white p-6 shadow-soft">
          <div className="mb-5 flex gap-3 rounded-2xl bg-brand-light p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand">Petunjuk Foto KTP</p>
              <ul className="mt-2 space-y-1 text-xs text-brand/90">
                <li>• Gunakan kamera belakang ponsel Anda</li>
                <li>• Pastikan KTP terlihat jelas dan tidak buram</li>
                <li>• Semua teks di KTP harus terbaca</li>
                <li>• Hindari pantulan cahaya di KTP</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {preview ? (
              <div className="overflow-hidden rounded-2xl border border-[#f0e8dc] shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview KTP" className="w-full object-cover" />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-[#FFF8F0]/60 text-gray-400 transition hover:border-brand hover:bg-brand-light/50 hover:text-brand"
              >
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-soft">
                  <Camera className="h-6 w-6" />
                </span>
                <span className="text-sm font-semibold">Ambil Foto KTP</span>
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:border-brand/30 hover:text-brand active:scale-[0.97]"
              >
                <RotateCcw className="h-4 w-4" />
                Ambil Ulang
              </button>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100"
            >
              {loading ? 'Mengunggah...' : <>Lanjutkan <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
