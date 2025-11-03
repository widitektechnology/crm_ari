import Link from 'next/link'
import { ReactNode } from 'react'
import { clsx } from 'clsx'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  href?: string
  className?: string
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  href,
  className
}: StatsCardProps) {
  const content = (
    <div className={clsx(
      'bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200',
      href && 'cursor-pointer',
      className
    )}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              {change && (
                <div className={clsx(
                  'ml-2 flex items-baseline text-sm font-semibold',
                  changeType === 'positive' && 'text-green-600',
                  changeType === 'negative' && 'text-red-600',
                  changeType === 'neutral' && 'text-gray-500'
                )}>
                  {changeType === 'positive' && (
                    <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center text-green-500" />
                  )}
                  {changeType === 'negative' && (
                    <ArrowTrendingDownIcon className="h-4 w-4 flex-shrink-0 self-center text-red-500" />
                  )}
                  <span className="sr-only">
                    {changeType === 'positive' ? 'Increased' : changeType === 'negative' ? 'Decreased' : 'Changed'} by
                  </span>
                  {change}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}