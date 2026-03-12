import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { WatchlistItem, WatchlistItemCreate, ListType } from '../types'
import * as api from '../api/movieApi'

interface WatchlistContextValue {
  // All items across all lists (used for total badge count)
  items: WatchlistItem[]
  loading: boolean
  // Per-list operations
  isInList: (movieId: number, listType: ListType) => boolean
  addToList: (item: WatchlistItemCreate, listType: ListType) => Promise<void>
  removeFromList: (movieId: number, listType: ListType) => Promise<void>
  getListItems: (listType: ListType) => WatchlistItem[]
  refresh: () => Promise<void>
  // Backward-compatible helpers (default list = 'watchlist')
  isInWatchlist: (movieId: number) => boolean
  addMovie: (item: WatchlistItemCreate) => Promise<void>
  removeMovie: (movieId: number) => Promise<void>
}

const WatchlistContext = createContext<WatchlistContextValue | undefined>(undefined)

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getWatchlist()
      setItems(data.items)
    } catch {
      // fail silently
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isInList = (movieId: number, listType: ListType) =>
    items.some((item) => item.movie_id === movieId && item.list_type === listType)

  const getListItems = (listType: ListType) =>
    items.filter((item) => item.list_type === listType)

  const addToList = async (item: WatchlistItemCreate, listType: ListType) => {
    const newItem = await api.addToWatchlist({ ...item, list_type: listType })
    setItems((prev) => [newItem, ...prev])
  }

  const removeFromList = async (movieId: number, listType: ListType) => {
    await api.removeFromWatchlist(movieId, listType)
    setItems((prev) =>
      prev.filter((item) => !(item.movie_id === movieId && item.list_type === listType)),
    )
  }

  // Backward-compatible wrappers
  const isInWatchlist = (movieId: number) => isInList(movieId, 'watchlist')
  const addMovie = (item: WatchlistItemCreate) => addToList(item, 'watchlist')
  const removeMovie = (movieId: number) => removeFromList(movieId, 'watchlist')

  return (
    <WatchlistContext.Provider
      value={{ items, loading, isInList, addToList, removeFromList, getListItems, refresh, isInWatchlist, addMovie, removeMovie }}
    >
      {children}
    </WatchlistContext.Provider>
  )
}

export const useWatchlist = (): WatchlistContextValue => {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider')
  return ctx
}
