'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, BadgeDollarSign, LogOut, Menu, X, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { href: '/mitra/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/mitra/admin/resellers', label: 'Kelola Mitra', icon: Users },
  { href: '/mitra/admin/accounts', label: 'Akun Mitra', icon: UserCircle },
  { href: '/mitra/admin/commission', label: 'Tier Komisi', icon: BadgeDollarSign },
]

function SidebarContent({
  collapsed,
  onClose,
  onToggleCollapse,
  showCollapseBtn,
}: {
  collapsed?: boolean
  onClose?: () => void
  onToggleCollapse?: () => void
  showCollapseBtn?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/mitra/login')
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="flex h-full flex-col bg-[#FFF8F0]">
      {/* Header */}
      <div className={`flex items-center border-b border-[#f0e8dc] ${collapsed ? 'justify-center px-2 py-4' : 'justify-between px-4 py-4'}`}>
        {!collapsed && (
          <Image
            src="https://lh3.googleusercontent.com/d/1TpFd2rJxeYrmtmyjl6L-6cQrX9sQI1fi"
            alt="Bolen Katresna"
            width={120}
            height={56}
            className="h-10 w-auto object-contain"
            unoptimized
          />
        )}
        {collapsed && (
          <Image
            src="https://lh3.googleusercontent.com/d/1TpFd2rJxeYrmtmyjl6L-6cQrX9sQI1fi"
            alt="Bolen Katresna"
            width={36}
            height={36}
            className="h-8 w-8 object-contain"
            unoptimized
          />
        )}
        {onClose && (
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 lg:hidden">
            <X size={20} />
          </button>
        )}
        {showCollapseBtn && !onClose && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-full bg-[#f0e8dc] text-gray-500 hover:text-gray-800 transition"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Portal</p>
        </div>
      )}

      <nav className={`flex-1 space-y-0.5 px-2 pt-2 ${collapsed ? 'items-center' : ''}`}>
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? 'justify-center' : ''} ${
              isActive(href, exact)
                ? 'bg-brand text-white'
                : 'text-gray-600 hover:bg-[#f0e8dc]'
            }`}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && label}
          </Link>
        ))}
      </nav>

      <div className={`px-2 py-4 border-t border-[#f0e8dc]`}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Keluar' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && 'Keluar'}
        </button>
      </div>
    </div>
  )
}

export default function MitraAdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const sidebarW = collapsed ? 'lg:w-14' : 'lg:w-56'
  const mainML = collapsed ? 'lg:ml-14' : 'lg:ml-56'

  return (
    <div className="flex min-h-screen bg-[#FFF8F0]">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex lg:flex-col ${sidebarW} fixed inset-y-0 left-0 z-30 border-r border-[#f0e8dc] transition-all duration-200`}>
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(v => !v)}
          showCollapseBtn
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[#f0e8dc] transform transition-transform duration-200 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col ${mainML} transition-all duration-200`}>
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-[#FFF8F0] border-b border-[#f0e8dc] sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="p-1 text-gray-500">
            <Menu size={22} />
          </button>
          <Image
            src="https://lh3.googleusercontent.com/d/1TpFd2rJxeYrmtmyjl6L-6cQrX9sQI1fi"
            alt="Bolen Katresna"
            width={100}
            height={44}
            className="h-8 w-auto object-contain"
            unoptimized
          />
        </header>

        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
