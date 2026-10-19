'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Building2, Users, TrendingUp, Search } from 'lucide-react'

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

const ROLE_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  admin:     { label: 'Admin',     bg: 'bg-red-100',    text: 'text-red-700' },
  reseller:  { label: 'Reseller',  bg: 'bg-purple-100', text: 'text-purple-700' },
  jastiper:  { label: 'Jastiper',  bg: 'bg-blue-100',   text: 'text-blue-700' },
}

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

  const totalComm = filtered.reduce((s, a) => s + a.totalCommission, 0)
  const totalOrders = filtered.reduce((s, a) => s + a.totalOrders, 0)

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Akun Mitra</h1>
        <p className="text-sm text-gray-500 mt-0.5">Komisi & statistik per reseller / jastiper</p>
      </div>

      {/* Date filter */}
      <div className="mb-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Periode</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                preset === p.key
                  ? 'bg-brand text-white shadow-sm'
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
            <span className="text-gray-400 text-sm font-medium">–</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-brand" />
            <p className="text-xs text-gray-500">Total Komisi</p>
          </div>
          <p className="text-lg font-bold text-brand">{formatPrice(totalComm)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-gray-400" />
            <p className="text-xs text-gray-500">Total Order</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{totalOrders}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
      </div>

      {/* List */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">Tidak ada mitra ditemukan</div>
        ) : (
          <div className="divide-y divide-[#fdf4ec]">
            {filtered.map(a => {
              const roleInfo = ROLE_STYLE[a.role] ?? ROLE_STYLE.reseller
              return (
                <div key={a.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{a.full_name}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${roleInfo.bg} ${roleInfo.text}`}>
                          {roleInfo.label}
                        </span>
                        {!a.is_active && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400 font-medium">Inaktif</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{a.email}{a.phone ? ` · ${a.phone}` : ''}</p>
                    </div>
                  </div>

                  <div className="flex gap-6 mb-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Komisi</p>
                      <p className="text-sm font-bold text-brand">{formatPrice(a.totalCommission)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Order</p>
                      <p className="text-sm font-bold text-gray-800">{a.totalOrders}</p>
                    </div>
                  </div>

                  {a.bank_account ? (
                    <div className="flex items-center gap-2 bg-[#FFF8F0] rounded-xl px-3 py-2">
                      <Building2 size={13} className="shrink-0 text-gray-400" />
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">{a.bank_name}</span>
                        {' '}· {a.bank_account}
                        {a.bank_holder ? ` · a/n ${a.bank_holder}` : ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-300 italic">Belum ada info bank</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
