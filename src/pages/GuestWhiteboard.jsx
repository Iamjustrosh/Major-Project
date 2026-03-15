import React, { useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tldraw, getSnapshot, exportAs } from 'tldraw'
import { useAuthStore } from '../store/useAuthStore'
import GuestBanner from '../components/GuestBanner'
import 'tldraw/tldraw.css'

export default function GuestWhiteboard() {
  const navigate = useNavigate()
  const { isGuest } = useAuthStore()
  const editorRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)
  const [toast, setToast] = useState(null)

  // Redirect if somehow accessed without guest mode
  if (!isGuest) {
    navigate('/homepage')
    return null
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ✅ Export as PNG using tldraw 4.x exportAs()
  const handleExportPNG = useCallback(async () => {
    const editor = editorRef.current
    if (!editor) return showToast('Whiteboard not ready', 'error')

    const shapeIds = [...editor.getCurrentPageShapeIds()]

    if (shapeIds.length === 0) {
      showToast('Nothing to export — draw something first!', 'error')
      return
    }

    setIsExporting(true)
    try {
      // exportAs triggers a download automatically — no blob handling needed
      await exportAs(editor, shapeIds, 'png', `collab-board-${Date.now()}`)
      showToast('✓ PNG exported successfully!')
    } catch (err) {
      console.error('PNG export error:', err)
      showToast('Export failed — try again', 'error')
    } finally {
      setIsExporting(false)
    }
  }, [])

  // ✅ Export as JSON using tldraw 4.x getSnapshot()
  const handleExportJSON = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return showToast('Whiteboard not ready', 'error')

    const shapeIds = [...editor.getCurrentPageShapeIds()]
    if (shapeIds.length === 0) {
      showToast('Nothing to export — draw something first!', 'error')
      return
    }

    try {
      // getSnapshot returns { document, session } — fully re-importable via loadSnapshot()
      const snapshot = getSnapshot(editor.store)
      const json = JSON.stringify(snapshot, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `collab-board-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('✓ JSON exported — re-importable anytime!')
    } catch (err) {
      console.error('JSON export error:', err)
      showToast('Export failed — try again', 'error')
    }
  }, [])

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">

      {/* Guest Banner — export + auth actions */}
      <GuestBanner
        onExportPNG={handleExportPNG}
        onExportJSON={handleExportJSON}
        isExporting={isExporting}
      />

      {/* Whiteboard — fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <Tldraw
          persistenceKey="guest-whiteboard"
          autoFocus
          onMount={(editor) => {
            editorRef.current = editor
          }}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl z-[9999] transition-all
          ${toast.type === 'error'
            ? 'bg-red-600/90 text-white border border-red-500/40'
            : 'bg-gray-800 text-white border border-white/10'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}