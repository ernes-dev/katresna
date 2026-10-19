'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { CommissionTier } from '@/lib/mitra'

const EMPTY_TIER: Omit<CommissionTier, 'id'> = {
  min_sales: 0,
  max_sales: null,
  type: 'percent',
  value: 5,
  label: '',
}

export default function AdminCommissionPage() {
  const router = useRouter()
  const [tiers, setTiers] = useState<CommissionTier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Omit<CommissionTier, 'id'>>(EMPTY_TIER)
  const [showAdd, setShowAdd] = useState(false)
  const [newTier, setNewTier] = useState<Omit<CommissionTier, 'id'>>(EMPTY_TIER)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/mitra/login'); return }

    const { data: profile } = await supabase
      .from('resellers')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      router.replace('/mitra/dashboard')
      return
    }

    const { data } = await supabase
      .from('commission_tiers')
      .select('*')
      .order('min_sales', { ascending: true })

    setTiers((data ?? []) as CommissionTier[])
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  const startEdit = (tier: CommissionTier) => {
    setEditingId(tier.id)
    setEditData({ min_sales: tier.min_sales, max_sales: tier.max_sales, type: tier.type, value: tier.value, label: tier.label })
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('commission_tiers')
      .update(editData)
      .eq('id', editingId)
    if (error) { alert('Gagal menyimpan: ' + error.message) }
    else { setEditingId(null) }
    await load()
    setSaving(false)
  }

  const deleteTier = async (id: number) => {
    if (!confirm('Hapus tier ini?')) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('commission_tiers').delete().eq('id', id)
    if (error) { alert('Gagal hapus: ' + error.message) }
    await load()
    setSaving(false)
  }

  const addTier = async () => {
    if (!newTier.label) { alert('Isi nama tier terlebih dahulu.'); return }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('commission_tiers').insert(newTier)
    if (error) { alert('Gagal tambah: ' + error.message) }
    else { setShowAdd(false); setNewTier(EMPTY_TIER) }
    await load()
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  const TierForm = ({
    data,
    onChange,
    onSave,
    onCancel,
    saveLabel,
  }: {
    data: Omit<CommissionTier, 'id'>
    onChange: (d: Omit<CommissionTier, 'id'>) => void
    onSave: () => void
    onCancel: () => void
    saveLabel: string
  }) => (
    <div className="mt-3 space-y-3 rounded-xl bg-gray-50 p-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Nama Tier</label>
        <input
          value={data.label}
          onChange={e => onChange({ ...data, label: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
          placeholder="Contoh: Silver, Gold"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Min. Order</label>
          <input
            type="number"
            min={0}
            value={data.min_sales}
            onChange={e => onChange({ ...data, min_sales: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Max. Order</label>
          <input
            type="number"
            min={0}
            value={data.max_sales ?? ''}
            onChange={e => onChange({ ...data, max_sales: e.target.value === '' ? null : Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
            placeholder="Kosong = tak terbatas"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Tipe</label>
          <select
            value={data.type}
            onChange={e => onChange({ ...data, type: e.target.value as 'percent' | 'fixed' })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="percent">Persentase (%)</option>
            <option value="fixed">Nominal (Rp)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            {data.type === 'percent' ? 'Nilai (%)' : 'Nilai (Rp)'}
          </label>
          <input
            type="number"
            min={0}
            value={data.value}
            onChange={e => onChange({ ...data, value: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          disabled={saving}
          onClick={onSave}
          className="flex-1 rounded-xl bg-brand py-2 text-xs font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : saveLabel}
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl border border-gray-200 px-4 py-2 text-xs text-gray-600 transition hover:bg-gray-50"
        >
          Batal
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/mitra/admin" className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Tier Komisi</h1>
        </div>

        <div className="space-y-3">
          {tiers.map(tier => (
            <div key={tier.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{tier.label}</p>
                  <p className="text-xs text-gray-500">
                    {tier.min_sales} – {tier.max_sales ?? '∞'} order ·{' '}
                    {tier.type === 'percent'
                      ? `${tier.value}%`
                      : `Rp${tier.value.toLocaleString('id-ID')}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(tier)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand transition hover:bg-brand-light"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTier(tier.id)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              {editingId === tier.id && (
                <TierForm
                  data={editData}
                  onChange={setEditData}
                  onSave={saveEdit}
                  onCancel={() => setEditingId(null)}
                  saveLabel="Simpan Perubahan"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          {!showAdd ? (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full rounded-2xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 transition hover:border-brand hover:text-brand"
            >
              + Tambah Tier Baru
            </button>
          ) : (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-semibold text-gray-900">Tier Baru</p>
              <TierForm
                data={newTier}
                onChange={setNewTier}
                onSave={addTier}
                onCancel={() => { setShowAdd(false); setNewTier(EMPTY_TIER) }}
                saveLabel="Tambah Tier"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
