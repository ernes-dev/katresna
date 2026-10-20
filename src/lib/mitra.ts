'use client'

import { createClient } from '@/lib/supabase/client'

export interface ResellerProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  kyc_photo_url: string | null
  kyc_status: 'pending' | 'approved' | 'rejected'
  kyc_notes: string | null
  bank_name: string | null
  bank_account: string | null
  bank_holder: string | null
  bank_status: 'pending' | 'approved' | 'rejected'
  is_active: boolean
  role: string
  ref_code: string | null
  created_at: string
}

export function makeRefCode(name: string): string {
  const base = (name || 'mitra')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10) || 'mitra'
  const rand = Math.random().toString(36).slice(2, 6)
  return `${base}-${rand}`
}

// Returns the reseller's ref_code, generating & persisting one if absent.
export async function ensureRefCode(resellerId: string, fullName: string): Promise<string | null> {
  const supabase = createClient()
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = makeRefCode(fullName)
    const { error } = await supabase
      .from('resellers')
      .update({ ref_code: code })
      .eq('id', resellerId)
      .is('ref_code', null)
    if (!error) {
      const { data } = await supabase.from('resellers').select('ref_code').eq('id', resellerId).single()
      return data?.ref_code ?? code
    }
  }
  return null
}

export interface CommissionTier {
  id: number
  min_sales: number
  max_sales: number | null
  type: 'percent' | 'fixed'
  value: number
  label: string
}

export interface Commission {
  id: string
  reseller_id: string
  order_ref: string
  order_amount: number
  commission_amount: number
  status: 'pending' | 'paid'
  notes: string | null
  created_at: string
}

export async function getMitraSession() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { user: null, reseller: null }

  const { data: reseller, error: resellerError } = await supabase
    .from('resellers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (resellerError || !reseller) return { user, reseller: null }

  return { user, reseller: reseller as ResellerProfile }
}

export async function getCommissionTiers(): Promise<CommissionTier[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('commission_tiers')
    .select('*')
    .order('min_sales', { ascending: true })
  if (error || !data) return []
  return data as CommissionTier[]
}

export function getCommissionTier(
  totalSales: number,
  tiers: CommissionTier[]
): CommissionTier | null {
  if (!tiers.length) return null
  for (const tier of tiers.slice().reverse()) {
    if (totalSales >= tier.min_sales) return tier
  }
  return tiers[0]
}

export function calculateCommission(
  orderAmount: number,
  tier: CommissionTier | null
): number {
  if (!tier) return 0
  if (tier.type === 'percent') {
    return Math.round((orderAmount * tier.value) / 100)
  }
  return tier.value
}
