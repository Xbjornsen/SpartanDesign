import type { Metadata } from 'next'
import { Inter, Cinzel } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '700', '900'],
})

export const metadata: Metadata = {
  title: 'SpartanDesign - Bold. Disciplined. Timeless.',
  description: 'A design system inspired by Spartan values of discipline, strength, and simplicity',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
