'use client'

import { usePathname } from 'next/navigation'
import Navbar from './navbar'
import Footer from './footer'
import { SiteContentProvider } from './SiteContentProvider'
import AnalyticsTracker from './AnalyticsTracker'
import TicketPrompt from './TicketPrompt'

export default function SiteChrome({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <SiteContentProvider>
      <AnalyticsTracker />
      {!isAdmin ? <Navbar /> : null}
      <main>{children}</main>
      {!isAdmin ? <Footer /> : null}
      {!isAdmin ? <TicketPrompt /> : null}
    </SiteContentProvider>
  )
}
