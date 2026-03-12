import { useCallback, useEffect, useRef, RefObject } from 'react'

/**
 * Calls `onLoadMore` when the sentinel element enters the viewport.
 * Returns a ref to attach to the sentinel div.
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  enabled: boolean,
): RefObject<HTMLDivElement> {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && enabled) {
        onLoadMore()
      }
    },
    [onLoadMore, enabled],
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleIntersect])

  return sentinelRef
}
