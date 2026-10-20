'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Shield, Banknote } from 'lucide-react'

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

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Menunggu Verifikasi</h1>
          <p className="text-sm text-gray-500">
            Akun Anda sedang diverifikasi admin. Proses 1x24 jam.
          </p>
        </div>

        {reseller && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Status Verifikasi</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-gray-400" />
                  Verifikasi KTP
                </span>
                <StatusBadge status={reseller.kyc_status} />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Banknote className="h-4 w-4 text-gray-400" />
                  Verifikasi Rekening
                </span>
                <StatusBadge status={reseller.bank_status} />
              </div>
            </div>

            {reseller.kyc_status === 'rejected' && reseller.kyc_notes && (
              <div className="mt-4 rounded-xl bg-red-50 p-3">
                <p className="text-xs font-medium text-red-700">Catatan KYC:</p>
                <p className="mt-1 text-xs text-red-600">{reseller.kyc_notes}</p>
                <button
                  onClick={() => router.push('/mitra/kyc')}
                  className="mt-3 w-full rounded-xl bg-brand py-2 text-xs font-semibold text-white"
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
            className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Perbarui Status
          </button>
          <button
            onClick={handleLogout}
            className="w-full rounded-xl py-2.5 text-sm font-medium text-gray-400 transition hover:text-gray-600"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  )
}
