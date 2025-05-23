'use client'

import { useState, useEffect } from 'react'
import { insertCalendarEvents, GoogleCalendarEvent } from '@/app/lib/utils/InsertCalEvent'
import { useGapiCalendar } from '@/app/lib/hooks/useGapiCalendar'

const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY
const maxFiles = 10

export default function UploadPage() {
  const [fileInputs, setFileInputs] = useState<(File | null)[]>([])
  const [parsedEvents, setParsedEvents] = useState<GoogleCalendarEvent[]>([])
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { ready, error } = useGapiCalendar(API_KEY!)

  useEffect(() => {
    if (error) alert('❌ Google API failed to load')
  }, [error])

  const handleFileChange = (index: number, file: File | null) => {
    const newFiles = [...fileInputs]
    newFiles[index] = file
    setFileInputs(newFiles)
  }

  const handleAddInput = () => {
    if (fileInputs.length < maxFiles) {
      setFileInputs([...fileInputs, null])
    }
  }

  const handleRemoveInput = (index: number) => {
    const newFiles = [...fileInputs]
    newFiles.splice(index, 1)
    setFileInputs(newFiles)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setParsedEvents([])
    setSuccess(false)
    setLoading(true)

    const selectedFiles = fileInputs.filter(Boolean)
    if (selectedFiles.length === 0) {
      alert('⚠️ Please select at least one PDF.')
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => formData.append('pdfs', file!))

      const uploadRes = await fetch('/api/upload_pdfs', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadRes.json()
      const extractedText = uploadData.extractedText

      const geminiRes = await fetch('/api/gemini_call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: extractedText }),
      })

      const geminiData = await geminiRes.json()
      const rawResponse = geminiData.response || geminiData.error || 'No response'

      let cleanJson = rawResponse.trim()
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/```json|```/g, '').trim()
      }

      const events: GoogleCalendarEvent[] = JSON.parse(cleanJson)
      if (!Array.isArray(events)) throw new Error('Gemini did not return a valid array')

      setParsedEvents(events) // Store parsed events for preview
    } catch (err) {
      console.error('❌ Error:', err)
      alert('❌ Something went wrong. Check the console.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmInsert = async () => {
    if (!ready) {
      alert('Google Calendar is not ready yet.')
      return
    }

    try {
      setLoading(true)
      await insertCalendarEvents(parsedEvents)
      setParsedEvents([])
      setSuccess(true)
    } catch (err) {
      console.error('❌ Insert error:', err)
      alert('❌ Failed to insert events.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A1F44] text-white px-6 py-12 font-sans flex flex-col items-center">
      {success && (
        <div className="mb-6 w-full max-w-2xl bg-green-100 text-green-800 border border-green-300 px-4 py-3 rounded shadow text-center font-semibold">
          ✅ Events successfully added to Google Calendar!
        </div>
      )}

      <div className="bg-white text-gray-800 p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold mb-6 text-center">Upload Your Syllabus</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fileInputs.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                className="flex-1 border border-gray-300 rounded px-3 py-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveInput(index)}
                className="text-red-600 hover:text-red-800 font-bold text-lg"
              >
                ×
              </button>
            </div>
          ))}

          {fileInputs.length < maxFiles && (
            <button
              type="button"
              onClick={handleAddInput}
              className="bg-[#00B5E2] text-white px-4 py-2 rounded hover:bg-[#009cc7] transition"
            >
              + Add PDF
            </button>
          )}

          {fileInputs.length > 0 && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Upload'}
            </button>
          )}
        </form>

        {parsedEvents.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-3">Preview Events</h2>
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {parsedEvents.map((event, idx) => (
                <li key={idx} className="bg-gray-100 p-4 rounded text-sm">
                  <p><strong>{event.summary}</strong></p>
                  <p>
                    {new Date(event.start).toLocaleString()} →{' '}
                    {new Date(event.end).toLocaleTimeString()}
                  </p>
                  {event.location && <p>📍 {event.location}</p>}
                  {event.recurrence && <p>🔁 {event.recurrence.join(', ')}</p>}
                </li>
              ))}
            </ul>

            <button
              onClick={handleConfirmInsert}
              className="mt-6 w-full bg-[#00B5E2] text-white font-semibold py-3 rounded hover:bg-[#009cc7] transition"
              disabled={loading}
            >
              {loading ? 'Adding to Calendar...' : 'Confirm & Add to Google Calendar'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
