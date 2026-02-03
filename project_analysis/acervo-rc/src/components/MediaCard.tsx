import { useState, memo } from 'react'
import { statusColors } from '@/hooks/useTaxonomy'
import type { CatalogoItem } from '@/lib/supabase'
import { FileImage, FileVideo, File, Play, ImageOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { VideoThumbnail } from './VideoThumbnail'

interface MediaCardProps {
  item: CatalogoItem
}

export const MediaCard = memo(function MediaCard({ item }: MediaCardProps) {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)
  const statusClass = statusColors[item.status || ''] || 'bg-neutral-200 text-neutral-700'
  
  const isImage = item.arquivo_tipo?.startsWith('image')
  const isVideo = item.arquivo_tipo?.startsWith('video')
  const hasValidUrl = item.arquivo_url && !imageError

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
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden border border-neutral-100"
    >
      <div className="relative aspect-video bg-neutral-100 flex items-center justify-center overflow-hidden">
        {hasValidUrl && isImage ? (
          <img
            src={item.arquivo_url}
            alt={item.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : hasValidUrl && isVideo ? (
          <VideoThumbnail
            src={item.arquivo_url!}
            thumbnailUrl={item.thumbnail_url}
            className="w-full h-full"
            showPlayIcon={true}
            playIconSize="md"
            onError={() => setImageError(true)}
          />
        ) : (
          renderPlaceholder()
        )}
        
        {/* Status Badge */}
        {item.status && (
          <span className={`absolute top-2 right-2 px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${statusClass}`}>
            {item.status}
          </span>
        )}
        
        {/* Tipo de arquivo badge */}
        {item.arquivo_tipo && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 text-xs bg-black/60 text-white rounded backdrop-blur-sm">
            {isVideo ? 'Video' : isImage ? 'Imagem' : 'Documento'}
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900 truncate group-hover:text-primary-600 transition-colors text-sm lg:text-base">
          {item.titulo}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-neutral-500">
          {item.data_captacao && (
            <span>{new Date(item.data_captacao).toLocaleDateString('pt-BR')}</span>
          )}
          {item.area_fazenda && (
            <>
              {item.data_captacao && <span className="text-neutral-300">|</span>}
              <span className="truncate">{item.area_fazenda}</span>
            </>
          )}
        </div>
        {item.tema_principal && (
          <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-primary-50 text-primary-600 rounded-full truncate max-w-full">
            {item.tema_principal}
          </span>
        )}
      </div>
    </div>
  )
})
