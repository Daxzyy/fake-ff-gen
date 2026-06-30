import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lobby Card Generator',
  description: 'Lobby card generator by @givy.',
  icons: {
    icon: '/og-image.jpg',
  },
  openGraph: {
    title: 'Lobby Card Generator',
    description: 'Lobby card generator by @givy.',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Lobby Card Generator',
    description: 'Lobby card generator by @givy.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
