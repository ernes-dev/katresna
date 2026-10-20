'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Settings, LogOut, Menu, X, Images, FileText, ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
  { href: '/admin/products', label: 'Produk', icon: Package, adminOnly: true },
  { href: '/admin/banners', label: 'Flyer', icon: Images, adminOnly: true },
  { href: '/admin/orders', label: 'Pesanan', icon: ClipboardList, adminOnly: false },
  { href: '/admin/invoice', label: 'Invoice', icon: FileText, adminOnly: false },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings, adminOnly: true },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  isFullAdmin: boolean
}

export default function AdminSidebar({ isOpen, onClose, isFullAdmin }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const visibleItems = navItems.filter(item => isFullAdmin || !item.adminOnly)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 bg-[#FFF8F0] border-r border-[#f0e8dc] flex flex-col',
          'transition-all duration-300 ease-in-out',
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, width depends on collapsed
          'lg:relative lg:translate-x-0 lg:z-auto',
          collapsed ? 'lg:w-14' : 'lg:w-56',
          // Mobile fixed width
          'w-64',
        ].join(' ')}
      >
        {/* Header */}
        <div className="h-16 border-b border-[#f0e8dc] flex items-center justify-between px-3">
          {!collapsed && (
            <div className="flex-1 flex justify-center">
              <Image
                src="https://lh3.googleusercontent.com/d/1TpFd2rJxeYrmtmyjl6L-6cQrX9sQI1fi"
                alt="Bolen Katresna"
                width={110}
                height={55}
                className="h-9 w-auto object-contain"
                unoptimized
              />
            </div>
          )}

          {/* Desktop hamburger toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-brand-light hover:text-brand transition text-gray-500 flex-shrink-0 active:scale-[0.97]"
            title={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
          >
            <Menu size={18} />
          </button>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-brand-light hover:text-brand transition text-gray-500 flex-shrink-0 active:scale-[0.97]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
          {visibleItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                title={collapsed ? label : undefined}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition active:scale-[0.98]',
                  collapsed ? 'justify-center' : '',
                  active
                    ? 'bg-brand text-white shadow-sm shadow-brand/25'
                    : 'text-gray-600 hover:bg-brand-light hover:text-brand',
                ].join(' ')}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-2.5 border-t border-[#f0e8dc]">
          <button
            onClick={handleLogout}
            title={collapsed ? 'Keluar' : undefined}
            className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition active:scale-[0.98] ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
