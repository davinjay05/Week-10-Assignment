import { NextRequest, NextResponse } from 'next/server'

const VALID_ACTIONS = ['start', 'stop', 'reset'] as const
type TimerAction = typeof VALID_ACTIONS[number]

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 })
  }

  const { action, duration } = body as Record<string, unknown>

  if (!VALID_ACTIONS.includes(action as TimerAction)) {
    return NextResponse.json(
      { error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}` },
      { status: 400 }
    )
  }

  if (action === 'start' && duration !== undefined) {
    if (typeof duration !== 'number' || !Number.isFinite(duration) || duration <= 0) {
      return NextResponse.json(
        { error: 'duration must be a positive number (seconds)' },
        { status: 400 }
      )
    }
  }

  return NextResponse.json({
    status: 'ok',
    action,
    ...(action === 'start' && duration !== undefined && { duration }),
  })
}
