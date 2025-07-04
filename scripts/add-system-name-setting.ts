import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addSystemNameSetting() {
  try {
    console.log('🔧 Adding system name setting to branding category...')

    // Add system name setting to branding category
    const systemNameSetting = await prisma.setting.upsert({
      where: {
        category_key: {
          category: 'branding',
          key: 'systemName'
        }
      },
      update: {
        name: 'System Name',
        description: 'System name displayed throughout the application',
        type: 'text'
      },
      create: {
        category: 'branding',
        key: 'systemName',
        name: 'System Name',
        value: JSON.stringify('MOPGOM Global Youth Registration'),
        type: 'text',
        description: 'System name displayed throughout the application'
      }
    })

    console.log('✅ System name setting created/updated:', systemNameSetting)

    // Add system description setting to branding category
    const systemDescSetting = await prisma.setting.upsert({
      where: {
        category_key: {
          category: 'branding',
          key: 'systemDescription'
        }
      },
      update: {
        name: 'System Description',
        description: 'Brief description of the system',
        type: 'text'
      },
      create: {
        category: 'branding',
        key: 'systemDescription',
        name: 'System Description',
        value: JSON.stringify('Youth registration and management platform'),
        type: 'text',
        description: 'Brief description of the system'
      }
    })

    console.log('✅ System description setting created/updated:', systemDescSetting)

    // Verify the settings exist
    const brandingSettings = await prisma.setting.findMany({
      where: {
        category: 'branding'
      }
    })

    console.log('\n📋 Current branding settings:')
    brandingSettings.forEach(setting => {
      console.log(`   - ${setting.key}: ${setting.value}`)
    })

    console.log('\n🎯 System name setting is now available in the admin panel!')
    console.log('   Go to Admin → Settings → General → System Branding')

  } catch (error) {
    console.error('❌ Error adding system name setting:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
addSystemNameSetting()
  .then(() => {
    console.log('✅ System name setting setup completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ System name setting setup failed:', error)
    process.exit(1)
  })
