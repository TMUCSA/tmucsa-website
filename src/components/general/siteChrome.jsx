'use client'

import { usePathname } from 'next/navigation'
import Navbar from './navbar'
import Footer from './footer'
import { SiteContentProvider } from './SiteContentProvider'

export default function SiteChrome({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <SiteContentProvider>
      {!isAdmin ? <Navbar /> : null}
      <main>{children}</main>
      {!isAdmin ? <Footer /> : null}
    </SiteContentProvider>
  )
}
