import React from 'react'
import Layout from './Layout'

const Companies: React.FC = () => {
  return (
    <Layout title="Gestión de Empresas">
      {/* Contenido de empresas */}
      <div className="space-y-6">
        {/* Tarjeta de Coming Soon */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 text-center border border-white/20">
          <div className="text-6xl mb-6">🏢</div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Módulo de Empresas
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Esta sección estará disponible próximamente. Aquí podrás gestionar todas las empresas del sistema.
          </p>
          
          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center space-y-2 p-4 bg-blue-50 rounded-xl">
              <span className="text-2xl">✅</span>
              <span className="font-semibold text-blue-800">Crear Empresas</span>
              <span className="text-sm text-blue-600">Registro completo</span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4 bg-green-50 rounded-xl">
              <span className="text-2xl">✅</span>
              <span className="font-semibold text-green-800">Editar Información</span>
              <span className="text-sm text-green-600">Datos actualizables</span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4 bg-purple-50 rounded-xl">
              <span className="text-2xl">✅</span>
              <span className="font-semibold text-purple-800">Gestionar Empleados</span>
              <span className="text-sm text-purple-600">Asignación directa</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full text-sm font-semibold shadow-lg inline-block">
            🚧 Próximamente Disponible
          </div>
        </div>

        {/* Stats placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
                <span className="text-xl text-white">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Total Empresas</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl">
                <span className="text-xl text-white">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl">
                <span className="text-xl text-white">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Con Empleados</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Companies