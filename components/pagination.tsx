import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type PaginationProps = { page: number; pageSize: number; count: number; onChange: (page: number) => void }

/** Paginazione a base zero, con intervallo visibile e controlli accessibili. */
export function Pagination({ page, pageSize, count, onChange }: PaginationProps) {
    const pages = Math.ceil(count / pageSize)
    if (pages <= 1) return null
    return (
        <div className="mt-3 flex items-center justify-end gap-2 text-sm">
            <span className="text-faint num">{page * pageSize + 1}–{Math.min(count, (page + 1) * pageSize)} di {count}</span>
            <Button variant="ghost" size="icon-sm" aria-label="Pagina precedente" disabled={page === 0} onClick={() => onChange(page - 1)}><ChevronLeft /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Pagina successiva" disabled={page + 1 >= pages} onClick={() => onChange(page + 1)}><ChevronRight /></Button>
        </div>
    )
}
