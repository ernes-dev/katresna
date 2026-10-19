'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Send, Copy, Check, Search, X } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

function ProductPickerModal({ products, onSelect, onClose }: {
  products: Product[]
  onSelect: (p: Product) => void
  onClose: () => void
}) {
  const [q, setQ] = useState('')
  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl max-h-[80vh] flex flex-col max-w-lg mx-auto">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input autoFocus type="text" value={q} onChange={e => setQ(e.target.value)}
            placeholder="Cari produk..." className="flex-1 outline-none text-sm" />
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="overflow-y-auto p-3">
          {filtered.length === 0
            ? <p className="text-center text-sm text-gray-400 py-8">Produk tidak ditemukan</p>
            : (() => {
                const groups: { label: string; items: Product[] }[] = []
                filtered.forEach(p => {
                  const cat = (p as any).category?.name || 'Lainnya'
                  const g = groups.find(g => g.label === cat)
                  if (g) g.items.push(p)
                  else groups.push({ label: cat, items: [p] })
                })
                return groups.map(g => (
                  <div key={g.label} className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">{g.label}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {g.items.map(p => (
                        <button key={p.id} onClick={() => { onSelect(p); onClose() }}
                          className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-brand-light transition border border-transparent hover:border-brand/20">
                          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-1.5">
                            {p.image_url
                              ? <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-2xl">🍱</div>
                            }
                          </div>
                          <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">{p.name}</p>
                          <p className="text-xs text-brand font-bold mt-0.5">{formatPrice(p.price)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              })()
          }
        </div>
      </div>
    </>
  )
}

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

function genInvoiceNumber(isPO: boolean) {
  const now = new Date()
  const d = now.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' }).split('/').reverse().join('')
  const t = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace(':', '')
  return `${isPO ? 'PO' : 'INV'}-${d}-${t}`
}

export default function InvoicePage() {
  const [customerName, setCustomerName] = useState('')
  const [customerWA, setCustomerWA] = useState('')
  const [resellerName, setResellerName] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([{ name: '', qty: 1, price: 0 }])
  const [shippingCost, setShippingCost] = useState(0)
  const [notes, setNotes] = useState('')
  const [isPO, setIsPO] = useState(false)
  const [cashbackType, setCashbackType] = useState<'none' | 'percent' | 'fixed'>('none')
  const [cashbackValue, setCashbackValue] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [copied, setCopied] = useState(false)
  const [pickerOpenFor, setPickerOpenFor] = useState<number | null>(null)
  const [invoiceNumber] = useState(() => genInvoiceNumber(false))

  const CATEGORY_ORDER = ['box', 'bolen', 'promo', 'beverages']

  useEffect(() => {
    createClient().from('products').select('*, category:categories(*)').eq('is_available', true)
      .then(({ data }) => {
        const sorted = (data || []).sort((a: any, b: any) => {
          const ai = CATEGORY_ORDER.indexOf(a.category?.name?.toLowerCase() || '')
          const bi = CATEGORY_ORDER.indexOf(b.category?.name?.toLowerCase() || '')
          const av = ai === -1 ? 99 : ai
          const bv = bi === -1 ? 99 : bi
          if (av !== bv) return av - bv
          return a.name.localeCompare(b.name)
        })
        setProducts(sorted)
      })
  }, [])

  const addItem = () => setItems(prev => [...prev, { name: '', qty: 1, price: 0 }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof InvoiceItem, value: string | number) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const cashbackAmount = cashbackType === 'percent'
    ? Math.round(subtotal * cashbackValue / 100)
    : cashbackType === 'fixed' ? cashbackValue : 0
  const total = subtotal + shippingCost - cashbackAmount

  const displayInvoiceNumber = isPO
    ? invoiceNumber.replace('INV-', 'PO-')
    : invoiceNumber

  const buildMessage = () => {
    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const itemLines = items
      .filter(i => i.name.trim())
      .map(i => `• ${i.name} x${i.qty} — ${formatPrice(i.price * i.qty)}`)
      .join('\n')

    const header = isPO ? '*PURCHASE ORDER BOLEN KATRESNA*' : '*INVOICE BOLEN KATRESNA*'
    const recipientLabel = isPO ? 'Reseller/Jastiper' : 'Pelanggan'
    const recipientName = isPO && resellerName ? resellerName : customerName

    return `${header}
━━━━━━━━━━━━━━
No: ${displayInvoiceNumber}
${recipientLabel}: ${recipientName}${customerName && isPO && resellerName ? `\nNama Penerima: ${customerName}` : ''}
Tanggal: ${date}
━━━━━━━━━━━━━━
*PESANAN:*
${itemLines}
━━━━━━━━━━━━━━
Subtotal: ${formatPrice(subtotal)}${shippingCost > 0 ? `\nOngkir: ${formatPrice(shippingCost)}` : ''}${cashbackAmount > 0 ? `\nCashback${cashbackType === 'percent' ? ` (${cashbackValue}%)` : ''}: -${formatPrice(cashbackAmount)}` : ''}
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
      <h1 className="text-xl font-bold text-gray-900 mb-6">Buat Invoice / PO</h1>

      <div className="space-y-4">
        {/* PO toggle + Invoice number */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-800 text-sm">Mode Purchase Order (PO)</p>
            <p className="text-xs text-gray-400 mt-0.5">Untuk reseller / jastiper partai besar</p>
          </div>
          <button
            onClick={() => setIsPO(v => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isPO ? 'bg-brand' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPO ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-semibold">Nomor {isPO ? 'PO' : 'Invoice'}</span>
          <span className="text-sm font-mono font-bold text-gray-700">{displayInvoiceNumber}</span>
        </div>

        {/* Customer / Reseller info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-800">{isPO ? 'Data Reseller / Jastiper' : 'Data Pelanggan'}</h2>

          {isPO && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nama Reseller / Jastiper *</label>
              <input type="text" value={resellerName} onChange={e => setResellerName(e.target.value)}
                placeholder="Nama reseller atau jastiper" className={inputClass} />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-600 mb-1">{isPO ? 'Nama Penerima (opsional)' : 'Nama Pelanggan'}</label>
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

          {/* Header row */}
          <div className="grid grid-cols-[1fr_48px_100px_auto] gap-2 px-1 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            <span>Produk</span><span className="text-center">Qty</span><span>Harga</span><span />
          </div>

          <div className="space-y-2">
            {items.map((item, i) => {
              const matched = products.find(p => p.name === item.name)
              return (
                <div key={i} className="grid grid-cols-[1fr_48px_100px_auto] gap-2 items-center">
                  {/* Name + picker */}
                  <button
                    type="button"
                    onClick={() => setPickerOpenFor(i)}
                    className="flex items-center gap-2 text-left bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 hover:border-brand/40 hover:bg-brand-light/30 transition min-w-0"
                  >
                    {matched?.image_url && (
                      <div className="relative w-7 h-7 rounded-md overflow-hidden flex-shrink-0">
                        <Image src={matched.image_url} alt={item.name} fill className="object-cover" />
                      </div>
                    )}
                    {item.name
                      ? <span className="text-sm font-medium text-gray-800 truncate flex-1">{item.name}</span>
                      : <span className="text-sm text-gray-400 flex items-center gap-1.5 flex-1"><Search size={13} /> Pilih produk...</span>
                    }
                  </button>

                  {/* Qty */}
                  <input type="number" value={item.qty} min={1}
                    onChange={e => updateItem(i, 'qty', Number(e.target.value))}
                    className="border border-gray-200 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand w-full" />

                  {/* Price */}
                  <div className="relative">
                    <input type="number" value={item.price || ''} min={0}
                      onChange={e => updateItem(i, 'price', Number(e.target.value))}
                      placeholder="0"
                      className="border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand w-full" />
                  </div>

                  {/* Delete */}
                  {items.length > 1
                    ? <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
                    : <span className="w-7" />
                  }
                </div>
              )
            })}
          </div>

          {/* Subtotal per row hint */}
          {items.some(i => i.price > 0) && (
            <div className="mt-2 space-y-1">
              {items.filter(i => i.name && i.price > 0).map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-400 px-1">
                  <span className="truncate max-w-[200px]">{item.name} ×{item.qty}</span>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
          )}

          {pickerOpenFor !== null && (
            <ProductPickerModal
              products={products}
              onSelect={p => { updateItem(pickerOpenFor, 'name', p.name); updateItem(pickerOpenFor, 'price', p.price) }}
              onClose={() => setPickerOpenFor(null)}
            />
          )}
        </div>

        {/* Shipping + notes + cashback */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ongkos Kirim (Rp)</label>
            <input type="number" value={shippingCost || ''} min={0}
              onChange={e => setShippingCost(Number(e.target.value))}
              placeholder="0" className={inputClass} />
          </div>

          {/* Cashback */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Cashback / Diskon</label>
            <div className="flex gap-2">
              <select value={cashbackType} onChange={e => { setCashbackType(e.target.value as any); setCashbackValue(0) }}
                className={`${inputClass} w-36 bg-white`}>
                <option value="none">Tidak ada</option>
                <option value="percent">Persen (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
              {cashbackType !== 'none' && (
                <input type="number" value={cashbackValue || ''} min={0}
                  max={cashbackType === 'percent' ? 100 : undefined}
                  onChange={e => setCashbackValue(Number(e.target.value))}
                  placeholder={cashbackType === 'percent' ? 'Misal: 10' : 'Jumlah Rp'}
                  className={`${inputClass} flex-1`} />
              )}
            </div>
            {cashbackAmount > 0 && (
              <p className="text-xs text-green-600 mt-1 font-semibold">Potongan: -{formatPrice(cashbackAmount)}</p>
            )}
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
          {cashbackAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600 mb-1">
              <span>Cashback{cashbackType === 'percent' ? ` (${cashbackValue}%)` : ''}</span>
              <span>-{formatPrice(cashbackAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-brand text-base border-t border-brand/20 pt-2 mt-2">
            <span>TOTAL</span><span>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-3 border-2 border-brand text-brand rounded-xl font-semibold text-sm hover:bg-brand-light transition flex-1">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Tersalin!' : 'Salin Teks'}
          </button>
          <button onClick={handleSend}
            className="flex items-center gap-2 px-4 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition flex-1 justify-center">
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
