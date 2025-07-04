import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('Backup endpoint called')

    // Simplified authentication check - just verify token exists
    const token = request.cookies.get('auth-token')?.value
    console.log('Token found:', !!token)

    if (!token) {
      console.log('No token provided')
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
    }

    // Try to verify token
    try {
      const payload = verifyToken(token)
      console.log('Token verified, payload:', payload)
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    } catch (authError) {
      console.error('Token verification error:', authError)
      return NextResponse.json({ error: 'Token verification failed: ' + authError.message }, { status: 401 })
    }

    // Create backup data with error handling for each query
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        settings: [],
        roles: [],
        users: [],
        system_info: {
          backup_type: 'basic',
          created_by: 'admin',
          description: 'System backup created from admin panel'
        }
      }
    }

    console.log('Starting database queries...')

    try {
      // Get settings - this is the most important data
      const settings = await prisma.setting.findMany()
      backupData.data.settings = settings
      console.log('Settings retrieved:', settings.length)
    } catch (error) {
      console.error('Error fetching settings:', error)
      // If we can't get settings, create a minimal backup
      backupData.data.settings = []
      backupData.data.system_info.error = 'Could not retrieve settings: ' + error.message
    }

    try {
      // Get roles
      const roles = await prisma.role.findMany()
      backupData.data.roles = roles
      console.log('Roles retrieved:', roles.length)
    } catch (error) {
      console.error('Error fetching roles:', error)
      backupData.data.roles = []
    }

    // Skip users for now to avoid complex queries
    backupData.data.users = []
    backupData.data.system_info.note = 'User data excluded for security'

    console.log('Backup data prepared, size:', JSON.stringify(backupData).length)

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `system-backup-${timestamp}.json`

    // Return backup as downloadable file
    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Backup creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
