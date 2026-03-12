const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const getPosterUrl = (
  path: string | null | undefined,
  size: 'w185' | 'w342' | 'w500' | 'original' = 'w342',
): string => {
  if (!path) return '/placeholder-poster.svg'
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export const getBackdropUrl = (
  path: string | null | undefined,
  size: 'w780' | 'w1280' | 'original' = 'w1280',
): string => {
  if (!path) return '/placeholder-backdrop.svg'
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export const formatRating = (rating: number | null | undefined): string => {
  if (rating == null) return 'N/A'
  return rating.toFixed(1)
}

export const formatRuntime = (minutes: number | null | undefined): string => {
  if (!minutes) return 'N/A'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

export const formatYear = (date: string | null | undefined): string => {
  if (!date) return 'N/A'
  return date.slice(0, 4)
}

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount || amount === 0) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatPopularity = (popularity: number | null | undefined): string => {
  if (popularity == null) return 'N/A'
  return popularity.toFixed(1)
}