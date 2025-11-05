import { useState, useEffect } from 'react'
import { useMail } from '../../contexts/MailContext'
import { detectProvider, validateAccountConfig } from '../../config/mailProviders'
import { mailAutodiscovery } from '../../services/mailAutodiscovery'
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

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true)
    
    try {
      // Verificar cache primero
      const cachedConfig = mailAutodiscovery.getCachedConfig(formData.email, formData.name)
      
      if (cachedConfig.success && cachedConfig.config) {
        console.log('✅ Configuración encontrada en cache')
        setFormData(prev => ({ ...prev, ...cachedConfig.config }))
        setStep('manual')
        return
      }

      // Intentar autodiscovery avanzado
      console.log('🔍 Iniciando autodiscovery avanzado...')
      const discoveryResult = await mailAutodiscovery.discoverMailConfig(formData.email, formData.name)
      
      if (discoveryResult.success && discoveryResult.config) {
        console.log(`✅ Configuración encontrada via ${discoveryResult.method}`)
        setFormData(prev => ({ ...prev, ...discoveryResult.config }))
        
        // Detectar si requiere OAuth2
        const oauthInfo = mailAutodiscovery.detectOAuth2Requirement(formData.email)
        if (oauthInfo.requiresOAuth) {
          setErrors([`⚠️ ${oauthInfo.provider} requiere autenticación OAuth2. Por ahora, usa una contraseña de aplicación.`])
        }
        
        setStep('manual')
      } else {
        // Fallback: configuración manual básica
        console.log('⚠️ No se pudo autoconfigurar, usando configuración manual')
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
        
        if (discoveryResult.error) {
          setErrors([discoveryResult.error])
        }
        
        setStep('manual')
      }
    } catch (error) {
      console.error('Error durante autodiscovery:', error)
      setErrors(['Error durante la detección automática. Procede con configuración manual.'])
      setStep('manual')
    } finally {
      setIsLoading(false)
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
      // Probar conectividad real
      console.log('🔍 Probando conectividad IMAP/SMTP...')
      const connectionTest = await mailAutodiscovery.testConnection(formData)
      
      if (!connectionTest.success) {
        setErrors([connectionTest.error || 'Error al conectar con el servidor'])
        setStep('manual')
        return
      }

      console.log('✅ Conexión exitosa, agregando cuenta...')
      
      // Agregar cuenta al contexto
      await addAccount(formData as Omit<MailAccount, 'id' | 'created_at'>)
      
      // Cachear configuración exitosa para futuros usuarios
      mailAutodiscovery.cacheSuccessfulConfig(formData.email || '', formData)
      
      onAccountAdded(formData as MailAccount)
    } catch (error) {
      console.error('Error durante configuración:', error)
      setErrors(['Error al conectar con el servidor. Verifica la configuración.'])
      setStep('manual')
    } finally {
      setIsLoading(false)
    }
  }

  const getProviderInfo = () => {
    const provider = detectProvider(formData.email || '')
    const oauthInfo = mailAutodiscovery.detectOAuth2Requirement(formData.email || '')
    
    if (provider) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{provider.icon}</span>
              <span className="font-medium text-blue-900">{provider.name}</span>
            </div>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              ✅ Auto-detectado
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-blue-700">
              📧 IMAP: {provider.incoming.server}:{provider.incoming.port}
            </p>
            <p className="text-sm text-blue-700">
              📤 SMTP: {provider.outgoing.server}:{provider.outgoing.port}
            </p>
            {oauthInfo.requiresOAuth && (
              <p className="text-xs text-orange-700 bg-orange-50 rounded px-2 py-1 mt-2">
                ⚠️ Requiere OAuth2 - Usa contraseña de aplicación
              </p>
            )}
          </div>
        </div>
      )
    }
    
    // Mostrar información de autodiscovery si no se detectó proveedor conocido
    if (formData.email && step === 'manual') {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔍</span>
            <span className="font-medium text-yellow-900">Configuración personalizada</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            No se pudo detectar automáticamente. Verifica la configuración manual.
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
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Verificando servidor IMAP</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-green-600 rounded-full" style={{ animationDelay: '0.5s' }}></div>
            <span>Verificando servidor SMTP</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-purple-600 rounded-full" style={{ animationDelay: '1s' }}></div>
            <span>Validando credenciales</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Esto puede tomar unos segundos...
        </p>
      </div>
    )
  }

  // Mostrar progreso de autodiscovery durante la configuración básica
  if (isLoading && step === 'basic') {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          🔍 Detectando configuración automáticamente
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Consultando base de datos de proveedores</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-green-600 rounded-full" style={{ animationDelay: '0.3s' }}></div>
            <span>Verificando DNS SRV records</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-purple-600 rounded-full" style={{ animationDelay: '0.6s' }}></div>
            <span>Probando Microsoft Autodiscover</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-orange-600 rounded-full" style={{ animationDelay: '0.9s' }}></div>
            <span>Consultando Mozilla ISPDB</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Intentando múltiples métodos de autodiscovery...
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