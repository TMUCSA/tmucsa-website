'use client'

import { usePathname } from 'next/navigation'
import Navbar from './navbar'
import Footer from './footer'
import { SiteContentProvider, SiteContentStatus, useSiteContent } from './SiteContentProvider'
import AnalyticsTracker from './AnalyticsTracker'
import TicketPrompt from './TicketPrompt'

function PublicContent({ children }) {
  const global = useSiteContent('global')
  if (!global) return <main className="min-h-screen flex items-center justify-center"><SiteContentStatus /></main>
  return <><Navbar />{children}<Footer /><TicketPrompt /></>
}

export default function SiteChrome({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <SiteContentProvider>
      <AnalyticsTracker />
      {isAdmin ? children : <PublicContent>{children}</PublicContent>}
    </SiteContentProvider>
  )
}
