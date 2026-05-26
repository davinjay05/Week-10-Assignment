import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function ensureUser(uid: string, email: string, name?: string | null) {
  await prisma.user.upsert({
    where: { id: uid },
    update: {},
    create: { id: uid, email, name: name ?? null },
  })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const alarms = await prisma.alarm.findMany({
      where: { userId: session.uid },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ alarms })
  } catch (err) {
    console.error('[GET /api/alarms]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { time, label } = (body ?? {}) as Record<string, unknown>
  if (!time || typeof time !== 'string') {
    return NextResponse.json({ error: 'time is required' }, { status: 400 })
  }
  if (!label || typeof label !== 'string') {
    return NextResponse.json({ error: 'label is required' }, { status: 400 })
  }

  try {
    await ensureUser(session.uid, session.email ?? '', session.name)
    const alarm = await prisma.alarm.create({
      data: { userId: session.uid, time, label },
    })
    return NextResponse.json({ alarm })
  } catch (err) {
    console.error('[POST /api/alarms]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { id } = (body ?? {}) as Record<string, unknown>
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    const existing = await prisma.alarm.findFirst({ where: { id, userId: session.uid } })
    if (!existing) return NextResponse.json({ error: 'Alarm not found' }, { status: 404 })

    const alarm = await prisma.alarm.update({
      where: { id },
      data: { active: !existing.active },
    })
    return NextResponse.json({ alarm })
  } catch (err) {
    console.error('[PATCH /api/alarms]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { id } = (body ?? {}) as Record<string, unknown>
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    const existing = await prisma.alarm.findFirst({ where: { id, userId: session.uid } })
    if (!existing) return NextResponse.json({ error: 'Alarm not found' }, { status: 404 })

    await prisma.alarm.delete({ where: { id } })
    return NextResponse.json({ status: 'ok', deleted: id })
  } catch (err) {
    console.error('[DELETE /api/alarms]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
