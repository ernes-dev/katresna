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
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Kelola Mitra</h1>
        <p className="text-sm text-gray-500 mt-0.5">Approve dan kelola reseller &amp; jastiper</p>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              tab === t.key
                ? 'bg-brand text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-[#f0e8dc] border border-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">Tidak ada data</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#FFF8F0]">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email / HP</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">KYC</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Bank</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-[#FFF8F0] transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{r.full_name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <p className="text-xs">{r.email}</p>
                      {r.phone && <p className="text-xs text-gray-400">{r.phone}</p>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.kyc_status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.bank_status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge active={r.is_active} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/mitra/admin/resellers/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark transition"
                      >
                        Detail
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
