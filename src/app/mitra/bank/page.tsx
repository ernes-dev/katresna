'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const BANK_OPTIONS = [
  'BCA', 'BRI', 'BNI', 'Mandiri', 'BSI',
  'DANA', 'GoPay', 'OVO', 'SeaBank', 'Lainnya',
]

export default function MitraBankPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [bankName, setBankName] = useState(BANK_OPTIONS[0])
  const [bankAccount, setBankAccount] = useState('')
  const [bankHolder, setBankHolder] = useState('')
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/mitra/login')
        return
      }

      const { data: reseller } = await supabase
        .from('resellers')
        .select('kyc_photo_url, full_name')
        .eq('user_id', user.id)
        .single()

      if (!reseller?.kyc_photo_url) {
        router.replace('/mitra/kyc')
        return
      }

      // Pre-fill holder name from reseller profile
      if (reseller.full_name) {
        setBankHolder(reseller.full_name)
      }

      setUserId(user.id)
      setAuthLoading(false)
    }
    check()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('resellers')
      .update({
        bank_name: bankName,
        bank_account: bankAccount,
        bank_holder: bankHolder,
        bank_status: 'pending',
        is_active: false,
      })
      .eq('user_id', userId)

    if (error) {
      alert('Gagal menyimpan data rekening: ' + error.message)
      setLoading(false)
      return
    }

    router.replace('/mitra/pending')
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Data Rekening</h1>
          <p className="mt-1 text-sm text-gray-500">Langkah 2 dari 2</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 rounded-xl bg-brand-light p-4">
            <p className="text-xs text-brand">
              Nama pemilik rekening harus sesuai dengan nama yang tertera di KTP.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nama Bank / E-Wallet</label>
              <select
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              >
                {BANK_OPTIONS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nomor Rekening / Nomor HP</label>
              <input
                type="text"
                required
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Nomor rekening atau nomor HP"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nama Pemilik Rekening</label>
              <input
                type="text"
                required
                value={bankHolder}
                onChange={e => setBankHolder(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Harus sesuai KTP"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? 'Menyimpan...' : 'Kirim Pendaftaran'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
