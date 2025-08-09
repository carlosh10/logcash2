'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function BottomSheet({ isOpen, onClose, title, children, className = '' }: BottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Prevent body scroll when sheet is open
      if (typeof document !== 'undefined') {
        document.body.classList.add('overflow-hidden')
      }
    } else {
      setTimeout(() => setIsVisible(false), 200)
      if (typeof document !== 'undefined') {
        document.body.classList.remove('overflow-hidden')
      }
    }

    // Cleanup on unmount
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('overflow-hidden')
      }
    }
  }, [isOpen])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleDragStart = (e: React.TouchEvent) => {
    const startY = e.touches[0].clientY
    let currentY = startY
    let isDragging = false

    const handleDragMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY
      const deltaY = currentY - startY

      if (deltaY > 10) {
        isDragging = true
        const sheet = document.getElementById('bottom-sheet-content')
        if (sheet) {
          sheet.style.transform = `translateY(${Math.max(0, deltaY)}px)`
        }
      }
    }

    const handleDragEnd = () => {
      const deltaY = currentY - startY
      const sheet = document.getElementById('bottom-sheet-content')

      if (sheet) {
        sheet.style.transform = ''
      }

      if (isDragging && deltaY > 100) {
        onClose()
      }

      document.removeEventListener('touchmove', handleDragMove)
      document.removeEventListener('touchend', handleDragEnd)
    }

    document.addEventListener('touchmove', handleDragMove, { passive: false })
    document.addEventListener('touchend', handleDragEnd)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Sheet */}
      <div
        id="bottom-sheet-content"
        className={`relative w-full bg-white rounded-t-3xl shadow-xl transition-transform duration-300 ease-out safe-area-bottom ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } ${className}`}
        onTouchStart={handleDragStart}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-old-money-navy">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            >
              <X className="w-5 h-5 text-old-money-gray" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}