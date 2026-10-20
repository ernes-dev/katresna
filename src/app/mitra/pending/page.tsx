'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Shield, Banknote, Clock, RefreshCw, LogOut } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
        Disetujui
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        Ditolak
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
      Menunggu
    </span>
  )
}

export default function MitraPendingPage() {
  const router = useRouter()
  const [reseller, setReseller] = useState<{
    kyc_status: string
    bank_status: string
    is_active: boolean
    kyc_notes?: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const checkStatus = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/mitra/login')
      return
    }

    const { data } = await supabase
      .from('resellers')
      .select('kyc_status, bank_status, is_active, kyc_notes')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setReseller(data)
      if (data.is_active) {
        router.replace('/mitra/dashboard')
      }
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/mitra/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <Image
          src="https://lh3.googleusercontent.com/d/1TpFd2rJxeYrmtmyjl6L-6cQrX9sQI1fi"
          alt="Bolen Katresna"
          width={120}
          height={56}
          className="mx-auto h-10 w-auto object-contain"
          unoptimized
        />

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 to-amber-500 p-6 text-center text-white shadow-float">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-white/5" />
          <div className="relative">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Clock className="h-8 w-8" />
            </div>
            <h1 className="font-display text-xl font-semibold">Menunggu Verifikasi</h1>
            <p className="mt-1 text-sm text-white/85">
              Akun Anda sedang diverifikasi admin. Proses 1x24 jam.
            </p>
          </div>
        </div>

        {reseller && (
          <div className="rounded-3xl border border-[#f0e8dc] bg-white p-5 shadow-soft">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Status Verifikasi</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-[#FFF8F0] px-4 py-3">
                <span className="flex items-center gap-2.5 text-sm text-gray-600">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light">
                    <Shield className="h-4 w-4 text-brand" />
                  </span>
                  Verifikasi KTP
                </span>
                <StatusBadge status={reseller.kyc_status} />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#FFF8F0] px-4 py-3">
                <span className="flex items-center gap-2.5 text-sm text-gray-600">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light">
                    <Banknote className="h-4 w-4 text-brand" />
                  </span>
                  Verifikasi Rekening
                </span>
                <StatusBadge status={reseller.bank_status} />
              </div>
            </div>

            {reseller.kyc_status === 'rejected' && reseller.kyc_notes && (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3">
                <p className="text-xs font-semibold text-red-700">Catatan KYC:</p>
                <p className="mt-1 text-xs text-red-600">{reseller.kyc_notes}</p>
                <button
                  onClick={() => router.push('/mitra/kyc')}
                  className="mt-3 w-full rounded-xl bg-brand py-2 text-xs font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark active:scale-[0.97]"
                >
                  Upload Ulang KTP
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={checkStatus}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:border-brand/30 hover:text-brand active:scale-[0.97]"
          >
            <RefreshCw className="h-4 w-4" />
            Perbarui Status
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-gray-400 transition hover:text-gray-600"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  )
}
