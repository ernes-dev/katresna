'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Store, Package } from 'lucide-react'

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-brand' : 'bg-gray-200'
      }`}
    >
      <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-7' : 'translate-x-0'
      }`} />
    </button>
  )
}

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

  const update = async (field: string, value: boolean) => {
    const supabase = createClient()
    await supabase.from('store_settings').update({ [field]: value }).eq('id', 1)
    router.refresh()
  }

  return (
    <div className="divide-y divide-gray-100">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isOpen ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Store size={18} className={isOpen ? 'text-green-600' : 'text-gray-400'} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Status Toko</p>
            <p className="text-xs text-gray-400 mt-0.5">{isOpen ? 'Toko sedang buka' : 'Toko sedang tutup'}</p>
          </div>
        </div>
        <Toggle
          checked={isOpen}
          onChange={() => { const v = !isOpen; setIsOpen(v); update('is_open', v) }}
        />
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${pickup ? 'bg-brand-light' : 'bg-gray-100'}`}>
            <Package size={18} className={pickup ? 'text-brand' : 'text-gray-400'} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Fitur Pick Up</p>
            <p className="text-xs text-gray-400 mt-0.5">{pickup ? 'Customer bisa ambil sendiri' : 'Tidak tersedia'}</p>
          </div>
        </div>
        <Toggle
          checked={pickup}
          onChange={() => { const v = !pickup; setPickup(v); update('pickup_enabled', v) }}
        />
      </div>
    </div>
  )
}
