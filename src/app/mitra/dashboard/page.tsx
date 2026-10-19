'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getCommissionTier, getCommissionTiers, calculateCommission, type CommissionTier, type Commission, type ResellerProfile } from '@/lib/mitra'

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
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Selamat datang,</p>
            <h1 className="text-lg font-bold text-gray-900">{reseller?.full_name}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Keluar
          </button>
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Komisi</p>
            <p className="mt-1 text-lg font-bold text-brand">{formatRupiah(totalEarned)}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Order</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{totalSales}</p>
          </div>
        </div>

        {/* Tier Card */}
        {currentTier && (
          <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
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

        {/* Commission Table */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Riwayat Komisi</h2>
          </div>
          {commissions.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">Belum ada komisi</div>
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
