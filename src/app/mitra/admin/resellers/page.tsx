'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type TabKey = 'all' | 'pending_kyc' | 'pending_bank' | 'active'

interface ResellerRow {
  id: string
  full_name: string
  email: string
  phone: string
  kyc_status: string
  bank_status: string
  is_active: boolean
  created_at: string
}

function StatusBadge({ status, active }: { status?: string; active?: boolean }) {
  if (active !== undefined) {
    return active ? (
      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Aktif</span>
    ) : (
      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Inaktif</span>
    )
  }
  if (status === 'approved') return <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Disetujui</span>
  if (status === 'rejected') return <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Ditolak</span>
  return <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Pending</span>
}

export default function AdminResellersPage() {
  const router = useRouter()
  const [resellers, setResellers] = useState<ResellerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('all')

  useEffect(() => {
    const load = async () => {
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

      const { data } = await supabase
        .from('resellers')
        .select('id, full_name, email, phone, kyc_status, bank_status, is_active, created_at')
        .order('created_at', { ascending: false })

      setResellers((data ?? []) as ResellerRow[])
      setLoading(false)
    }
    load()
  }, [router])

  const filtered = resellers.filter(r => {
    if (tab === 'pending_kyc') return r.kyc_status === 'pending'
    if (tab === 'pending_bank') return r.bank_status === 'pending' && r.kyc_status === 'approved'
    if (tab === 'active') return r.is_active
    return true
  })

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'pending_kyc', label: 'Pending KYC' },
    { key: 'pending_bank', label: 'Pending Bank' },
    { key: 'active', label: 'Aktif' },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/mitra/admin" className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Kelola Reseller</h1>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                tab === t.key
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-white shadow-sm">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">Tidak ada data</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(r => (
                <Link
                  key={r.id}
                  href={`/mitra/admin/resellers/${r.id}`}
                  className="flex items-center justify-between px-4 py-3 transition hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{r.full_name}</p>
                    <p className="truncate text-xs text-gray-500">{r.email} · {r.phone}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <StatusBadge status={r.kyc_status} />
                      <StatusBadge status={r.bank_status} />
                      <StatusBadge active={r.is_active} />
                    </div>
                  </div>
                  <svg className="ml-3 h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
