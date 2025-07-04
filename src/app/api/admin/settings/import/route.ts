import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Determine if this is an admin or user based on the token type
    const userType = payload.type || 'admin'

    let user
    if (userType === 'admin') {
      user = await prisma.admin.findUnique({
        where: { id: payload.adminId },
        include: { role: true }
      })
    } else {
      user = await prisma.user.findUnique({
        where: { id: payload.adminId },
        include: { role: true }
      })
    }

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 })
    }

    // Check if user has Super Admin privileges (import is more sensitive)
    if (user.role?.name !== 'Super Admin') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith('.json')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload a JSON file.' }, { status: 400 })
    }

    // Parse the backup file
    const fileContent = await file.text()
    let backupData

    try {
      backupData = JSON.parse(fileContent)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 })
    }

    // Validate backup structure
    if (!backupData.data || !backupData.timestamp) {
      return NextResponse.json({ error: 'Invalid backup file structure' }, { status: 400 })
    }

    // Import settings (safer to import)
    if (backupData.data.settings) {
      for (const setting of backupData.data.settings) {
        await prisma.setting.upsert({
          where: {
            category_key: {
              category: setting.category,
              key: setting.key
            }
          },
          update: {
            name: setting.name,
            value: setting.value,
            type: setting.type,
            description: setting.description,
            updatedAt: new Date()
          },
          create: {
            category: setting.category,
            key: setting.key,
            name: setting.name,
            value: setting.value,
            type: setting.type,
            description: setting.description
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data imported successfully',
      importedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
