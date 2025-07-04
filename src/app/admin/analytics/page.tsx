'use client'

import { useState, useEffect } from 'react'
import { AdminLayoutNew } from '@/components/admin/AdminLayoutNew'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { formatNumber } from '@/lib/statistics' // Commented out as it's not used
// Removed heavy animations for better performance
import { useTranslation } from '@/contexts/LanguageContext'
import { StatsCard, StatsGrid } from '@/components/ui/stats-card'
// Skeleton components are now inline in the loading state
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react'
import { SimpleBarChart, SimpleDoughnutChart, SimpleLineChart } from '@/components/ui/simple-charts'

interface AnalyticsData {
  totalRegistrations: number
  demographics: {
    ageGroups: Record<string, number>
    genderDistribution: Record<string, number>
  }
  trends: {
    daily: Array<{ date: string; count: number }>
    monthly: Array<{ month: string; count: number }>
  }
  stats: {
    averageAge: number
    growthRate: number
    peakMonth: string
    completionRate: number
  }
}

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  // Debug logging for age distribution
  useEffect(() => {
    if (analytics?.demographics?.ageGroups) {
      console.log('🔍 Age Distribution Data:', analytics.demographics.ageGroups)
      console.log('📊 Chart Data:', Object.entries(analytics.demographics.ageGroups).map(([label, value]) => ({
        label: `${label} years`,
        value: value as number
      })))
    }
  }, [analytics])

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  // Show skeleton loader while data is loading
  if (loading) {
    return (
      <AdminLayoutNew
        title="Analytics"
        description="Registration trends and program insights"
      >
        <div className="space-y-6">
          {/* Stats Cards Skeleton */}
          <StatsGrid columns={4}>
            {Array.from({ length: 4 }).map((_, i) => (
              <StatsCard
                key={i}
                title=""
                value=""
                icon={BarChart3}
                gradient="bg-gradient-to-r from-gray-400 to-gray-500"
                bgGradient="bg-gradient-to-br from-white to-gray-50"
                loading={true}
              />
            ))}
          </StatsGrid>

          {/* Charts Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <Card className="p-4 sm:p-6 bg-white">
              <div className="space-y-4">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-64 sm:h-80 bg-gray-200 rounded animate-pulse" />
              </div>
            </Card>
            <Card className="p-4 sm:p-6 bg-white">
              <div className="space-y-4">
                <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                <div className="h-64 sm:h-80 bg-gray-200 rounded animate-pulse" />
              </div>
            </Card>
          </div>

          {/* Large Chart Skeleton */}
          <Card className="p-4 sm:p-6 bg-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-64 sm:h-96 bg-gray-200 rounded animate-pulse" />
            </div>
          </Card>
        </div>
      </AdminLayoutNew>
    )
  }

  return (
    <AdminLayoutNew
      title={t('page.analytics.title')}
      description={t('page.analytics.description')}
    >
      {/* Stats Cards - Consistent Design */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Growth Rate"
          value={`${analytics?.stats.growthRate !== undefined ? `${analytics.stats.growthRate >= 0 ? '+' : ''}${analytics.stats.growthRate}` : '0'}%`}
          subtitle="Monthly growth trend"
          icon={TrendingUp}
          gradient="bg-gradient-to-r from-green-500 to-emerald-600"
          bgGradient="bg-gradient-to-br from-white to-green-50"
        />

        <StatsCard
          title="Average Age"
          value={(analytics?.stats.averageAge || 0).toFixed(1)}
          subtitle="Participant demographics"
          icon={Users}
          gradient="bg-gradient-to-r from-blue-500 to-cyan-600"
          bgGradient="bg-gradient-to-br from-white to-blue-50"
        />

        <StatsCard
          title="Peak Month"
          value={analytics?.stats.peakMonth || 'N/A'}
          subtitle="Highest registration period"
          icon={Calendar}
          gradient="bg-gradient-to-r from-purple-500 to-pink-600"
          bgGradient="bg-gradient-to-br from-white to-purple-50"
        />

        <StatsCard
          title="Total Registrations"
          value={(analytics?.totalRegistrations || 0).toLocaleString()}
          subtitle="All-time participant count"
          icon={BarChart3}
          gradient="bg-gradient-to-r from-indigo-500 to-purple-600"
          bgGradient="bg-gradient-to-br from-white to-indigo-50"
        />
      </StatsGrid>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 my-8 sm:mb-6">
        {/* Age Distribution Chart */}
        <Card className="p-4 sm:p-6 bg-white">
          <h3 className="font-apercu-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Age Distribution</h3>
          <div className="h-64 sm:h-80">
            {analytics?.demographics?.ageGroups ? (
              <SimpleBarChart
                data={Object.entries(analytics.demographics.ageGroups).map(([label, value]) => ({
                  label: `${label} years`,
                  value: value as number
                }))}
                height={280}
                colors={['#667EEA', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
              />
            ) : analytics === null ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-apercu-medium text-gray-500">Loading age data...</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-red-400 mx-auto mb-3" />
                  <p className="font-apercu-medium text-red-500">Failed to load age data</p>
                  <p className="font-apercu-regular text-xs text-gray-500 mt-1">Check console for errors</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Gender Distribution Chart */}
        <Card className="p-4 sm:p-6 bg-white">
          <h3 className="font-apercu-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Gender Distribution</h3>
          <div className="h-64 sm:h-80">
            {analytics?.demographics.genderDistribution ? (
              <SimpleDoughnutChart
                data={Object.entries(analytics.demographics.genderDistribution).map(([label, value], index) => ({
                  label,
                  value: value as number,
                  color: ['#3B82F6', '#EC4899', '#10B981'][index] || '#6B7280'
                }))}
                size={200}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-apercu-medium text-gray-500">Loading gender data...</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Registration Trends Chart */}
      <Card className="p-4 sm:p-6 bg-white">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-apercu-bold text-base sm:text-lg text-gray-900">📈 Registration Trends (Last 30 Days)</h3>
          {refreshing && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="font-apercu-regular">Refreshing...</span>
            </div>
          )}
        </div>
        <div className="h-64 sm:h-96">
          {analytics?.trends.daily ? (
            <SimpleLineChart
              data={analytics.trends.daily.map(item => ({
                label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: item.count
              }))}
              height={320}
              color="#667EEA"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="font-apercu-medium text-gray-500">No trend data available</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </AdminLayoutNew>
  )
}
