/* eslint-disable */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    google: typeof google
    gapi: typeof gapi
  }

  namespace google.accounts.oauth2 {
    interface TokenResponse {
      access_token: string
      expires_in: string
      token_type: string
      scope: string
      error: string
    }

    interface TokenClient {
      requestAccessToken: (overrideConfig?: google.accounts.oauth2.OverridableTokenClientConfig) => void
    }
    
    interface TokenClientConfig {
      client_id: string
      scope: string
      callback: (tokenResponse: TokenResponse) => void
    }

    function initTokenClient(config: TokenClientConfig): TokenClient
  }

  namespace gapi {
    function load(api: string, callback: () => void): void

    namespace client {
      function init(config: { apiKey: string }): Promise<void>
      function getToken(): { access_token?: string } | null
    }
  }
}

const CLIENT_ID = '713280709835-2523lsdhhrjds94051531u9ug0255put.apps.googleusercontent.com'
const API_KEY = 'AIzaSyClH3qCqk5DgD-d6UWrFQ2cJx2_sn1XgkI'
const SCOPES = 'https://www.googleapis.com/auth/calendar'

export default function Home() {
  const [tokenClient, setTokenClient] = useState<google.accounts.oauth2.TokenClient | null>(null)
  const [gapiLoaded, setGapiLoaded] = useState<boolean>(false)
  const [gisLoaded, setGisLoaded] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    const loadScript = (src: string, onload: () => void) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.defer = true
      script.onload = onload
      document.body.appendChild(script)
    }

    loadScript('https://apis.google.com/js/api.js', () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({ apiKey: API_KEY })
        setGapiLoaded(true)
      })
    })

    loadScript('https://accounts.google.com/gsi/client', () => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (resp) => {
          if (resp.error) {
            console.error('OAuth2 error:', resp.error)
            return
          }

          const token = window.gapi.client.getToken()
          const accessToken = token?.access_token
          if (!accessToken) return

          await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          })

          router.push('/upload')
        },
      })
      setTokenClient(client)
      setGisLoaded(true)
    })
  }, [router])

  const handleSignIn = () => {
    if (!tokenClient) return
    tokenClient.requestAccessToken({ prompt: 'consent' })
  }

  return (
    <main className="relative min-h-screen bg-[#0A1F44] text-white flex flex-col items-center justify-center px-6 py-12 font-sans overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative max-w-xl text-center space-y-6 z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
          Welcome to Syl2Cal
        </h1>
        <p className="text-lg md:text-xl text-gray-300">
          Upload your syllabus and sync your class schedule with Google Calendar effortlessly.
        </p>
        <button
          onClick={handleSignIn}
          disabled={!(gapiLoaded && gisLoaded)}
          className="bg-[#00B5E2] text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-[#009cc7] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign in with Google
        </button>
      </div>
    </main>
  )
}
