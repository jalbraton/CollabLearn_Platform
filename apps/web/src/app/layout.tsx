import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CollabLearn Platform - Collaborative Learning & Knowledge Management',
  description: 'A powerful platform for collaborative learning, knowledge management, and team documentation',
  keywords: ['collaboration', 'learning', 'knowledge base', 'documentation', 'team workspace'],
  authors: [{ name: 'CollabLearn Team' }],
  openGraph: {
    title: 'CollabLearn Platform',
    description: 'Collaborative Learning & Knowledge Management Platform',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
