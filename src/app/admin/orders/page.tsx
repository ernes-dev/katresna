'use client'
import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Phone, MapPin, Clock, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { getCommissionTiers, getCommissionTier, calculateCommission } from '@/lib/mitra'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Menunggu',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  processing: { label: 'Diproses',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
  done:       { label: 'Selesai',    color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled:  { label: 'Dibatalkan', color: 'bg-red-100 text-red-500 border-red-200' },
}

const STATUS_NEXT: Record<string, string> = {
  pending: 'processing',
  processing: 'done',
}

function queueLabel(orders: Order[], order: Order): number {
  const today = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })
  const todayOrders = orders
    .filter(o => new Date(o.created_at).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' }) === today)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  return todayOrders.findIndex(o => o.id === order.id) + 1
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'today' | 'all'>('today')
  const [isAdmin, setIsAdmin] = useState(false)

  const fetchOrders = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase
      .from('resellers')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    const isFullAdmin = !profile || profile.role === 'admin'
    setIsAdmin(isFullAdmin)

    const query = supabase
      .from('orders')
      .select('*, reseller:resellers(full_name, role)')
      .order('created_at', { ascending: false })
    if (!isFullAdmin) {
      query.eq('reseller_id', profile!.id)
    }
    if (filter === 'today') {
      const jakartaToday = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
      jakartaToday.setHours(0, 0, 0, 0)
      query.gte('created_at', jakartaToday.toISOString())
    }
    const { data } = await query.limit(100)
    setOrders((data as Order[]) || [])
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const generateCommission = async (order: Order) => {
    const resellerId = (order as any).reseller_id as string | null
    if (!resellerId) return
    const supabase = createClient()

    const { data: existing } = await supabase
      .from('commissions')
      .select('id')
      .eq('order_ref', order.id)
      .maybeSingle()
    if (existing) return

    const { count } = await supabase
      .from('commissions')
      .select('*', { count: 'exact', head: true })
      .eq('reseller_id', resellerId)
    const salesCount = (count ?? 0) + 1

    const tiers = await getCommissionTiers()
    const tier = getCommissionTier(salesCount, tiers)
    const amount = calculateCommission(order.subtotal, tier)

    await supabase.from('commissions').insert({
      reseller_id: resellerId,
      order_ref: order.id,
      order_amount: order.subtotal,
      commission_amount: amount,
      status: 'pending',
    })
  }

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('orders').update({ status }).eq('id', id)
    if (status === 'done') {
      const order = orders.find(o => o.id === id)
      if (order) await generateCommission(order)
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as Order['status'] } : o))
  }

  const todayOrders = orders.filter(o => {
    const today = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })
    return new Date(o.created_at).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' }) === today
  })

  const pending = orders.filter(o => o.status === 'pending').length
  const processing = orders.filter(o => o.status === 'processing').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Antrian Pesanan</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Hari ini: {todayOrders.length} pesanan · {pending} menunggu · {processing} diproses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm">
            <button onClick={() => setFilter('today')} className={`px-3 py-1.5 font-medium transition ${filter === 'today' ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Hari ini</button>
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 font-medium transition ${filter === 'all' ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Semua</button>
          </div>
          <button onClick={fetchOrders} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Memuat...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-30" />
          <p>Belum ada pesanan {filter === 'today' ? 'hari ini' : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const qNum = queueLabel(orders, order)
            const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending
            const nextStatus = STATUS_NEXT[order.status]
            const time = new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
            const date = new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' })
            const isToday = new Date(order.created_at).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' }) === new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })

            return (
              <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {isToday && qNum > 0 && (
                      <div className="w-10 h-10 rounded-xl bg-brand text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
                        #{qNum}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{order.customer_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                        {isAdmin && (order as any).reseller && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            (order as any).reseller.role === 'jastiper'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {(order as any).reseller.role === 'jastiper' ? 'Jastiper' : 'Reseller'} · {(order as any).reseller.full_name}
                          </span>
                        )}
                        {order.customer_whatsapp && (
                          <a href={`https://wa.me/62${order.customer_whatsapp.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-green-600 font-semibold hover:underline">
                            <Phone size={11} /> {order.customer_whatsapp}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-brand">{formatPrice(order.subtotal)}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-0.5">
                      <Clock size={10} /> {isToday ? time : `${date} ${time}`}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3 text-xs text-gray-600 space-y-1">
                  {(order.items as any[]).map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <MapPin size={11} className="text-brand" />
                  <span>{order.shipping_method === 'pickup' ? 'Ambil sendiri' : order.courier}</span>
                  {order.address && order.shipping_method !== 'pickup' && (
                    <span className="truncate max-w-xs">— {order.address}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {nextStatus && (
                    <button
                      onClick={() => updateStatus(order.id, nextStatus)}
                      className="flex-1 bg-brand text-white py-2 rounded-xl text-sm font-semibold hover:bg-brand-dark transition"
                    >
                      {nextStatus === 'processing' ? '✓ Proses' : '✓ Selesai'}
                    </button>
                  )}
                  {order.status !== 'cancelled' && order.status !== 'done' && (
                    <button
                      onClick={() => updateStatus(order.id, 'cancelled')}
                      className="px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition"
                    >
                      Batal
                    </button>
                  )}
                  {(order.status === 'cancelled' || order.status === 'done') && (
                    <span className="text-xs text-gray-400 self-center">—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
