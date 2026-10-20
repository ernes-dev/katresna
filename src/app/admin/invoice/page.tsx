'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Send, Copy, Check, Search, X, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

const CATEGORY_ORDER = ['box', 'bolen', 'promo', 'beverages']

function ProductPickerModal({ products, onSelect, onClose }: {
  products: Product[]
  onSelect: (p: Product, variantName?: string, variantPrice?: number) => void
  onClose: () => void
}) {
  const [q, setQ] = useState('')
  const [variantStep, setVariantStep] = useState<Product | null>(null)

  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
  const groups: { label: string; items: Product[] }[] = []
  filtered.forEach(p => {
    const cat = (p as any).category?.name || 'Lainnya'
    const g = groups.find(g => g.label === cat)
    if (g) g.items.push(p)
    else groups.push({ label: cat, items: [p] })
  })

  const handlePickProduct = (p: Product) => {
    const variants = Array.isArray(p.variants) ? p.variants : []
    if (variants.length > 0) {
      setVariantStep({ ...p, variants })
    } else {
      onSelect(p)
      onClose()
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-[5%] bottom-[5%] z-50 bg-white rounded-2xl shadow-2xl flex flex-col max-w-md mx-auto overflow-hidden">

        {variantStep ? (
          /* Step 2: Variant picker */
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <button onClick={() => setVariantStep(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400">
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {variantStep.image_url && (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={variantStep.image_url} alt={variantStep.name} fill className="object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{variantStep.name}</p>
                  <p className="text-xs text-gray-400">Pilih varian</p>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {variantStep.variants!.map(v => (
                <button
                  key={v.name}
                  onClick={() => { onSelect(variantStep, v.name, v.price); onClose() }}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 border-gray-100 hover:border-brand hover:bg-brand-light transition group"
                >
                  <span className="font-semibold text-gray-800 group-hover:text-brand">{v.name}</span>
                  {!variantStep.is_custom_box && <span className="font-bold text-brand text-base">{formatPrice(v.price)}</span>}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Step 1: Product grid */
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Cari produk..."
                className="flex-1 outline-none text-sm bg-transparent"
              />
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-3">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-12">Produk tidak ditemukan</p>
              ) : (
                groups.map(g => (
                  <div key={g.label} className="mb-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{g.label}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {g.items.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handlePickProduct(p)}
                          className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-brand-light transition border border-transparent hover:border-brand/20 active:scale-95 relative"
                        >
                          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 mb-1.5">
                            {p.image_url
                              ? <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-3xl">🍱</div>
                            }
                            {p.variants && p.variants.length > 0 && (
                              <span className="absolute bottom-1 right-1 bg-brand text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                {p.variants.length} varian
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">{p.name}</p>
                          {!p.is_custom_box && (
                            <p className="text-xs text-brand font-bold mt-0.5">
                              {p.variants && p.variants.length > 0
                                ? `ab ${formatPrice(Math.min(...p.variants.map(v => v.price)))}`
                                : formatPrice(p.price)
                              }
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

interface InvoiceItem { name: string; qty: number; price: number; isian?: string[] }

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
  const displayInvoiceNumber = isPO ? invoiceNumber.replace('INV-', 'PO-') : invoiceNumber

  const buildMessage = () => {
    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const itemLines = items
      .filter(i => i.name.trim())
      .map(i => {
        const line = `• ${i.name} x${i.qty} — ${formatPrice(i.price * i.qty)}`
        return i.isian && i.isian.length > 0 ? `${line}\n  Isian: ${i.isian.join(', ')}` : line
      })
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
    window.open(`https://wa.me/${formatWA(customerWA)}?text=${encodeURIComponent(buildMessage())}`, '_blank')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildMessage())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 text-sm transition bg-white"

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Buat Invoice / PO</h1>

      <div className="space-y-4">

        {/* PO toggle + number */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <p className="font-semibold text-gray-800 text-sm">Mode Purchase Order (PO)</p>
              <p className="text-xs text-gray-400 mt-0.5">Untuk reseller / jastiper partai besar</p>
            </div>
            {/* Toggle */}
            <button
              onClick={() => setIsPO(v => !v)}
              aria-checked={isPO}
              role="switch"
              className={`relative flex-shrink-0 w-12 h-7 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand/50 ${isPO ? 'bg-brand' : 'bg-gray-200'}`}
            >
              <span className={`block w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${isPO ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="bg-gray-50 rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">No. {isPO ? 'PO' : 'Invoice'}</span>
            <span className="text-xs font-mono font-bold text-gray-700">{displayInvoiceNumber}</span>
          </div>
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <h2 className="font-semibold text-gray-800 text-sm">{isPO ? 'Data Reseller / Jastiper' : 'Data Pelanggan'}</h2>
          {isPO && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Reseller / Jastiper *</label>
              <input type="text" value={resellerName} onChange={e => setResellerName(e.target.value)}
                placeholder="Nama reseller atau jastiper" className={inputClass} />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {isPO ? 'Nama Penerima (opsional)' : 'Nama Pelanggan'}
            </label>
            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
              placeholder="Nama lengkap" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Nomor WhatsApp</label>
            <input type="tel" value={customerWA} onChange={e => setCustomerWA(e.target.value)}
              placeholder="08xxxxxxxxxx" className={inputClass} />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 text-sm">Item Pesanan</h2>
            <button onClick={addItem}
              className="flex items-center gap-1 text-xs text-brand font-bold px-2.5 py-1.5 bg-brand-light rounded-lg hover:bg-brand/10 transition">
              <Plus size={13} /> Tambah Item
            </button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_52px_108px_28px] gap-2 px-1 mb-2">
            <span className="text-xs font-semibold text-gray-400">Produk</span>
            <span className="text-xs font-semibold text-gray-400 text-center">Qty</span>
            <span className="text-xs font-semibold text-gray-400">Harga</span>
            <span />
          </div>

          <div className="space-y-3">
            {items.map((item, i) => {
              const baseName = item.name.replace(/\s*\(.*\)$/, '')
              const matched = products.find(p => p.name === baseName || p.name === item.name)

              return (
                <div key={i} className="space-y-1.5">
                  <div className="grid grid-cols-[1fr_52px_108px_28px] gap-2 items-center">
                    {/* Product picker */}
                    <button
                      type="button"
                      onClick={() => setPickerOpenFor(i)}
                      className="flex items-center gap-2 text-left bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 hover:border-brand/50 hover:bg-brand-light/40 transition min-w-0 group"
                    >
                      {matched?.image_url ? (
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={matched.image_url} alt={item.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:bg-brand-light">
                          <Search size={12} />
                        </div>
                      )}
                      {item.name ? (
                        <span className="text-xs font-semibold text-gray-800 truncate flex-1 leading-tight">{item.name}</span>
                      ) : (
                        <span className="text-xs text-gray-400 flex-1">Pilih produk...</span>
                      )}
                    </button>

                    {/* Qty */}
                    <input
                      type="number"
                      value={item.qty}
                      min={1}
                      onChange={e => updateItem(i, 'qty', Math.max(1, Number(e.target.value)))}
                      className="border border-gray-200 rounded-xl px-1 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand/40 w-full bg-white transition"
                    />

                    {/* Price */}
                    <input
                      type="number"
                      value={item.price || ''}
                      min={0}
                      onChange={e => updateItem(i, 'price', Number(e.target.value))}
                      placeholder="0"
                      className="border border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand/40 w-full bg-white transition"
                    />

                    {/* Delete */}
                    {items.length > 1 ? (
                      <button onClick={() => removeItem(i)}
                        className="text-gray-300 hover:text-red-500 transition p-0.5 rounded-lg hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    ) : <span />}
                  </div>

                  {/* Isian bolen picker for custom box */}
                  {matched?.is_custom_box && item.name.includes('(') && (() => {
                    const maxIsi = item.name.includes('Isi 8') ? 8 : 4
                    const selected: string[] = item.isian ?? []
                    const bolenItems = products.filter(p =>
                      (p as any).category?.name?.toLowerCase() === 'bolen' && !p.is_custom_box
                    )
                    const toggle = (name: string) => {
                      setItems(prev => prev.map((it, idx) => {
                        if (idx !== i) return it
                        const cur = it.isian ?? []
                        const next = cur.includes(name)
                          ? cur.filter(n => n !== name)
                          : cur.length < maxIsi ? [...cur, name] : cur
                        return { ...it, isian: next }
                      }))
                    }
                    return (
                      <div className="ml-10 mr-7 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-500">
                            Pilih isian bolen
                          </p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            selected.length === maxIsi
                              ? 'bg-brand text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {selected.length}/{maxIsi}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {bolenItems.map(b => {
                            const active = selected.includes(b.name)
                            const full = !active && selected.length >= maxIsi
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => toggle(b.name)}
                                disabled={full}
                                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                                  active
                                    ? 'bg-brand text-white border-brand shadow-sm'
                                    : full
                                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand hover:text-brand'
                                }`}
                              >
                                {b.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Subtotal hint */}
                  {item.name && item.price > 0 && (
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs text-gray-400 truncate max-w-[60%]">{item.name} ×{item.qty}</span>
                      <span className="text-xs font-semibold text-gray-600">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Shipping + Cashback + Notes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">

          {/* Shipping */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Ongkos Kirim (Rp)</label>
            <input type="number" value={shippingCost || ''} min={0}
              onChange={e => setShippingCost(Number(e.target.value))}
              placeholder="0 (kosongkan jika gratis)" className={inputClass} />
          </div>

          {/* Cashback */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Cashback / Diskon</label>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={cashbackType}
                  onChange={e => { setCashbackType(e.target.value as any); setCashbackValue(0) }}
                  className="appearance-none border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white transition w-36"
                >
                  <option value="none">Tidak ada</option>
                  <option value="percent">Persen (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {cashbackType !== 'none' && (
                <input
                  type="number"
                  value={cashbackValue || ''}
                  min={0}
                  max={cashbackType === 'percent' ? 100 : undefined}
                  onChange={e => setCashbackValue(Number(e.target.value))}
                  placeholder={cashbackType === 'percent' ? 'Contoh: 10' : 'Jumlah Rp'}
                  className={`${inputClass} flex-1`}
                />
              )}
            </div>
            {cashbackAmount > 0 && (
              <p className="text-xs text-green-600 mt-1.5 font-semibold">
                Potongan: -{formatPrice(cashbackAmount)}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Catatan (opsional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Instruksi khusus..." className={inputClass} />
          </div>
        </div>

        {/* Total summary */}
        <div className="bg-brand-light rounded-2xl p-4 border border-brand/15">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            {shippingCost > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Ongkir</span><span className="font-medium">{formatPrice(shippingCost)}</span>
              </div>
            )}
            {cashbackAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Cashback{cashbackType === 'percent' ? ` (${cashbackValue}%)` : ''}</span>
                <span className="font-medium">-{formatPrice(cashbackAmount)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between font-bold text-brand text-base border-t border-brand/20 pt-3 mt-3">
            <span>TOTAL</span><span className="text-lg">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-brand text-brand rounded-xl font-bold text-sm hover:bg-brand-light transition"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Tersalin!' : 'Salin Teks'}
          </button>
          <button
            onClick={handleSend}
            className="flex items-center justify-center gap-2 px-4 py-3.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-dark transition shadow-sm shadow-brand/20"
          >
            <Send size={16} />
            Kirim via WA
          </button>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5 border-b border-gray-200 bg-white">
            Preview Pesan WhatsApp
          </p>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed p-4">
            {buildMessage()}
          </pre>
        </div>

      </div>

      {pickerOpenFor !== null && (
        <ProductPickerModal
          products={products}
          onSelect={(p, variantName, variantPrice) => {
            const name = variantName ? `${p.name} (${variantName})` : p.name
            const price = variantPrice ?? p.price
            updateItem(pickerOpenFor, 'name', name)
            updateItem(pickerOpenFor, 'price', price)
          }}
          onClose={() => setPickerOpenFor(null)}
        />
      )}
    </div>
  )
}
