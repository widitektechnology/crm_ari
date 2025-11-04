import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Verificar estado del backend al cargar
  useEffect(() => {
    checkBackendHealth()
    const interval = setInterval(checkBackendHealth, 30000) // Verificar cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const checkBackendHealth = async () => {
    try {
      await apiService.checkHealth()
      setBackendStatus('connected')
    } catch (error) {
      setBackendStatus('error')
      console.error('Backend no disponible:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!username.trim() || !password) {
      setError('Por favor, complete todos los campos')
      setIsLoading(false)
      return
    }

    try {
      await login(username.trim(), password)
      navigate('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Error de autenticación')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return '✅ Conectado'
      case 'error': return '❌ Sin conexión'
      default: return '🔄 Verificando...'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🎯 CRM ARI
          </div>
          <p className="text-gray-600 text-lg">Sistema de Gestión Empresarial</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              👤 Usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/90"
              placeholder="Ingrese su usuario"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              🔑 Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/90"
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || backendStatus === 'error'}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Iniciando sesión...
              </span>
            ) : (
              '🚀 Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Panel de estado */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Estado del Sistema</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>🔗 Backend:</span>
              <span>/api/ (proxy)</span>
            </div>
            <div className="flex justify-between">
              <span>💾 Base de datos:</span>
              <span>MySQL</span>
            </div>
            <div className="flex justify-between">
              <span>⚡ Estado:</span>
              <span className={`font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        {/* Aviso de backend */}
        {backendStatus === 'error' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-yellow-700 text-sm">
              <strong>⚠️ Aviso:</strong> Verifica que el proxy nginx esté configurado correctamente
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login