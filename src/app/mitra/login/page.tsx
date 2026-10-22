'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, LogIn } from 'lucide-react'

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

    if (reseller.role === 'admin' || reseller.role === 'owner') {
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8F0] px-4 py-12">
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
        </div>

        <div className="rounded-3xl border border-[#f0e8dc] bg-white p-6 shadow-soft">
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold text-gray-900">Masuk ke Akun Mitra</h2>
            <p className="mt-1 text-sm text-gray-400">Selamat datang kembali, silakan masuk</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100"
            >
              {loading ? 'Memproses...' : <>Masuk <LogIn className="h-4 w-4" /></>}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          Belum punya akun?{' '}
          <Link href="/mitra/register" className="font-semibold text-brand hover:underline">
            Daftar Mitra
          </Link>
        </p>
      </div>
    </div>
  )
}
