'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  AlertTriangle,
  User,
  Home,
  Users,
  Calendar,
  UserX,
  ExternalLink,
  Clock,
  Shield
} from 'lucide-react'

interface RoomAllocation {
  roomId: string
  roomName: string
  roomGender: string
  roomCapacity: number
  currentOccupancy: number
  roommates: string[]
  registrantName: string
  registrantGender: string
  allocationDate: string
  allocatedBy: string
}

interface Registration {
  id: string
  fullName: string
  gender: string
  dateOfBirth: string
  phoneNumber: string
  emailAddress: string
}

interface UnverificationWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (forceUnverify?: boolean) => void
  onGoToAccommodations: () => void
  loading: boolean
  hasRoomAllocation: boolean
  roomAllocation?: RoomAllocation
  registration?: Registration
  error?: string
}

export function UnverificationWarningModal({
  isOpen,
  onClose,
  onConfirm,
  onGoToAccommodations,
  loading,
  hasRoomAllocation,
  roomAllocation,
  registration,
  error
}: UnverificationWarningModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) {
      console.warn('⚠️ Date of birth is missing for age calculation')
      return 'Unknown'
    }

    try {
      const today = new Date()
      const birthDate = new Date(dateOfBirth)

      // Check if the date is valid
      if (isNaN(birthDate.getTime())) {
        console.warn('⚠️ Invalid date of birth:', dateOfBirth)
        return 'Invalid Date'
      }

      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch (error) {
      console.error('Error calculating age:', error)
      return 'Error'
    }
  }

  if (!registration) {
    console.warn('⚠️ UnverificationWarningModal: No registration data provided')
    return null
  }

  // Debug logging
  console.log('🔍 UnverificationWarningModal Registration Data:', {
    registration,
    hasDateOfBirth: !!registration.dateOfBirth,
    hasPhoneNumber: !!registration.phoneNumber,
    hasEmailAddress: !!registration.emailAddress,
    dateOfBirth: registration.dateOfBirth,
    phoneNumber: registration.phoneNumber,
    emailAddress: registration.emailAddress
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Unverify Attendee</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Registrant Information */}
          <Card className="p-4 bg-gray-50">
            <h3 className="font-apercu-bold text-lg text-gray-900 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Registrant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="font-apercu-medium text-sm text-gray-600">Full Name</p>
                <p className="font-apercu-regular text-base text-gray-900">{registration.fullName}</p>
              </div>
              <div>
                <p className="font-apercu-medium text-sm text-gray-600">Gender</p>
                <Badge variant="outline" className="mt-1">
                  {registration.gender}
                </Badge>
              </div>
              <div>
                <p className="font-apercu-medium text-sm text-gray-600">Age</p>
                <p className="font-apercu-regular text-base text-gray-900">
                  {registration.dateOfBirth ? `${calculateAge(registration.dateOfBirth)} years old` : 'Age not available'}
                </p>
              </div>
              <div>
                <p className="font-apercu-medium text-sm text-gray-600">Phone</p>
                <p className="font-apercu-regular text-base text-gray-900">
                  {registration.phoneNumber || 'Phone not available'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="font-apercu-medium text-sm text-gray-600">Email</p>
                <p className="font-apercu-regular text-base text-gray-900 break-all">
                  {registration.emailAddress || 'Email not available'}
                </p>
              </div>
            </div>
          </Card>

          {/* Room Allocation Warning */}
          {hasRoomAllocation && roomAllocation ? (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-apercu-bold text-lg text-red-900 mb-2">
                    ⚠️ Room Allocation Detected
                  </h3>
                  <p className="font-apercu-regular text-sm text-red-800 mb-4">
                    This attendee is currently allocated to a room. You must remove them from the room before unverifying.
                  </p>

                  {/* Room Details */}
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <h4 className="font-apercu-bold text-base text-gray-900 mb-3 flex items-center">
                      <Home className="h-4 w-4 mr-2 text-blue-600" />
                      Room Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="font-apercu-medium text-sm text-gray-600">Room Name</p>
                        <p className="font-apercu-bold text-base text-gray-900">{roomAllocation.roomName}</p>
                      </div>
                      <div>
                        <p className="font-apercu-medium text-sm text-gray-600">Room Gender</p>
                        <Badge variant="outline">{roomAllocation.roomGender}</Badge>
                      </div>
                      <div>
                        <p className="font-apercu-medium text-sm text-gray-600">Occupancy</p>
                        <p className="font-apercu-regular text-base text-gray-900">
                          {roomAllocation.currentOccupancy} / {roomAllocation.roomCapacity} people
                        </p>
                      </div>
                      <div>
                        <p className="font-apercu-medium text-sm text-gray-600">Allocated Date</p>
                        <p className="font-apercu-regular text-sm text-gray-900">
                          {formatDate(roomAllocation.allocationDate)}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-apercu-medium text-sm text-gray-600">Allocated By</p>
                        <p className="font-apercu-regular text-base text-gray-900">{roomAllocation.allocatedBy}</p>
                      </div>
                    </div>

                    {/* Roommates */}
                    {roomAllocation.roommates.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-apercu-bold text-sm text-gray-900 mb-2 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-green-600" />
                          Current Roommates ({roomAllocation.roommates.length})
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {roomAllocation.roommates.map((roommate, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {roommate}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Required */}
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <h5 className="font-apercu-bold text-sm text-amber-900 mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Action Required
                    </h5>
                    <p className="font-apercu-regular text-sm text-amber-800 mb-3">
                      To unverify this attendee, you must first remove them from their room allocation.
                    </p>
                    <Button
                      onClick={onGoToAccommodations}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Go to Accommodations Page
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            /* No Room Allocation - Safe to Unverify */
            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-apercu-bold text-lg text-amber-900 mb-2">
                    Confirm Unverification
                  </h3>
                  <p className="font-apercu-regular text-sm text-amber-800 mb-4">
                    Are you sure you want to unverify <strong>{registration.fullName}</strong>?
                  </p>
                  
                  <div className="bg-white rounded-lg p-3 border border-amber-200">
                    <h4 className="font-apercu-bold text-sm text-gray-900 mb-2">This action will:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center">
                        <UserX className="h-4 w-4 mr-2 text-red-500" />
                        Mark the attendee as unverified
                      </li>
                      <li className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-orange-500" />
                        Remove verification timestamp and verifier information
                      </li>
                      <li className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-blue-500" />
                        Prevent them from being allocated to rooms until re-verified
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="font-apercu-medium text-sm text-red-800">{error}</p>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            
            {!hasRoomAllocation && (
              <Button
                onClick={() => onConfirm(false)}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Unverifying...
                  </>
                ) : (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Confirm Unverify
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
