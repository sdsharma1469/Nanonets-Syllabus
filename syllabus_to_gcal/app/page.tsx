'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const askGemini = async () => {
    setLoading(true)
    const res = await fetch('/api/gemini_call')
    const data = await res.json()
    setResponse(data.response || data.error)
    setLoading(false)
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <button
        onClick={askGemini}
        className="mb-4 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
      >
        Ask Gemini
      </button>

      {loading && <p>Loading...</p>}
      {!loading && response && <p className="text-gray-800">{response}</p>}

      <Link href="/upload">
        <button className="mt-8 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
          Go to Upload Page
        </button>
      </Link>
    </main>
  )
}
