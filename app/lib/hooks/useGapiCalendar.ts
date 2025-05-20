'use client'

import { useEffect, useState } from 'react'

const GAPI_SCRIPT_URL = 'https://apis.google.com/js/api.js'

export function useGapiCalendar(apiKey: string) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return reject(new Error('No window object'))
        if (window.gapi) return resolve()

        const script = document.createElement('script')
        script.src = GAPI_SCRIPT_URL
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load gapi script'))
        document.body.appendChild(script)
      })
    }

    const initGapi = async () => {
      try {
        await loadScript()

        await new Promise<void>((resolve) => {
          window.gapi.load('client', async () => {
            await window.gapi.client.init({
                apiKey: process.env.GOOGLE_CALENDAR_API_KEY,
                clientId: process.env.GOOGLE_CLIENT_ID,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                scope: 'https://www.googleapis.com/auth/calendar',
              })
            await window.gapi.client.load('calendar', 'v3')
            resolve()
          })
        })

        setReady(true)
      } catch (err) {
        console.error('❌ useGapiCalendar error:', err)
        setError(err as Error)
      }
    }

    initGapi()
  }, [apiKey])

  return { ready, error }
}
