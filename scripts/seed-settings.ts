#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultSettings = [
  // System settings
  {
    category: 'system',
    key: 'systemName',
    value: JSON.stringify('Mopgomglobal'),
    type: 'text',
    name: 'System Name',
    description: 'The name of the system displayed in the UI',
    isSystem: true
  },
  {
    category: 'system',
    key: 'timezone',
    value: JSON.stringify('UTC-5 (EST)'),
    type: 'select',
    name: 'Timezone',
    description: 'Default timezone for the system',
    isSystem: true
  },
  {
    category: 'system',
    key: 'dateFormat',
    value: JSON.stringify('MM/DD/YYYY'),
    type: 'select',
    name: 'Date Format',
    description: 'Default date format for the system',
    isSystem: false
  },
  {
    category: 'system',
    key: 'language',
    value: JSON.stringify('en'),
    type: 'select',
    name: 'Language',
    description: 'Default language for the system',
    isSystem: false
  },
  {
    category: 'system',
    key: 'maintenanceMode',
    value: JSON.stringify(false),
    type: 'toggle',
    name: 'Maintenance Mode',
    description: 'Enable maintenance mode to prevent user access',
    isSystem: true
  },
  {
    category: 'system',
    key: 'debugMode',
    value: JSON.stringify(false),
    type: 'toggle',
    name: 'Debug Mode',
    description: 'Enable debug mode for development',
    isSystem: true
  },

  // Branding settings
  {
    category: 'branding',
    key: 'systemName',
    value: JSON.stringify('Mopgomglobal'),
    type: 'text',
    name: 'System Name',
    description: 'The name displayed in branding',
    isSystem: false
  },
  {
    category: 'branding',
    key: 'logoUrl',
    value: JSON.stringify('/globe.svg'),
    type: 'text',
    name: 'Logo URL',
    description: 'URL to the system logo',
    isSystem: false
  },

  // User Management settings
  {
    category: 'userManagement',
    key: 'defaultRole',
    value: JSON.stringify('Viewer'),
    type: 'select',
    name: 'Default Role',
    description: 'Default role assigned to new users',
    isSystem: false
  },
  {
    category: 'userManagement',
    key: 'selfRegistration',
    value: JSON.stringify(false),
    type: 'toggle',
    name: 'Self Registration',
    description: 'Allow users to register themselves',
    isSystem: false
  },
  {
    category: 'userManagement',
    key: 'passwordRequirements',
    value: JSON.stringify('medium'),
    type: 'select',
    name: 'Password Requirements',
    description: 'Password complexity requirements',
    isSystem: false
  },
  {
    category: 'userManagement',
    key: 'sessionTimeout',
    value: JSON.stringify(30),
    type: 'number',
    name: 'Session Timeout',
    description: 'Session timeout in minutes',
    isSystem: false
  },
  {
    category: 'userManagement',
    key: 'maxUsers',
    value: JSON.stringify(1000),
    type: 'number',
    name: 'Max Users',
    description: 'Maximum number of users allowed',
    isSystem: false
  },

  // Security settings
  {
    category: 'security',
    key: 'twoFactor',
    value: JSON.stringify('optional'),
    type: 'select',
    name: 'Two Factor Authentication',
    description: 'Two factor authentication requirement',
    isSystem: false
  },
  {
    category: 'security',
    key: 'loginAttempts',
    value: JSON.stringify(5),
    type: 'number',
    name: 'Login Attempts',
    description: 'Maximum login attempts before lockout',
    isSystem: false
  },
  {
    category: 'security',
    key: 'lockoutDuration',
    value: JSON.stringify(30),
    type: 'number',
    name: 'Lockout Duration',
    description: 'Account lockout duration in minutes',
    isSystem: false
  },
  {
    category: 'security',
    key: 'passwordExpiry',
    value: JSON.stringify(90),
    type: 'number',
    name: 'Password Expiry',
    description: 'Password expiry in days',
    isSystem: false
  },
  {
    category: 'security',
    key: 'ipWhitelist',
    value: JSON.stringify(false),
    type: 'toggle',
    name: 'IP Whitelist',
    description: 'Enable IP whitelist for admin access',
    isSystem: false
  },

  // Notification settings
  {
    category: 'notifications',
    key: 'newRegistrationAlerts',
    value: JSON.stringify(true),
    type: 'toggle',
    name: 'New Registration Alerts',
    description: 'Send alerts for new registrations',
    isSystem: false
  },
  {
    category: 'notifications',
    key: 'dailySummary',
    value: JSON.stringify(true),
    type: 'toggle',
    name: 'Daily Summary',
    description: 'Send daily summary emails',
    isSystem: false
  },
  {
    category: 'notifications',
    key: 'maintenanceAlerts',
    value: JSON.stringify(true),
    type: 'toggle',
    name: 'Maintenance Alerts',
    description: 'Send maintenance alerts to admins',
    isSystem: false
  },
  {
    category: 'notifications',
    key: 'emailNotifications',
    value: JSON.stringify('enabled'),
    type: 'select',
    name: 'Email Notifications',
    description: 'Email notification settings',
    isSystem: false
  },
  {
    category: 'notifications',
    key: 'slackWebhook',
    value: JSON.stringify(''),
    type: 'text',
    name: 'Slack Webhook',
    description: 'Slack webhook URL for notifications',
    isSystem: false
  }
]

async function seedSettings() {
  try {
    console.log('🌱 Seeding default settings...')

    // Check if settings already exist
    const existingSettingsCount = await prisma.setting.count()
    if (existingSettingsCount > 0) {
      console.log(`📊 Settings already exist (${existingSettingsCount} found). Skipping seeding.`)
      return
    }

    let seededCount = 0
    for (const setting of defaultSettings) {
      try {
        await prisma.setting.upsert({
          where: {
            category_key: {
              category: setting.category,
              key: setting.key
            }
          },
          update: {
            // Only update non-system settings
            ...(setting.isSystem ? {} : {
              value: setting.value,
              type: setting.type,
              name: setting.name,
              description: setting.description,
              updatedAt: new Date()
            })
          },
          create: {
            category: setting.category,
            key: setting.key,
            value: setting.value,
            type: setting.type,
            name: setting.name,
            description: setting.description,
            isSystem: setting.isSystem,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        seededCount++
      } catch (settingError) {
        console.warn(`⚠️ Failed to seed setting ${setting.category}.${setting.key}:`, settingError)
      }
    }

    console.log(`✅ Successfully seeded ${seededCount}/${defaultSettings.length} settings`)

    // Verify settings were created
    const settingsCount = await prisma.setting.count()
    console.log(`📊 Total settings in database: ${settingsCount}`)

  } catch (error) {
    console.error('❌ Error seeding settings:', error)
    // Don't throw error in production builds - just log it
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Continuing build despite seeding error...')
    } else {
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
seedSettings()
  .then(() => {
    console.log('\n✅ Settings seeding completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Settings seeding failed:', error)
    // In production, don't fail the build for seeding errors
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Continuing despite seeding error in production...')
      process.exit(0)
    } else {
      process.exit(1)
    }
  })
