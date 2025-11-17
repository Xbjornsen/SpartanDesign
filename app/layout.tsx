import './globals.css'

export const metadata = {
  title: 'Spartan Design - Laser Cutting',
  description: 'Design custom laser cut products',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
