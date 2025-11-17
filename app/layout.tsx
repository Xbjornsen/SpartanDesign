import './globals.css'
import ClientLayout from '@/components/ClientLayout'

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
