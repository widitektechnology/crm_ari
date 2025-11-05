import { useState, useEffect } from 'react'
import { useMail } from '../../contexts/MailContext'
import { detectProvider, generateAutoConfig, validateAccountConfig } from '../../config/mailProviders'
import type { AccountSetupProps, MailAccount } from '../../types/mail'

export default function AccountSetup({ onAccountAdded, onCancel, initialData }: AccountSetupProps) {
  const { addAccount } = useMail()
  
  const [step, setStep] = useState<'basic' | 'manual' | 'testing'>('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  
  const [formData, setFormData] = useState<Partial<MailAccount>>({
    name: '',
    email: '',
    provider: 'gmail',
    settings: {
      incoming: {
        server: '',
        port: 993,
        ssl: true,
        username: '',
        password: ''
      },
      outgoing: {
        server: '',
        port: 587,
        ssl: true,
        username: '',
        password: ''
      }
    },
    isActive: true,
    isDefault: false,
    lastSync: new Date(),
    unreadCount: 0,
    totalCount: 0
  })

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    if (!formData.name?.trim()) {
      setErrors(['El nombre es requerido'])
      return
    }

    if (!formData.email?.trim()) {
      setErrors(['El email es requerido'])
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors(['El formato del email no es válido'])
      return
    }

    // Intentar autoconfiguración
    const autoConfig = generateAutoConfig(formData.email, formData.name)
    
    if (autoConfig) {
      setFormData(prev => ({
        ...prev,
        ...autoConfig,
        settings: {
          incoming: {
            ...autoConfig.settings!.incoming,
            username: formData.email || '',
            password: ''
          },
          outgoing: {
            ...autoConfig.settings!.outgoing,
            username: formData.email || '',
            password: ''
          }
        }
      }))
      setStep('manual')
    } else {
      // Si no se puede autoconfigurar, ir a configuración manual
      setFormData(prev => ({
        ...prev,
        provider: 'imap',
        settings: {
          incoming: {
            server: '',
            port: 993,
            ssl: true,
            username: formData.email || '',
            password: ''
          },
          outgoing: {
            server: '',
            port: 587,
            ssl: true,
            username: formData.email || '',
            password: ''
          }
        }
      }))
      setStep('manual')
    }
  }

  const handleManualConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    const validationErrors = validateAccountConfig(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setStep('testing')
    setIsLoading(true)

    try {
      // Simular prueba de conexión
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Simular que la conexión fue exitosa
      await addAccount(formData as Omit<MailAccount, 'id' | 'created_at'>)
      onAccountAdded(formData as MailAccount)
    } catch (error) {
      setErrors(['Error al conectar con el servidor. Verifica la configuración.'])
      setStep('manual')
    } finally {
      setIsLoading(false)
    }
  }

  const getProviderInfo = () => {
    const provider = detectProvider(formData.email || '')
    if (provider) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{provider.icon}</span>
            <span className="font-medium text-blue-900">{provider.name}</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Configuración detectada automáticamente
          </p>
        </div>
      )
    }
    return null
  }

  if (step === 'testing') {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Probando conexión...
        </h3>
        <p className="text-gray-600">
          Verificando la configuración del servidor
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex">
            <span className="text-red-400">⚠️</span>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error en la configuración
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'basic' && (
        <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la cuenta
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mi cuenta de correo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección de correo
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          {getProviderInfo()}

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {step === 'manual' && (
        <form onSubmit={handleManualConfigSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Configuración del servidor
            </h3>
            
            {getProviderInfo()}

            {/* Servidor entrante */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Servidor entrante (IMAP)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servidor
                  </label>
                  <input
                    type="text"
                    value={formData.settings?.incoming.server || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings!,
                        incoming: { ...prev.settings!.incoming, server: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="imap.ejemplo.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puerto
                  </label>
                  <input
                    type="number"
                    value={formData.settings?.incoming.port || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings!,
                        incoming: { ...prev.settings!.incoming, port: parseInt(e.target.value) }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="incomingSsl"
                    checked={formData.settings?.incoming.ssl || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings!,
                        incoming: { ...prev.settings!.incoming, ssl: e.target.checked }
                      }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="incomingSsl" className="ml-2 text-sm text-gray-700">
                    SSL/TLS
                  </label>
                </div>
              </div>
            </div>

            {/* Servidor saliente */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Servidor saliente (SMTP)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servidor
                  </label>
                  <input
                    type="text"
                    value={formData.settings?.outgoing.server || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings!,
                        outgoing: { ...prev.settings!.outgoing, server: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="smtp.ejemplo.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puerto
                  </label>
                  <input
                    type="number"
                    value={formData.settings?.outgoing.port || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings!,
                        outgoing: { ...prev.settings!.outgoing, port: parseInt(e.target.value) }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="outgoingSsl"
                    checked={formData.settings?.outgoing.ssl || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings!,
                        outgoing: { ...prev.settings!.outgoing, ssl: e.target.checked }
                      }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="outgoingSsl" className="ml-2 text-sm text-gray-700">
                    SSL/TLS
                  </label>
                </div>
              </div>
            </div>

            {/* Credenciales */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  value={formData.settings?.incoming.username || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: {
                      incoming: { ...prev.settings!.incoming, username: e.target.value },
                      outgoing: { ...prev.settings!.outgoing, username: e.target.value }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={formData.settings?.incoming.password || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: {
                      incoming: { ...prev.settings!.incoming, password: e.target.value },
                      outgoing: { ...prev.settings!.outgoing, password: e.target.value }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setStep('basic')}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Probando...' : 'Conectar'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}