'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [fileInputs, setFileInputs] = useState<(File | null)[]>([])
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
  
    // Basic validation: ensure at least one file is selected
    const selectedFiles = fileInputs.filter((file) => file)
    if (selectedFiles.length === 0) {
      alert("⚠️ Please select at least one PDF to upload.")
      return
    }
  
    const formData = new FormData()
    selectedFiles.forEach((file) => {
      formData.append('pdfs', file as File)
    })
  
    try {
      const res = await fetch('/api/upload_pdfs', {
        method: 'POST',
        body: formData,
      })
  
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`)
      }
  
      const data = await res.json()
  
      if (Array.isArray(data.texts)) {
        alert(`✅ Uploaded ${data.texts.length} files`)
      } else {
        console.log("Unexpected response:", data)
        alert("⚠️ Upload succeeded but server response was unexpected.")
      }
    } catch (error) {
      console.error("❌ Upload error:", error)
      alert("❌ Failed to upload files. Please try again.")
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
              onChange={(e) =>
                handleFileChange(index, e.target.files?.[0] || null)
              }
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
          >
            Upload
          </button>
        )}
      </form>
    </main>
  )
}
