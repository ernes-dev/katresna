'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Commission } from '@/lib/mitra'

interface ResellerDetail {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  kyc_photo_url: string | null
  kyc_status: string
  kyc_notes: string | null
  bank_name: string | null
  bank_account: string | null
  bank_holder: string | null
  bank_status: string
  is_active: boolean
  created_at: string
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved' || status === 'true') return <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Disetujui</span>
  if (status === 'rejected') return <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Ditolak</span>
  return <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">Pending</span>
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ResellerDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [reseller, setReseller] = useState<ResellerDetail | null>(null)
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [kycPhotoUrl, setKycPhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const [showRejectKyc, setShowRejectKyc] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/mitra/login'); return }

    const { data: profile } = await supabase
      .from('resellers')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      router.replace('/mitra/dashboard')
      return
    }

    const { data: r } = await supabase
      .from('resellers')
      .select('*')
      .eq('id', id)
      .single()

    if (!r) { router.replace('/mitra/admin/resellers'); return }

    setReseller(r as ResellerDetail)

    if (r.kyc_photo_url) {
      // Try to get signed URL from storage path
      const pathMatch = r.kyc_photo_url.match(/kyc-photos\/(.+)$/)
      if (pathMatch) {
        const { data: signed } = await supabase.storage
          .from('kyc-photos')
          .createSignedUrl(pathMatch[1], 3600)
        setKycPhotoUrl(signed?.signedUrl ?? r.kyc_photo_url)
      } else {
        setKycPhotoUrl(r.kyc_photo_url)
      }
    }

    const { data: comData } = await supabase
      .from('commissions')
      .select('*')
      .eq('reseller_id', id)
      .order('created_at', { ascending: false })
      .limit(20)

    setCommissions((comData ?? []) as Commission[])
    setLoading(false)
  }, [id, router])

  useEffect(() => { load() }, [load])

  const doUpdate = async (updates: Record<string, unknown>) => {
    setActionLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('resellers').update(updates).eq('id', id)
    if (error) { alert('Gagal: ' + error.message) }
    await load()
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!reseller) return null

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/mitra/admin/resellers" className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Detail Reseller</h1>
        </div>

        {/* Profile Card */}
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Informasi Pribadi</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nama</span>
              <span className="font-medium">{reseller.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span>{reseller.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">No. HP</span>
              <span>{reseller.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Daftar</span>
              <span>{formatDate(reseller.created_at)}</span>
            </div>
          </div>
        </div>

        {/* KYC Card */}
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Verifikasi KTP</h2>
            <StatusBadge status={reseller.kyc_status} />
          </div>

          {kycPhotoUrl ? (
            <div className="mb-4 overflow-hidden rounded-xl border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={kycPhotoUrl} alt="KTP" className="w-full object-cover" />
            </div>
          ) : (
            <p className="mb-4 text-sm text-gray-400">Belum ada foto KTP</p>
          )}

          {reseller.kyc_notes && (
            <div className="mb-3 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
              <span className="font-medium">Catatan:</span> {reseller.kyc_notes}
            </div>
          )}

          <div className="flex gap-2">
            <button
              disabled={actionLoading || reseller.kyc_status === 'approved'}
              onClick={() => doUpdate({ kyc_status: 'approved', kyc_notes: null })}
              className="flex-1 rounded-xl bg-green-600 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              Setujui KYC
            </button>
            <button
              disabled={actionLoading}
              onClick={() => setShowRejectKyc(v => !v)}
              className="flex-1 rounded-xl bg-red-50 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
            >
              Tolak KYC
            </button>
          </div>

          {showRejectKyc && (
            <div className="mt-3 space-y-2">
              <textarea
                value={rejectNotes}
                onChange={e => setRejectNotes(e.target.value)}
                placeholder="Alasan penolakan..."
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-brand"
              />
              <button
                disabled={actionLoading}
                onClick={() => {
                  doUpdate({ kyc_status: 'rejected', kyc_notes: rejectNotes })
                  setShowRejectKyc(false)
                }}
                className="w-full rounded-xl bg-red-600 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                Konfirmasi Tolak
              </button>
            </div>
          )}
        </div>

        {/* Bank Card */}
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Data Rekening</h2>
            <StatusBadge status={reseller.bank_status} />
          </div>
          {reseller.bank_account ? (
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Bank</span>
                <span className="font-medium">{reseller.bank_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">No. Rekening</span>
                <span>{reseller.bank_account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Atas Nama</span>
                <span>{reseller.bank_holder}</span>
              </div>
            </div>
          ) : (
            <p className="mb-4 text-sm text-gray-400">Belum ada data rekening</p>
          )}
          <div className="flex gap-2">
            <button
              disabled={actionLoading || reseller.bank_status === 'approved'}
              onClick={() => doUpdate({ bank_status: 'approved' })}
              className="flex-1 rounded-xl bg-green-600 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              Setujui Rekening
            </button>
            <button
              disabled={actionLoading}
              onClick={() => doUpdate({ bank_status: 'rejected' })}
              className="flex-1 rounded-xl bg-red-50 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
            >
              Tolak Rekening
            </button>
          </div>
        </div>

        {/* Activate Button */}
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Status Akun</p>
              <p className="text-xs text-gray-500">
                {reseller.is_active ? 'Akun aktif dan bisa login' : 'Akun belum aktif'}
              </p>
            </div>
            <button
              disabled={actionLoading}
              onClick={() => doUpdate({ is_active: !reseller.is_active })}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                reseller.is_active
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-brand text-white hover:bg-brand-dark'
              }`}
            >
              {reseller.is_active ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          </div>
        </div>

        {/* Commission History */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Riwayat Komisi</h2>
          </div>
          {commissions.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">Belum ada komisi</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {commissions.map(c => (
                <div key={c.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.order_ref}</p>
                    <p className="text-xs text-gray-400">{formatDate(c.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand">{formatRupiah(c.commission_amount)}</p>
                    <span className={`text-xs ${c.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {c.status === 'paid' ? 'Dibayar' : 'Proses'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
