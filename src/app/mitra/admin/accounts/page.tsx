'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Building2, Users, TrendingUp, Search, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

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
  pendingCommission: number
  paidCommission: number
}

const ROLE_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  owner:     { label: 'Owner',     bg: 'bg-amber-100',  text: 'text-amber-700' },
  admin:     { label: 'Admin',     bg: 'bg-red-100',    text: 'text-red-700' },
  reseller:  { label: 'Reseller',  bg: 'bg-purple-100', text: 'text-purple-700' },
  jastiper:  { label: 'Jastiper',  bg: 'bg-blue-100',   text: 'text-blue-700' },
}

const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const DAYS_ID = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

function pad(n: number) { return String(n).padStart(2, '0') }
function fmt(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function today() { return fmt(new Date()) }

const PRESETS = [
  { label: 'Hari Ini',  range: () => { const t = today(); return { from: t, to: t } } },
  { label: '7 Hari',    range: () => { const d = new Date(); d.setDate(d.getDate()-6); return { from: fmt(d), to: today() } } },
  { label: '30 Hari',   range: () => { const d = new Date(); d.setDate(d.getDate()-29); return { from: fmt(d), to: today() } } },
  { label: 'Bulan Ini', range: () => { const n = new Date(); return { from: `${n.getFullYear()}-${pad(n.getMonth()+1)}-01`, to: today() } } },
  { label: 'Tahun Ini', range: () => { return { from: `${new Date().getFullYear()}-01-01`, to: today() } } },
]

function formatDisplayRange(from: string, to: string) {
  if (!from || !to) return 'Pilih Periode'
  const f = new Date(from), t = new Date(to)
  const df = `${f.getDate()} ${MONTHS_ID[f.getMonth()].slice(0,3)} ${f.getFullYear()}`
  const dt = `${t.getDate()} ${MONTHS_ID[t.getMonth()].slice(0,3)} ${t.getFullYear()}`
  return from === to ? df : `${df} – ${dt}`
}

interface CalendarPickerProps {
  from: string
  to: string
  onChange: (from: string, to: string) => void
  onClose: () => void
}
function CalendarPicker({ from, to, onChange, onClose }: CalendarPickerProps) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(from ? new Date(from).getFullYear() : now.getFullYear())
  const [viewMonth, setViewMonth] = useState(from ? new Date(from).getMonth() : now.getMonth())
  const [picking, setPicking] = useState<'from' | 'to'>('from')
  const [tempFrom, setTempFrom] = useState(from)
  const [tempTo, setTempTo] = useState(to)

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1) } else setViewMonth(m => m-1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1) } else setViewMonth(m => m+1) }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const clickDay = (day: number) => {
    const d = `${viewYear}-${pad(viewMonth+1)}-${pad(day)}`
    if (picking === 'from') {
      setTempFrom(d); setTempTo(''); setPicking('to')
    } else {
      if (d < tempFrom) { setTempFrom(d); setTempTo(tempFrom) }
      else { setTempTo(d) }
      setPicking('from')
    }
  }

  const apply = () => {
    if (tempFrom && tempTo) onChange(tempFrom, tempTo)
    onClose()
  }

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i+1)]

  return (
    <div className="p-4 w-[300px]">
      {/* Presets */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => { const r = p.range(); setTempFrom(r.from); setTempTo(r.to); onChange(r.from, r.to); onClose() }}
            className="rounded-full px-3 py-1 text-xs font-semibold bg-[#FFF8F0] text-gray-600 hover:bg-[#f0e8dc] transition border border-[#f0e8dc]"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[#f0e8dc] transition"><ChevronLeft size={15} /></button>
        <span className="text-sm font-semibold text-gray-800">{MONTHS_ID[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[#f0e8dc] transition"><ChevronRight size={15} /></button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_ID.map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>)}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const d = `${viewYear}-${pad(viewMonth+1)}-${pad(day)}`
          const isFrom = d === tempFrom
          const isTo = d === tempTo
          const inRange = tempFrom && tempTo && d > tempFrom && d < tempTo
          return (
            <button
              key={i}
              onClick={() => clickDay(day)}
              className={`text-xs py-1.5 rounded-lg font-medium transition ${
                isFrom || isTo ? 'bg-brand text-white' :
                inRange ? 'bg-brand/10 text-brand' :
                'hover:bg-[#f0e8dc] text-gray-700'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Range display */}
      {(tempFrom || tempTo) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <input readOnly value={tempFrom} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-center bg-[#FFF8F0] outline-none" placeholder="Dari" />
          <span>–</span>
          <input readOnly value={tempTo} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-center bg-[#FFF8F0] outline-none" placeholder="Sampai" />
        </div>
      )}

      {tempFrom && tempTo && (
        <button onClick={apply} className="mt-3 w-full bg-brand text-white text-sm font-semibold py-2 rounded-xl hover:bg-brand-dark transition">
          Terapkan
        </button>
      )}

      <p className="mt-2 text-[10px] text-center text-gray-400">
        {picking === 'from' ? 'Klik tanggal mulai' : 'Klik tanggal akhir'}
      </p>
    </div>
  )
}

export default function AdminAccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<MitraAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [rangeFrom, setRangeFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate()-29); return fmt(d) })
  const [rangeTo, setRangeTo] = useState(today)
  const [calOpen, setCalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const calRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const getRange = useCallback(() => ({ from: rangeFrom, to: rangeTo }), [rangeFrom, rangeTo])

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/mitra/login'); return }
    const { data: profile } = await supabase.from('resellers').select('role').eq('user_id', user.id).single()
    if (!profile || (profile.role !== 'admin' && profile.role !== 'owner')) { router.replace('/mitra/dashboard'); return }

    const { from, to } = getRange()
    const fromStart = from
    const toEnd = to + 'T23:59:59'

    const [{ data: resellers }, { data: commissions }] = await Promise.all([
      supabase.from('resellers').select('id, full_name, email, phone, role, bank_name, bank_account, bank_holder, is_active').order('full_name'),
      supabase.from('commissions').select('reseller_id, commission_amount, status, created_at'),
    ])

    const commMap: Record<string, { total: number; count: number; pending: number; paid: number }> = {}
    for (const c of commissions ?? []) {
      if (!commMap[c.reseller_id]) commMap[c.reseller_id] = { total: 0, count: 0, pending: 0, paid: 0 }
      const m = commMap[c.reseller_id]
      // Period stats (within selected date range)
      if (c.created_at >= fromStart && c.created_at <= toEnd) {
        m.total += c.commission_amount
        m.count += 1
      }
      // Payout balance (all-time)
      if (c.status === 'paid') m.paid += c.commission_amount
      else m.pending += c.commission_amount
    }

    setAccounts((resellers ?? []).map((r: any) => ({
      ...r,
      totalCommission: commMap[r.id]?.total ?? 0,
      totalOrders: commMap[r.id]?.count ?? 0,
      pendingCommission: commMap[r.id]?.pending ?? 0,
      paidCommission: commMap[r.id]?.paid ?? 0,
    })))
    setLoading(false)
  }, [router, getRange])

  useEffect(() => { load() }, [load])

  const markPaid = async (resellerId: string, resellerName: string, amount: number) => {
    if (amount <= 0) return
    if (!confirm(`Tandai komisi ${resellerName} sebesar ${formatPrice(amount)} sebagai sudah dibayar?`)) return
    const supabase = createClient()
    const { error } = await supabase
      .from('commissions')
      .update({ status: 'paid' })
      .eq('reseller_id', resellerId)
      .eq('status', 'pending')
    if (error) { alert('Gagal: ' + error.message); return }
    await load()
  }

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
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Akun Mitra</h1>
        <p className="text-sm text-gray-500 mt-0.5">Komisi & statistik per reseller / jastiper</p>
      </div>

      {/* Date filter */}
      <div className="mb-4 relative" ref={calRef}>
        <button
          onClick={() => setCalOpen(v => !v)}
          className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-2.5 shadow-sm hover:border-brand/30 transition w-full sm:w-auto"
        >
          <Calendar size={15} className="text-brand shrink-0" />
          <span className="text-sm font-medium text-gray-700">{formatDisplayRange(rangeFrom, rangeTo)}</span>
          <ChevronRight size={14} className={`text-gray-400 ml-auto transition-transform ${calOpen ? 'rotate-90' : ''}`} />
        </button>
        {calOpen && (
          <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            <CalendarPicker
              from={rangeFrom}
              to={rangeTo}
              onChange={(f, t) => { setRangeFrom(f); setRangeTo(t) }}
              onClose={() => setCalOpen(false)}
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
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm py-16 text-center text-sm text-gray-400">
          Tidak ada mitra ditemukan
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const roleInfo = ROLE_STYLE[a.role] ?? ROLE_STYLE.reseller
            const isMitra = a.role !== 'admin' && a.role !== 'owner'
            return (
              <div key={a.id} className="rounded-2xl bg-white border border-[#f0e8dc] shadow-sm p-4">
                {/* Header */}
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="font-bold text-gray-900">{a.full_name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${roleInfo.bg} ${roleInfo.text}`}>
                    {roleInfo.label}
                  </span>
                  {!a.is_active && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-400 font-medium">Inaktif</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{a.email}{a.phone ? ` · ${a.phone}` : ''}</p>

                {isMitra && (
                  <>
                    {/* Period stats */}
                    <div className="flex gap-8 mt-3 pt-3 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Komisi Periode</p>
                        <p className="text-sm font-bold text-brand">{formatPrice(a.totalCommission)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Order</p>
                        <p className="text-sm font-bold text-gray-800">{a.totalOrders}</p>
                      </div>
                    </div>

                    {/* Payout balance */}
                    {(a.pendingCommission > 0 || a.paidCommission > 0) && (
                      <div className="flex items-center justify-between gap-3 bg-[#FFF8F0] rounded-xl px-3.5 py-3 mt-3">
                        <div className="flex gap-6">
                          <div>
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">Belum Dibayar</p>
                            <p className="text-sm font-bold text-amber-600">{formatPrice(a.pendingCommission)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-0.5">Sudah Dibayar</p>
                            <p className="text-sm font-bold text-green-600">{formatPrice(a.paidCommission)}</p>
                          </div>
                        </div>
                        {a.pendingCommission > 0 && (
                          <button
                            onClick={() => markPaid(a.id, a.full_name, a.pendingCommission)}
                            className="shrink-0 rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-dark active:scale-[0.98] transition shadow-sm shadow-brand/20"
                          >
                            Tandai Lunas
                          </button>
                        )}
                      </div>
                    )}

                    {/* Bank */}
                    <div className="mt-3">
                      {a.bank_account ? (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Building2 size={13} className="shrink-0 text-gray-400" />
                          <span>
                            <span className="font-medium text-gray-600">{a.bank_name}</span>
                            {' '}· {a.bank_account}
                            {a.bank_holder ? ` · a/n ${a.bank_holder}` : ''}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-300 italic">Belum ada info bank</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
