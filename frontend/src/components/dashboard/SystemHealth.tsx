import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline'

interface SystemHealthProps {
  health: {
    status: 'healthy' | 'warning' | 'error'
    services: Array<{
      name: string
      status: 'up' | 'down' | 'degraded'
      response_time?: number
      last_check: string
    }>
  }
}

const statusIcons = {
  healthy: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon
}

const statusColors = {
  healthy: 'text-green-600 bg-green-100',
  warning: 'text-yellow-600 bg-yellow-100',
  error: 'text-red-600 bg-red-100'
}

const serviceStatusColors = {
  up: 'text-green-600',
  degraded: 'text-yellow-600',
  down: 'text-red-600'
}

export default function SystemHealth({ health }: SystemHealthProps) {
  const StatusIcon = statusIcons[health.status]
  const statusColorClass = statusColors[health.status]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Estado del Sistema</h3>
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClass}`}>
          <StatusIcon className="h-4 w-4 mr-1" />
          {health.status === 'healthy' ? 'Saludable' : 
           health.status === 'warning' ? 'Advertencia' : 'Error'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {health.services.map((service) => (
          <div key={service.name} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
              <span className={`text-xs font-medium ${serviceStatusColors[service.status]}`}>
                {service.status === 'up' ? 'Activo' : 
                 service.status === 'degraded' ? 'Degradado' : 'Inactivo'}
              </span>
            </div>
            {service.response_time && (
              <p className="text-xs text-gray-500">
                Tiempo de respuesta: {service.response_time}ms
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Última verificación: {new Date(service.last_check).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}