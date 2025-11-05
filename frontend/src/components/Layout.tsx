import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface NavButtonProps {
  to: string
  active: boolean
  icon: string
  text: string
}

const NavButton: React.FC<NavButtonProps> = ({ to, active, icon, text }) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
        active 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </Link>
  )
}

interface LayoutProps {
  children: React.ReactNode
  title: string
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Premium Unificado */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-lg">
                  <span className="text-xl text-white">🚀</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                    CRM ARI
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">Sistema Empresarial</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-white/60 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700 font-medium">En línea</span>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/60 rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
                <span className="text-gray-700 font-medium hidden sm:block">
                  {user?.username || 'Usuario'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación mejorada unificada */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex space-x-8 items-center">
            <NavButton 
              to="/dashboard" 
              active={location.pathname === '/dashboard'}
              icon="📊"
              text="Dashboard"
            />
            <NavButton 
              to="/companies" 
              active={location.pathname === '/companies'}
              icon="🏢"
              text="Empresas"
            />
            <NavButton 
              to="/employees" 
              active={location.pathname === '/employees'}
              icon="👥"
              text="Empleados"
            />
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Título de la página */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mt-2"></div>
        </div>

        {/* Contenido de la página */}
        <div className="animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout