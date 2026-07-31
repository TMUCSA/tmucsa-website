import { redirect } from 'next/navigation'
import AdminLogin from '@/components/admin/AdminLogin'
import { getAdminUser } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  const admin = await getAdminUser()
  if (admin) redirect('/admin/dashboard')
  return <AdminLogin />
}
