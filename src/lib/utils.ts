export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatWhatsApp(phone: string): string {
  let clean = phone.replace(/\D/g, '')
  if (clean.startsWith('0')) clean = '62' + clean.slice(1)
  if (!clean.startsWith('62')) clean = '62' + clean
  return clean
}

export function buildWhatsAppMessage(params: {
  full_name: string
  whatsapp: string
  address: string
  items: Array<{ name: string; quantity: number; price: number }>
  subtotal: number
  shipping_cost: number
  courier: string
  shipping_method: 'delivery' | 'pickup'
  notes?: string
}): string {
  const { full_name, whatsapp, address, items, subtotal, shipping_cost, courier, shipping_method, notes } = params
  const total = subtotal + shipping_cost

  const itemLines = items
    .map(i => `• ${i.name} x${i.quantity} = ${formatPrice(i.price * i.quantity)}`)
    .join('\n')

  const shippingLine = shipping_method === 'pickup'
    ? 'Ambil sendiri (Pick Up)'
    : `${courier} = ${formatPrice(shipping_cost)}`

  const notesLine = notes ? `\nCatatan: ${notes}` : ''

  return `*Pesanan Bolen Katresna*

*Nama:* ${full_name}
*No. WA:* ${whatsapp}
*Alamat:* ${address}${notesLine}

*Detail Pesanan:*
${itemLines}

Subtotal: ${formatPrice(subtotal)}
Pengiriman: ${shippingLine}
------------------
*Total: ${formatPrice(total)}*

_Mohon konfirmasi pesanan ini. Terima kasih!_`
}
