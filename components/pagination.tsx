"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage: number
  totalItems: number
}

export function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }: PaginationProps) {
  // Ensure all inputs are valid numbers to prevent NaN errors
  const safeCurrentPage = typeof currentPage !== "number" || Number.isNaN(currentPage) || currentPage < 1 ? 1 : currentPage
  const safeItemsPerPage = typeof itemsPerPage !== "number" || Number.isNaN(itemsPerPage) || itemsPerPage < 1 ? 10 : itemsPerPage
  const safeTotalItems = typeof totalItems !== "number" || Number.isNaN(totalItems) ? 0 : totalItems
  const safeTotalPages = typeof totalPages !== "number" || Number.isNaN(totalPages) || totalPages < 0 ? 0 : totalPages

  const startItem = (safeCurrentPage - 1) * safeItemsPerPage + 1
  const endItem = Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems)

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-slate-400">
        Mostrando <span className="font-medium text-white">{startItem}</span> a{" "}
        <span className="font-medium text-white">{endItem}</span> de{" "}
        <span className="font-medium text-white">{safeTotalItems}</span> resultados
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage === 1}
          className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, safeTotalPages || 0) }, (_, i) => {
            let pageNum: number
            if (safeTotalPages <= 5) {
              pageNum = i + 1
            } else if (safeCurrentPage <= 3) {
              pageNum = i + 1
            } else if (safeCurrentPage >= safeTotalPages - 2) {
              pageNum = safeTotalPages - 4 + i
            } else {
              pageNum = safeCurrentPage - 2 + i
            }

            return (
              <Button
                key={pageNum}
                variant={safeCurrentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={
                  safeCurrentPage === pageNum
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                }
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages}
          className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={safeCurrentPage === safeTotalPages}
          className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
