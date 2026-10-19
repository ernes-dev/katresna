'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Send, Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface InvoiceItem {
  name: string
  qty: number
  price: number
}

function formatWA(num: string) {
  const d = num.replace(/\D/g, '')
  if (d.startsWith('0')) return '62' + d.slice(1)
  if (d.startsWith('62')) return d
  return '62' + d
}

export default function InvoicePage() {
  const [customerName, setCustomerName] = useState('')
  const [customerWA, setCustomerWA] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([{ name: '', qty: 1, price: 0 }])
  const [shippingCost, setShippingCost] = useState(0)
  const [notes, setNotes] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    createClient().from('products').select('*').eq('is_available', true).order('name')
      .then(({ data }) => setProducts(data || []))
  }, [])

  const addItem = () => setItems(prev => [...prev, { name: '', qty: 1, price: 0 }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof InvoiceItem, value: string | number) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const total = subtotal + shippingCost

  const buildMessage = () => {
    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const itemLines = items
      .filter(i => i.name.trim())
      .map(i => `• ${i.name} x${i.qty} — ${formatPrice(i.price * i.qty)}`)
      .join('\n')

    return `*INVOICE BOLEN KATRESNA*
━━━━━━━━━━━━━━
Pelanggan: ${customerName}
Tanggal: ${date}
━━━━━━━━━━━━━━
*PESANAN:*
${itemLines}
━━━━━━━━━━━━━━
Subtotal: ${formatPrice(subtotal)}${shippingCost > 0 ? `\nOngkir: ${formatPrice(shippingCost)}` : ''}
*TOTAL: ${formatPrice(total)}*
━━━━━━━━━━━━━━${notes ? `\nCatatan: ${notes}\n━━━━━━━━━━━━━━` : ''}
Mohon lakukan pembayaran sesuai total di atas.
Terima kasih telah memesan Bolen Katresna! 🎉`
  }

  const handleSend = () => {
    if (!customerWA.trim()) return alert('Isi nomor WA pelanggan')
    const wa = formatWA(customerWA)
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(buildMessage())}`, '_blank')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildMessage())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand text-sm"

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Buat Invoice</h1>

      <div className="space-y-4">
        {/* Customer info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-800">Data Pelanggan</h2>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nama Pelanggan</label>
            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
              placeholder="Nama lengkap" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nomor WhatsApp</label>
            <input type="tel" value={customerWA} onChange={e => setCustomerWA(e.target.value)}
              placeholder="08xxxxxxxxxx" className={inputClass} />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Item Pesanan</h2>
            <button onClick={addItem} className="flex items-center gap-1 text-sm text-brand font-semibold">
              <Plus size={14} /> Tambah
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1.5">
                  <select
                    className={`${inputClass} bg-white`}
                    value=""
                    onChange={e => {
                      const p = products.find(p => p.id === e.target.value)
                      if (p) updateItem(i, 'name', p.name)
                      if (p) updateItem(i, 'price', p.price)
                    }}
                  >
                    <option value="">Pilih produk...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — {formatPrice(p.price)}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={item.name}
                    onChange={e => updateItem(i, 'name', e.target.value)}
                    placeholder="Nama item (bisa edit manual)"
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <input type="number" value={item.qty} min={1}
                      onChange={e => updateItem(i, 'qty', Number(e.target.value))}
                      className={`${inputClass} w-20`} placeholder="Qty" />
                    <input type="number" value={item.price || ''} min={0}
                      onChange={e => updateItem(i, 'price', Number(e.target.value))}
                      className={`${inputClass} flex-1`} placeholder="Harga satuan" />
                    <span className="text-xs text-gray-400 self-center whitespace-nowrap">
                      = {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                </div>
                {items.length > 1 && (
                  <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 mt-1 flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shipping + notes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ongkos Kirim (Rp)</label>
            <input type="number" value={shippingCost || ''} min={0}
              onChange={e => setShippingCost(Number(e.target.value))}
              placeholder="0" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Catatan (opsional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Instruksi khusus..." className={inputClass} />
          </div>
        </div>

        {/* Total */}
        <div className="bg-brand-light rounded-2xl p-4 border border-brand/20">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
          </div>
          {shippingCost > 0 && (
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Ongkir</span><span>{formatPrice(shippingCost)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-brand text-base border-t border-brand/20 pt-2 mt-2">
            <span>TOTAL</span><span>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-3 border-2 border-brand text-brand rounded-xl font-semibold text-sm hover:bg-brand-light transition flex-1"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Tersalin!' : 'Salin Teks'}
          </button>
          <button
            onClick={handleSend}
            className="flex items-center gap-2 px-4 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition flex-1 justify-center"
          >
            <Send size={16} />
            Kirim via WhatsApp
          </button>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-2">PREVIEW PESAN</p>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
            {buildMessage()}
          </pre>
        </div>
      </div>
    </div>
  )
}
