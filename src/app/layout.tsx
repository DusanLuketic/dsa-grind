import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Sidebar } from '@/components/layout/Sidebar'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DSA Grind',
  description: 'Track your progress through 150 NeetCode problems',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-background text-foreground min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar solvedCount={0} totalCount={150} />
          <main className="flex-1 overflow-auto lg:pl-[260px]">
            <Breadcrumbs />
            {children}
          </main>
        </div>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
