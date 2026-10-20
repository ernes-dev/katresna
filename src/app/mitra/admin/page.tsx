'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ringkasan status mitra</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map(s => (
          <div key={s.label} className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
