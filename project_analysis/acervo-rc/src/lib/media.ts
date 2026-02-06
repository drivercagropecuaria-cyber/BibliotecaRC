export const withCacheBuster = (url?: string | null, token?: string | number | null) => {
  if (!url) return ''
  if (url.includes('v=')) return url
  const separator = url.includes('?') ? '&' : '?'
  const value = token ?? '1'
  return `${url}${separator}v=${encodeURIComponent(String(value))}`
}
