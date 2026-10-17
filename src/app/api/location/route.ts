import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) return NextResponse.json({ error: 'Missing lat/lon' }, { status: 400 })

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=id`,
      { headers: { 'User-Agent': 'KatresnaApp/1.0' } }
    )
    const data = await res.json()

    const address = data.address
    const formatted = [
      address?.road,
      address?.suburb || address?.neighbourhood,
      address?.city_district || address?.quarter,
      address?.city || address?.town || address?.village,
      address?.state,
    ].filter(Boolean).join(', ')

    return NextResponse.json({ address: formatted, raw: address })
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
