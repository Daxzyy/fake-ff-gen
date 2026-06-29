import { NextRequest, NextResponse } from 'next/server'

const rateMap = new Map<string, { count: number; reset: number }>()

function checkRate(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (!checkRate(ip)) {
      return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 })
    }

    const body = await req.json()
    const rawUsername = body.username
    const rawLobby = body.lobby

    if (typeof rawUsername !== 'string' || rawUsername.trim().length === 0) {
      return NextResponse.json({ error: 'Username is required.' }, { status: 400 })
    }

    const username = rawUsername.trim().slice(0, 20)
    const lobby = rawLobby != null && rawLobby !== 0 ? Number(rawLobby) : undefined

    const generateFF = require('fake-ff')
    const result = await generateFF({
      username,
      lobby,
      outputDir: '/tmp',
    })

    if (result.status !== 'success') {
      return NextResponse.json({ error: 'Generation failed.' }, { status: 500 })
    }

    const fs = require('fs')
    const imgBuffer = fs.readFileSync(result.result)
    const base64 = `data:image/png;base64,${imgBuffer.toString('base64')}`

    try { fs.unlinkSync(result.result) } catch {}

    return NextResponse.json({ username: result.username, lobby: result.lobby, image: base64 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
