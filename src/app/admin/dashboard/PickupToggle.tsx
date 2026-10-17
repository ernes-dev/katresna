'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function PickupToggle({
  initialPickup,
  initialOpen,
}: {
  initialPickup: boolean
  initialOpen: boolean
}) {
  const router = useRouter()
  const [pickup, setPickup] = useState(initialPickup)
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [loading, setLoading] = useState(false)

  const update = async (field: string, value: boolean) => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('store_settings').update({ [field]: value }).eq('id', 1)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={14} className="animate-spin" />
          <span>Menyimpan...</span>
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="font-medium text-gray-900">Status Toko</p>
          <p className="text-sm text-gray-500">Tampilkan toko sebagai buka/tutup ke customer</p>
        </div>
        <button
          onClick={() => { setIsOpen(!isOpen); update('is_open', !isOpen) }}
          className={`relative w-12 h-6 rounded-full transition-colors ${isOpen ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isOpen ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="font-medium text-gray-900">Fitur Pick Up</p>
          <p className="text-sm text-gray-500">Izinkan customer ambil pesanan sendiri di toko</p>
        </div>
        <button
          onClick={() => { setPickup(!pickup); update('pickup_enabled', !pickup) }}
          className={`relative w-12 h-6 rounded-full transition-colors ${pickup ? 'bg-brand' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${pickup ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  )
}
