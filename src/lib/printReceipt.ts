// Thermal receipt builder (58mm — compatible with 58mm & 80mm printers).

export interface PrintItem {
  name: string
  quantity: number
  price: number
  isian?: string[]
}

export interface PrintOrder {
  invoiceNo?: string
  date?: string
  customerName: string
  phone?: string | null
  address?: string | null
  courier?: string | null
  shippingMethod?: string | null
  items: PrintItem[]
  subtotal: number
  shippingCost?: number
  serviceFee?: number
  discount?: number
  total: number
  notes?: string | null
  resellerName?: string | null
  queueNo?: number | null
}

export type ReceiptType = 'customer' | 'logistic' | 'checker'

const rp = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID')
const esc = (s: string) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const today = () =>
  new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
const line = '--------------------------------'

function totalQty(items: PrintItem[]) {
  return items.reduce((s, i) => s + i.quantity, 0)
}

function customerBody(o: PrintOrder): string {
  const rows = o.items.map(it => {
    const head = `${it.quantity}x ${esc(it.name)}`
    const amt = rp(it.price * it.quantity)
    const isian = it.isian && it.isian.length
      ? `<div class="sub">Isian: ${esc(it.isian.join(', '))}</div>` : ''
    return `<div class="it"><div class="itname">${head}</div><div class="itamt">${amt}</div></div>${isian}`
  }).join('')

  const sumRow = (label: string, val: string, strong = false) =>
    `<div class="sum${strong ? ' strong' : ''}"><span>${label}</span><span>${val}</span></div>`

  return `
  <div class="center">
    <div class="shop">BOLEN KATRESNA</div>
    <div class="small">Oleh-oleh khas Bandung</div>
  </div>
  <div class="hr"></div>
  ${o.invoiceNo ? `<div class="kv">No&nbsp;&nbsp;: ${esc(o.invoiceNo)}</div>` : ''}
  <div class="kv">Tgl&nbsp;: ${esc(o.date || today())}</div>
  <div class="kv">Nama: ${esc(o.customerName)}</div>
  ${o.resellerName ? `<div class="kv">Via&nbsp;: ${esc(o.resellerName)}</div>` : ''}
  <div class="hr"></div>
  ${rows}
  <div class="hr"></div>
  ${sumRow('Subtotal', rp(o.subtotal))}
  ${o.shippingCost ? sumRow('Ongkir', rp(o.shippingCost)) : ''}
  ${o.serviceFee ? sumRow('Jasa', rp(o.serviceFee)) : ''}
  ${o.discount ? sumRow('Diskon', '-' + rp(o.discount)) : ''}
  ${sumRow('TOTAL', rp(o.total), true)}
  <div class="hr"></div>
  ${o.notes ? `<div class="small">Catatan: ${esc(o.notes)}</div><div class="hr"></div>` : ''}
  <div class="center small">Terima kasih telah memesan!</div>`
}

function logisticBody(o: PrintOrder): string {
  const ship = o.shippingMethod === 'pickup' ? 'Ambil sendiri' : (o.courier || '-')
  return `
  <div class="center"><div class="shop">PENGIRIMAN</div></div>
  <div class="hr"></div>
  ${o.invoiceNo ? `<div class="kv">No&nbsp;&nbsp;&nbsp;: ${esc(o.invoiceNo)}</div>` : ''}
  ${o.queueNo ? `<div class="kv big">Antrian #${o.queueNo}</div>` : ''}
  <div class="kv">Nama&nbsp;: ${esc(o.customerName)}</div>
  <div class="kv">HP&nbsp;&nbsp;&nbsp;: ${esc(o.phone || '-')}</div>
  <div class="kv">Kurir: ${esc(ship)}</div>
  <div class="hr"></div>
  <div class="kv">Alamat:</div>
  <div class="addr">${esc(o.address || '-')}</div>
  <div class="hr"></div>
  <div class="kv">Total item: ${totalQty(o.items)} pcs</div>
  ${o.notes ? `<div class="small">Catatan: ${esc(o.notes)}</div>` : ''}`
}

function checkerBody(o: PrintOrder): string {
  const rows = o.items.map(it => {
    const isian = it.isian && it.isian.length
      ? it.isian.map(x => `<div class="cksub">- ${esc(x)}</div>`).join('') : ''
    return `<div class="ck">&#9744; ${it.quantity}x ${esc(it.name)}</div>${isian}`
  }).join('')
  return `
  <div class="center"><div class="shop">CHECKLIST PACKING</div></div>
  <div class="hr"></div>
  ${o.invoiceNo ? `<div class="kv">No&nbsp;&nbsp;: ${esc(o.invoiceNo)}</div>` : ''}
  ${o.queueNo ? `<div class="kv big">Antrian #${o.queueNo}</div>` : ''}
  <div class="kv">Nama: ${esc(o.customerName)}</div>
  <div class="hr"></div>
  ${rows}
  <div class="hr"></div>
  <div class="kv">Total: ${totalQty(o.items)} item</div>
  ${o.notes ? `<div class="small">Catatan: ${esc(o.notes)}</div>` : ''}
  <div class="sign">Checker: ______________</div>`
}

const BUILDERS: Record<ReceiptType, (o: PrintOrder) => string> = {
  customer: customerBody,
  logistic: logisticBody,
  checker: checkerBody,
}

function docHtml(bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Struk</title><style>
  @page { size: 58mm auto; margin: 0; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:58mm; padding:3mm 2mm; font-family:'Courier New',monospace; font-size:11px; line-height:1.35; color:#000; }
  .center { text-align:center; }
  .shop { font-size:15px; font-weight:bold; letter-spacing:.5px; }
  .small { font-size:10px; }
  .big { font-size:13px; font-weight:bold; }
  .hr { border-top:1px dashed #000; margin:4px 0; }
  .kv { white-space:pre-wrap; }
  .addr { white-space:pre-wrap; font-weight:bold; }
  .it { display:flex; justify-content:space-between; gap:6px; margin-top:2px; }
  .itname { flex:1; }
  .itamt { white-space:nowrap; }
  .sub { font-size:10px; padding-left:8px; }
  .sum { display:flex; justify-content:space-between; }
  .sum.strong { font-weight:bold; font-size:13px; margin-top:2px; }
  .ck { margin-top:3px; font-size:12px; }
  .cksub { font-size:10px; padding-left:14px; }
  .sign { margin-top:14px; }
  </style></head><body>${bodyHtml}
  <script>window.onload=function(){setTimeout(function(){window.print();},150);};window.onafterprint=function(){window.close();};</script>
  </body></html>`
}

export function printReceipt(order: PrintOrder, type: ReceiptType) {
  const html = docHtml(BUILDERS[type](order))
  const w = window.open('', '_blank', 'width=400,height=640')
  if (!w) { alert('Popup diblokir. Izinkan popup untuk mencetak.'); return }
  w.document.open()
  w.document.write(html)
  w.document.close()
}
