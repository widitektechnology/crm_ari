import { useState, useEffect } from 'react'
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'

export default function Header({ setSidebarOpen }) {
  const [backendStatus, setBackendStatus] = useState('Verificando...')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Actualizar hora cada segundo
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Verificar estado del backend
    const checkBackend = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://crm.arifamilyassets.com'
        const response = await fetch(`${baseUrl}/health`)
        
        if (response.ok) {
          setBackendStatus('✅ Conectado')
        } else {
          setBackendStatus('❌ Error')
        }
      } catch (error) {
        setBackendStatus('❌ Desconectado')
      }
    }

    checkBackend()
    const statusInterval = setInterval(checkBackend, 30000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(statusInterval)
    }
  }, [])

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Abrir sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separador */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 justify-between items-center">
        {/* Información del sistema */}
        <div className="flex items-center gap-x-4 text-sm text-gray-500">
          <div className="hidden sm:block">
            Sistema: {backendStatus}
          </div>
          <div className="hidden md:block">
            {currentTime.toLocaleString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notificaciones */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Ver notificaciones</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Usuario */}
          <div className="flex items-center gap-x-2">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <div className="hidden lg:block text-sm">
              <p className="font-semibold text-gray-900">Usuario Admin</p>
              <p className="text-gray-500">admin@crm.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}