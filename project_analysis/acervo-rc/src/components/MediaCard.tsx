import { useState, memo, useEffect } from 'react'
import { statusColors } from '@/hooks/useTaxonomy'
import type { CatalogoItem } from '@/lib/supabase'
import { FileImage, FileVideo, File, Play, ImageOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { VideoThumbnail } from './VideoThumbnail'
import { withCacheBuster } from '@/lib/media'

interface MediaCardProps {
  item: CatalogoItem
}

export const MediaCard = memo(function MediaCard({ item }: MediaCardProps) {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const statusClass = statusColors[item.status || ''] || 'bg-neutral-200 text-neutral-700'
  
  const isImage = item.arquivo_tipo?.startsWith('image')
  const isVideo = item.arquivo_tipo?.startsWith('video')
  const imageUrl = item.thumbnail_url || item.arquivo_url
  const cacheKey = item.updated_at || item.created_at || item.media_id || item.id
  const hasValidUrl = imageUrl && !imageError

  useEffect(() => {
    setImageLoading(true)
    setImageError(false)
  }, [imageUrl])

  // Gera cor de fundo baseada no titulo para placeholder
  const getPlaceholderColor = () => {
    const colors = [
      'from-emerald-400 to-teal-500',
      'from-blue-400 to-indigo-500',
      'from-purple-400 to-pink-500',
      'from-amber-400 to-orange-500',
      'from-rose-400 to-red-500',
      'from-cyan-400 to-blue-500',
    ]
    const index = item.titulo.length % colors.length
    return colors[index]
  }

  const renderPlaceholder = () => (
    <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderColor()} flex flex-col items-center justify-center text-white`}>
      {isVideo ? (
        <FileVideo className="w-10 h-10 opacity-80" />
      ) : isImage ? (
        <ImageOff className="w-10 h-10 opacity-80" />
      ) : (
        <File className="w-10 h-10 opacity-80" />
      )}
      <span className="text-xs mt-2 opacity-70 px-2 text-center truncate max-w-full">
        {item.arquivo_nome || 'Sem arquivo'}
      </span>
    </div>
  )

  return (
    <div
      onClick={() => navigate(`/item/${item.id}`)}
      className="glass-card hover:shadow-[0_20px_40px_-24px_rgba(7,14,10,0.7)] transition-all duration-300 cursor-pointer group overflow-hidden hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] bg-neutral-950/40 flex items-center justify-center overflow-hidden">
        {hasValidUrl && isImage ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 shimmer" aria-hidden="true" />
            )}
            <img
              src={imageUrl}
              alt={item.titulo}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageError(true)}
            />
          </>
        ) : ((item.proxy_url || item.arquivo_url) && isVideo) ? (
          <VideoThumbnail
            src={withCacheBuster(item.proxy_url || item.arquivo_url, cacheKey)}
            thumbnailUrl={item.thumbnail_url}
            className="w-full h-full"
            showPlayIcon={true}
            playIconSize="md"
            onError={() => setImageError(true)}
          />
        ) : (
          renderPlaceholder()
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Status Badge */}
        {item.status && (
          <span className={`absolute top-3 right-3 px-2.5 py-1 text-[11px] font-semibold rounded-full shadow-sm ${statusClass}`}>
            {item.status}
          </span>
        )}
        
        {/* Tipo de arquivo badge */}
        {item.arquivo_tipo && (
          <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] bg-black/60 text-white rounded backdrop-blur-sm">
            {isVideo ? 'Video' : isImage ? 'Imagem' : 'Documento'}
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-rc-text truncate group-hover:text-rc-gold transition-colors text-sm lg:text-base">
          {item.titulo}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-rc-text-muted">
          {item.data_captacao && (
            <span>{new Date(item.data_captacao).toLocaleDateString('pt-BR')}</span>
          )}
          {item.area_fazenda && (
            <>
              {item.data_captacao && <span className="text-rc-border">|</span>}
              <span className="truncate">{item.area_fazenda}</span>
            </>
          )}
        </div>
        {item.tema_principal && (
          <span className="rc-badge mt-2 truncate max-w-full">
            {item.tema_principal}
          </span>
        )}
      </div>
    </div>
  )
})
