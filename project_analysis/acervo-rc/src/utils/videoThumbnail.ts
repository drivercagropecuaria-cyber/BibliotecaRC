/**
 * Extrai o primeiro frame de um vídeo e retorna como Blob JPG
 */
export async function generateVideoThumbnail(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    
    const url = URL.createObjectURL(file)
    video.src = url
    
    const cleanup = () => {
      URL.revokeObjectURL(url)
      video.remove()
    }
    
    video.onloadeddata = () => {
      // Seek para 0.1s para garantir um frame válido
      video.currentTime = 0.1
    }
    
    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas')
        // Limitar dimensões para performance
        const maxSize = 400
        let width = video.videoWidth
        let height = video.videoHeight
        
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height)
          canvas.toBlob((blob) => {
            cleanup()
            resolve(blob)
          }, 'image/jpeg', 0.8)
        } else {
          cleanup()
          resolve(null)
        }
      } catch (err) {
        console.error('Erro ao gerar thumbnail:', err)
        cleanup()
        resolve(null)
      }
    }
    
    video.onerror = () => {
      cleanup()
      resolve(null)
    }
    
    // Timeout de segurança
    setTimeout(() => {
      cleanup()
      resolve(null)
    }, 10000)
  })
}
