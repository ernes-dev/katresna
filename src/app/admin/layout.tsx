'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import AdminSidebar from '@/components/admin/Sidebar'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const RESELLER_ALLOWED = ['/admin/orders', '/admin/invoice']

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isFullAdmin, setIsFullAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    if (pathname === '/admin/login') return
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/admin/login'); return }
      const { data: profile } = await supabase
        .from('resellers')
        .select('role')
        .eq('user_id', user.id)
        .single()

      const fullAdmin = !profile || profile.role === 'admin' || profile.role === 'owner'
      setIsFullAdmin(fullAdmin)

      if (!fullAdmin && !RESELLER_ALLOWED.some(p => pathname === p || pathname.startsWith(p + '/'))) {
        router.replace('/admin/orders')
      }
    }
    check()
  }, [pathname, router])

  if (pathname === '/admin/login') return <>{children}</>

  if (isFullAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#FFF8F0]">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isFullAdmin={isFullAdmin}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-[#FFF8F0] border-b border-[#f0e8dc] px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-600"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <Image
            src="https://lh3.googleusercontent.com/d/1TpFd2rJxeYrmtmyjl6L-6cQrX9sQI1fi"
            alt="Bolen Katresna"
            width={100}
            height={50}
            className="h-8 w-auto object-contain"
            unoptimized
          />
        </div>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
