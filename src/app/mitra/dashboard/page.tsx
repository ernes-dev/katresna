'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getCommissionTier, getCommissionTiers, calculateCommission, type CommissionTier, type Commission, type ResellerProfile } from '@/lib/mitra'
import { LogOut, TrendingUp, Package, Clock } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  const approvedCommissions = commissions.filter(c => c.status !== 'pending')
  const totalSales = approvedCommissions.length
  const totalEarned = approvedCommissions.reduce((s, c) => s + c.commission_amount, 0)
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
          height={32}
          width={0}
          className="h-8 w-auto"
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

        {/* Welcome */}
        <div>
          <p className="text-xs text-gray-400">Selamat datang,</p>
          <div className="mt-0.5 flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{reseller?.full_name}</h1>
            <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs capitalize text-brand">
              {reseller?.role ?? 'mitra'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-lg bg-brand/10 p-1.5">
                <TrendingUp className="h-4 w-4 text-brand" />
              </span>
              <p className="text-xs text-gray-500">Total Komisi</p>
            </div>
            <p className="text-lg font-bold text-brand">{formatRupiah(totalEarned)}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-lg bg-gray-100 p-1.5">
                <Package className="h-4 w-4 text-gray-500" />
              </span>
              <p className="text-xs text-gray-500">Total Order</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{totalSales}</p>
          </div>
        </div>

        {/* Tier Card */}
        {currentTier && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Tier Saat Ini</p>
                <p className="font-semibold text-gray-900">{currentTier.label}</p>
              </div>
              <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
                {currentTier.type === 'percent' ? `${currentTier.value}%` : formatRupiah(currentTier.value)}
              </span>
            </div>
            {nextTier && (
              <>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {totalSales} dari {nextTier.min_sales} order untuk tier berikutnya: <strong>{nextTier.label}</strong>
                </p>
              </>
            )}
            {!nextTier && (
              <p className="text-xs text-gray-500">Anda berada di tier tertinggi!</p>
            )}
          </div>
        )}

        {/* Commission History */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <Clock className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Riwayat Komisi</h2>
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
                    <p className="truncate text-sm font-medium text-gray-800">{c.order_ref}</p>
                    <p className="text-xs text-gray-400">{formatDate(c.created_at)}</p>
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
