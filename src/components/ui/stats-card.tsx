/**
 * Reusable Stats Card Component with consistent design
 */

import React from 'react'
import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: LucideIcon
  gradient: string
  bgGradient: string
  loading?: boolean
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  bgGradient,
  loading = false
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 ${bgGradient}`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`h-12 w-12 ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-apercu-regular text-sm text-gray-600">{title}</p>
                <p className="font-apercu-bold text-2xl text-gray-900">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                {subtitle && (
                  <p className="font-apercu-regular text-xs text-green-600">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

interface StatsGridProps {
  children: React.ReactNode
  columns?: 'auto' | 3 | 4 | 6
}

export function StatsGrid({ children, columns = 6 }: StatsGridProps) {
  const gridClass = columns === 'auto' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    : columns === 3
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : columns === 4
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6'

  return (
    <div className={gridClass}>
      {children}
    </div>
  )
}
