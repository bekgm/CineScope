import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null

  const maxVisible = 5
  const half = Math.floor(maxVisible / 2)
  let start = Math.max(1, currentPage - half)
  let end = Math.min(totalPages, start + maxVisible - 1)
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="btn-secondary px-2 py-1.5 text-sm disabled:opacity-40"
        aria-label="First page"
      >
        «
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
        aria-label="Previous page"
      >
        ‹
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="btn-secondary px-3 py-1.5 text-sm">
            1
          </button>
          {start > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
            page === currentPage
              ? 'bg-primary-600 text-white'
              : 'btn-secondary'
          }`}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
          <button onClick={() => onPageChange(totalPages)} className="btn-secondary px-3 py-1.5 text-sm">
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
        aria-label="Next page"
      >
        ›
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="btn-secondary px-2 py-1.5 text-sm disabled:opacity-40"
        aria-label="Last page"
      >
        »
      </button>
    </div>
  )
}

export default Pagination
