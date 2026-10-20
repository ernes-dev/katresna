'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getCommissionTier, getCommissionTiers, calculateCommission, ensureRefCode, type CommissionTier, type Commission, type ResellerProfile } from '@/lib/mitra'
import { LogOut, TrendingUp, Package, Clock, Link2, Copy, Check } from 'lucide-react'

const REFERRAL_BASE = 'https://bolenkatresna.com'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function MitraDashboardPage() {
  const router = useRouter()
  const [reseller, setReseller] = useState<ResellerProfile | null>(null)
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [tiers, setTiers] = useState<CommissionTier[]>([])
  const [loading, setLoading] = useState(true)
  const [refCode, setRefCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/mitra/login'); return }

      const { data: profile } = await supabase
        .from('resellers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!profile) { router.replace('/mitra/login'); return }
      if (!profile.is_active) { router.replace('/mitra/pending'); return }

      setReseller(profile as ResellerProfile)

      if (profile.ref_code) {
        setRefCode(profile.ref_code)
      } else {
        const code = await ensureRefCode(profile.id, profile.full_name)
        setRefCode(code)
      }

      const [tiersData, { data: comData }] = await Promise.all([
        getCommissionTiers(),
        supabase
          .from('commissions')
          .select('*')
          .eq('reseller_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ])
      setTiers(tiersData)
      setCommissions((comData ?? []) as Commission[])
      setLoading(false)
    }
    load()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/mitra/login')
  }

  const referralLink = refCode ? `${REFERRAL_BASE}/?ref=${refCode}` : ''
  const copyLink = async () => {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_) {}
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  const totalSales = commissions.length
  const totalEarned = commissions.reduce((s, c) => s + c.commission_amount, 0)
  const paidEarned = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.commission_amount, 0)
  const pendingEarned = totalEarned - paidEarned
  const currentTier = getCommissionTier(totalSales, tiers)
  const nextTier = tiers.find(t => t.min_sales > totalSales) ?? null
  const progressPct = currentTier && nextTier
    ? Math.min(100, ((totalSales - currentTier.min_sales) / (nextTier.min_sales - currentTier.min_sales)) * 100)
    : 100

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#f0e8dc] bg-[#FFF8F0] px-4">
        <Image
          src="https://lh3.googleusercontent.com/d/1TpFd2rJxeYrmtmyjl6L-6cQrX9sQI1fi"
          alt="Katresna"
          height={50}
          width={110}
          className="h-9 w-auto object-contain"
          unoptimized
        />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:text-red-500 hover:border-red-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          Keluar
        </button>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-lg space-y-4 px-4 py-5">

        {/* Hero balance card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-5 text-white shadow-lg shadow-brand/25">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute right-6 top-20 h-24 w-24 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-white/70">Selamat datang,</p>
                <h1 className="font-display text-xl font-semibold leading-tight">{reseller?.full_name}</h1>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold capitalize backdrop-blur-sm">
                {reseller?.role ?? 'mitra'}
              </span>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-1.5 text-white/70">
                <TrendingUp className="h-3.5 w-3.5" />
                <p className="text-xs">Total Komisi</p>
              </div>
              <p className="mt-1 text-3xl font-bold tracking-tight">{formatRupiah(totalEarned)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 backdrop-blur-sm">
                  Dibayar {formatRupiah(paidEarned)}
                </span>
                {pendingEarned > 0 && (
                  <span className="rounded-full bg-amber-300/25 px-2.5 py-0.5 text-amber-50 backdrop-blur-sm">
                    Belum dibayar {formatRupiah(pendingEarned)}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-white/70">
                  <Package className="h-3.5 w-3.5" />
                  <p className="text-[11px]">Total Order</p>
                </div>
                <p className="mt-0.5 text-xl font-bold">{totalSales}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-white/70">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <p className="text-[11px]">Tier Saat Ini</p>
                </div>
                <p className="mt-0.5 text-xl font-bold">{currentTier?.label ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Link */}
        {referralLink && (
          <div className="rounded-3xl border border-[#f0e8dc] bg-white p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="rounded-xl bg-brand-light p-2">
                <Link2 className="h-4 w-4 text-brand" />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900">Link Referral Kamu</p>
                <p className="text-xs text-gray-400">Sebar link ini — order dari link ini masuk ke kamu</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={referralLink}
                onFocus={e => e.target.select()}
                className="flex-1 min-w-0 rounded-xl border border-dashed border-brand/30 bg-brand-light/40 px-3 py-2.5 text-xs font-medium text-brand/90 outline-none"
              />
              <button
                onClick={copyLink}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-dark active:scale-[0.97] shadow-sm shadow-brand/20"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
            </div>
          </div>
        )}

        {/* Tier Card */}
        {currentTier && (
          <div className="rounded-3xl border border-[#f0e8dc] bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Tier Saat Ini</p>
                <p className="font-display text-lg font-semibold text-gray-900">{currentTier.label}</p>
              </div>
              <span className="rounded-full bg-gradient-to-br from-brand to-brand-dark px-3 py-1 text-xs font-bold text-white shadow-sm shadow-brand/20">
                {currentTier.type === 'percent' ? `${currentTier.value}%` : formatRupiah(currentTier.value)}
              </span>
            </div>
            {nextTier && (
              <>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-light">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-500"
                    style={{ width: `${Math.max(progressPct, 4)}%` }}
                  />
                </div>
                <p className="mt-2.5 text-xs text-gray-500">
                  <strong className="text-gray-700">{totalSales}</strong> dari {nextTier.min_sales} order menuju <strong className="text-brand">{nextTier.label}</strong>
                </p>
              </>
            )}
            {!nextTier && (
              <p className="text-xs text-gray-500">🎉 Kamu di tier tertinggi!</p>
            )}
          </div>
        )}

        {/* Commission History */}
        <div className="rounded-3xl border border-[#f0e8dc] bg-white shadow-soft overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-50 px-5 py-4">
            <Clock className="h-4 w-4 text-brand" />
            <h2 className="font-display text-base font-semibold text-gray-900">Riwayat Komisi</h2>
          </div>
          {commissions.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Package className="mb-3 h-10 w-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-400">Belum ada komisi</p>
              <p className="mt-1 text-xs text-gray-300">Order yang kamu referensikan akan muncul di sini</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {commissions.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex-shrink-0 rounded-lg bg-gray-100 p-2">
                    <Package className="h-4 w-4 text-gray-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">Komisi Pesanan</p>
                    <p className="text-xs text-gray-400">{formatDate(c.created_at)} · dari {formatRupiah(c.order_amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand">{formatRupiah(c.commission_amount)}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
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
