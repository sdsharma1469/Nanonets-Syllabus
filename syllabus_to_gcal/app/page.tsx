'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-white p-8">
      <Link href="/upload">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
          Go to Upload Page
        </button>
      </Link>
    </main>
  )
}
