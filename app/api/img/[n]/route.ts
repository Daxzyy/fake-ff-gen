import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { n: string } }
) {
  const n = parseInt(params.n, 10)
  if (isNaN(n) || n < 1 || n > 30) {
    return new NextResponse('Not found', { status: 404 })
  }

  const upstream = `https://raw.githubusercontent.com/Ditzzx-vibecoder/fake-ff/main/assets/lobby/${n}.jpg`

  const res = await fetch(upstream, { next: { revalidate: 86400 } })
  if (!res.ok) return new NextResponse('Not found', { status: 404 })

  const buf = await res.arrayBuffer()
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}
