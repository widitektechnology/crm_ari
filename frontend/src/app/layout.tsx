import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema ERP Empresarial',
  description: 'Sistema de Planificación de Recursos Empresariales modular, escalable y configurable',
  keywords: ['ERP', 'Sistema Empresarial', 'Gestión', 'Recursos Humanos', 'Finanzas', 'IA'],
  authors: [{ name: 'Equipo de Desarrollo ERP' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}