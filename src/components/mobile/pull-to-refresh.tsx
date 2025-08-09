'use client'

import { useState, useRef, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  const maxPullDistance = 80
  const refreshThreshold = 60

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY > 0) return
    
    startY.current = e.touches[0].clientY
    currentY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (window.scrollY > 0 || isRefreshing) return
    
    currentY.current = e.touches[0].clientY
    const deltaY = currentY.current - startY.current

    if (deltaY > 0) {
      e.preventDefault()
      const distance = Math.min(deltaY * 0.5, maxPullDistance)
      setPullDistance(distance)
      setIsPulling(distance > 10)
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= refreshThreshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setIsPulling(false)
    setPullDistance(0)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preventPassive = { passive: false }
    
    container.addEventListener('touchstart', handleTouchStart, preventPassive)
    container.addEventListener('touchmove', handleTouchMove, preventPassive)
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [pullDistance, isRefreshing])

  const getRefreshOpacity = () => {
    return Math.min(pullDistance / refreshThreshold, 1)
  }

  const getRotation = () => {
    if (isRefreshing) return 'animate-spin'
    return pullDistance >= refreshThreshold ? 'rotate-180' : 'rotate-0'
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Pull to Refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 ease-out z-10"
        style={{
          transform: `translateY(${pullDistance - 60}px)`,
          opacity: getRefreshOpacity(),
        }}
      >
        <div className="bg-white rounded-full p-3 shadow-lg border border-gray-200">
          <RefreshCw
            className={`w-5 h-5 text-hermes-orange transition-transform duration-200 ${getRotation()}`}
          />
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}