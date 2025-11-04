import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const Employees: React.FC = () => {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🎯 CRM ARI
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-12 items-center">
            <a
              href="/dashboard"
              className="text-gray-500 hover:text-gray-700 px-1 py-1 text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="/companies"
              className="text-gray-500 hover:text-gray-700 px-1 py-1 text-sm font-medium"
            >
              Empresas
            </a>
            <a
              href="/employees"
              className="text-blue-600 border-b-2 border-blue-600 px-1 py-1 text-sm font-medium"
            >
              Empleados
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Empleados</h2>
          <p className="mt-2 text-gray-600">
            Gestiona los empleados de tu sistema
          </p>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Módulo de Empleados
          </h3>
          <p className="text-gray-600 mb-6">
            Esta sección estará disponible próximamente. Aquí podrás gestionar todos los empleados del sistema.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <span>✅</span>
              <span>Registrar empleados</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span>✅</span>
              <span>Gestionar perfiles</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span>✅</span>
              <span>Asignar a empresas</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Employees