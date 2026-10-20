'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, BadgeDollarSign, LogOut, Menu, X, UserCircle } from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { href: '/mitra/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/mitra/admin/resellers', label: 'Kelola Mitra', icon: Users },
  { href: '/mitra/admin/accounts', label: 'Akun Mitra', icon: UserCircle },
  { href: '/mitra/admin/commission', label: 'Tier Komisi', icon: BadgeDollarSign },
]

export default function MitraAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/mitra/login')
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const NavItems = ({ onClickItem }: { onClickItem?: () => void }) => (
    <>
      {NAV.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={onClickItem}
          title={collapsed ? label : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
            collapsed ? 'justify-center' : ''
          } ${
            isActive(href, exact)
              ? 'bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm shadow-brand/25'
              : 'text-gray-600 hover:bg-[#f0e8dc] hover:text-gray-900'
          }`}
        >
          <Icon size={17} className="shrink-0" />
          {!collapsed && label}
        </Link>
      ))}
    </>
  )

  return (
    <div className="flex min-h-screen bg-[#FFF8F0]">
      {/* Desktop sidebar — always visible, collapsible to icon-only */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 border-r border-[#f0e8dc] bg-[#FFF8F0] transition-all duration-200 ${
          collapsed ? 'w-[60px]' : 'w-56'
        }`}
      >
        {/* Logo + hamburger */}
        <div className="relative flex items-center justify-center border-b border-[#f0e8dc] h-14 px-3">
          {collapsed ? (
            <button
              onClick={() => setCollapsed(v => !v)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-[#f0e8dc] transition"
            >
              <Menu size={18} />
            </button>
          ) : (
            <>
              <Image
                src="https://lh3.googleusercontent.com/d/1TpFd2rJxeYrmtmyjl6L-6cQrX9sQI1fi"
                alt="Bolen Katresna"
                width={110}
                height={50}
                className="h-9 w-auto object-contain"
                unoptimized
              />
              <button
                onClick={() => setCollapsed(v => !v)}
                className="absolute right-3 flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-[#f0e8dc] transition"
              >
                <Menu size={18} />
              </button>
            </>
          )}
        </div>

        {!collapsed && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Portal</p>
          </div>
        )}

        <nav className={`flex-1 space-y-0.5 px-2 pt-2`}>
          <NavItems />
        </nav>

        <div className="px-2 py-4 border-t border-[#f0e8dc]">
          <button
            onClick={handleLogout}
            title={collapsed ? 'Keluar' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition active:scale-[0.98] ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && 'Keluar'}
          </button>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-[#f0e8dc] bg-[#FFF8F0] transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#f0e8dc] h-14 px-4">
          <Image
            src="https://lh3.googleusercontent.com/d/1TpFd2rJxeYrmtmyjl6L-6cQrX9sQI1fi"
            alt="Bolen Katresna"
            width={110}
            height={50}
            className="h-9 w-auto object-contain"
            unoptimized
          />
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-[#f0e8dc] transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-4 pb-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Portal</p>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 pt-2">
          <NavItems onClickItem={() => setMobileOpen(false)} />
        </nav>

        <div className="px-2 py-4 border-t border-[#f0e8dc]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition active:scale-[0.98]"
          >
            <LogOut size={17} className="shrink-0" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          collapsed ? 'lg:ml-[60px]' : 'lg:ml-56'
        }`}
      >
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-[#FFF8F0] border-b border-[#f0e8dc] sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-[#f0e8dc] transition"
          >
            <Menu size={20} />
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

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
