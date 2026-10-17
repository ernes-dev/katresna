'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Loader2, Navigation, Pencil, Package, Truck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import { useCartStore } from '@/store/cart'
import { formatPrice, buildWhatsAppMessage, formatWhatsApp } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type ShippingMethod = 'delivery' | 'pickup'

const COURIERS = [
  { id: 'paxel', name: 'Paxel', logo: '/couriers/paxel.webp' },
  { id: 'gosend', name: 'GoSend', logo: '/couriers/gosend.webp' },
  { id: 'grabexpress', name: 'GrabExpress', logo: '/couriers/grabexpress.webp' },
  { id: 'shopee', name: 'Shopee Xpress', logo: '/couriers/shopee.png' },
  { id: 'maxim', name: 'Maxim Delivery', logo: '/couriers/maxim.webp' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartStore()

  const [fullName, setFullName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('delivery')
  const [selectedCourier, setSelectedCourier] = useState('')
  const [pickupEnabled, setPickupEnabled] = useState(false)
  const [storeWhatsapp, setStoreWhatsapp] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (items.length === 0) router.push('/cart')
  }, [items, router])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('store_settings').select('pickup_enabled, whatsapp_number').eq('id', 1).single().then(({ data }) => {
      if (data) {
        setPickupEnabled(data.pickup_enabled)
        const dbWa = (data.whatsapp_number || '').replace(/\D/g, '')
        const wa = dbWa.length >= 9 ? dbWa : (process.env.NEXT_PUBLIC_STORE_WHATSAPP || '')
        setStoreWhatsapp(wa)
      }
    })
  }, [])

  const handleGetLocation = async () => {
    if (!navigator.geolocation) return alert('Browser tidak mendukung GPS')
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(`/api/location?lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          if (data.address) setAddress(data.address)
        } catch {}
        setLocationLoading(false)
      },
      () => {
        alert('Tidak bisa mendapatkan lokasi. Isi alamat secara manual.')
        setLocationLoading(false)
      }
    )
  }

  const handleSubmit = async () => {
    if (!fullName.trim()) return alert('Nama lengkap wajib diisi')
    if (!whatsapp.trim()) return alert('Nomor WhatsApp wajib diisi')
    if (shippingMethod === 'delivery' && !address.trim()) return alert('Alamat wajib diisi')
    if (shippingMethod === 'delivery' && !selectedCourier) return alert('Pilih kurir pengiriman')

    setSubmitting(true)

    const courierLabel = COURIERS.find(c => c.id === selectedCourier)?.name || selectedCourier
    const courierName = shippingMethod === 'pickup' ? 'Ambil Sendiri di Outlet' : `${courierLabel} (ongkir dikonfirmasi admin)`

    const message = buildWhatsAppMessage({
      full_name: fullName,
      whatsapp,
      address: shippingMethod === 'pickup' ? 'Ambil sendiri di outlet' : address,
      items: items.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.product.price })),
      subtotal: totalPrice(),
      shipping_cost: 0,
      courier: courierName,
      shipping_method: shippingMethod,
      notes,
    })

    const waNumber = formatWhatsApp(storeWhatsapp)
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`

    clearCart()
    window.open(waUrl, '_blank')
    router.push('/order/success')
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand text-sm"

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-40">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/cart" className="text-gray-500 hover:text-gray-700 p-1">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Package size={18} className="text-brand" />
            Pesanan ({items.length} item)
          </h2>
          <div className="space-y-2">
            {items.map(i => (
              <div key={i.product.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{i.product.name} x{i.quantity}</span>
                <span className="font-medium">{formatPrice(i.product.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Subtotal</span>
            <span className="text-brand">{formatPrice(totalPrice())}</span>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Data Penerima</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap *</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WhatsApp *</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Shipping method */}
        {pickupEnabled && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <h2 className="font-bold text-gray-900 mb-3">Metode Pengiriman</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShippingMethod('delivery')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                  shippingMethod === 'delivery' ? 'border-brand bg-brand-light' : 'border-gray-200'
                }`}
              >
                <Truck size={24} className={shippingMethod === 'delivery' ? 'text-brand' : 'text-gray-400'} />
                <span className={`text-sm font-semibold ${shippingMethod === 'delivery' ? 'text-brand' : 'text-gray-600'}`}>
                  Dikirim
                </span>
              </button>
              <button
                onClick={() => setShippingMethod('pickup')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                  shippingMethod === 'pickup' ? 'border-brand bg-brand-light' : 'border-gray-200'
                }`}
              >
                <MapPin size={24} className={shippingMethod === 'pickup' ? 'text-brand' : 'text-gray-400'} />
                <span className={`text-sm font-semibold ${shippingMethod === 'pickup' ? 'text-brand' : 'text-gray-600'}`}>
                  Ambil di Outlet
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Courier selection */}
        {shippingMethod === 'delivery' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Truck size={18} className="text-brand" />
              Pilih Kurir
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {COURIERS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourier(c.id)}
                  className={`relative flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 transition ${
                    selectedCourier === c.id
                      ? 'border-brand bg-brand-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="relative w-full h-10">
                    <Image
                      src={c.logo}
                      alt={c.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Ongkir akan dikonfirmasi admin via WhatsApp sesuai kurir yang dipilih.
            </p>
          </div>
        )}

        {/* Address */}
        {shippingMethod === 'delivery' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={18} className="text-brand" />
                Alamat Pengiriman
              </h2>
              <button
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="flex items-center gap-1.5 text-brand text-sm font-semibold hover:text-brand-dark transition"
              >
                {locationLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Navigation size={14} />
                )}
                {locationLoading ? 'Mendeteksi...' : 'Gunakan Lokasi Anda'}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap *</label>
                <div className="relative">
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota"
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                  <Pencil size={14} className="absolute top-3 right-3 text-gray-300 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan (opsional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Instruksi khusus, patokan, dll."
                  className={inputClass}
                />
              </div>
            </div>

          </div>
        )}

        {/* Pickup notes */}
        {shippingMethod === 'pickup' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan (opsional)</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Waktu pick up, dll."
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Total & submit */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-4 py-4 z-50">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between font-bold text-base mb-3">
              <span>Total</span>
              <span className="text-brand text-lg">{formatPrice(totalPrice())}</span>
            </div>
            {shippingMethod === 'delivery' && (
              <p className="text-xs text-gray-400 mb-3">+ ongkir dikonfirmasi admin</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-brand text-white py-4 rounded-2xl font-bold text-base hover:bg-brand-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <span>Proses Pesanan Sekarang</span>
              )}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
