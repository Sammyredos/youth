'use client'

import { useState, useEffect } from 'react'
import { AdminLayoutNew } from '@/components/admin/AdminLayoutNew'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EventsSkeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, MapPin, Users, Plus } from 'lucide-react'

export default function EventsPage() {
  const [loading, setLoading] = useState(true)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const events: Array<{
    name: string
    date: string
    time: string
    location: string
    attendees: number
    status: string
    color: string
  }> = [] // Events will be loaded from database

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="success" className="font-apercu-medium">Upcoming</Badge>
      case 'active':
        return <Badge variant="info" className="font-apercu-medium">Active</Badge>
      case 'completed':
        return <Badge variant="secondary" className="font-apercu-medium">Completed</Badge>
      default:
        return <Badge variant="secondary" className="font-apercu-medium">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <AdminLayoutNew
        title="Events"
        description="Manage program events and activities"
      >
        <EventsSkeleton />
      </AdminLayoutNew>
    )
  }

  return (
    <AdminLayoutNew
      title="Events"
      description="Manage program events and activities"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-apercu-bold text-xl text-gray-900">Upcoming Events</h2>
          <p className="font-apercu-regular text-sm text-gray-600">Manage and track program events</p>
        </div>
        <Button className="font-apercu-medium">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {events.map((event, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-12 w-12 bg-gradient-to-r ${event.color} rounded-xl flex items-center justify-center`}>
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                {getStatusBadge(event.status)}
              </div>

              <h3 className="font-apercu-bold text-lg text-gray-900 mb-3">
                {event.name}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="font-apercu-regular">{event.date}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="font-apercu-regular">{event.time}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="font-apercu-regular">{event.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="font-apercu-regular">{event.attendees} attendees</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1 font-apercu-medium">
                  View Details
                </Button>
                <Button size="sm" className="flex-1 font-apercu-medium">
                  Manage
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center mb-8">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-apercu-bold text-lg text-gray-900 mb-2">No Events Yet</h3>
          <p className="font-apercu-regular text-gray-600 mb-4">
            Create your first event to get started with event management.
          </p>
          <Button className="font-apercu-medium">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Event
          </Button>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-apercu-bold text-lg text-gray-900 mb-4">Event Calendar</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="font-apercu-medium text-gray-500">Calendar view</p>
            <p className="font-apercu-regular text-sm text-gray-400">Coming soon</p>
          </div>
        </div>
      </Card>
    </AdminLayoutNew>
  )
}
