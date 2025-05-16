'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [fileInputs, setFileInputs] = useState<(File | null)[]>([])
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const maxFiles = 10

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
    setGeminiResponse(null)
    setLoading(true)

    const selectedFiles = fileInputs.filter((file) => file)
    if (selectedFiles.length === 0) {
      alert('⚠️ Please select at least one PDF to upload.')
      setLoading(false)
      return
    }

    const formData = new FormData()
    selectedFiles.forEach((file) => {
      formData.append('pdfs', file as File)
    })

    try {
      // 1. Upload PDFs to get extracted text
      const uploadRes = await fetch('/api/upload_pdfs', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error(`Upload failed with status ${uploadRes.status}`)
      }

      const uploadData = await uploadRes.json()
      const extractedText = uploadData.extractedText

      // 2. Call Gemini route with extracted text (now using POST)
      const geminiRes = await fetch('/api/gemini_call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: extractedText }),
      })
      const geminiData = await geminiRes.json()


      setGeminiResponse(geminiData.response || geminiData.error || 'No response')
    } catch (error) {
      console.error('❌ Error:', error)
      alert('❌ Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6">Upload PDFs</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        {fileInputs.map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => handleRemoveInput(index)}
              className="text-red-500 hover:text-red-700 text-lg font-bold"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}

        {fileInputs.length < maxFiles && (
          <button
            type="button"
            onClick={handleAddInput}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Add PDF
          </button>
        )}

        {fileInputs.length > 0 && (
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Upload & Ask Gemini'}
          </button>
        )}
      </form>

      {geminiResponse && (
        <div className="mt-8 border p-4 rounded bg-gray-100 max-w-2xl whitespace-pre-wrap">
          <h2 className="text-lg font-semibold mb-2">🧠 Gemini Response:</h2>
          <p>{geminiResponse}</p>
        </div>
      )}
    </main>
  )
}
