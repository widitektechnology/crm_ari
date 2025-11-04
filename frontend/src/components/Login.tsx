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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/20">
        {/* Logo y título mejorado */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-3xl">🚀</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            CRM ARI
          </h1>
          <p className="text-blue-100 text-lg font-medium">Sistema Empresarial Moderno</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mt-4"></div>
        </div>

        {/* Estado del backend */}
        <div className="flex items-center justify-center mb-6">
          <div className={`flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm ${getStatusColor()}`}>
            <span className="text-sm font-medium text-white">{getStatusText()}</span>
          </div>
        </div>

        {/* Formulario mejorado */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-semibold text-blue-100">
              Email o Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-blue-200">👤</span>
              </div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                placeholder="admin@crm.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-blue-100">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-blue-200">🔑</span>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                placeholder="admin123"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || backendStatus === 'error'}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
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