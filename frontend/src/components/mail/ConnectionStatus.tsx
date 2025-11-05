import { useState, useEffect } from 'react'
import { useMail } from '../../contexts/MailContext'
import { MailConnectionService } from '../../services/mailConnection'

const mailConnectionService = new MailConnectionService()

interface ConnectionStatusProps {
  className?: string
}

export default function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const { accounts } = useMail()
  const [connectionStates, setConnectionStates] = useState<Record<string, {
    imap: 'connected' | 'disconnected' | 'error' | 'testing'
    smtp: 'connected' | 'disconnected' | 'error' | 'testing'
    lastSync?: Date
    error?: string
  }>>({})

  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Verificar conexiones cada 30 segundos
    const checkConnections = async () => {
      for (const account of accounts) {
        try {
          setConnectionStates(prev => ({
            ...prev,
            [account.id]: { ...prev[account.id], imap: 'testing', smtp: 'testing' }
          }))

          const result = await mailConnectionService.testConnection({
            incoming: account.settings?.incoming || { server: '', port: 993, ssl: true, username: '', password: '' },
            outgoing: account.settings?.outgoing || { server: '', port: 587, ssl: true, username: '', password: '' }
          })

          setConnectionStates(prev => ({
            ...prev,
            [account.id]: {
              imap: result.success ? 'connected' : 'error',
              smtp: result.success ? 'connected' : 'error',
              lastSync: new Date(),
              error: result.success ? undefined : result.error
            }
          }))
        } catch (error) {
          setConnectionStates(prev => ({
            ...prev,
            [account.id]: {
              imap: 'error',
              smtp: 'error',
              lastSync: new Date(),
              error: error instanceof Error ? error.message : 'Error desconocido'
            }
          }))
        }
      }
    }

    if (accounts.length > 0) {
      checkConnections()
      const interval = setInterval(checkConnections, 30000) // 30 segundos
      return () => clearInterval(interval)
    }
  }, [accounts])

  const getOverallStatus = () => {
    if (accounts.length === 0) return 'no-accounts'
    
    const states = Object.values(connectionStates)
    if (states.length === 0) return 'checking'

    const hasError = states.some(state => state.imap === 'error' || state.smtp === 'error')
    const hasTesting = states.some(state => state.imap === 'testing' || state.smtp === 'testing')
    const allConnected = states.every(state => state.imap === 'connected' && state.smtp === 'connected')

    if (hasError) return 'error'
    if (hasTesting) return 'checking'
    if (allConnected) return 'connected'
    return 'partial'
  }

  const getStatusInfo = () => {
    const status = getOverallStatus()
    
    switch (status) {
      case 'no-accounts':
        return {
          icon: '📭',
          text: 'Sin cuentas configuradas',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100'
        }
      case 'checking':
        return {
          icon: '🔄',
          text: 'Verificando conexiones...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        }
      case 'connected':
        return {
          icon: '✅',
          text: 'Todas las cuentas conectadas',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      case 'partial':
        return {
          icon: '⚠️',
          text: 'Conexiones parciales',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        }
      case 'error':
        return {
          icon: '❌',
          text: 'Error en conexiones',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        }
      default:
        return {
          icon: '❓',
          text: 'Estado desconocido',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className={`${className}`}>
      {/* Estado general */}
      <div 
        className={`${statusInfo.bgColor} ${statusInfo.color} px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{statusInfo.icon}</span>
            <span className="text-sm font-medium">{statusInfo.text}</span>
          </div>
          <div className="flex items-center space-x-2">
            {accounts.length > 0 && (
              <span className="text-xs bg-black bg-opacity-10 px-2 py-1 rounded-full">
                {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''}
              </span>
            )}
            <span className={`text-xs transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Detalles expandibles */}
      {showDetails && accounts.length > 0 && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">Estado por cuenta</h4>
          </div>
          
          <div className="divide-y divide-gray-200">
            {accounts.map((account) => {
              const state = connectionStates[account.id]
              
              return (
                <div key={account.id} className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {account.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {account.email}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Estado IMAP */}
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">IMAP:</span>
                        <StatusIndicator status={state?.imap || 'disconnected'} />
                      </div>
                      
                      {/* Estado SMTP */}
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">SMTP:</span>
                        <StatusIndicator status={state?.smtp || 'disconnected'} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Información adicional */}
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>📧 {account.unreadCount || 0} sin leer</span>
                      <span>📁 {account.totalCount || 0} total</span>
                    </div>
                    
                    {state?.lastSync && (
                      <span>
                        Última verificación: {state.lastSync.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Error si existe */}
                  {state?.error && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      ⚠️ {state.error}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Información del backend */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>🔌 Backend API Status</span>
              <BackendStatus />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusIndicator({ status }: { status: 'connected' | 'disconnected' | 'error' | 'testing' }) {
  const config = {
    connected: { icon: '🟢', tooltip: 'Conectado' },
    disconnected: { icon: '⚫', tooltip: 'Desconectado' },
    error: { icon: '🔴', tooltip: 'Error de conexión' },
    testing: { icon: '🟡', tooltip: 'Verificando...' }
  }

  const { icon, tooltip } = config[status]

  return (
    <span 
      className="text-xs cursor-help" 
      title={tooltip}
    >
      {icon}
    </span>
  )
}

function BackendStatus() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Intentar hacer una petición simple al backend
        const response = await fetch('/api/health', { 
          method: 'GET',
          timeout: 5000 
        } as any)
        
        setBackendStatus(response.ok ? 'online' : 'offline')
      } catch (error) {
        setBackendStatus('offline')
      }
    }

    checkBackend()
    const interval = setInterval(checkBackend, 60000) // Verificar cada minuto
    
    return () => clearInterval(interval)
  }, [])

  const statusConfig = {
    checking: { icon: '🟡', text: 'Verificando...' },
    online: { icon: '✅', text: 'En línea' },
    offline: { icon: '❌', text: 'Sin conexión al backend' }
  }

  const { icon, text } = statusConfig[backendStatus]

  return (
    <div className="flex items-center space-x-1">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  )
}