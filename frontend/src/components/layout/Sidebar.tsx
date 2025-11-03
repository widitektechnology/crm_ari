'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CpuChipIcon,
  LinkIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Vista general del sistema'
  },
  {
    name: 'Empresas',
    href: '/dashboard/companies',
    icon: BuildingOfficeIcon,
    description: 'Gestión de empresas'
  },
  {
    name: 'Recursos Humanos',
    href: '/dashboard/payroll',
    icon: UsersIcon,
    description: 'Empleados y nómina'
  },
  {
    name: 'Finanzas',
    href: '/dashboard/finance',
    icon: CurrencyDollarIcon,
    description: 'Facturación y contabilidad'
  },
  {
    name: 'Inteligencia Artificial',
    href: '/dashboard/ai',
    icon: CpuChipIcon,
    description: 'Servicios de IA'
  },
  {
    name: 'Integraciones',
    href: '/dashboard/integrations',
    icon: LinkIcon,
    description: 'APIs externas'
  },
  {
    name: 'Configuración',
    href: '/dashboard/settings',
    icon: Cog6ToothIcon,
    description: 'Configuración del sistema'
  },
]

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          className="bg-gray-900 text-white p-2 rounded-md shadow-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        <div className="flex h-full flex-col bg-gray-900">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-800">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <CpuChipIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-white">ERP Sistema</h1>
                <p className="text-xs text-gray-400">Empresarial</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                             (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-400 truncate">
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
                <span className="text-sm font-medium text-white">AD</span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Administrador
                </p>
                <p className="text-xs text-gray-400 truncate">
                  admin@erp-sistema.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}