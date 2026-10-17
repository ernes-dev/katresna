import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-xs">
        <div className="bg-brand/10 rounded-full w-28 h-28 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={64} className="text-brand" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Terkirim!</h1>
        <p className="text-gray-500 text-sm mb-2 leading-relaxed">
          Pesananmu sudah dikirim ke WhatsApp Bolen Katresna. Tunggu konfirmasi ya!
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Jika WhatsApp tidak terbuka otomatis, hubungi kami langsung di WhatsApp.
        </p>
        <Link
          href="/"
          className="bg-brand text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-dark transition inline-block"
        >
          Kembali ke Menu
        </Link>
      </div>
    </div>
  )
}
