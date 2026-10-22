'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Users, ShieldCheck, Landmark, CheckCircle2 } from 'lucide-react'

interface Stats {
  total: number
  pendingKyc: number
  pendingBank: number
  active: number
}

export default function MitraAdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ total: 0, pendingKyc: 0, pendingBank: 0, active: 0 })
  const [loading, setLoading] = useState(true)

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

      if (!profile || (profile.role !== 'admin' && profile.role !== 'owner')) {
        router.replace('/mitra/dashboard')
        return
      }

      const { data: all } = await supabase.from('resellers').select('kyc_status, bank_status, is_active')

      if (all) {
        setStats({
          total: all.length,
          pendingKyc: all.filter(r => r.kyc_status === 'pending').length,
          pendingBank: all.filter(r => r.bank_status === 'pending' && r.kyc_status === 'approved').length,
          active: all.filter(r => r.is_active).length,
        })
      }
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  const statCards = [
    { label: 'KYC Pending', value: stats.pendingKyc, color: 'text-yellow-600', icon: ShieldCheck, iconWrap: 'bg-yellow-50 text-yellow-600' },
    { label: 'Bank Pending', value: stats.pendingBank, color: 'text-yellow-600', icon: Landmark, iconWrap: 'bg-yellow-50 text-yellow-600' },
    { label: 'Mitra Aktif', value: stats.active, color: 'text-green-600', icon: CheckCircle2, iconWrap: 'bg-green-50 text-green-600' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ringkasan status mitra</p>
      </div>

      {/* Hero metric */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-5 text-white shadow-lg shadow-brand/25">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-8 top-20 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2 text-white/80">
            <Users className="h-4 w-4" />
            <p className="text-xs font-medium">Total Mitra</p>
          </div>
          <p className="mt-1.5 text-4xl font-bold tracking-tight">{stats.total}</p>
          <p className="mt-1 text-xs text-white/60">{stats.active} aktif dari {stats.total} terdaftar</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {statCards.map(s => (
          <div key={s.label} className="rounded-2xl bg-white p-4 shadow-soft border border-[#f0e8dc]">
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${s.iconWrap}`}>
                <s.icon className="h-4 w-4" />
              </span>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
            <p className={`mt-2 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
