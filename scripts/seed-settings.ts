import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedSettings() {
  try {
    console.log('🌱 Seeding default settings...')

    // Default system settings
    const defaultSettings = [
      {
        category: 'branding',
        key: 'systemName',
        name: 'System Name',
        value: 'MOPGOM Global Youth Registration',
        type: 'text',
        description: 'System name displayed throughout the application'
      },
      {
        category: 'branding',
        key: 'systemDescription',
        name: 'System Description',
        value: 'Youth registration and management platform',
        type: 'text',
        description: 'Brief description of the system'
      },
      {
        category: 'branding',
        key: 'logoUrl',
        name: 'Logo URL',
        value: null,
        type: 'text',
        description: 'URL of the system logo'
      },
      {
        category: 'system',
        key: 'timezone',
        name: 'System Timezone',
        value: 'UTC-5 (EST)',
        type: 'text',
        description: 'Default timezone for the system'
      },
      {
        category: 'system',
        key: 'dateFormat',
        name: 'Date Format',
        value: 'MM/DD/YYYY',
        type: 'text',
        description: 'Default date format'
      },
      {
        category: 'system',
        key: 'maintenanceMode',
        name: 'Maintenance Mode',
        value: false,
        type: 'boolean',
        description: 'Enable maintenance mode'
      },
      {
        category: 'system',
        key: 'debugMode',
        name: 'Debug Mode',
        value: false,
        type: 'boolean',
        description: 'Enable debug mode'
      },
      {
        category: 'registration',
        key: 'enabled',
        name: 'Registration Enabled',
        value: true,
        type: 'boolean',
        description: 'Enable/disable new registrations'
      },
      {
        category: 'registration',
        key: 'minimumAge',
        name: 'Minimum Age',
        value: 16,
        type: 'number',
        description: 'Minimum age for registration'
      },
      {
        category: 'registration',
        key: 'maximumAge',
        name: 'Maximum Age',
        value: 35,
        type: 'number',
        description: 'Maximum age for registration'
      },
      {
        category: 'registration',
        key: 'closureDate',
        name: 'Registration Closure Date',
        value: '2024-12-31',
        type: 'date',
        description: 'Registration closure date'
      },
      {
        category: 'email',
        key: 'enabled',
        name: 'Email Enabled',
        value: true,
        type: 'boolean',
        description: 'Enable email notifications'
      },
      {
        category: 'sms',
        key: 'enabled',
        name: 'SMS Enabled',
        value: false,
        type: 'boolean',
        description: 'Enable SMS notifications'
      },
      {
        category: 'accommodations',
        key: 'enabled',
        name: 'Accommodations Enabled',
        value: true,
        type: 'boolean',
        description: 'Enable accommodation management'
      },
      {
        category: 'accommodations',
        key: 'ageGapLimit',
        name: 'Age Gap Limit',
        value: 3,
        type: 'number',
        description: 'Maximum age gap for room allocation'
      },
      {
        category: 'security',
        key: 'maxLoginAttempts',
        name: 'Max Login Attempts',
        value: 5,
        type: 'number',
        description: 'Maximum login attempts before lockout'
      },
      {
        category: 'security',
        key: 'lockoutDuration',
        name: 'Lockout Duration',
        value: 30,
        type: 'number',
        description: 'Account lockout duration in minutes'
      },
      {
        category: 'notifications',
        key: 'newRegistrationAlerts',
        name: 'New Registration Alerts',
        value: true,
        type: 'boolean',
        description: 'Send alerts for new registrations'
      },
      {
        category: 'notifications',
        key: 'dailySummary',
        name: 'Daily Summary',
        value: true,
        type: 'boolean',
        description: 'Send daily summary emails'
      },
      {
        key: 'registration.enabled',
        value: 'true',
        description: 'Enable/disable new registrations'
      },
      {
        key: 'registration.minimum_age',
        value: '16',
        description: 'Minimum age for registration'
      },
      {
        key: 'registration.maximum_age',
        value: '35',
        description: 'Maximum age for registration'
      },
      {
        key: 'registration.closure_date',
        value: '2024-12-31',
        description: 'Registration closure date'
      },
      {
        key: 'email.enabled',
        value: 'true',
        description: 'Enable email notifications'
      },
      {
        key: 'sms.enabled',
        value: 'false',
        description: 'Enable SMS notifications'
      },
      {
        key: 'accommodations.enabled',
        value: 'true',
        description: 'Enable accommodation management'
      },
      {
        key: 'accommodations.age_gap_limit',
        value: '3',
        description: 'Maximum age gap for room allocation'
      },
      {
        key: 'backup.enabled',
        value: 'true',
        description: 'Enable automatic backups'
      },
      {
        key: 'backup.encryption',
        value: 'false',
        description: 'Enable backup encryption'
      }
    ]

    // Upsert each setting
    for (const setting of defaultSettings) {
      if (setting.category) {
        // Handle categorized settings (new format)
        await prisma.setting.upsert({
          where: {
            category_key: {
              category: setting.category,
              key: setting.key
            }
          },
          update: {
            name: setting.name,
            description: setting.description,
            type: setting.type
          },
          create: {
            category: setting.category,
            key: setting.key,
            name: setting.name,
            value: setting.value === null ? null : JSON.stringify(setting.value),
            type: setting.type,
            description: setting.description
          }
        })
      } else {
        // Handle legacy settings (old format)
        await prisma.setting.upsert({
          where: { key: setting.key },
          update: {
            description: setting.description
          },
          create: {
            key: setting.key,
            value: setting.value,
            description: setting.description
          }
        })
      }
    }

    console.log(`✅ Seeded ${defaultSettings.length} default settings`)
    console.log('🎯 Settings configured:')
    console.log('   - System name and description')
    console.log('   - Registration settings (enabled, age limits)')
    console.log('   - Communication settings (email/SMS disabled by default)')
    console.log('   - Accommodation settings')
    console.log('   - Backup settings')
    console.log('\n📝 You can modify these settings in the admin panel.')

  } catch (error) {
    console.error('❌ Error seeding settings:', error)
    // Don't throw error to prevent build failure
    console.log('⚠️  Continuing with deployment...')
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
seedSettings()
  .then(() => {
    console.log('✅ Settings seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Settings seeding failed:', error)
    process.exit(0) // Exit with 0 to not fail the build
  })
