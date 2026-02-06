import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, RotateCw, Info } from 'lucide-react'
import { CatalogoItem } from '@/lib/supabase'

interface ImageLightboxProps {
  item: CatalogoItem
  items?: CatalogoItem[]
  currentIndex?: number
  onClose: () => void
  onNavigate?: (index: number) => void
}

export function ImageLightbox({ item, items = [], currentIndex = 0, onClose, onNavigate }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const isImage = item.arquivo_tipo?.startsWith('image')
  const isVideo = item.arquivo_tipo?.startsWith('video')
  const canNavigate = items.length > 1

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape': onClose(); break
      case 'ArrowLeft': if (canNavigate && currentIndex > 0) onNavigate?.(currentIndex - 1); break
      case 'ArrowRight': if (canNavigate && currentIndex < items.length - 1) onNavigate?.(currentIndex + 1); break
      case '+': case '=': setZoom(z => Math.min(z + 0.25, 4)); break
      case '-': setZoom(z => Math.max(z - 0.25, 0.5)); break
      case 'r': setRotation(r => (r + 90) % 360); break
      case 'i': setShowInfo(s => !s); break
    }
  }, [onClose, canNavigate, currentIndex, items.length, onNavigate])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  useEffect(() => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(z => Math.min(Math.max(z + delta, 0.5), 4))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold truncate max-w-md">{item.titulo}</h3>
          {canNavigate && (
            <span className="text-white/60 text-sm">{currentIndex + 1} / {items.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isImage && (
            <>
              <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Zoom out (-)">
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white/60 text-sm min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(z + 0.25, 4))} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Zoom in (+)">
                <ZoomIn className="w-5 h-5" />
              </button>
              <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Rotacionar (R)">
                <RotateCw className="w-5 h-5" />
              </button>
            </>
          )}
          <button onClick={() => setShowInfo(!showInfo)} className={`p-2 rounded-lg transition-all ${showInfo ? 'text-primary-400 bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`} title="Informacoes (I)">
            <Info className="w-5 h-5" />
          </button>
          {item.arquivo_url && (
            <a href={item.arquivo_url} download className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Download">
              <Download className="w-5 h-5" />
            </a>
          )}
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all ml-2" title="Fechar (Esc)">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Navigation Arrows */}
        {canNavigate && currentIndex > 0 && (
          <button onClick={() => onNavigate?.(currentIndex - 1)} className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {canNavigate && currentIndex < items.length - 1 && (
          <button onClick={() => onNavigate?.(currentIndex + 1)} className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Media */}
        <div
          className={`max-w-full max-h-full ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {isImage && item.arquivo_url ? (
            <img
              src={item.arquivo_url}
              alt={item.titulo}
              className="max-w-[90vw] max-h-[80vh] object-contain select-none transition-transform duration-200"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
              draggable={false}
            />
          ) : isVideo && item.arquivo_url ? (
            <video src={item.arquivo_url} controls autoPlay className="max-w-[90vw] max-h-[80vh]" />
          ) : (
            <div className="text-white/50 text-center p-8">Preview nao disponivel</div>
          )}
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-black/80 backdrop-blur-sm border-l border-white/10 p-6 overflow-y-auto">
            <h4 className="text-white font-semibold mb-4">Informacoes</h4>
            <dl className="space-y-3 text-sm">
              {[
                ['Titulo', item.titulo],
                ['Area', item.area_fazenda],
                ['Local', item.ponto],
                ['Data', item.data_captacao ? new Date(item.data_captacao).toLocaleDateString('pt-BR') : null],
                ['Tipo', item.tipo_projeto],
                ['Status', item.status],
                ['Responsavel', item.responsavel],
                ['Tema', item.tema_principal],
                ['Frase-memoria', item.frase_memoria],
              ].map(([label, value]) => value && (
                <div key={label as string}>
                  <dt className="text-white/50">{label}</dt>
                  <dd className="text-white">{value as string}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {canNavigate && items.length <= 20 && (
        <div className="flex items-center justify-center gap-2 p-4 border-t border-white/10 overflow-x-auto" onClick={e => e.stopPropagation()}>
          {items.map((it, idx) => (
            <button
              key={it.id}
              onClick={() => onNavigate?.(idx)}
              className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${idx === currentIndex ? 'border-primary-500 ring-2 ring-primary-500/50' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              {it.arquivo_url && it.arquivo_tipo?.startsWith('image') ? (
                <img src={it.arquivo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white/50 text-xs">
                  {it.arquivo_tipo?.startsWith('video') ? 'VID' : 'DOC'}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
