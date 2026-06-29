import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import os from 'os'
import path from 'path'

const rateMap = new Map<string, { count: number; reset: number }>()

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

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

function getBrowser(ua: string): string {
  if (/Edg\//i.test(ua))          return 'Microsoft Edge'
  if (/OPR\/|Opera/i.test(ua))    return 'Opera'
  if (/SamsungBrowser/i.test(ua)) return 'Samsung Browser'
  if (/UCBrowser/i.test(ua))      return 'UC Browser'
  if (/YaBrowser/i.test(ua))      return 'Yandex Browser'
  if (/Firefox\//i.test(ua))      return 'Firefox'
  if (/Chrome\//i.test(ua))       return 'Chrome'
  if (/Safari\//i.test(ua))       return 'Safari'
  if (/MSIE|Trident/i.test(ua))   return 'Internet Explorer'
  return 'Unknown Browser'
}

function getDevice(ua: string): string {
  if (/iPad/i.test(ua))                           return 'iPad (iOS)'
  if (/iPhone/i.test(ua))                         return 'iPhone (iOS)'
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return 'Android Phone'
  if (/Android/i.test(ua))                        return 'Android Tablet'
  if (/Windows NT/i.test(ua))                     return 'Windows PC'
  if (/Macintosh|Mac OS X/i.test(ua))             return 'Mac'
  if (/Linux/i.test(ua))                          return 'Linux'
  return 'Unknown Device'
}

async function sendTelegramNotif(
  req: NextRequest,
  username: string,
  lobby: number | string
) {
  const botToken = process.env.TG_BOT_TOKEN
  const chatId   = process.env.TG_CHAT_ID
  if (!botToken || !chatId) return

  const ip      = getIP(req)
  const ua      = req.headers.get('user-agent') || ''
  const browser = getBrowser(ua)
  const device  = getDevice(ua)
  const ts      = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })

  let city = '?', region = '?', country = '?', isp = '?'
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,isp,status`, {
      signal: AbortSignal.timeout(3000),
    })
    const geo = await geoRes.json()
    if (geo.status === 'success') {
      city    = geo.city
      region  = geo.regionName
      country = geo.country
      isp     = geo.isp
    }
  } catch (_) {}

  const lobbyLabel = lobby === 0 || lobby === 'random' ? 'Random' : `#${lobby}`

  const caption = [
    `<blockquote>🎴 <b>FF Lobby Card Generator</b></blockquote>`,
    ``,
    `<b>⚔️ Card Info</b>`,
    `👤 <b>Username</b> › <code>${username}</code>`,
    `🗺 <b>Lobby</b>    › ${lobbyLabel}`,
    ``,
    `<b>🌐 Visitor Info</b>`,
    `🔌 <b>IP</b>      › <code>${ip}</code>`,
    `📍 <b>Kota</b>    › ${city}, ${region}`,
    `🌍 <b>Negara</b>  › ${country}`,
    `📡 <b>ISP</b>     › ${isp}`,
    `🖥 <b>Device</b>  › ${device}`,
    `🌏 <b>Browser</b> › ${browser}`,
    ``,
    `<blockquote>🕐 ${ts}</blockquote>`,
  ].join('\n')

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: caption, parse_mode: 'HTML' }),
    })
  } catch (_) {}
}

export async function POST(req: NextRequest) {
  try {
    const ip = getIP(req)
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

    const outputDir = path.join(os.tmpdir(), `ff-out-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    fs.mkdirSync(outputDir, { recursive: true })

    const result = await generateFF({ username, lobby, outputDir })

    if (result.status !== 'success') {
      return NextResponse.json({ error: 'Generation failed.' }, { status: 500 })
    }

    const imgBuffer = fs.readFileSync(result.result)
    const base64 = `data:image/png;base64,${imgBuffer.toString('base64')}`

    try { fs.rmSync(outputDir, { recursive: true, force: true }) } catch {}

    sendTelegramNotif(req, username, rawLobby ?? 'random').catch(() => {})

    return NextResponse.json({ username: result.username, lobby: result.lobby, image: base64 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
