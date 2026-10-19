'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function MitraRegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'reseller' | 'jastiper'>('reseller')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Password dan konfirmasi password tidak cocok.')
      return
    }
    if (password.length < 6) {
      alert('Password minimal 6 karakter.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError || !authData.user) {
      alert('Registrasi gagal: ' + (authError?.message ?? 'Unknown error'))
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('resellers').insert({
      user_id: authData.user.id,
      full_name: fullName,
      email,
      phone,
      role,
    })

    if (insertError) {
      alert('Gagal menyimpan data: ' + insertError.message)
      setLoading(false)
      return
    }

    router.replace('/mitra/kyc')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Daftar Mitra</h1>
          <p className="mt-1 text-sm text-gray-500">Bolen Katresna</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-gray-800">Buat Akun Mitra Baru</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Daftar Sebagai</label>
              <div className="grid grid-cols-2 gap-3">
                {(['reseller', 'jastiper'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border-2 p-3 text-left transition ${role === r ? 'border-brand bg-brand-light' : 'border-gray-200 bg-white hover:border-brand/40'}`}
                  >
                    <p className={`text-sm font-bold capitalize ${role === r ? 'text-brand' : 'text-gray-800'}`}>{r}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {r === 'reseller' ? 'Jual produk Katresna' : 'Antar pesanan pelanggan'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Sesuai KTP"
              />
            </div>
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
              <label className="mb-1 block text-sm font-medium text-gray-700">Nomor HP</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="08xxxxxxxxxx"
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
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Konfirmasi Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Ulangi password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Sudah punya akun?{' '}
          <Link href="/mitra/login" className="font-semibold text-brand hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
