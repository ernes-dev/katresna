import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { origin_district_id, destination_district_id, weight_gram } = await req.json()

  if (!origin_district_id || !destination_district_id || !weight_gram) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const apiKey = process.env.API_CO_ID_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const url = new URL('https://use.api.co.id/courier/v2/rates')
    url.searchParams.set('origin_district_code', origin_district_id)
    url.searchParams.set('destination_district_code', destination_district_id)
    url.searchParams.set('weight', String(weight_gram))
    url.searchParams.set('couriers', 'jne,jnt,sicepat,anteraja,ninja,sap,lion,idx')

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'x-api-co-id': apiKey },
    })

    const data = await res.json()

    if (!data.is_success) {
      return NextResponse.json({ error: data.message || 'Failed to get rates' }, { status: 400 })
    }

    const raw: Array<{
      courier_code: string; courier_name: string; service_name: string; service_type: string;
      price: number; etd: string | null; is_cheapest: boolean
    }> = data.data?.rates || []

    // Exclude cargo/trucking services (too heavy for bakery items)
    const filtered = raw.filter(r => r.service_type !== 'Cargo')

    // Convert price from IDR-cents to IDR, fix field names
    const normalized = filtered.map(r => ({
      courier: r.courier_name,
      service: r.service_name,
      price: Math.round(r.price / 100),
      etd: r.etd ? `${r.etd} hari` : '-',
      is_cheapest: false,
    })).sort((a, b) => a.price - b.price)

    if (normalized.length > 0) normalized[0].is_cheapest = true

    return NextResponse.json({ rates: normalized })
  } catch {
    return NextResponse.json({ error: 'Shipping service unavailable' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')
  const apiKey = process.env.API_CO_ID_KEY

  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  let endpoint = 'https://use.api.co.id/courier/v1/locations/provinces'
  if (type === 'cities' && id) endpoint = `https://use.api.co.id/courier/v1/locations/cities?province=${id}`
  if (type === 'districts' && id) endpoint = `https://use.api.co.id/courier/v1/locations/districts?city=${id}`

  try {
    const res = await fetch(endpoint, {
      headers: { 'x-api-co-id': apiKey },
    })
    const data = await res.json()
    return NextResponse.json(data.data || [])
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
