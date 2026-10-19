'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { ChevronRight, Building2 } from 'lucide-react'

interface MitraAccount {
  id: string
  full_name: string
  email: string
  phone: string
  role: string
  bank_name: string | null
  bank_account: string | null
  bank_holder: string | null
  is_active: boolean
  totalCommission: number
  totalOrders: number
}

type Preset = '1d' | '7d' | '30d' | 'month' | 'year' | 'custom'

function getPresetRange(preset: Preset): { from: string; to: string } {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const today = fmt(now)

  if (preset === '1d') return { from: today, to: today }
  if (preset === '7d') {
    const d = new Date(now); d.setDate(d.getDate() - 6)
    return { from: fmt(d), to: today }
  }
  if (preset === '30d') {
    const d = new Date(now); d.setDate(d.getDate() - 29)
    return { from: fmt(d), to: today }
  }
  if (preset === 'month') {
    return { from: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, to: today }
  }
  if (preset === 'year') {
    return { from: `${now.getFullYear()}-01-01`, to: today }
  }
  return { from: today, to: today }
}

const PRESETS: { key: Preset; label: string }[] = [
  { key: '1d', label: 'Hari Ini' },
  { key: '7d', label: '7 Hari' },
  { key: '30d', label: '30 Hari' },
  { key: 'month', label: 'Bulan Ini' },
  { key: 'year', label: 'Tahun Ini' },
  { key: 'custom', label: 'Custom' },
]

export default function AdminAccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<MitraAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [preset, setPreset] = useState<Preset>('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [search, setSearch] = useState('')

  const getRange = useCallback(() => {
    if (preset === 'custom' && customFrom && customTo) {
      return { from: customFrom, to: customTo }
    }
    if (preset !== 'custom') return getPresetRange(preset)
    return getPresetRange('30d')
  }, [preset, customFrom, customTo])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/mitra/login'); return }
      const { data: profile } = await supabase.from('resellers').select('role').eq('user_id', user.id).single()
      if (!profile || profile.role !== 'admin') { router.replace('/mitra/dashboard'); return }

      const { from, to } = getRange()
      const toEnd = to + 'T23:59:59'

      const [{ data: resellers }, { data: commissions }] = await Promise.all([
        supabase.from('resellers').select('id, full_name, email, phone, role, bank_name, bank_account, bank_holder, is_active').order('full_name'),
        supabase.from('commissions').select('reseller_id, commission_amount').gte('created_at', from).lte('created_at', toEnd),
      ])

      const commMap: Record<string, { total: number; count: number }> = {}
      for (const c of commissions ?? []) {
        if (!commMap[c.reseller_id]) commMap[c.reseller_id] = { total: 0, count: 0 }
        commMap[c.reseller_id].total += c.commission_amount
        commMap[c.reseller_id].count += 1
      }

      setAccounts((resellers ?? []).map(r => ({
        ...r,
        totalCommission: commMap[r.id]?.total ?? 0,
        totalOrders: commMap[r.id]?.count ?? 0,
      })))
      setLoading(false)
    }
    load()
  }, [router, getRange])

  const filtered = accounts.filter(a =>
    a.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Akun Mitra</h1>
        <p className="text-sm text-gray-500 mt-0.5">Komisi & statistik per reseller / jastiper</p>
      </div>

      {/* Date filter */}
      <div className="mb-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Periode</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                preset === p.key
                  ? 'bg-brand text-white'
                  : 'bg-[#FFF8F0] text-gray-600 hover:bg-[#f0e8dc]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
      </div>

      {/* List */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Tidak ada mitra ditemukan</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(a => (
              <Link
                key={a.id}
                href={`/mitra/admin/resellers/${a.id}`}
                className="flex items-start justify-between px-4 py-4 hover:bg-[#FFF8F0] transition gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{a.full_name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.role === 'jastiper' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {a.role === 'jastiper' ? 'Jastiper' : 'Reseller'}
                    </span>
                    {!a.is_active && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Inaktif</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{a.email} · {a.phone}</p>

                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Komisi</p>
                      <p className="text-sm font-bold text-brand">{formatPrice(a.totalCommission)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Order</p>
                      <p className="text-sm font-bold text-gray-800">{a.totalOrders}</p>
                    </div>
                  </div>

                  {a.bank_account && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                      <Building2 size={12} className="shrink-0 text-gray-400" />
                      <span>{a.bank_name} · {a.bank_account} a/n {a.bank_holder}</span>
                    </div>
                  )}
                </div>
                <ChevronRight size={16} className="shrink-0 text-gray-400 mt-1" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
