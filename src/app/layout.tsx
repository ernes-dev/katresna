import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import RefCapture from '@/components/RefCapture'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bolen Katresna',
  description: 'Pesan bolen & minuman dari Bolen Katresna, Bandung',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <RefCapture />
        {children}
      </body>
    </html>
  )
}
