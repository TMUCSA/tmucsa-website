'use client'

/* eslint-disable @next/next/no-img-element */
// Google profile photos are short-lived external URLs and should bypass image optimization.
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import AdminIcon from './AdminIcon'
import AdminAccessModal from './AdminAccessModal'

const navigation = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/events', label: 'Events', icon: 'events' },
  { href: '/admin/links', label: 'Links', icon: 'links' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
  { href: '/admin/team', label: 'Team', icon: 'team' },
  { href: '/admin/content', label: 'Website Content', icon: 'content' },
  { href: '/admin/media', label: 'Media', icon: 'media' },
]

function initials(name) {
  return String(name || 'Admin')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function AdminShell({ admin, children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [managingAdmins, setManagingAdmins] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await fetch('/api/auth/session', { method: 'DELETE' })
      await signOut(auth)
      router.push('/admin/login')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  const sidebar = (
    <aside className="flex h-full w-[280px] flex-col border-r border-white/10 bg-[#0A091C] px-5 py-6 text-white">
      <div className="flex items-center justify-between px-2">
        <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image src="/icons/logo5.png" alt="TMUCSA" width={48} height={48} className="h-11 w-11" />
          <div>
            <p className="font-josefin text-lg font-semibold tracking-wider">TMUCSA</p>
            <p className="text-[10px] tracking-[0.22em] text-[#FFF4E2]/55">CONTENT STUDIO</p>
          </div>
        </Link>
        <button className="rounded-lg p-2 text-white/60 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
          <AdminIcon name="close" />
        </button>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-1.5">
        <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.2em] text-white/30">WORKSPACE</p>
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                active
                  ? 'bg-[#FFF4E2] font-medium text-[#0A081B] shadow-lg shadow-black/10'
                  : 'text-white/55 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <AdminIcon name={item.icon} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 pt-5">
        {admin.isOwner ? (
          <button type="button" onClick={() => { setOpen(false); setManagingAdmins(true) }} className="mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/45 transition hover:bg-white/[0.05] hover:text-white">
            Manage administrators
            <AdminIcon name="settings" className="h-4 w-4" />
          </button>
        ) : null}
        <a href="/" target="_blank" className="mb-4 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/45 transition hover:bg-white/[0.05] hover:text-white">
          View public site
          <AdminIcon name="arrow" className="h-4 w-4 -rotate-45" />
        </a>
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
          {admin.picture ? (
            <img src={admin.picture} alt="" className="h-10 w-10 rounded-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25487D] text-xs font-semibold">{initials(admin.name)}</div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{admin.name}</p>
            <p className="truncate text-xs text-white/35">{admin.email}</p>
          </div>
          <button onClick={handleSignOut} disabled={signingOut} className="rounded-lg p-2 text-white/35 hover:bg-white/10 hover:text-white" aria-label="Sign out">
            <AdminIcon name="logout" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#F4F2ED] font-jost text-[#161329]">
      <div className="fixed inset-y-0 left-0 z-50 hidden lg:block">{sidebar}</div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />
          <div className="relative h-full">{sidebar}</div>
        </div>
      ) : null}

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#161329]/10 bg-[#F4F2ED]/90 px-5 backdrop-blur-xl sm:px-8 lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-xl border border-[#161329]/10 bg-white p-2.5" aria-label="Open navigation">
            <AdminIcon name="menu" />
          </button>
          <p className="font-josefin font-semibold tracking-wider">TMUCSA ADMIN</p>
          <div className="h-10 w-10" />
        </header>
        {children}
      </div>
      {managingAdmins ? <AdminAccessModal currentEmail={admin.email} onClose={() => setManagingAdmins(false)} /> : null}
    </div>
  )
}
