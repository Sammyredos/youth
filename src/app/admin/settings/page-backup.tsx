'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayoutNew } from '@/components/admin/AdminLayoutNew'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// import { FormSkeleton } from '@/components/ui/skeleton' // Commented out as unused
import { useToast } from '@/contexts/ToastContext'
import { useUser } from '@/contexts/UserContext'
import { ErrorModal } from '@/components/ui/error-modal'
// import { getErrorMessage, parseApiError } from '@/lib/error-messages' // Commented out as unused (using local parseApiError)
import { useBranding } from '@/contexts/BrandingContext'
// import { SystemBranding } from '@/components/admin/SystemBranding' // Temporarily removed to fix webpack error
// import { useTranslation } from '@/contexts/LanguageContext' // Temporarily removed to fix webpack error
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
  // EyeOff, // Commented out as unused
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

export default function SettingsPage() {
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
  const [loading, setLoading] = useState(false) // Start with false for instant display
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
  const [importingData, setImportingData] = useState(false)
  const [viewingLogs, setViewingLogs] = useState(false)
  const [systemLogs, setSystemLogs] = useState<Array<{ id: string; message: string; timestamp: string; level: string }>>([])
  const [showLogsModal, setShowLogsModal] = useState(false)
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
      // Silently handle user fetch error - not critical for settings page
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
      // Silently handle logo fetch error - not critical
      console.error('Failed to load current logo:', error)
    }
  }



  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')

      if (response.status === 403) {
        // User doesn't have permission to access settings
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
        // Transform the API response to match the component's expected format
        const transformedSettings: SettingsState = {}

        Object.keys(data.settings).forEach(category => {
          transformedSettings[category] = data.settings[category].map((setting: { key: string; name: string; value: string | boolean; type: string; options?: string[]; description?: string }) => ({
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

  const updateSetting = (category: string, settingId: string, newValue: string | boolean) => {
    try {
      setSettings(prev => {
        // Validate previous settings exist
        if (!prev || typeof prev !== 'object') {
          console.error('Settings object is invalid:', prev)
          return prev
        }

        // Validate category exists and is an array
        if (!prev[category] || !Array.isArray(prev[category])) {
          console.error(`Category ${category} is not a valid array:`, prev[category])
          return prev
        }

        return {
          ...prev,
          [category]: prev[category].map(setting => {
            // Validate setting object
            if (!setting || typeof setting !== 'object' || !setting.key) {
              console.warn('Invalid setting object:', setting)
              return setting
            }

            return setting.key === settingId ? { ...setting, value: newValue } : setting
          })
        }
      })

      // Trigger real-time updates for system name
      if (category === 'branding' && settingId === 'systemName' && typeof newValue === 'string') {
        updateSystemName(newValue)
        // Refresh branding context to ensure all components update
        setTimeout(() => refreshBranding(), 100)
        console.log('System name updated:', newValue)
      }
    } catch (err) {
      console.error('Error updating setting:', err)
      error('Update Failed', 'Failed to update setting. Please refresh the page.')
    }
  }

  const saveSettings = async (category: string) => {
    setSaving(true)
    try {
      // Use specialized API endpoints for email and SMS
      if (category === 'email') {
        await saveEmailSettings()
      } else if (category === 'sms') {
        await saveSmsSettings()
      } else {
        // Use general settings API for other categories
        // Validate settings object exists
        if (!settings || typeof settings !== 'object') {
          throw new Error('Settings not loaded. Please refresh the page.')
        }

        const categorySettings = settings[category] || []

        // Validate category settings array
        if (!Array.isArray(categorySettings)) {
          throw new Error(`${category} settings data is corrupted. Please refresh the page.`)
        }

        const settingsToSave = categorySettings
          .filter(setting => setting && setting.key) // Filter out invalid settings
          .map(setting => ({
            category,
            key: setting.key,
            value: setting.value ?? ''
          }))

        const response = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            settings: settingsToSave
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save settings')
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error('Invalid response format')
        }
      }

      // Check if system name was updated and trigger global update
      if (category === 'branding') {
        const systemNameSetting = settings.branding?.find(s => s.key === 'systemName')
        if (systemNameSetting) {
          updateSystemName(systemNameSetting.value as string)
          // Force immediate refresh and then another after delay
          await refreshBranding()
          setTimeout(() => refreshBranding(), 500)
          console.log('System name setting saved:', systemNameSetting.value)
        }
      }

      // Show success toast
      success('Settings Saved Successfully', `${getCategoryDisplayName(category)} settings have been saved and are now in effect across the system.`)
      setEditingCategory(null)
      setMessage(null) // Clear any existing message
    } catch (error) {
      const errorMessage = parseApiError(error)
      setErrorModal({
        isOpen: true,
        type: 'error',
        title: 'Failed to Save Settings',
        description: 'Unable to save the settings changes. This could be due to validation errors or insufficient permissions.',
        details: `Error: ${errorMessage}\nCategory: ${getCategoryDisplayName(category)}\nTime: ${new Date().toISOString()}`,
        errorCode: 'SETTINGS_SAVE_ERROR'
      })
    } finally {
      setSaving(false)
    }
  }

  const saveEmailSettings = async () => {
    // Validate settings object exists
    if (!settings || typeof settings !== 'object') {
      throw new Error('Settings not loaded. Please refresh the page.')
    }

    const emailSettings = settings.email || []

    // Validate email settings array
    if (!Array.isArray(emailSettings)) {
      throw new Error('Email settings data is corrupted. Please refresh the page.')
    }

    const emailData = emailSettings.reduce((acc, setting) => {
      // Validate setting object
      if (!setting || typeof setting !== 'object' || !setting.key) {
        console.warn('Invalid email setting object:', setting)
        return acc
      }

      // Map the setting keys to the expected API field names
      const fieldMap: Record<string, string> = {
        'smtpHost': 'smtpHost',
        'smtpPort': 'smtpPort',
        'smtpUser': 'smtpUser',
        'smtpPass': 'smtpPass',
        'smtpSecure': 'smtpSecure',
        'emailFromName': 'emailFromName',
        'emailReplyTo': 'emailReplyTo',
        'adminEmails': 'adminEmails'
      }

      const fieldName = fieldMap[setting.key] || setting.key
      acc[fieldName] = setting.value ?? ''
      return acc
    }, {} as Record<string, string | boolean>)

    console.log('Saving email settings:', emailData) // Debug log

    const response = await fetch('/api/admin/settings/email', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Email settings save error response:', errorText) // Debug log

      let errorData: any
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: `HTTP ${response.status}: ${errorText}` }
      }

      console.error('Email settings save error:', errorData) // Debug log

      // Handle specific error cases
      if (response.status === 403) {
        throw new Error('Only Super Admin can modify email settings. Please contact your administrator.')
      } else if (response.status === 400) {
        const details = errorData.details || []
        const errorMessages = details.map((d: { path?: string[]; message: string }) => `${d.path?.join('.')}: ${d.message}`).join(', ')
        throw new Error(errorData.message || errorData.error || `Validation failed: ${errorMessages}` || 'Invalid email settings data')
      } else {
        throw new Error(errorData.message || errorData.error || 'Failed to save email settings')
      }
    }

    const result = await response.json()
    console.log('Email settings save result:', result) // Debug log
  }

  const saveSmsSettings = async () => {
    // Validate settings object exists
    if (!settings || typeof settings !== 'object') {
      throw new Error('Settings not loaded. Please refresh the page.')
    }

    const smsSettings = settings.sms || []

    // Validate SMS settings array
    if (!Array.isArray(smsSettings)) {
      throw new Error('SMS settings data is corrupted. Please refresh the page.')
    }

    const smsData = smsSettings.reduce((acc, setting) => {
      // Validate setting object
      if (!setting || typeof setting !== 'object' || !setting.key) {
        console.warn('Invalid SMS setting object:', setting)
        return acc
      }

      // Map the setting keys to the expected API field names
      const fieldMap: Record<string, string> = {
        'smsEnabled': 'smsEnabled',
        'smsProvider': 'smsProvider',
        'smsApiKey': 'smsApiKey',
        'smsApiSecret': 'smsApiSecret',
        'smsFromNumber': 'smsFromNumber',
        'smsRegion': 'smsRegion',
        'smsGatewayUrl': 'smsGatewayUrl',
        'smsUsername': 'smsUsername'
      }

      const fieldName = fieldMap[setting.key] || setting.key
      acc[fieldName] = setting.value ?? ''
      return acc
    }, {} as Record<string, string | boolean>)

    console.log('Saving SMS settings:', smsData) // Debug log

    const response = await fetch('/api/admin/settings/sms', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smsData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SMS settings save error response:', errorText) // Debug log

      let errorData: any
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: `HTTP ${response.status}: ${errorText}` }
      }

      console.error('SMS settings save error:', errorData) // Debug log

      // Handle specific error cases
      if (response.status === 403) {
        throw new Error('Only Super Admin can modify SMS settings. Please contact your administrator.')
      } else if (response.status === 400) {
        const details = errorData.details || []
        const errorMessages = details.map((d: { path?: string[]; message: string }) => `${d.path?.join('.')}: ${d.message}`).join(', ')
        throw new Error(errorData.message || errorData.error || `Validation failed: ${errorMessages}` || 'Invalid SMS settings data')
      } else {
        throw new Error(errorData.message || errorData.error || 'Failed to save SMS settings')
      }
    }

    const result = await response.json()
    console.log('SMS settings save result:', result) // Debug log
  }

  const testEmailConfiguration = async () => {
    if (!testEmail) {
      error('Missing Email', 'Please enter an email address to send the test email to.')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      error('Invalid Email', 'Please enter a valid email address.')
      return
    }

    // Validate settings object exists
    if (!settings || typeof settings !== 'object') {
      error('Settings Error', 'Settings not loaded. Please refresh the page.')
      return
    }

    // Check if email settings exist and are configured
    const emailSettings = settings.email
    if (!emailSettings || !Array.isArray(emailSettings) || emailSettings.length === 0) {
      error('Email Not Configured', 'Please configure email settings before testing.')
      return
    }

    // Check if required email settings are present
    const requiredSettings = ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword']
    const missingSettings = requiredSettings.filter(setting => {
      const settingObj = emailSettings.find(s => s && s.key === setting)
      return !settingObj || !settingObj.value
    })

    if (missingSettings.length > 0) {
      error('Incomplete Email Configuration', `Please configure the following settings: ${missingSettings.join(', ')}`)
      return
    }

    setTestingEmail(true)
    try {
      // Test email functionality has been removed
      throw new Error('Email testing functionality is not available')

      const data = await response.json()

      if (response.ok) {
        success('Test Email Sent', `Test email sent successfully to ${testEmail}. Check your inbox to verify the configuration.`)
        setTestEmail('')
      } else {
        throw new Error(data.message || data.error || 'Failed to send test email')
      }
    } catch (err) {
      console.error('Email test error:', err)
      error('Test Email Failed', err instanceof Error ? err.message : 'Failed to send test email')
    } finally {
      setTestingEmail(false)
    }
  }

  const testSmsConfiguration = async () => {
    if (!testPhone) {
      error('Missing Phone Number', 'Please enter a phone number to send the test SMS to.')
      return
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(testPhone)) {
      error('Invalid Phone Number', 'Please enter a valid phone number (e.g., +1234567890).')
      return
    }

    // Validate settings object exists
    if (!settings || typeof settings !== 'object') {
      error('Settings Error', 'Settings not loaded. Please refresh the page.')
      return
    }

    // Check if SMS settings exist and are configured
    const smsSettings = settings.sms
    if (!smsSettings || !Array.isArray(smsSettings) || smsSettings.length === 0) {
      error('SMS Not Configured', 'Please configure SMS settings before testing.')
      return
    }

    // Check if required SMS settings are present
    const requiredSettings = ['smsProvider', 'smsApiKey']
    const missingSettings = requiredSettings.filter(setting => {
      const settingObj = smsSettings.find(s => s && s.key === setting)
      return !settingObj || !settingObj.value
    })

    if (missingSettings.length > 0) {
      error('Incomplete SMS Configuration', `Please configure the following settings: ${missingSettings.join(', ')}`)
      return
    }

    setTestingSms(true)
    try {
      // Test SMS functionality has been removed
      throw new Error('SMS testing functionality is not available')

      const data = await response.json()

      if (response.ok) {
        success('Test SMS Sent', `Test SMS sent successfully to ${testPhone}. Check your phone to verify the configuration.`)
        setTestPhone('')
      } else {
        throw new Error(data.message || data.error || 'Failed to send test SMS')
      }
    } catch (err) {
      console.error('SMS test error:', err)
      error('Test SMS Failed', err instanceof Error ? err.message : 'Failed to send test SMS')
    } finally {
      setTestingSms(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('Starting logo upload:', file.name, file.type, file.size)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('Invalid File Type', 'Please select an image file (PNG, JPG, SVG).')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      error('File Too Large', 'Please select an image smaller than 5MB.')
      return
    }

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)

      console.log('Sending upload request...')
      const response = await fetch('/api/admin/settings/logo', {
        method: 'POST',
        body: formData,
      })

      console.log('Upload response status:', response.status)
      const data = await response.json()
      console.log('Upload response data:', data)

      if (response.ok) {
        setCurrentLogo(data.logoUrl)
        success('Logo Updated', 'System logo and favicon have been updated successfully.')

        // Update favicon immediately
        updateFavicon(data.logoUrl)

        // Update logo in branding context
        updateLogo(data.logoUrl)

        // Force immediate refresh and then another after delay
        await refreshBranding()
        setTimeout(() => refreshBranding(), 500)
        console.log('Logo uploaded:', data.logoUrl)
      } else {
        throw new Error(data.error || data.message || 'Failed to upload logo')
      }
    } catch (err) {
      console.error('Logo upload error:', err)
      error('Logo Upload Failed', err instanceof Error ? err.message : 'Failed to upload logo')
    } finally {
      setUploadingLogo(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const updateFavicon = (logoUrl: string) => {
    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon) {
      favicon.href = logoUrl
    } else {
      const newFavicon = document.createElement('link')
      newFavicon.rel = 'icon'
      newFavicon.href = logoUrl
      document.head.appendChild(newFavicon)
    }

    // Update apple-touch-icon
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
    if (appleTouchIcon) {
      appleTouchIcon.href = logoUrl
    } else {
      const newAppleTouchIcon = document.createElement('link')
      newAppleTouchIcon.rel = 'apple-touch-icon'
      newAppleTouchIcon.href = logoUrl
      document.head.appendChild(newAppleTouchIcon)
    }
  }



  // Data Management Functions
  const handleBackupData = async () => {
    try {
      success('Creating Backup', 'Preparing system backup...')

      console.log('Starting backup request...')
      const response = await fetch('/api/admin/settings/backup', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
      })

      console.log('Backup response status:', response.status)
      console.log('Backup response headers:', response.headers)

      if (response.ok) {
        const blob = await response.blob()
        console.log('Backup blob size:', blob.size)

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `system-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        success('Backup Created', 'System backup has been downloaded successfully.')
      } else {
        const errorText = await response.text()
        console.error('Backup error response:', errorText)

        let errorData: any
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: `HTTP ${response.status}: ${errorText}` }
        }

        throw new Error(errorData.error || `Failed to create backup (${response.status})`)
      }
    } catch (err) {
      console.error('Backup error:', err)
      error('Backup Failed', err instanceof Error ? err.message : 'Failed to create backup')
    }
  }

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.json')) {
      error('Invalid File', 'Please select a valid JSON backup file.')
      event.target.value = ''
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error('File Too Large', 'Backup file must be smaller than 10MB.')
      event.target.value = ''
      return
    }

    setImportingData(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/settings/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        success('Import Successful', 'Data has been imported successfully. Settings will be refreshed automatically.')
        // Reload settings to reflect changes
        setTimeout(() => {
          loadSettings()
          // Update branding context
          updateSystemName(data.systemName || 'MopgomYouth')
          console.log('Data imported, system name:', data.systemName || 'MopgomYouth')
        }, 1000)
      } else {
        throw new Error(data.error || 'Failed to import data')
      }
    } catch (err) {
      console.error('Import error:', err)
      error('Import Failed', err instanceof Error ? err.message : 'Failed to import data')
    } finally {
      setImportingData(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleViewLogs = async () => {
    setViewingLogs(true)
    try {
      const response = await fetch('/api/admin/settings/logs?limit=20', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setSystemLogs(data.logs || [])
        setShowLogsModal(true)
      } else {
        throw new Error(data.error || 'Failed to load logs')
      }
    } catch (err) {
      console.error('Logs error:', err)
      error('Logs Failed', err instanceof Error ? err.message : 'Failed to load system logs')
    } finally {
      setViewingLogs(false)
    }
  }

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      branding: 'System Branding',
      userManagement: 'User Management',
      security: 'Security',
      email: 'Email Configuration',
      sms: 'SMS Configuration',
      notifications: 'Notifications',
      system: 'System'
    }
    return categoryMap[category] || category
  }

  // Tab configuration
  const settingsTabs = [
    {
      id: 'general',
      name: 'General',
      icon: Settings,
      description: 'Basic system settings and branding',
      categories: ['branding']
    },
    {
      id: 'communications',
      name: 'Communications',
      icon: Mail,
      description: 'Email and SMS configuration',
      categories: ['email', 'sms']
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Security and user management',
      categories: ['security', 'userManagement']
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      description: 'Notification preferences',
      categories: ['notifications']
    },
    {
      id: 'data',
      name: 'Data Management',
      icon: Database,
      description: 'Backup, import, and export data',
      categories: []
    }
  ]

  // Render tab content based on active tab
  const renderTabContent = () => {
    const currentTab = settingsTabs.find(tab => tab.id === activeTab)
    if (!currentTab) return null

    switch (activeTab) {
      case 'general':
        return renderGeneralTab()
      case 'communications':
        return renderCommunicationsTab()
      case 'security':
        return renderSecurityTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'data':
        return renderDataManagementTab()
      default:
        return null
    }
  }

  // Helper function to render edit buttons
  const renderEditButtons = (categoryId: string) => {
    const isEditing = editingCategory === categoryId

    if (!isEditing && userRole === 'Super Admin') {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingCategory(categoryId)}
          className="font-apercu-medium"
        >
          <Settings className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )
    } else if (userRole === 'Super Admin' && isEditing) {
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingCategory(null)}
            className="font-apercu-medium"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => saveSettings(categoryId)}
            disabled={saving}
            className="font-apercu-medium"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      )
    } else if (userRole === 'Admin') {
      return (
        <Badge variant="secondary" className="font-apercu-medium text-xs">
          <Eye className="h-3 w-3 mr-1" />
          Read Only
        </Badge>
      )
    }
    return null
  }

  // General Tab Content
  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Language Selection - Simplified to avoid circular dependencies */}
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

      {/* System Branding Card */}
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
          {renderEditButtons('branding')}
        </div>

        {/* Branding Settings List */}
        {settings.branding && Array.isArray(settings.branding) && settings.branding.length > 0 && (
          <div className="space-y-4 mb-6">
            {settings.branding.filter(setting => setting && setting.key).map((setting) => (
              <div key={setting.key} className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-3 lg:space-y-0">
                <div className="flex-1 min-w-0 lg:pr-4">
                  <p className="font-apercu-medium text-sm text-gray-900">{setting.name || 'Unknown Setting'}</p>
                  {setting.description && (
                    <p className="font-apercu-regular text-xs text-gray-500 mt-1 break-words">{setting.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-start lg:justify-end lg:flex-shrink-0">
                  {renderSettingInput('branding', setting)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Logo Upload Section */}
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="font-apercu-bold text-sm text-orange-800 mb-3">System Logo & Favicon</h4>
          <p className="font-apercu-regular text-xs text-orange-700 mb-4">
            Upload a logo that will be used throughout the system and as the favicon. Recommended size: 512x512px, PNG or SVG format.
          </p>
          <div className="space-y-4">
            {/* Current Logo Preview */}
            <div className="flex items-center space-x-4">
              {(currentLogo || branding.logoUrl) ? (
                <div className="h-16 w-16 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={currentLogo || branding.logoUrl || ''}
                    alt="Current Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-white" />
                </div>
              )}
              <div>
                <p className="font-apercu-medium text-sm text-gray-900">Current Logo</p>
                <p className="font-apercu-regular text-xs text-gray-500">
                  {(currentLogo || branding.logoUrl) ? 'Custom logo uploaded' : 'Default system icon'}
                </p>
              </div>
            </div>

            {/* Upload Section */}
            <div className={`border-2 border-dashed border-orange-300 rounded-lg p-6 text-center ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="logo-upload"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                {uploadingLogo ? (
                  <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                ) : (
                  <Upload className="h-8 w-8 text-orange-500" />
                )}
                <span className="font-apercu-medium text-sm text-orange-700">
                  {uploadingLogo ? 'Uploading logo...' : 'Click to upload new logo'}
                </span>
                <span className="font-apercu-regular text-xs text-orange-600">
                  PNG, JPG, SVG up to 5MB
                </span>
              </label>
            </div>
          </div>
        </div>
      </Card>


    </div>
  )

  // Communications Tab Content
  const renderCommunicationsTab = () => {
    try {
      // Validate settings object exists
      if (!settings || typeof settings !== 'object') {
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="font-apercu-bold text-lg text-gray-900 mb-2">Settings Not Loaded</h3>
                <p className="font-apercu-bold text-sm text-gray-600">
                  Settings data is not available. Please refresh the page.
                </p>
              </div>
            </Card>
          </div>
        )
      }

      return (
        <div className="space-y-6">
          {/* Email Configuration Card */}
          {settings.email && Array.isArray(settings.email) && settings.email.length > 0 ? (
            <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-apercu-bold text-lg text-gray-900">Email Configuration</h3>
                <p className="font-apercu-regular text-sm text-gray-600">SMTP settings and email preferences</p>
              </div>
            </div>
            {renderEditButtons('email')}
          </div>

          <div className="space-y-4">
            {settings.email.filter(setting => setting && setting.key).map((setting) => (
              <div key={setting.key} className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-3 lg:space-y-0">
                <div className="flex-1 min-w-0 lg:pr-4">
                  <p className="font-apercu-medium text-sm text-gray-900">{setting.name || 'Unknown Setting'}</p>
                  {setting.description && (
                    <p className="font-apercu-regular text-xs text-gray-500 mt-1 break-words">{setting.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-start lg:justify-end lg:flex-shrink-0">
                  {renderSettingInput('email', setting)}
                </div>
              </div>
            ))}
          </div>

          {/* Email Test Section */}
          {editingCategory !== 'email' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-apercu-bold text-sm text-green-800 mb-3">Test Email Configuration</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email address to test"
                  className="flex-1 px-3 py-2 border border-green-300 rounded-lg font-apercu-regular focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
                <Button
                  onClick={testEmailConfiguration}
                  disabled={testingEmail || !testEmail}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 font-apercu-medium"
                >
                  {testingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-6">
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-apercu-bold text-lg text-gray-900 mb-2">Email Not Configured</h3>
            <p className="font-apercu-bold text-sm text-gray-600">
              Email settings are not configured. Please contact your administrator.
            </p>
          </div>
        </Card>
      )}

      {/* SMS Configuration Card */}
      {settings.sms && Array.isArray(settings.sms) && settings.sms.length > 0 ? (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-apercu-bold text-lg text-gray-900">SMS Configuration</h3>
                <p className="font-apercu-bold text-sm text-gray-600">SMS provider settings and preferences</p>
              </div>
            </div>
            {renderEditButtons('sms')}
          </div>

          <div className="space-y-4">
            {settings.sms.filter(setting => setting && setting.key).map((setting) => (
              <div key={setting.key} className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-3 lg:space-y-0">
                <div className="flex-1 min-w-0 lg:pr-4">
                  <p className="font-apercu-medium text-sm text-gray-900">{setting.name || 'Unknown Setting'}</p>
                  {setting.description && (
                    <p className="font-apercu-bold text-xs text-gray-500 mt-1 break-words">{setting.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-start lg:justify-end lg:flex-shrink-0">
                  {renderSettingInput('sms', setting)}
                </div>
              </div>
            ))}
          </div>

          {/* SMS Test Section */}
          {editingCategory !== 'sms' && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-apercu-bold text-sm text-purple-800 mb-3">Test SMS Configuration</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Enter phone number to test (+1234567890)"
                  className="flex-1 px-3 py-2 border border-purple-300 rounded-lg font-apercu-regular focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
                <Button
                  onClick={testSmsConfiguration}
                  disabled={testingSms || !testPhone}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 font-apercu-medium"
                >
                  {testingSms ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Send Test SMS
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-6">
          <div className="text-center py-8">
            <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-apercu-bold text-lg text-gray-900 mb-2">SMS Not Configured</h3>
            <p className="font-apercu-bold text-sm text-gray-600">
              SMS settings are not configured. Please contact your administrator.
            </p>
          </div>
        </Card>
      )}
    </div>
    )
  } catch (error) {
    console.error('Error rendering communications tab:', error)
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="font-apercu-bold text-lg text-gray-900 mb-2">Error Loading Communications</h3>
            <p className="font-apercu-bold text-sm text-gray-600">
              There was an error loading the communications settings. Please refresh the page.
            </p>
          </div>
        </Card>
      </div>
    )
  }
}

  // Security Tab Content
  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Security Settings Card */}
      {settings.security && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-apercu-bold text-lg text-gray-900">Security Settings</h3>
                <p className="font-apercu-regular text-sm text-gray-600">Authentication and security preferences</p>
              </div>
            </div>
            {renderEditButtons('security')}
          </div>

          <div className="space-y-4">
            {settings.security.map((setting) => (
              <div key={setting.key} className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-3 lg:space-y-0">
                <div className="flex-1 min-w-0 lg:pr-4">
                  <p className="font-apercu-medium text-sm text-gray-900">{setting.name}</p>
                  {setting.description && (
                    <p className="font-apercu-regular text-xs text-gray-500 mt-1 break-words">{setting.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-start lg:justify-end lg:flex-shrink-0">
                  {renderSettingInput('security', setting)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* User Management Card */}
      {settings.userManagement && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-apercu-bold text-lg text-gray-900">User Management</h3>
                <p className="font-apercu-regular text-sm text-gray-600">User roles and permissions</p>
              </div>
            </div>
            {renderEditButtons('userManagement')}
          </div>

          <div className="space-y-4">
            {settings.userManagement.map((setting) => (
              <div key={setting.key} className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-3 lg:space-y-0">
                <div className="flex-1 min-w-0 lg:pr-4">
                  <p className="font-apercu-medium text-sm text-gray-900">{setting.name}</p>
                  {setting.description && (
                    <p className="font-apercu-regular text-xs text-gray-500 mt-1 break-words">{setting.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-start lg:justify-end lg:flex-shrink-0">
                  {renderSettingInput('userManagement', setting)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )

  // Notifications Tab Content
  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {settings.notifications && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-apercu-bold text-lg text-gray-900">Notification Settings</h3>
                <p className="font-apercu-regular text-sm text-gray-600">Configure notification preferences</p>
              </div>
            </div>
            {renderEditButtons('notifications')}
          </div>

          <div className="space-y-4">
            {settings.notifications.map((setting) => (
              <div key={setting.key} className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-3 lg:space-y-0">
                <div className="flex-1 min-w-0 lg:pr-4">
                  <p className="font-apercu-medium text-sm text-gray-900">{setting.name}</p>
                  {setting.description && (
                    <p className="font-apercu-regular text-xs text-gray-500 mt-1 break-words">{setting.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-start lg:justify-end lg:flex-shrink-0">
                  {renderSettingInput('notifications', setting)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )

  // Data Management Tab Content
  const renderDataManagementTab = () => (
    <div className="space-y-6">
      {/* Data Operations Card */}
      <Card className="p-6 bg-white">
        <div className="flex items-center mb-6">
          <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-apercu-bold text-lg text-gray-900">Data Management</h3>
            <p className="font-apercu-regular text-sm text-gray-600">Backup, import, and export system data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Backup Data */}
          <div className="p-4 border border-blue-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                  <Download className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-apercu-bold text-sm text-gray-900">Backup Data</h4>
                  <p className="font-apercu-bold text-xs text-gray-500">Export system data</p>
                </div>
              </div>
            </div>
            <p className="font-apercu-bold text-xs text-gray-600 mb-3">
              Download a complete backup of your system data including settings, users, and configurations.
            </p>
            <Button
              size="sm"
              className="w-full"
              onClick={handleBackupData}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Backup
            </Button>
          </div>

          {/* Import Data */}
          <div className="p-4 border border-green-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-apercu-bold text-sm text-gray-900">Import Data</h4>
                  <p className="font-apercu-bold text-xs text-gray-500">Import configurations</p>
                </div>
              </div>
            </div>
            <p className="font-apercu-bold text-xs text-gray-600 mb-3">
              Import system data from a backup file or migrate from another system.
            </p>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="import-file"
                disabled={importingData}
              />
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('import-file')?.click()}
                disabled={importingData}
              >
                {importingData ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* System Logs */}
          <div className="p-4 border border-purple-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-apercu-bold text-sm text-gray-900">System Logs</h4>
                  <p className="font-apercu-bold text-xs text-gray-500">View activity logs</p>
                </div>
              </div>
            </div>
            <p className="font-apercu-bold text-xs text-gray-600 mb-3">
              View and download system activity logs for troubleshooting and monitoring.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={handleViewLogs}
              disabled={viewingLogs}
            >
              {viewingLogs ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  View Logs
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* System Information */}
      <Card className="p-6">
        <h3 className="font-apercu-bold text-lg text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="font-apercu-medium text-sm text-gray-600 mb-1">Version</p>
            <p className="font-apercu-regular text-lg text-gray-900">v1.0.0</p>
          </div>
          <div>
            <p className="font-apercu-medium text-sm text-gray-600 mb-1">Last Updated</p>
            <p className="font-apercu-regular text-lg text-gray-900">Today</p>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-apercu-medium text-sm text-gray-600 mb-1">Environment</p>
            <Badge className="bg-green-100 text-green-800 border-green-200 font-apercu-medium">
              Development
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  )

  // Removed settingsCategories as it's not used in the current implementation


  const renderSettingInput = (category: string, setting: SettingItem) => {
    // Validate inputs to prevent runtime errors
    if (!setting || !setting.key || !setting.type) {
      console.warn('Invalid setting object:', setting)
      return (
        <Badge variant="secondary" className="font-apercu-medium text-xs">
          Invalid Setting
        </Badge>
      )
    }

    const isEditing = editingCategory === category
    const settingValue = setting.value ?? ''

    if (!isEditing) {
      return (
        <div className="flex items-center space-x-2">
          {setting.type === 'toggle' ? (
            <Badge
              className={`font-apercu-medium text-xs ${
                settingValue
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }`}
            >
              {settingValue ? 'Enabled' : 'Disabled'}
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-apercu-medium text-xs">
              {settingValue ? settingValue.toString() : 'Not set'}
            </Badge>
          )}
        </div>
      )
    }

    switch (setting.type) {
      case 'toggle':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={Boolean(settingValue)}
              onChange={(e) => updateSetting(category, setting.key, e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="font-apercu-medium text-sm text-gray-700">
              {settingValue ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        )

      case 'select':
        const options = setting.options || []
        return (
          <select
            value={settingValue as string || ''}
            onChange={(e) => updateSetting(category, setting.key, e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg font-apercu-regular focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            {options.length === 0 && (
              <option value="">No options available</option>
            )}
            {options.map((option, index) => (
              <option key={`${option}-${index}`} value={option.toLowerCase()}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'number':
        return (
          <input
            type="number"
            value={settingValue as string || ''}
            onChange={(e) => updateSetting(category, setting.key, e.target.value)}
            className="w-full sm:w-24 px-3 py-2 border border-gray-300 rounded-lg font-apercu-regular focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        )

      default:
        return (
          <input
            type={setting.type}
            value={settingValue as string || ''}
            onChange={(e) => updateSetting(category, setting.key, e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg font-apercu-regular focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm min-w-0"
          />
        )
    }
  }

  // Validate settings object before rendering
  if (!settings && !loading) {
    return (
      <AdminLayoutNew title="Settings" description="Configure system settings and preferences">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="font-apercu-bold text-lg text-gray-900 mb-2">Settings Not Available</h3>
              <p className="font-apercu-bold text-sm text-gray-600 mb-4">
                Unable to load system settings. This could be due to a network issue or server error.
              </p>
              <Button onClick={loadSettings} className="font-apercu-medium">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading Settings
              </Button>
            </div>
          </Card>
        </div>
      </AdminLayoutNew>
    )
  }

  // Loading skeleton removed - page shows immediately for better performance

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
      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <span className={`font-apercu-medium text-sm ${
            message.type === 'success' ? 'text-green-700' : 'text-red-700'
          }`}>
            {message.text}
          </span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-apercu-bold text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className={activeTab === tab.id ? 'text-white' : ''}>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Description */}
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="font-apercu-regular text-sm text-indigo-700">
            {settingsTabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>
      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>

      {/* System Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="font-apercu-bold text-lg text-gray-900">System Logs</h3>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <AlertCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {systemLogs.map((log) => (
                  <div key={log.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={`text-xs ${
                            log.level === 'ERROR' ? 'bg-red-100 text-red-800 border-red-200' :
                            log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-green-100 text-green-800 border-green-200'
                          }`}
                        >
                          {log.level}
                        </Badge>
                        <span className="font-apercu-medium text-sm text-gray-900">{log.message}</span>
                      </div>
                      <span className="font-apercu-regular text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      {(log as any).user && <p><strong>User:</strong> {(log as any).user}</p>}
                      {(log as any).ip && <p><strong>IP:</strong> {(log as any).ip}</p>}
                      {(log as any).details && <p><strong>Details:</strong> {(log as any).details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowLogsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

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
