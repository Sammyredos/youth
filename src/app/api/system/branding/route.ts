import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Public API - no authentication required for system branding
export async function GET() {
  try {
    // Get system name and logo from settings
    const brandingSettings = await prisma.setting.findMany({
      where: {
        category: 'branding',
        key: {
          in: ['systemName', 'logoUrl']
        }
      }
    })

    const systemNameSetting = brandingSettings.find(s => s.key === 'systemName')
    const logoUrlSetting = brandingSettings.find(s => s.key === 'logoUrl')

    let systemName = 'Mopgomglobal' // Default fallback
    let logoUrl = null

    if (systemNameSetting) {
      try {
        systemName = JSON.parse(systemNameSetting.value)
      } catch {
        systemName = systemNameSetting.value
      }
    }

    if (logoUrlSetting) {
      try {
        logoUrl = JSON.parse(logoUrlSetting.value)
      } catch {
        logoUrl = logoUrlSetting.value
      }
    }

    // Add cache-busting parameter to logo URL
    const logoUrlWithCacheBust = logoUrl ? `${logoUrl}?v=${Date.now()}` : null

    return NextResponse.json({
      success: true,
      systemName,
      logoUrl: logoUrlWithCacheBust,
      timestamp: Date.now() // Add timestamp for cache invalidation
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30', // Reduced cache time for faster updates
      }
    })

  } catch (error) {
    console.error('Error fetching system branding:', error)
    
    // Return default values on error
    return NextResponse.json({
      success: true,
      systemName: 'MopgomYouth',
      logoUrl: null
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60',
      }
    })
  }
}
