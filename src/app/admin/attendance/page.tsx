'use client'

import { useState, useEffect } from 'react'
import { AdminLayoutNew } from '@/components/admin/AdminLayoutNew'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { StatsCard, StatsGrid } from '@/components/ui/stats-card'
import { UserCard } from '@/components/ui/user-card'
import { useToast } from '@/contexts/ToastContext'
// Removed heavy animations for better performance
import { QRScanner } from '@/components/admin/QRScanner'
import { UnverificationWarningModal } from '@/components/modals/UnverificationWarningModal'

import {
  Activity,
  UserCheck,
  UserX,
  QrCode,
  Search,
  CheckCircle,
  Users,
  RefreshCw,
  Scan,
  Clock,
  ChevronDown,
  X
} from 'lucide-react'

interface AttendanceStats {
  overview: {
    totalRegistrations: number
    verifiedRegistrations: number
    unverifiedRegistrations: number
    verificationRate: number
    allocatedVerified: number
    unallocatedVerified: number
  }
  genderBreakdown: Array<{
    gender: string
    total: number
    verified: number
    unverified: number
  }>
  recentVerifications: Array<{
    id: string
    fullName: string
    gender: string
    verifiedAt: string
    verifiedBy: string
  }>
  hourlyStats: Array<{
    hour: number
    count: number
  }>
  verificationTrends: {
    todayVerifications: number
    yesterdayVerifications: number
    thisWeekVerifications: number
    averageVerificationTime: number
  }
  topVerifiers: Array<{
    verifierEmail: string
    count: number
  }>
}

interface UnverifiedRegistration {
  id: string
  fullName: string
  gender: string
  age: number
  phoneNumber: string
  emailAddress: string
  hasQRCode: boolean
  createdAt: string
}

export default function AttendancePage() {
  const { success, error } = useToast()
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [registrations, setRegistrations] = useState<UnverifiedRegistration[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [unverifying, setUnverifying] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all')
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [scannerInputValue, setScannerInputValue] = useState('')

  // Unverification modal state
  const [showUnverifyModal, setShowUnverifyModal] = useState(false)
  const [unverifyTarget, setUnverifyTarget] = useState<string | null>(null)
  const [unverifyError, setUnverifyError] = useState<string | null>(null)
  const [roomAllocationData, setRoomAllocationData] = useState<any>(null)

  // Dropdown states for collapsible sections - closed by default on mobile/tablet
  const [isGenderBreakdownOpen, setIsGenderBreakdownOpen] = useState(false)
  const [isRecentVerificationsOpen, setIsRecentVerificationsOpen] = useState(false)
  const [isTopVerifiersOpen, setIsTopVerifiersOpen] = useState(false)

  // Detect screen size and close dropdowns on mobile/tablet
  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktopSize = window.innerWidth >= 1024 // lg breakpoint

      // Close all dropdowns on mobile/tablet
      if (!isDesktopSize) {
        setIsGenderBreakdownOpen(false)
        setIsRecentVerificationsOpen(false)
        setIsTopVerifiersOpen(false)
      }
    }

    // Check on mount
    checkScreenSize()

    // Add resize listener
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Handle page change with smooth transition (client-side only)
  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage) return
    setCurrentPage(newPage)
    // No API call needed - pagination is client-side now
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/attendance/stats')
      if (response.ok) {
        const statsData = await response.json()
        setStats(statsData.stats)
      }
    } catch (loadError) {
      console.error('Error loading stats:', loadError)
      error('Failed to load stats')
    }
  }

  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false)

  const loadRegistrations = async () => {
    // Prevent multiple simultaneous requests
    if (isLoadingRegistrations) return

    setIsLoadingRegistrations(true)
    try {
      // Build query parameters - only use verification filter, no search term
      const params = new URLSearchParams()

      // Load all data for client-side filtering (more efficient for real-time search)
      params.append('limit', '1000') // Load more data for client-side filtering
      params.append('page', '1')

      // Capture current filter state to prevent race conditions
      const currentFilter = verificationFilter

      // Add verification filter
      if (currentFilter === 'verified') {
        params.append('verified', 'true')
      } else if (currentFilter === 'unverified') {
        params.append('verified', 'false')
      }
      // For 'all', don't add verified parameter to get all registrations

      const response = await fetch(`/api/admin/attendance/registrations?${params}`, {
        headers: { 'Cache-Control': 'max-age=30' } // Cache for 30 seconds
      })

      if (response.ok) {
        const data = await response.json()

        // Only update state if the filter hasn't changed during the request
        if (currentFilter === verificationFilter) {
          setRegistrations(data.registrations || [])
        }
      }
    } catch (loadError) {
      console.error('Error loading registrations:', loadError)
      error('Failed to load registrations')
    } finally {
      setIsLoadingRegistrations(false)
    }
  }

  const loadData = async (isInitial = false) => {
    if (isInitial) {
      setInitialLoading(true)
    }
    await Promise.all([loadStats(), loadRegistrations()])
    if (isInitial) {
      setInitialLoading(false)
    }
  }

  const handleManualVerification = async (registrationId: string) => {
    try {
      setVerifying(registrationId)

      const response = await fetch('/api/admin/attendance/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'manual',
          registrationId
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh data with current filter state
        await Promise.all([loadStats(), loadRegistrations()])
        success(`${data.registration.fullName} has been verified successfully!`)
      } else {
        error(`Verification failed: ${data.error}`)
      }

    } catch (verifyError) {
      console.error('Error verifying registration:', verifyError)
      error('Failed to verify registration')
    } finally {
      setVerifying(null)
    }
  }

  const handleUnverifyRequest = async (registrationId: string) => {
    try {
      setUnverifyError(null)
      setRoomAllocationData(null)

      // Check unverification eligibility
      const response = await fetch(`/api/admin/attendance/unverify?registrationId=${registrationId}`)
      const data = await response.json()

      if (response.ok) {
        setUnverifyTarget(registrationId)
        setRoomAllocationData(data)
        setShowUnverifyModal(true)
      } else {
        error(`Cannot check unverification status: ${data.error}`)
      }
    } catch (err) {
      console.error('Error checking unverification eligibility:', err)
      error('Failed to check unverification eligibility')
    }
  }

  const handleUnverifyConfirm = async (forceUnverify = false) => {
    if (!unverifyTarget) return

    try {
      setUnverifying(unverifyTarget)
      setUnverifyError(null)

      const response = await fetch('/api/admin/attendance/unverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: unverifyTarget,
          forceUnverify
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh data
        await Promise.all([loadStats(), loadRegistrations()])
        success(data.message)
        setShowUnverifyModal(false)
        setUnverifyTarget(null)
        setRoomAllocationData(null)
      } else {
        if (data.error === 'ROOM_ALLOCATED') {
          setUnverifyError('User is allocated to a room. Please remove from room first.')
          setRoomAllocationData(data)
        } else {
          setUnverifyError(data.error || 'Unverification failed')
        }
      }

    } catch (err) {
      console.error('Error unverifying registration:', err)
      setUnverifyError('Failed to unverify registration')
    } finally {
      setUnverifying(null)
    }
  }

  const handleGoToAccommodations = () => {
    // Navigate to accommodations page
    window.open('/admin/accommodations', '_blank')
  }

  const handleQRScan = async (qrData: string) => {
    try {
      const response = await fetch('/api/admin/attendance/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'qr',
          qrCode: qrData
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh data with current filter state
        await Promise.all([loadStats(), loadRegistrations()])
        success(`${data.registration.fullName} has been verified via QR code!`)
        setShowQRScanner(false)
      } else {
        error(`QR verification failed: ${data.error}`)
      }

    } catch (qrError) {
      console.error('Error verifying QR code:', qrError)
      error('Failed to verify QR code')
    }
  }

  // Handle external scanner input
  const handleScannerInput = async (scannedData: string) => {
    if (scannedData.trim().length < 10) return // Minimum QR data length

    try {
      // Check if it looks like JSON QR data
      if (scannedData.startsWith('{') && scannedData.endsWith('}')) {
        await handleQRScan(scannedData)
        setScannerInputValue('') // Clear input
        success('QR code scanned successfully!')
      } else {
        error('Invalid QR code format')
        setScannerInputValue('')
      }
    } catch (scanError) {
      console.error('Scanner input error:', scanError)
      error('Failed to process scanned QR code')
      setScannerInputValue('')
    }
  }

  // No need for currentPage useEffect - pagination is client-side now

  // Reload registrations when verification filter changes (instant)
  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filtering
    loadRegistrations() // Load immediately without delay or clearing
  }, [verificationFilter])

  // No need for search-based useEffect - we use client-side filtering now

  // Handle scanner input changes
  useEffect(() => {
    if (scannerInputValue.length > 50) { // Likely complete QR data
      handleScannerInput(scannerInputValue)
    }
  }, [scannerInputValue])

  // Reload registrations when verification filter changes
  useEffect(() => {
    loadRegistrations()
  }, [verificationFilter])

  useEffect(() => {
    // Load data immediately with initial loading state
    loadData(true)

    // Set up real-time updates every 5 seconds (without initial loading state)
    const interval = setInterval(() => {
      // Only refresh stats, not registrations (to preserve filter state)
      loadStats()
    }, 5000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])

  // Client-side filtering for real-time search (no API calls needed)
  const filteredRegistrations = registrations.filter((registration: any) => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = (
        registration.fullName.toLowerCase().includes(searchLower) ||
        registration.emailAddress.toLowerCase().includes(searchLower) ||
        registration.phoneNumber.includes(searchTerm)
      )
      if (!matchesSearch) return false
    }

    // Verification filter is already handled by the API
    return true
  })

  // Client-side pagination for filtered results
  const totalFilteredResults = filteredRegistrations.length
  const totalPages = Math.ceil(totalFilteredResults / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, endIndex)

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Removed auto-refresh for better performance



  return (
    <AdminLayoutNew
      title="Attendance Verification"
      description="Verify attendees before room allocation. No verification, no room allocation — no exceptions."
    >
      {initialLoading ? (
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Verification Controls Skeleton */}
          <div className="bg-white rounded-lg border p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-10 w-full sm:w-64 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Table Skeleton */}
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-3">
              <Button
                onClick={() => {
                  loadStats()
                  loadRegistrations()
                }}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Refresh Data</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
              <Button
                onClick={() => setShowQRScanner(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 w-full sm:w-auto"
              >
                <QrCode className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline text-white">Camera Scanner</span>
                <span className="sm:hidden text-white">Scan QR</span>
              </Button>

              {/* Status Indicators - Responsive */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {/* External Scanner Status */}
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <Scan className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="font-apercu-medium text-xs sm:text-sm text-blue-700">
                    <span className="hidden sm:inline">External Scanner Ready</span>
                    <span className="sm:hidden">Scanner Ready</span>
                  </span>
                </div>

                {/* Auto-refresh indicator */}
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <RefreshCw className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="font-apercu-medium text-xs sm:text-sm text-green-700">
                    <span className="hidden sm:inline">Auto-refresh: 30s</span>
                    <span className="sm:hidden">Auto: 30s</span>
                  </span>
                </div>
              </div>
            </div>

          {/* Statistics Cards - Responsive Grid */}
          {stats ? (
            <StatsGrid columns={6}>
              <StatsCard
                title="Total Registrations"
                value={stats.overview.totalRegistrations}
                icon={Users}
                gradient="bg-gradient-to-r from-blue-500 to-cyan-600"
                bgGradient="bg-gradient-to-br from-white to-blue-50"
              />

              <StatsCard
                title="Verified Attendees"
                value={stats.overview.verifiedRegistrations}
                subtitle={`${stats.overview.verificationRate}% verified`}
                icon={UserCheck}
                gradient="bg-gradient-to-r from-green-500 to-emerald-600"
                bgGradient="bg-gradient-to-br from-white to-green-50"
              />

              <StatsCard
                title="Pending Verification"
                value={stats.overview.unverifiedRegistrations}
                icon={UserX}
                gradient="bg-gradient-to-r from-orange-500 to-amber-600"
                bgGradient="bg-gradient-to-br from-white to-orange-50"
              />

              <StatsCard
                title="Ready for Allocation"
                value={stats.overview.unallocatedVerified}
                icon={CheckCircle}
                gradient="bg-gradient-to-r from-purple-500 to-indigo-600"
                bgGradient="bg-gradient-to-br from-white to-purple-50"
              />

              <StatsCard
                title="Today's Verifications"
                value={stats.verificationTrends?.todayVerifications || 0}
                icon={Clock}
                gradient="bg-gradient-to-r from-indigo-500 to-purple-600"
                bgGradient="bg-gradient-to-br from-white to-indigo-50"
              />

              <StatsCard
                title="This Week"
                value={stats.verificationTrends?.thisWeekVerifications || 0}
                icon={Activity}
                gradient="bg-gradient-to-r from-teal-500 to-cyan-600"
                bgGradient="bg-gradient-to-br from-white to-teal-50"
              />
            </StatsGrid>
          ) : null}

          {/* Detailed Statistics - Responsive */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {/* Gender Breakdown */}
              <Card className="border-0 shadow-sm bg-white">
                <div
                  className="p-4 sm:p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200"
                  onClick={() => setIsGenderBreakdownOpen(!isGenderBreakdownOpen)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                        <Users className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-apercu-bold text-base lg:text-lg text-gray-900">Gender Breakdown</h3>
                        <p className="font-apercu-regular text-xs lg:text-sm text-gray-600">Verification status by gender</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 lg:h-4 lg:w-4 text-gray-500 lg:text-gray-400 transition-transform duration-200 ${
                        isGenderBreakdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
                {isGenderBreakdownOpen && (
                  <div className="p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {stats.genderBreakdown.slice(0, 4).map((gender) => (
                        <div key={gender.gender} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`h-3 w-3 rounded-full ${
                                gender.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'
                              }`}></div>
                              <span className="font-apercu-medium text-sm text-gray-900">{gender.gender}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-apercu-bold text-lg text-gray-900">{gender.verified}</div>
                              <div className="font-apercu-regular text-xs text-gray-500">of {gender.total}</div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                gender.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'
                              }`}
                              style={{ width: `${gender.total > 0 ? (gender.verified / gender.total) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <div className="mt-2 text-center">
                            <span className="font-apercu-medium text-xs text-gray-600">
                              {gender.total > 0 ? Math.round((gender.verified / gender.total) * 100) : 0}% verified
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Recent Verifications */}
              <Card className="border-0 shadow-sm bg-white">
                <div
                  className="p-4 sm:p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200"
                  onClick={() => setIsRecentVerificationsOpen(!isRecentVerificationsOpen)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <UserCheck className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-apercu-bold text-base lg:text-lg text-gray-900">Recent Verifications</h3>
                        <p className="font-apercu-regular text-xs lg:text-sm text-gray-600">Latest verified attendees</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 lg:h-4 lg:w-4 text-gray-500 lg:text-gray-400 transition-transform duration-200 ${
                        isRecentVerificationsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
                {isRecentVerificationsOpen && (
                  <div className="p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-3">
                      {stats.recentVerifications.slice(0, 4).map((verification, index) => (
                        <div key={verification.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-apercu-bold text-sm ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                                index === 1 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                index === 2 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                                'bg-gradient-to-r from-purple-400 to-pink-500'
                              }`}>
                                {verification.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="flex-1">
                                <p className="font-apercu-medium text-sm text-gray-900">{verification.fullName}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className={`text-xs ${
                                    verification.gender === 'Male'
                                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                                      : 'bg-pink-100 text-pink-800 border-pink-200'
                                  }`}>
                                    {verification.gender}
                                  </Badge>
                                  <span className="font-apercu-regular text-xs text-gray-500">
                                    {new Date(verification.verifiedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {stats.recentVerifications.length === 0 && (
                        <div className="text-center py-8">
                          <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <UserCheck className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-apercu-regular text-sm">
                            No recent verifications
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>

              {/* Top Verifiers */}
              <Card className="border-0 shadow-sm bg-white">
                <div
                  className="p-4 sm:p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200"
                  onClick={() => setIsTopVerifiersOpen(!isTopVerifiersOpen)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <UserCheck className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-apercu-bold text-base lg:text-lg text-gray-900">Top Verifiers</h3>
                        <p className="font-apercu-regular text-xs lg:text-sm text-gray-600">Most active staff members</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 lg:h-4 lg:w-4 text-gray-500 lg:text-gray-400 transition-transform duration-200 ${
                        isTopVerifiersOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
                {isTopVerifiersOpen && (
                  <div className="p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-3">
                      {stats.topVerifiers?.slice(0, 4).map((verifier, index) => (
                        <div key={verifier.verifierEmail} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-apercu-bold text-sm ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                                index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                index === 2 ? 'bg-gradient-to-r from-amber-600 to-orange-600' :
                                'bg-gradient-to-r from-blue-400 to-blue-500'
                              }`}>
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-apercu-medium text-sm text-gray-900">
                                  {verifier.verifierEmail.split('@')[0]}
                                </p>
                                <p className="font-apercu-regular text-xs text-gray-600">
                                  {verifier.count} verifications
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <UserCheck className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-apercu-regular text-sm">
                            No verification data yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Verification Controls */}
          <>
              <Card className="border-0 shadow-sm bg-white">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-apercu-bold text-base lg:text-lg text-gray-900">
                          {verificationFilter === 'verified' ? 'Verified Attendees' :
                           verificationFilter === 'unverified' ? 'Pending Verification' :
                           'All Registrations'}
                        </h3>
                        <p className="font-apercu-regular text-xs lg:text-sm text-gray-600">
                          {verificationFilter === 'verified' ? 'Attendees who have been physically verified' :
                           verificationFilter === 'unverified' ? 'Attendees awaiting physical verification' :
                           'All registered attendees'}
                        </p>
                      </div>
                    </div>

                    {/* Verification Filter and Search - Responsive Layout */}
                    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-3 lg:gap-4 lg:ml-auto">
                      {/* Verification Status Filter */}
                      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:gap-3">
                        <label className="font-apercu-medium text-xs lg:text-sm text-gray-700 whitespace-nowrap">
                          Filter:
                        </label>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setVerificationFilter('all')}
                            className={`px-2 lg:px-3 py-1.5 rounded-md text-xs lg:text-sm font-apercu-medium transition-all duration-200 flex-1 sm:flex-none ${
                              verificationFilter === 'all'
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            All
                          </button>
                          <button
                            onClick={() => setVerificationFilter('unverified')}
                            className={`px-2 lg:px-3 py-1.5 rounded-md text-xs lg:text-sm font-apercu-medium transition-all duration-200 flex-1 sm:flex-none ${
                              verificationFilter === 'unverified'
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Unverified
                          </button>
                          <button
                            onClick={() => setVerificationFilter('verified')}
                            className={`px-2 lg:px-3 py-1.5 rounded-md text-xs lg:text-sm font-apercu-medium transition-all duration-200 flex-1 sm:flex-none ${
                              verificationFilter === 'verified'
                                ? 'bg-green-500 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Verified
                          </button>
                        </div>
                      </div>

                      {/* Real-time Search Filter */}
                      <div className="w-full sm:w-auto sm:min-w-[250px] lg:max-w-md">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg font-apercu-regular focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base transition-all duration-200"
                          />
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Unverified Registrations List */}
              <div className="p-4 sm:p-6">
                {registrations.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="font-apercu-bold text-lg text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="font-apercu-regular text-sm sm:text-base text-gray-600">
                      All registrations have been verified. Great work!
                    </p>
                  </div>
                ) : filteredRegistrations.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="font-apercu-bold text-lg text-gray-900 mb-2">No Matching Attendees</h3>
                    <p className="font-apercu-regular text-sm sm:text-base text-gray-600">
                      No attendees match your search criteria. Try adjusting your search term.
                    </p>
                    {searchTerm && (
                      <p className="font-apercu-medium text-sm text-indigo-600 mt-2">
                        Searching for: "{searchTerm}"
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                      {paginatedRegistrations.map((registration: any) => (
                        <div key={registration.id}>
                          <UserCard
                            user={{
                              id: registration.id,
                              fullName: registration.fullName,
                              emailAddress: registration.emailAddress,
                              phoneNumber: registration.phoneNumber,
                              gender: registration.gender,
                              age: registration.age,
                              createdAt: registration.createdAt,
                              isVerified: registration.isVerified || false,
                              hasQRCode: registration.hasQRCode,
                              verifiedAt: registration.verifiedAt,
                              verifiedBy: registration.verifiedBy
                            }}
                            onVerify={handleManualVerification}
                            onUnverify={handleUnverifyRequest}
                            onScanQR={() => setShowQRScanner(true)}
                            isVerifying={verifying === registration.id}
                            isUnverifying={unverifying === registration.id}
                            showVerifyButton={!registration.isVerified}
                            showUnverifyButton={registration.isVerified}
                            showQRButton={registration.hasQRCode}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Search Results Summary */}
                    {searchTerm && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <p className="font-apercu-regular text-sm text-gray-600 text-center">
                          Showing {paginatedRegistrations.length} of {totalFilteredResults} results
                          <span className="ml-2">• Filtered by: <span className="font-apercu-medium text-indigo-600">"{searchTerm}"</span></span>
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>



              {/* Pagination Controls - Responsive (show for both search and filter results) */}
              {totalPages > 1 && (
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center lg:justify-start text-xs lg:text-sm text-gray-600">
                    <span className="text-center lg:text-left">
                      <span className="hidden lg:inline">
                        Showing {startIndex + 1} to {Math.min(endIndex, totalFilteredResults)} of {totalFilteredResults} {
                          searchTerm ? 'search results' :
                          verificationFilter === 'verified' ? 'verified registrations' :
                          verificationFilter === 'unverified' ? 'unverified registrations' :
                          'registrations'
                        }
                      </span>
                      <span className="lg:hidden">Page {currentPage} of {totalPages} ({totalFilteredResults} total)</span>
                    </span>

                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="font-apercu-medium text-xs lg:text-sm px-2 lg:px-3 transition-all duration-200"
                    >
                      <span className="hidden lg:inline">Previous</span>
                      <span className="lg:hidden">Prev</span>
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = currentPage <= 3
                          ? i + 1
                          : currentPage >= totalPages - 2
                          ? totalPages - 4 + i
                          : currentPage - 2 + i

                        if (pageNum < 1 || pageNum > totalPages) return null

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={false}
                            className={`w-7 h-7 lg:w-8 lg:h-8 p-0 font-apercu-medium text-xs lg:text-sm transition-all duration-200 ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="font-apercu-medium text-xs lg:text-sm px-2 lg:px-3 transition-all duration-200"
                    >
                      <span className="hidden lg:inline">Next</span>
                      <span className="lg:hidden">Next</span>
                    </Button>
                  </div>
                </div>
              )}
            </>

        </div>
      )}

      {/* Hidden input for external handheld scanners */}
      <input
        type="text"
        value={scannerInputValue}
        onChange={(e) => setScannerInputValue(e.target.value)}
        style={{
          position: 'absolute',
          left: '-9999px',
          opacity: 0,
          pointerEvents: 'none'
        }}
        placeholder="External scanner input"
        autoComplete="off"
        tabIndex={-1}
      />

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />

      {/* Unverification Warning Modal */}
      <UnverificationWarningModal
        isOpen={showUnverifyModal}
        onClose={() => {
          setShowUnverifyModal(false)
          setUnverifyTarget(null)
          setUnverifyError(null)
          setRoomAllocationData(null)
        }}
        onConfirm={handleUnverifyConfirm}
        onGoToAccommodations={handleGoToAccommodations}
        loading={!!unverifying}
        hasRoomAllocation={roomAllocationData?.hasRoomAllocation || false}
        roomAllocation={roomAllocationData?.roomDetails}
        registration={roomAllocationData?.registration}
        error={unverifyError}
      />

    </AdminLayoutNew>
  )
}
