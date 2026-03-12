export type ListType = 'watchlist' | 'watched' | 'favourites'

export interface Genre {
  id: number
  name: string
}

export interface MovieSummary {
  id: number
  title: string
  poster_path: string | null
  release_date: string | null
  vote_average: number | null
  overview: string | null
  popularity: number | null
  genre_ids: number[]
}

export interface MovieDetail {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string | null
  vote_average: number | null
  overview: string | null
  genres: Genre[]
  runtime: number | null
  popularity: number | null
  vote_count: number | null
  tagline: string | null
  status: string | null
  budget: number | null
  revenue: number | null
  homepage: string | null
}

export interface MovieSearchResponse {
  page: number
  results: MovieSummary[]
  total_pages: number
  total_results: number
}

export interface VideoItem {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

export interface VideoListResponse {
  results: VideoItem[]
}

export interface CastMember {
  id: number
  name: string
  character: string | null
  profile_path: string | null
  order: number | null
}

export interface CrewMember {
  id: number
  name: string
  job: string | null
  department: string | null
  profile_path: string | null
}

export interface CreditsResponse {
  cast: CastMember[]
  crew: CrewMember[]
}

export interface WatchlistItem {
  id: number
  movie_id: number
  title: string
  poster_path: string | null
  release_date: string | null
  vote_average: number | null
  overview: string | null
  added_at: string
  list_type: ListType
}

export interface WatchlistResponse {
  items: WatchlistItem[]
  total: number
}

export interface WatchlistItemCreate {
  movie_id: number
  title: string
  poster_path?: string | null
  release_date?: string | null
  vote_average?: number | null
  overview?: string | null
  list_type?: ListType
}