import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Folder, Image, Video, FileText, Play } from 'lucide-react'
import { VideoThumbnail } from './VideoThumbnail'

interface CoverMedia {
  url: string
  type: 'image' | 'video'
}

interface FolderCardProps {
  name: string
  slug: string
  itemCount: number
  imageCount: number
  videoCount: number
  covers?: CoverMedia[]
}

export const FolderCard = memo(function FolderCard({ name, slug, itemCount, imageCount, videoCount, covers = [] }: FolderCardProps) {
  return (
    <Link
      to={`/acervo/${slug}`}
      className="group relative block overflow-hidden rc-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Cover Media Grid or Gradient Background */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {covers.length > 0 ? (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="overflow-hidden relative">
                {covers[i] ? (
                  covers[i].type === 'image' ? (
                    <img
                      src={covers[i].url}
                      alt={`${name} ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <VideoThumbnail
                      src={covers[i].url}
                      className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                      showPlayIcon={true}
                      playIconSize="sm"
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-neutral-200" />
                )}
              </div>
            ))}
          </div>
        ) : videoCount > 0 ? (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#1f1f1f] to-[#2a2a2a] flex items-center justify-center">
            <Video className="w-20 h-20 text-white/30" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a5f1a] via-[#2e7d2e] to-[#134a13] flex items-center justify-center">
            <Folder className="w-20 h-20 text-white/30" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Folder Icon Badge */}
        <div className="absolute top-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
          <Folder className="w-6 h-6 text-white" />
        </div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{name}</h3>
          
          <div className="flex items-center gap-4 text-white/90">
            <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </span>
            
            {imageCount > 0 && (
              <span className="flex items-center gap-1 text-sm">
                <Image className="w-4 h-4" /> {imageCount}
              </span>
            )}
            
            {videoCount > 0 && (
              <span className="flex items-center gap-1 text-sm">
                <Video className="w-4 h-4" /> {videoCount}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#d4af37]/50 rounded-2xl transition-colors duration-300 pointer-events-none" />
    </Link>
  )
})
