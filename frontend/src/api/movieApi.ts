import axios from 'axios'
import type {
  MovieSearchResponse,
  MovieDetail,
  WatchlistResponse,
  WatchlistItemCreate,
  WatchlistItem,
  Genre,
  VideoListResponse,
  CreditsResponse,
  ListType,
} from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail || error.message || 'An error occurred'
    return Promise.reject(new Error(message))
  },
)

// ── Movies ──────────────────────────────────────────────────────────────────

export const searchMovies = async (
  query: string,
  page = 1,
  genreId?: number,
  sortBy?: string,
): Promise<MovieSearchResponse> => {
  const params: Record<string, string | number> = { q: query, page }
  if (genreId) params.genre_id = genreId
  if (sortBy) params.sort_by = sortBy
  const { data } = await api.get<MovieSearchResponse>('/movies/search', { params })
  return data
}

export const getTrendingMovies = async (
  timeWindow: 'day' | 'week' = 'week',
  page = 1,
): Promise<MovieSearchResponse> => {
  const { data } = await api.get<MovieSearchResponse>('/movies/trending', {
    params: { time_window: timeWindow, page },
  })
  return data
}

export const getMovieDetail = async (movieId: number): Promise<MovieDetail> => {
  const { data } = await api.get<MovieDetail>(`/movies/${movieId}`)
  return data
}

export const getSimilarMovies = async (
  movieId: number,
  page = 1,
): Promise<MovieSearchResponse> => {
  const { data } = await api.get<MovieSearchResponse>(`/movies/${movieId}/similar`, {
    params: { page },
  })
  return data
}

export const getRecommendations = async (
  movieId: number,
  page = 1,
): Promise<MovieSearchResponse> => {
  const { data } = await api.get<MovieSearchResponse>(
    `/movies/${movieId}/recommendations`,
    { params: { page } },
  )
  return data
}

export const getMovieVideos = async (movieId: number): Promise<VideoListResponse> => {
  const { data } = await api.get<VideoListResponse>(`/movies/${movieId}/videos`)
  return data
}

export const getMovieCredits = async (movieId: number): Promise<CreditsResponse> => {
  const { data } = await api.get<CreditsResponse>(`/movies/${movieId}/credits`)
  return data
}

export const getGenres = async (): Promise<Genre[]> => {
  const { data } = await api.get<{ genres: Genre[] }>('/movies/genres')
  return data.genres
}

export const discoverMovies = async (
  genreId: number,
  page = 1,
  sortBy = 'popularity.desc',
): Promise<MovieSearchResponse> => {
  const { data } = await api.get<MovieSearchResponse>('/movies/discover', {
    params: { genre_id: genreId, page, sort_by: sortBy },
  })
  return data
}

// ── Watchlist ────────────────────────────────────────────────────────────────

export const getWatchlist = async (listType?: ListType): Promise<WatchlistResponse> => {
  const params: Record<string, string> = {}
  if (listType) params.list_type = listType
  const { data } = await api.get<WatchlistResponse>('/watchlist', { params })
  return data
}

export const addToWatchlist = async (
  item: WatchlistItemCreate,
): Promise<WatchlistItem> => {
  const { data } = await api.post<WatchlistItem>('/watchlist', item)
  return data
}

export const removeFromWatchlist = async (
  movieId: number,
  listType: ListType = 'watchlist',
): Promise<void> => {
  await api.delete(`/watchlist/${movieId}`, { params: { list_type: listType } })
}

export const checkWatchlist = async (
  movieId: number,
): Promise<{ in_watchlist: boolean; in_watched: boolean; in_favourites: boolean; lists: string[] }> => {
  const { data } = await api.get(`/watchlist/check/${movieId}`)
  return data
}
