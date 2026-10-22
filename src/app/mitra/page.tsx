'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MitraRoot() {
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: reseller } = await supabase.from('resellers').select('role').eq('user_id', user.id).single()
        if (reseller?.role === 'admin' || reseller?.role === 'owner') {
          router.replace('/mitra/admin')
        } else {
          router.replace('/mitra/dashboard')
        }
      } else {
        router.replace('/mitra/login')
      }
    }
    check()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
    </div>
  )
}
