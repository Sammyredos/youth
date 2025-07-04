'use client'

import { useEffect } from 'react'

export function FaviconManager() {
  useEffect(() => {
    // Define updateFaviconElements function first
    const updateFaviconElements = (faviconUrl: string) => {
      console.log('🔧 FAVICON: Updating favicon elements to:', faviconUrl)

      // Remove ALL existing favicon elements first to prevent conflicts
      const existingFavicons = document.querySelectorAll('link[rel*="icon"], link[rel="shortcut icon"]')
      console.log(`🗑️ FAVICON: Removing ${existingFavicons.length} existing favicon elements`)
      existingFavicons.forEach(el => {
        console.log('🗑️ FAVICON: Removing:', el.getAttribute('rel'), el.getAttribute('href'))
        el.remove()
      })

      // Create new favicon elements with aggressive cache busting
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(7)
      const cacheBustedUrl = `${faviconUrl}?v=${timestamp}&r=${random}`

      console.log('🔧 FAVICON: Creating new favicon elements with URL:', cacheBustedUrl)

      // Main favicon (multiple formats for maximum compatibility)
      const favicon1 = document.createElement('link')
      favicon1.rel = 'icon'
      favicon1.type = faviconUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
      favicon1.href = cacheBustedUrl
      document.head.appendChild(favicon1)

      const favicon2 = document.createElement('link')
      favicon2.rel = 'shortcut icon'
      favicon2.href = cacheBustedUrl
      document.head.appendChild(favicon2)

      // Apple touch icon
      const appleTouchIcon = document.createElement('link')
      appleTouchIcon.rel = 'apple-touch-icon'
      appleTouchIcon.href = cacheBustedUrl
      document.head.appendChild(appleTouchIcon)

      // Force immediate browser refresh by manipulating the href
      setTimeout(() => {
        const allFavicons = document.querySelectorAll('link[rel*="icon"]')
        allFavicons.forEach(link => {
          const currentHref = link.getAttribute('href')
          if (currentHref) {
            link.setAttribute('href', '')
            setTimeout(() => {
              link.setAttribute('href', currentHref)
            }, 10)
          }
        })
      }, 100)

      console.log('✅ FAVICON: Favicon elements updated successfully')
    }

    // Set initial favicon immediately to prevent flashing
    const setInitialFavicon = () => {
      console.log('🚀 FAVICON: Setting initial favicon immediately...')

      // Check localStorage first for immediate favicon
      const cachedLogoUrl = localStorage.getItem('logo-url')
      if (cachedLogoUrl && cachedLogoUrl !== 'null') {
        console.log('⚡ FAVICON: Using cached logo URL:', cachedLogoUrl)
        updateFaviconElements(cachedLogoUrl)
      } else {
        console.log('⚡ FAVICON: Using default favicon initially')
        updateFaviconElements('/globe.svg')
      }
    }

    // Set initial favicon immediately
    setInitialFavicon()

    const updateFavicon = async () => {
      console.log('🔍 FAVICON: Starting favicon update process...')

      try {
        // Try multiple endpoints to get the logo
        const endpoints = [
          '/api/admin/settings/logo',
          '/api/admin/settings',
          '/api/system/branding'
        ]

        let logoUrl = null

        for (const endpoint of endpoints) {
          try {
            console.log(`🔍 FAVICON: Trying endpoint: ${endpoint}`)
            const response = await fetch(endpoint, {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            })

            if (response.ok) {
              const data = await response.json()
              console.log(`📄 FAVICON: Response from ${endpoint}:`, data)

              // Try different ways to extract logo URL
              logoUrl = data.logoUrl ||
                       data.settings?.find(s => s.key === 'logoUrl')?.value ||
                       (data.settings && data.settings.branding && data.settings.branding.logoUrl)

              if (logoUrl) {
                // Handle JSON-encoded strings
                try {
                  if (typeof logoUrl === 'string' && logoUrl.startsWith('"')) {
                    logoUrl = JSON.parse(logoUrl)
                  }
                } catch {
                  // logoUrl is already a string
                }
                console.log(`✅ FAVICON: Found logo URL: ${logoUrl} from ${endpoint}`)
                break
              }
            } else {
              console.log(`❌ FAVICON: ${endpoint} returned ${response.status}`)
            }
          } catch (err) {
            console.log(`⚠️ FAVICON: Error with ${endpoint}:`, err)
          }
        }

        if (logoUrl && logoUrl !== 'null' && logoUrl !== null) {
          console.log('🎯 FAVICON: Setting favicon to uploaded logo:', logoUrl)
          updateFaviconElements(logoUrl)
          // Cache the logo URL for immediate use on next load
          localStorage.setItem('logo-url', logoUrl)
        } else {
          console.log('🎯 FAVICON: No logo found, using default favicon')
          updateFaviconElements('/globe.svg')
          localStorage.removeItem('logo-url')
        }
      } catch (error) {
        console.error('🚨 FAVICON: Critical error:', error)
        updateFaviconElements('/globe.svg')
        localStorage.removeItem('logo-url')
      }
    }



    // Initial favicon update after setting initial favicon
    setTimeout(() => {
      updateFavicon()
    }, 100)

    // Listen for custom favicon update events
    const handleFaviconUpdate = (event: CustomEvent) => {
      console.log('🎯 FAVICON: Favicon update event received:', event.detail)
      const logoUrl = event.detail.logoUrl
      if (logoUrl && logoUrl !== 'null' && logoUrl !== null) {
        console.log('🔄 FAVICON: Updating favicon to new logo:', logoUrl)
        updateFaviconElements(logoUrl)
        localStorage.setItem('logo-url', logoUrl)
      } else {
        console.log('🔄 FAVICON: Reverting to default favicon')
        updateFaviconElements('/globe.svg')
        localStorage.removeItem('logo-url')
      }
    }

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'logo-url') {
        console.log('🔄 FAVICON: Logo URL changed in storage:', event.newValue)
        updateFaviconElements(event.newValue || '/globe.svg')
      }
    }

    // Listen for focus events to refresh favicon
    const handleFocus = () => {
      console.log('🔄 FAVICON: Window focused, checking for favicon updates...')
      updateFavicon()
    }

    window.addEventListener('favicon-update', handleFaviconUpdate as EventListener)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)

    // Aggressive periodic check every 3 seconds
    const interval = setInterval(() => {
      console.log('🔄 FAVICON: Periodic favicon check...')
      updateFavicon()
    }, 3000)

    // Cleanup
    return () => {
      window.removeEventListener('favicon-update', handleFaviconUpdate as EventListener)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [])

  return null // This component doesn't render anything
}
