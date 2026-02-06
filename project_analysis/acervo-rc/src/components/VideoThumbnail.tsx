import { useState, useEffect, useRef, memo } from 'react'
import { Play, Video } from 'lucide-react'

interface VideoThumbnailProps {
  src: string
  thumbnailUrl?: string | null
  alt?: string
  className?: string
  showPlayIcon?: boolean
  playIconSize?: 'sm' | 'md' | 'lg'
  onHoverPlay?: boolean
  onError?: () => void
}

export const VideoThumbnail = memo(function VideoThumbnail({
  src,
  thumbnailUrl,
  alt = 'Video',
  className = '',
  showPlayIcon = true,
  playIconSize = 'md',
  onHoverPlay = false,
  onError
}: VideoThumbnailProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [useImage, setUseImage] = useState(!!thumbnailUrl)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // IntersectionObserver para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Timeout para fallback - so inicia quando visivel
  useEffect(() => {
    if (!isVisible) return

    timeoutRef.current = setTimeout(() => {
      if (!loaded) {
        setError(true)
        onError?.()
      }
    }, 15000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isVisible, src, loaded, onError])

  const handleError = () => {
    setError(true)
    onError?.()
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const iconSizes = {
    sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
    md: { container: 'w-12 h-12', icon: 'w-6 h-6' },
    lg: { container: 'w-14 h-14', icon: 'w-7 h-7' }
  }

  if (error) {
    return (
      <div ref={containerRef} className={`bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center ${className}`}>
        <Video className="w-12 h-12 text-white/60" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {isVisible && useImage && thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={alt}
          className={`w-full h-full object-cover ${!loaded ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          onLoad={() => setLoaded(true)}
          onError={() => { setUseImage(false); setLoaded(false) }}
        />
      ) : null}
      
      {(!loaded || !isVisible) && !error && (
        <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center">
          <Video className="w-8 h-8 text-neutral-400" />
        </div>
      )}
      
      {showPlayIcon && loaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`${iconSizes[playIconSize].container} bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center`}>
            <Play className={`${iconSizes[playIconSize].icon} text-white ml-0.5`} />
          </div>
        </div>
      )}
    </div>
  )
})
