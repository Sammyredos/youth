'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Mail,
  Server,
  Shield,
  CheckCircle,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  Settings,
  RefreshCw
} from 'lucide-react'

interface EmailConfig {
  fromName: string
  fromEmail: string
  replyTo: string
  smtpHost: string
  smtpPort: string
  isSecure: boolean
  isConfigured: boolean
  environment: string
  source?: string
  adminEmails?: string[]
}

export function EmailConfigDisplay() {
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchEmailConfig()
  }, [])

  const fetchEmailConfig = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    }

    try {
      const response = await fetch('/api/admin/email-config')
      if (response.ok) {
        const data = await response.json()
        setEmailConfig(data.config)
      }
    } catch (error) {
      console.error('Failed to fetch email config:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchEmailConfig(true)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (loading) {
    return (
      <Card className="p-3 sm:p-4">
        <div className="animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 sm:h-5 sm:w-5 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-full sm:w-24"></div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (!emailConfig) {
    return (
      <Card className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-red-200 shadow-lg shadow-red-500/10">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="font-apercu-medium text-xs sm:text-sm text-red-800 truncate">
              Email configuration unavailable
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/admin/settings?tab=communications'}
            className="font-apercu-medium text-xs text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 self-start sm:self-center flex-shrink-0"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Configure</span>
            <span className="sm:hidden">Setup</span>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-green-200 shadow-lg shadow-green-500/10">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
          <h3 className="font-apercu-bold text-base sm:text-lg text-gray-900 truncate">Email Configuration</h3>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Badge
              variant={emailConfig.isConfigured ? 'success' : 'destructive'}
              className={`font-apercu-medium text-xs flex-shrink-0 ${
                emailConfig.isConfigured
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-red-100 text-red-800 border-red-300'
              }`}
            >
              {emailConfig.isConfigured ? 'Active' : 'Not Configured'}
            </Badge>
            {emailConfig.source && (
              <Badge
                variant="secondary"
                className="font-apercu-medium text-xs flex-shrink-0 bg-green-50 text-green-700 border-green-200"
              >
                {emailConfig.source}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 sm:gap-2 self-start sm:self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="font-apercu-medium text-xs flex-shrink-0 text-green-600 hover:text-green-800 hover:bg-green-50"
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="font-apercu-medium text-xs flex-shrink-0 text-green-600 hover:text-green-800 hover:bg-green-50"
          >
            {showDetails ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
            <span className="hidden sm:inline">{showDetails ? 'Hide' : 'Show'} Details</span>
            <span className="sm:hidden">{showDetails ? 'Hide' : 'Show'}</span>
          </Button>
          {!emailConfig.isConfigured && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/admin/settings?tab=communications'}
              className="font-apercu-medium text-xs text-green-600 hover:text-green-800 hover:bg-green-50 border border-green-200 flex-shrink-0"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Configure</span>
              <span className="sm:hidden">Setup</span>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
          <span className="font-apercu-regular text-xs text-gray-600 flex-shrink-0">From Email:</span>
          <div className="flex items-center space-x-1 min-w-0">
            <span className="font-apercu-medium text-xs text-gray-900 truncate">
              {emailConfig.fromEmail}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(emailConfig.fromEmail)}
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
          <span className="font-apercu-regular text-xs text-gray-600 flex-shrink-0">From Name:</span>
          <span className="font-apercu-medium text-xs text-gray-900 truncate">
            {emailConfig.fromName}
          </span>
        </div>

        {showDetails && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="font-apercu-regular text-xs text-gray-600 flex-shrink-0">Reply To:</span>
              <span className="font-apercu-medium text-xs text-gray-900 truncate">
                {emailConfig.replyTo}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="font-apercu-regular text-xs text-gray-600 flex-shrink-0">SMTP Host:</span>
              <span className="font-apercu-medium text-xs text-gray-900 truncate">
                {emailConfig.smtpHost}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="font-apercu-regular text-xs text-gray-600 flex-shrink-0">SMTP Port:</span>
              <div className="flex items-center space-x-1">
                <span className="font-apercu-medium text-xs text-gray-900">
                  {emailConfig.smtpPort}
                </span>
                {emailConfig.isSecure && (
                  <Shield className="h-3 w-3 text-green-600 flex-shrink-0" title="Secure Connection" />
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="font-apercu-regular text-xs text-gray-600 flex-shrink-0">Environment:</span>
              <Badge
                variant={emailConfig.environment === 'production' ? 'default' : 'secondary'}
                className="font-apercu-medium text-xs flex-shrink-0"
              >
                {emailConfig.environment}
              </Badge>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        {emailConfig.isConfigured ? (
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
              <span className="font-apercu-regular text-xs text-green-800">
                Ready to send emails to registrants
              </span>
            </div>
            {emailConfig.source === 'database' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/admin/settings?tab=communications'}
                className="font-apercu-medium text-xs text-green-600 hover:text-green-800 hover:bg-green-50 self-start sm:self-center"
              >
                <Settings className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Edit Settings</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 flex-shrink-0" />
              <span className="font-apercu-regular text-xs text-amber-800">
                Configure email settings to send notifications
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/admin/settings?tab=communications'}
              className="font-apercu-medium text-xs text-green-600 hover:text-green-800 hover:bg-green-50 border border-green-200 self-start sm:self-center"
            >
              <Settings className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Configure Now</span>
              <span className="sm:hidden">Setup</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
