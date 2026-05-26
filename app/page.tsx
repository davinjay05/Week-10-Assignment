export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import ClockApp from './components/ClockApp'

export default async function Home() {
  const session = await getSession()
  if (!session) redirect('/login')

  const userName = session.name ?? session.email?.split('@')[0] ?? 'User'

  return <ClockApp userName={userName} />
}
