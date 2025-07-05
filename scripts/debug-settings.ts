/**
 * Debug Settings Script
 * Shows current settings in the database to help troubleshoot issues
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugSettings() {
  try {
    console.log('🔍 Debugging current settings...')

    // Get all settings
    const allSettings = await prisma.setting.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    console.log(`\n📊 Found ${allSettings.length} settings in database:`)
    console.log('=' .repeat(80))

    // Group by category
    const settingsByCategory = allSettings.reduce((acc, setting) => {
      const category = setting.category || 'uncategorized'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(setting)
      return acc
    }, {} as Record<string, any[]>)

    // Display settings by category
    for (const [category, settings] of Object.entries(settingsByCategory)) {
      console.log(`\n📁 Category: ${category.toUpperCase()}`)
      console.log('-'.repeat(40))
      
      for (const setting of settings) {
        let value = setting.value
        try {
          // Try to parse JSON value
          const parsed = JSON.parse(setting.value)
          value = parsed
        } catch {
          // Keep original value if not JSON
        }
        
        console.log(`   🔑 ${setting.key}:`)
        console.log(`      📝 Name: ${setting.name || 'N/A'}`)
        console.log(`      💾 Value: ${JSON.stringify(value)}`)
        console.log(`      📋 Type: ${setting.type || 'N/A'}`)
        console.log(`      📄 Description: ${setting.description || 'N/A'}`)
        console.log()
      }
    }

    // Check specific branding settings
    console.log('\n🎨 BRANDING SETTINGS CHECK:')
    console.log('=' .repeat(50))
    
    const systemNameSetting = await prisma.setting.findFirst({
      where: {
        category: 'branding',
        key: 'systemName'
      }
    })
    
    const logoUrlSetting = await prisma.setting.findFirst({
      where: {
        category: 'branding',
        key: 'logoUrl'
      }
    })

    if (systemNameSetting) {
      let systemName = systemNameSetting.value
      try {
        systemName = JSON.parse(systemNameSetting.value)
      } catch {}
      console.log(`✅ System Name: ${JSON.stringify(systemName)}`)
    } else {
      console.log('❌ System Name setting not found!')
    }

    if (logoUrlSetting) {
      let logoUrl = logoUrlSetting.value
      try {
        logoUrl = JSON.parse(logoUrlSetting.value)
      } catch {}
      console.log(`✅ Logo URL: ${JSON.stringify(logoUrl)}`)
    } else {
      console.log('❌ Logo URL setting not found!')
    }

    // Check admin users
    console.log('\n👤 ADMIN USERS CHECK:')
    console.log('=' .repeat(50))
    
    const adminUsers = await prisma.admin.findMany({
      include: {
        role: {
          include: {
            permissions: true
          }
        }
      }
    })

    console.log(`Found ${adminUsers.length} admin users:`)
    for (const admin of adminUsers) {
      console.log(`   📧 ${admin.email} (${admin.name})`)
      console.log(`      👑 Role: ${admin.role?.name || 'No role'}`)
      console.log(`      🛡️  Permissions: ${admin.role?.permissions.length || 0}`)
      console.log(`      ✅ Active: ${admin.isActive}`)
      console.log()
    }

    // Check roles
    console.log('\n👑 ROLES CHECK:')
    console.log('=' .repeat(50))
    
    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { admins: true }
        }
      }
    })

    console.log(`Found ${roles.length} roles:`)
    for (const role of roles) {
      console.log(`   👑 ${role.name}`)
      console.log(`      📄 Description: ${role.description}`)
      console.log(`      🛡️  Permissions: ${role.permissions.length}`)
      console.log(`      👥 Users: ${role._count.admins}`)
      console.log(`      🔒 System Role: ${role.isSystem}`)
      console.log()
    }

  } catch (error) {
    console.error('❌ Error debugging settings:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
debugSettings()
  .then(() => {
    console.log('\n✅ Debug completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Debug failed:', error)
    process.exit(1)
  })
