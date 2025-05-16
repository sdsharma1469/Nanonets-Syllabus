'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    google: any
    gapi: any
  }
}

const CLIENT_ID = '713280709835-2523lsdhhrjds94051531u9ug0255put.apps.googleusercontent.com'
const API_KEY = 'AIzaSyClH3qCqk5DgD-d6UWrFQ2cJx2_sn1XgkI'
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'

export default function CalendarPage() {
  const [events, setEvents] = useState<string>('🗓️ Events will appear here...')
  const [gapiLoaded, setGapiLoaded] = useState(false)
  const [gisLoaded, setGisLoaded] = useState(false)
  const [tokenClient, setTokenClient] = useState<any>(null)

  useEffect(() => {
    const loadScripts = async () => {
      await loadScript('https://apis.google.com/js/api.js', () => gapiLoadedCallback())
      await loadScript('https://accounts.google.com/gsi/client', () => gisLoadedCallback())
    }

    loadScripts()
  }, [])

  const loadScript = (src: string, onload: () => void) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.onload = onload
    document.body.appendChild(script)
  }

  const gapiLoadedCallback = () => {
    window.gapi.load('client', async () => {
      await window.gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      })
      setGapiLoaded(true)
    })
  }

  const gisLoadedCallback = () => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // Will be set before calling
    })
    setTokenClient(client)
    setGisLoaded(true)
  }

  const handleAuthClick = () => {
    if (!tokenClient) return

    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        throw resp
      }
      document.getElementById('signout_button')!.style.visibility = 'visible'
      document.getElementById('authorize_button')!.innerText = 'Refresh'
      await listUpcomingEvents()
    }

    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' })
    } else {
      tokenClient.requestAccessToken({ prompt: '' })
    }
  }

  const handleSignoutClick = () => {
    const token = window.gapi.client.getToken()
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token)
      window.gapi.client.setToken('')
      setEvents('🗓️ Events will appear here...')
      document.getElementById('authorize_button')!.innerText = 'Authorize'
      document.getElementById('signout_button')!.style.visibility = 'hidden'
    }
  }

  const listUpcomingEvents = async () => {
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
      })

      const events = response.result.items
      if (!events || events.length === 0) {
        setEvents('No events found.')
        return
      }

      const output = events
        .map((event: any) => `${event.summary} (${event.start.dateTime || event.start.date})`)
        .join('\n')
      setEvents(`Events:\n${output}`)
    } catch (err: any) {
      setEvents(err.message)
    }
  }

  const ready = gapiLoaded && gisLoaded

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Google Calendar API Quickstart</h1>
      <div className="flex gap-4 mb-4">
        <button
          id="authorize_button"
          onClick={handleAuthClick}
          disabled={!ready}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Authorize
        </button>
        <button
          id="signout_button"
          onClick={handleSignoutClick}
          style={{ visibility: 'hidden' }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
      <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">{events}</pre>
    </main>
  )
}
