'use client'

import { useQuery } from 'react-query'
import { 
  ChartBarIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  LinkIcon,
  CpuChipIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { dashboardService } from '@/services/dashboard.service'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import StatsCard from '@/components/ui/StatsCard'
import RecentActivities from '@/components/dashboard/RecentActivities'
import SystemHealth from '@/components/dashboard/SystemHealth'

export default function DashboardPage() {
  const { 
    data: stats, 
    isLoading: isLoadingStats, 
    error: statsError 
  } = useQuery('dashboard-stats', () => dashboardService.getDashboardStats())

  const { 
    data: health, 
    isLoading: isLoadingHealth 
  } = useQuery('system-health', () => dashboardService.getSystemHealth())

  if (isLoadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (statsError) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar el dashboard</h3>
            <p className="mt-1 text-sm text-red-700">
              No se pudieron cargar las estadísticas del sistema. Por favor, intenta nuevamente.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Vista general del sistema ERP empresarial
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Empresas"
          value={stats?.total_companies || 0}
          icon={BuildingOfficeIcon}
          change="+2 este mes"
          changeType="positive"
          href="/dashboard/companies"
        />
        <StatsCard
          title="Empleados"
          value={stats?.total_employees || 0}
          icon={UsersIcon}
          change="+5 este mes"
          changeType="positive"
          href="/dashboard/payroll"
        />
        <StatsCard
          title="Facturas"
          value={stats?.total_invoices || 0}
          icon={DocumentTextIcon}
          change="+12 este mes"
          changeType="positive"
          href="/dashboard/finance"
        />
        <StatsCard
          title="Ingresos Mensuales"
          value={`$${(stats?.monthly_revenue || 0).toLocaleString()}`}
          icon={CurrencyDollarIcon}
          change="+8.2% vs mes anterior"
          changeType="positive"
          href="/dashboard/finance/reports"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatsCard
          title="Facturas Pendientes"
          value={stats?.pending_invoices || 0}
          icon={ExclamationTriangleIcon}
          change="2 vencidas"
          changeType="negative"
          href="/dashboard/finance?status=pending"
        />
        <StatsCard
          title="Integraciones Activas"
          value={stats?.active_integrations || 0}
          icon={LinkIcon}
          change="100% operativas"
          changeType="positive"
          href="/dashboard/integrations"
        />
        <StatsCard
          title="Clasificaciones IA"
          value={stats?.ai_classifications || 0}
          icon={CpuChipIcon}
          change="+45 hoy"
          changeType="positive"
          href="/dashboard/ai"
        />
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Ingresos Mensuales</h3>
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">Gráfico de ingresos</p>
              <p className="text-sm text-gray-400">Implementar con Recharts</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <RecentActivities activities={stats?.recent_activities || []} />
      </div>

      {/* System Health */}
      {!isLoadingHealth && health && (
        <SystemHealth health={health} />
      )}
    </div>
  )
}