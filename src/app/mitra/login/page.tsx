'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function MitraLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      alert('Login gagal: ' + (authError?.message ?? 'Unknown error'))
      setLoading(false)
      return
    }

    const { data: reseller, error: resellerError } = await supabase
      .from('resellers')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    if (resellerError || !reseller) {
      router.replace('/mitra/kyc')
      return
    }

    if (reseller.role === 'admin') {
      router.replace('/mitra/admin')
      return
    }

    if (!reseller.kyc_photo_url) {
      router.replace('/mitra/kyc')
      return
    }

    if (!reseller.bank_account) {
      router.replace('/mitra/bank')
      return
    }

    if (!reseller.is_active) {
      router.replace('/mitra/pending')
      return
    }

    router.replace('/mitra/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src="https://lh3.googleusercontent.com/d/1TpFd2rJxeYrmtmyjl6L-6cQrX9sQI1fi"
            alt="Bolen Katresna"
            width={160}
            height={80}
            className="mx-auto mb-4 h-16 w-auto object-contain"
            unoptimized
          />
          <h1 className="text-2xl font-bold text-gray-900">Portal Mitra</h1>
          <p className="mt-1 text-sm text-gray-500">Reseller & Jastiper Bolen Katresna</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-gray-800">Masuk ke Akun Mitra</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="email@contoh.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Belum punya akun?{' '}
          <Link href="/mitra/register" className="font-semibold text-brand hover:underline">
            Daftar Mitra
          </Link>
        </p>
      </div>
    </div>
  )
}
