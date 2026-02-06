import { useState, useRef, useEffect, memo } from 'react'
import { Image as ImageIcon } from 'lucide-react'

/* eslint-disable react-refresh/only-export-components */

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  onClick?: () => void
  aspectRatio?: 'square' | 'video' | 'auto'
  priority?: boolean // Carrega imediatamente sem lazy loading
}

// Cache de imagens carregadas para evitar recarregamentos
const loadedImages = new Set<string>()

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className = '',
  onClick,
  aspectRatio = 'square',
  priority = false
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(loadedImages.has(src))
  const [error, setError] = useState(false)
  const [isVisible, setIsVisible] = useState(priority)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver para lazy loading
  useEffect(() => {
    if (priority || isVisible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px', threshold: 0.01 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [priority, isVisible])

  const handleLoad = () => {
    loadedImages.add(src)
    setLoaded(true)
  }

  const handleError = () => {
    setError(true)
  }

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  }

  if (error) {
    return (
      <div 
        ref={containerRef}
        className={`bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center ${aspectClasses[aspectRatio]} ${className}`}
        onClick={onClick}
      >
        <ImageIcon className="w-12 h-12 text-neutral-400" />
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${aspectClasses[aspectRatio]} ${className}`}
      onClick={onClick}
    >
      {/* Placeholder com shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-neutral-200 shimmer" />
      )}
      
      {/* Imagem real */}
      {isVisible && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
})

// Componente para pré-carregar imagens críticas
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (loadedImages.has(src)) {
      resolve()
      return
    }
    
    const img = new Image()
    img.onload = () => {
      loadedImages.add(src)
      resolve()
    }
    img.onerror = reject
    img.src = src
  })
}

// Hook para pré-carregar múltiplas imagens
export function usePreloadImages(urls: string[]) {
  useEffect(() => {
    urls.forEach(url => {
      if (!loadedImages.has(url)) {
        const img = new Image()
        img.onload = () => loadedImages.add(url)
        img.src = url
      }
    })
  }, [urls])
}
