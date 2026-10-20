'use client'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const queue = params.get('queue')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] px-4">
      <div className="w-full max-w-sm">
        <div className="relative overflow-hidden rounded-3xl border border-[#f0e8dc] bg-white px-6 py-10 text-center shadow-soft">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-light/70" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-brand-light/50" />
          <div className="relative">
            <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-white shadow-float">
              <CheckCircle2 size={60} strokeWidth={2} />
            </div>
            <h1 className="font-display text-2xl font-semibold text-gray-900 mb-2">Pesanan Terkirim!</h1>

            {queue && Number(queue) > 0 && (
              <div className="my-5 rounded-2xl border border-dashed border-brand/30 bg-brand-light/40 px-6 py-4">
                <p className="text-[11px] font-semibold text-brand/70 uppercase tracking-wide mb-1">Nomor Antrian Hari Ini</p>
                <p className="font-display text-5xl font-bold text-brand">#{queue}</p>
              </div>
            )}

            <p className="text-gray-500 text-sm mb-2 leading-relaxed">
              Pesananmu sudah dikirim ke WhatsApp Bolen Katresna. Tunggu konfirmasi ya!
            </p>
            <p className="text-gray-400 text-xs mb-8">
              Jika WhatsApp tidak terbuka otomatis, hubungi kami langsung di WhatsApp.
            </p>
            <Link
              href="/"
              className="inline-block rounded-xl bg-brand px-8 py-3 font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark active:scale-[0.97]"
            >
              Kembali ke Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">Memuat...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
