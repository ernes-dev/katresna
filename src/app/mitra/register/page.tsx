'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { makeRefCode } from '@/lib/mitra'
import { Store, Bike, UserPlus, Check } from 'lucide-react'

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
      ref_code: makeRefCode(fullName),
    })

    if (insertError) {
      alert('Gagal menyimpan data: ' + insertError.message)
      setLoading(false)
      return
    }

    router.replace('/mitra/kyc')
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
            <h2 className="font-display text-xl font-semibold text-gray-900">Buat Akun Mitra Baru</h2>
            <p className="mt-1 text-sm text-gray-400">Bergabung dan mulai dapatkan komisi</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Daftar Sebagai</label>
              <div className="grid grid-cols-2 gap-3">
                {(['reseller', 'jastiper'] as const).map(r => {
                  const selected = role === r
                  const Icon = r === 'reseller' ? Store : Bike
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`relative rounded-2xl border-2 p-3.5 text-left transition active:scale-[0.98] ${selected ? 'border-brand bg-brand-light shadow-sm shadow-brand/10' : 'border-gray-200 bg-white hover:border-brand/40'}`}
                    >
                      {selected && (
                        <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                      )}
                      <span className={`mb-2 inline-flex rounded-xl p-2 transition ${selected ? 'bg-brand text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className={`text-sm font-bold capitalize ${selected ? 'text-brand' : 'text-gray-800'}`}>{r}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {r === 'reseller' ? 'Jual produk Katresna' : 'Antar pesanan pelanggan'}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Sesuai KTP"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="email@contoh.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nomor HP</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Konfirmasi Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Ulangi password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100"
            >
              {loading ? 'Mendaftarkan...' : <>Daftar Sekarang <UserPlus className="h-4 w-4" /></>}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          Sudah punya akun?{' '}
          <Link href="/mitra/login" className="font-semibold text-brand hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
