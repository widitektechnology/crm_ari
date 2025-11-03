import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/layout/Layout'
import { 
  ChartBarIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

// Componente para las tarjetas de estadísticas
function StatCard({ title, value, change, changeType, icon: Icon, color }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {changeType === 'increase' ? (
                      <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                    )}
                    <span className="sr-only">{changeType === 'increase' ? 'Aumentó' : 'Disminuyó'} en</span>
                    {change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para actividad reciente
function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'employee',
      title: 'Nuevo empleado registrado',
      description: 'María García se unió al equipo de Finanzas',
      time: 'Hace 2 horas',
      icon: UsersIcon,
      iconBackground: 'bg-blue-500'
    },
    {
      id: 2,
      type: 'invoice',
      title: 'Factura procesada',
      description: 'Factura #2024-001 por €2,500 completada',
      time: 'Hace 4 horas',
      icon: CurrencyDollarIcon,
      iconBackground: 'bg-green-500'
    },
    {
      id: 3,
      type: 'ai',
      title: 'Clasificación de emails',
      description: '25 emails clasificados automáticamente',
      time: 'Hace 6 horas',
      icon: SparklesIcon,
      iconBackground: 'bg-purple-500'
    },
    {
      id: 4,
      type: 'company',
      title: 'Nueva empresa registrada',
      description: 'TechCorp S.L. añadida al sistema',
      time: 'Ayer',
      icon: BuildingOfficeIcon,
      iconBackground: 'bg-orange-500'
    }
  ]

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Actividad Reciente</h3>
      </div>
      <div className="px-6 py-4">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== activities.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`${activity.iconBackground} h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white`}>
                        <activity.icon className="h-4 w-4 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    companies: 0,
    employees: 0,
    invoices: 0,
    revenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos (en producción esto vendría de la API)
    const loadDashboardData = async () => {
      try {
        // Aquí llamarías a tus endpoints reales
        // const companiesResponse = await fetch('/api/companies')
        // const employeesResponse = await fetch('/api/payroll/employees')
        // etc.
        
        // Por ahora simulamos los datos
        setTimeout(() => {
          setStats({
            companies: 3,
            employees: 12,
            invoices: 45,
            revenue: 125420
          })
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error)
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const statsData = [
    {
      title: 'Empresas Activas',
      value: loading ? '...' : stats.companies,
      change: '+2',
      changeType: 'increase',
      icon: BuildingOfficeIcon,
      color: 'text-blue-600'
    },
    {
      title: 'Empleados',
      value: loading ? '...' : stats.employees,
      change: '+3',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'text-green-600'
    },
    {
      title: 'Facturas este mes',
      value: loading ? '...' : stats.invoices,
      change: '+12%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'text-purple-600'
    },
    {
      title: 'Ingresos (€)',
      value: loading ? '...' : `€${stats.revenue.toLocaleString()}`,
      change: '+8%',
      changeType: 'increase',
      icon: ChartBarIcon,
      color: 'text-orange-600'
    }
  ]

  return (
    <>
      <Head>
        <title>Dashboard - CRM System</title>
        <meta name="description" content="Panel principal del CRM" />
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Encabezado */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Resumen general del sistema y métricas principales
            </p>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statsData.map((item, index) => (
              <StatCard
                key={index}
                title={item.title}
                value={item.value}
                change={item.change}
                changeType={item.changeType}
                icon={item.icon}
                color={item.color}
              />
            ))}
          </div>

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Actividad reciente */}
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>

            {/* Panel lateral de acciones rápidas */}
            <div className="space-y-6">
              {/* Acciones rápidas */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Acciones Rápidas</h3>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    + Nuevo Empleado
                  </button>
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    + Nueva Factura
                  </button>
                  <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                    🤖 Clasificar Emails
                  </button>
                  <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
                    + Nueva Empresa
                  </button>
                </div>
              </div>

              {/* Estado del sistema */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Estado del Sistema</h3>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Backend API</span>
                    <span className="text-sm font-medium text-green-600">✅ Conectado</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Base de Datos</span>
                    <span className="text-sm font-medium text-green-600">✅ Funcionando</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Módulos IA</span>
                    <span className="text-sm font-medium text-green-600">✅ Activos</span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Última actualización: {new Date().toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}