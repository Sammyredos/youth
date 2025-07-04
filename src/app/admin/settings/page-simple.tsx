'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayoutNew } from '@/components/admin/AdminLayoutNew'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/contexts/ToastContext'
import { useUser } from '@/contexts/UserContext'
import { ErrorModal } from '@/components/ui/error-modal'
import { useBranding } from '@/contexts/BrandingContext'
import {
  Settings,
  Shield,
  Users,
  Database,
  Bell,
  Mail,
  Phone,
  Globe,
  Download,
  Upload,
  Save,
  Check,
  AlertCircle,
  Eye,
  Loader2,
  Image,
  RefreshCw
} from 'lucide-react'

interface SettingItem {
  key: string
  name: string
  value: string | boolean
  type: 'text' | 'email' | 'select' | 'toggle' | 'number'
  options?: string[]
  description?: string
}

interface SettingsState {
  [key: string]: SettingItem[]
}

export default function SettingsPageSimple() {
  // Simple fallback translation function to avoid circular dependencies
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'page.settings.title': 'Settings',
      'page.settings.description': 'Configure system settings and preferences'
    }
    return translations[key] || key
  }

  const { currentUser } = useUser()
  const { branding, updateSystemName, updateLogo, refreshBranding } = useBranding()
  const [settings, setSettings] = useState<SettingsState>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [testingEmail, setTestingEmail] = useState(false)
  const [testingSms, setTestingSms] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testPhone, setTestPhone] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [currentLogo, setCurrentLogo] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('general')
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean
    type: 'error' | 'warning' | 'info' | 'success'
    title: string
    description: string
    details?: string
    errorCode?: string
  }>({
    isOpen: false,
    type: 'error',
    title: '',
    description: ''
  })

  const { success, error, warning } = useToast()

  const parseApiError = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unknown error occurred'
  }

  const getCurrentUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.user?.role?.name || '')
      }
    } catch {
      warning('User Information Unavailable', 'Unable to load user information. Some features may be limited.')
    }
  }, [warning])

  useEffect(() => {
    loadSettings()
    getCurrentUser()
    loadCurrentLogo()
  }, [getCurrentUser])

  const loadCurrentLogo = async () => {
    try {
      const response = await fetch('/api/admin/settings/logo')
      if (response.ok) {
        const data = await response.json()
        if (data.logoUrl) {
          setCurrentLogo(data.logoUrl)
        }
      }
    } catch (error) {
      console.error('Failed to load current logo:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')

      if (response.status === 403) {
        setErrorModal({
          isOpen: true,
          type: 'warning',
          title: 'Access Restricted',
          description: 'You do not have permission to view or modify system settings. Please contact your administrator if you need access.',
          details: 'Only Super Admin and Admin users can access system settings.',
          errorCode: 'SETTINGS_ACCESS_DENIED'
        })
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        const transformedSettings: SettingsState = {}

        Object.keys(data.settings).forEach(category => {
          transformedSettings[category] = data.settings[category].map((setting: any) => ({
            key: setting.key,
            name: setting.name,
            value: setting.value,
            type: setting.type,
            options: setting.options,
            description: setting.description
          }))
        })

        setSettings(transformedSettings)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      setErrorModal({
        isOpen: true,
        type: 'error',
        title: 'Failed to Load Settings',
        description: 'Unable to load system settings from the server. This could be due to insufficient permissions or a server issue.',
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}\nTime: ${new Date().toISOString()}`,
        errorCode: 'SETTINGS_LOAD_ERROR'
      })
    } finally {
      setLoading(false)
    }
  }

  // Check permissions - Allow Super Admin and Admin roles only
  const allowedRoles = ['Super Admin', 'Admin']
  if (currentUser && !allowedRoles.includes(currentUser.role?.name || '')) {
    return (
      <AdminLayoutNew title={t('page.settings.title')} description={t('page.settings.description')}>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to view this page.</p>
        </div>
      </AdminLayoutNew>
    )
  }

  return (
    <AdminLayoutNew
      title={t('page.settings.title')}
      description={t('page.settings.description')}
    >
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-apercu-bold text-lg text-gray-900 mb-2">Settings Page</h3>
            <p className="font-apercu-regular text-sm text-gray-600 mb-4">
              Settings functionality is temporarily simplified to resolve module loading issues.
            </p>
            <Button onClick={loadSettings} className="font-apercu-medium">
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Settings
            </Button>
          </div>
        </Card>

        {/* Language Selection - Simplified */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-apercu-bold text-lg text-gray-900">Language Settings</h3>
                <p className="font-apercu-regular text-sm text-gray-600">
                  Choose your preferred language for the interface
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="font-apercu-medium">
              Available
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Language settings are managed through the user interface. Changes take effect immediately.
          </p>
        </Card>

        {/* System Branding */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                <Image className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-apercu-bold text-lg text-gray-900">System Branding</h3>
                <p className="font-apercu-regular text-sm text-gray-600">Logo, favicon, and visual identity settings</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            System branding settings will be available once module loading issues are resolved.
          </p>
        </Card>
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
        type={errorModal.type}
        title={errorModal.title}
        description={errorModal.description}
        details={errorModal.details}
        errorCode={errorModal.errorCode}
        showRetry={errorModal.type === 'error'}
        onRetry={() => {
          setErrorModal(prev => ({ ...prev, isOpen: false }))
          loadSettings()
        }}
        showContactSupport={errorModal.type === 'error'}
      />
    </AdminLayoutNew>
  )
}
