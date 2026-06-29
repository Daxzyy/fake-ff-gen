import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FF Lobby Card Generator',
  description: 'Generate fake Free Fire lobby cards — fan-made tool, not affiliated with Garena.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
