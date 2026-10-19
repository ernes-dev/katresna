'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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

      if (!profile || profile.role !== 'admin') {
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

  const statCards = [
    { label: 'Total Mitra', value: stats.total, color: 'text-gray-900' },
    { label: 'KYC Pending', value: stats.pendingKyc, color: 'text-yellow-600' },
    { label: 'Bank Pending', value: stats.pendingBank, color: 'text-yellow-600' },
    { label: 'Mitra Aktif', value: stats.active, color: 'text-green-600' },
  ]

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Dashboard</p>
            <h1 className="text-xl font-bold text-gray-900">Admin Mitra</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Keluar
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {statCards.map(s => (
            <div key={s.label} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <Link
            href="/mitra/admin/resellers"
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition hover:bg-gray-50"
          >
            <div>
              <p className="font-semibold text-gray-900">Kelola Reseller</p>
              <p className="text-xs text-gray-500">Lihat, setujui, dan kelola mitra</p>
            </div>
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/mitra/admin/commission"
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition hover:bg-gray-50"
          >
            <div>
              <p className="font-semibold text-gray-900">Tier Komisi</p>
              <p className="text-xs text-gray-500">Atur struktur komisi reseller</p>
            </div>
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
