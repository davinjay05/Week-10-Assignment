import { NextRequest, NextResponse } from 'next/server'

const allTimeZones = [
  { name: 'New York', country: 'US', tz: 'America/New_York' },
  { name: 'Los Angeles', country: 'US', tz: 'America/Los_Angeles' },
  { name: 'Chicago', country: 'US', tz: 'America/Chicago' },
  { name: 'Denver', country: 'US', tz: 'America/Denver' },
  { name: 'Phoenix', country: 'US', tz: 'America/Phoenix' },
  { name: 'Anchorage', country: 'US', tz: 'America/Anchorage' },
  { name: 'Honolulu', country: 'US', tz: 'Pacific/Honolulu' },
  { name: 'Toronto', country: 'CA', tz: 'America/Toronto' },
  { name: 'Vancouver', country: 'CA', tz: 'America/Vancouver' },
  { name: 'Mexico City', country: 'MX', tz: 'America/Mexico_City' },
  { name: 'São Paulo', country: 'BR', tz: 'America/Sao_Paulo' },
  { name: 'Buenos Aires', country: 'AR', tz: 'America/Argentina/Buenos_Aires' },
  { name: 'Santiago', country: 'CL', tz: 'America/Santiago' },
  { name: 'Lima', country: 'PE', tz: 'America/Lima' },
  { name: 'Bogotá', country: 'CO', tz: 'America/Bogota' },
  { name: 'Reykjavik', country: 'IS', tz: 'Atlantic/Reykjavik' },
  { name: 'London', country: 'GB', tz: 'Europe/London' },
  { name: 'Paris', country: 'FR', tz: 'Europe/Paris' },
  { name: 'Berlin', country: 'DE', tz: 'Europe/Berlin' },
  { name: 'Rome', country: 'IT', tz: 'Europe/Rome' },
  { name: 'Madrid', country: 'ES', tz: 'Europe/Madrid' },
  { name: 'Amsterdam', country: 'NL', tz: 'Europe/Amsterdam' },
  { name: 'Stockholm', country: 'SE', tz: 'Europe/Stockholm' },
  { name: 'Oslo', country: 'NO', tz: 'Europe/Oslo' },
  { name: 'Helsinki', country: 'FI', tz: 'Europe/Helsinki' },
  { name: 'Warsaw', country: 'PL', tz: 'Europe/Warsaw' },
  { name: 'Prague', country: 'CZ', tz: 'Europe/Prague' },
  { name: 'Vienna', country: 'AT', tz: 'Europe/Vienna' },
  { name: 'Athens', country: 'GR', tz: 'Europe/Athens' },
  { name: 'Istanbul', country: 'TR', tz: 'Europe/Istanbul' },
  { name: 'Moscow', country: 'RU', tz: 'Europe/Moscow' },
  { name: 'Cairo', country: 'EG', tz: 'Africa/Cairo' },
  { name: 'Lagos', country: 'NG', tz: 'Africa/Lagos' },
  { name: 'Nairobi', country: 'KE', tz: 'Africa/Nairobi' },
  { name: 'Johannesburg', country: 'ZA', tz: 'Africa/Johannesburg' },
  { name: 'Casablanca', country: 'MA', tz: 'Africa/Casablanca' },
  { name: 'Dubai', country: 'AE', tz: 'Asia/Dubai' },
  { name: 'Riyadh', country: 'SA', tz: 'Asia/Riyadh' },
  { name: 'Baghdad', country: 'IQ', tz: 'Asia/Baghdad' },
  { name: 'Tehran', country: 'IR', tz: 'Asia/Tehran' },
  { name: 'Karachi', country: 'PK', tz: 'Asia/Karachi' },
  { name: 'Kolkata', country: 'IN', tz: 'Asia/Kolkata' },
  { name: 'Dhaka', country: 'BD', tz: 'Asia/Dhaka' },
  { name: 'Colombo', country: 'LK', tz: 'Asia/Colombo' },
  { name: 'Bangkok', country: 'TH', tz: 'Asia/Bangkok' },
  { name: 'Jakarta', country: 'ID', tz: 'Asia/Jakarta' },
  { name: 'Singapore', country: 'SG', tz: 'Asia/Singapore' },
  { name: 'Kuala Lumpur', country: 'MY', tz: 'Asia/Kuala_Lumpur' },
  { name: 'Manila', country: 'PH', tz: 'Asia/Manila' },
  { name: 'Hong Kong', country: 'HK', tz: 'Asia/Hong_Kong' },
  { name: 'Taipei', country: 'TW', tz: 'Asia/Taipei' },
  { name: 'Beijing', country: 'CN', tz: 'Asia/Shanghai' },
  { name: 'Seoul', country: 'KR', tz: 'Asia/Seoul' },
  { name: 'Tokyo', country: 'JP', tz: 'Asia/Tokyo' },
  { name: 'Sydney', country: 'AU', tz: 'Australia/Sydney' },
  { name: 'Melbourne', country: 'AU', tz: 'Australia/Melbourne' },
  { name: 'Brisbane', country: 'AU', tz: 'Australia/Brisbane' },
  { name: 'Perth', country: 'AU', tz: 'Australia/Perth' },
  { name: 'Adelaide', country: 'AU', tz: 'Australia/Adelaide' },
  { name: 'Auckland', country: 'NZ', tz: 'Pacific/Auckland' },
  { name: 'Fiji', country: 'FJ', tz: 'Pacific/Fiji' },
]

export async function GET() {
  return NextResponse.json({ zones: allTimeZones })
}

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { tz } = (body ?? {}) as Record<string, unknown>
  if (!tz || typeof tz !== 'string') {
    return NextResponse.json({ error: 'tz is required (IANA timezone string)' }, { status: 400 })
  }

  const zone = allTimeZones.find((z) => z.tz === tz)
  if (!zone) {
    return NextResponse.json({ error: `Unknown timezone: ${tz}` }, { status: 404 })
  }

  return NextResponse.json({ status: 'ok', zone })
}

export async function DELETE(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { tz } = (body ?? {}) as Record<string, unknown>
  if (!tz || typeof tz !== 'string') {
    return NextResponse.json({ error: 'tz is required (IANA timezone string)' }, { status: 400 })
  }

  const exists = allTimeZones.some((z) => z.tz === tz)
  if (!exists) {
    return NextResponse.json({ error: `Unknown timezone: ${tz}` }, { status: 404 })
  }

  return NextResponse.json({ status: 'ok', removed: tz })
}
