import { Activity } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  DocumentTextIcon,
  UserPlusIcon,
  CpuChipIcon,
  LinkIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface RecentActivitiesProps {
  activities: Activity[]
}

const activityIcons = {
  invoice_created: DocumentTextIcon,
  employee_added: UserPlusIcon,
  email_classified: CpuChipIcon,
  integration_executed: LinkIcon,
  payroll_calculated: CurrencyDollarIcon,
  default: ClockIcon
}

const activityColors = {
  invoice_created: 'text-blue-600 bg-blue-100',
  employee_added: 'text-green-600 bg-green-100',
  email_classified: 'text-purple-600 bg-purple-100',
  integration_executed: 'text-orange-600 bg-orange-100',
  payroll_calculated: 'text-emerald-600 bg-emerald-100',
  default: 'text-gray-600 bg-gray-100'
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
        <ClockIcon className="h-6 w-6 text-gray-400" />
      </div>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type as keyof typeof activityIcons] || activityIcons.default
            const colorClasses = activityColors[activity.type as keyof typeof activityColors] || activityColors.default
            
            return (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index !== activities.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${colorClasses}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {activity.description}
                        </p>
                        {activity.user && (
                          <p className="text-xs text-gray-400 mt-1">
                            por {activity.user}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={activity.timestamp}>
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                            locale: es
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      
      {activities.length === 0 && (
        <div className="text-center py-8">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No hay actividad reciente</p>
        </div>
      )}
    </div>
  )
}