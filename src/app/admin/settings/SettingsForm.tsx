'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import { StoreSettings } from '@/lib/types'

export default function SettingsForm({ initialData }: { initialData: StoreSettings | null }) {
  const router = useRouter()
  const [storeName, setStoreName] = useState(initialData?.store_name || '')
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp_number || '')
  const [address, setAddress] = useState(initialData?.address || '')
  const [instagram, setInstagram] = useState(initialData?.instagram_url || '')
  const [mapsUrl, setMapsUrl] = useState(initialData?.maps_url || '')
  const [districtId, setDistrictId] = useState(initialData?.origin_district_id || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from('store_settings').update({
      store_name: storeName,
      whatsapp_number: whatsapp,
      address,
      instagram_url: instagram || null,
      maps_url: mapsUrl || null,
      origin_district_id: districtId,
    }).eq('id', 1)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand text-sm"

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Toko</label>
        <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WhatsApp Toko</label>
        <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="628xxxxxxxxxx" className={inputClass} />
        <p className="text-xs text-gray-400 mt-1">Format internasional, contoh: 6281234567890</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
        <input type="url" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://www.instagram.com/bolenkatresna/" className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Link Google Maps</label>
        <input type="url" value={mapsUrl} onChange={e => setMapsUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..." className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Toko</label>
        <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Kecamatan Asal (api.co.id)</label>
        <input type="text" value={districtId} onChange={e => setDistrictId(e.target.value)} placeholder="contoh: 327319" className={inputClass} />
        <p className="text-xs text-gray-400 mt-1">
          Kecamatan Banceuy/Sumur Bandung: <span className="font-mono">327319</span>
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : saved ? (
          <><Check size={18} /> Tersimpan!</>
        ) : (
          'Simpan Pengaturan'
        )}
      </button>
    </form>
  )
}
