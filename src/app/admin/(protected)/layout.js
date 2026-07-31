import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin-auth'
import AdminShell from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export default async function ProtectedAdminLayout({ children }) {
  const admin = await getAdminUser()
  if (!admin) redirect('/admin/login')
  return <AdminShell admin={admin}>{children}</AdminShell>
}
