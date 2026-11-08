import { Deadline } from "@/components/bits"
import { day, euro, num } from "@/lib/format"
import type { ColumnDef, RegisterMeta, RegisterRow } from "@/lib/register-meta"

const cellValue = (column: ColumnDef, row: RegisterRow) => column.value ? column.value(row) : row[column.key]
export const isNumericColumn = (column: ColumnDef) => column.kind === "euro" || column.kind === "number"
const isCurrent = (row: RegisterRow) => row.current !== false
/** L'importo della riga: l'ultima colonna in euro. */
export const findAmountColumn = (meta: RegisterMeta) => meta.columns.findLast((c) => c.kind === "euro")!

export function RegisterCell({ column, row }: { column: ColumnDef; row: RegisterRow }) {
    const value = cellValue(column, row)
    switch (column.kind) {
        case "date": return <span className="num">{day(value as string | null)}</span>
        case "deadline": return <Deadline date={value as string | null} current={isCurrent(row)} />
        case "euro": return <span className="num">{euro(value as number | null)}</span>
        case "number": return <span className="num">{num(value as number | null, column.unit)}</span>
        default: return <>{value ?? <span className="text-faint">—</span>}</>
    }
}

/** Testo semplice di una cella, per la seconda riga delle card su telefono. */
export function formatCellText(column: ColumnDef, row: RegisterRow) {
    const value = cellValue(column, row)
    if (value == null || value === "") return null
    if (column.kind === "date" || column.kind === "deadline") return day(value as string)
    if (column.kind === "euro") return euro(value as number)
    if (column.kind === "number") return num(value as number, column.unit)
    return String(value)
}
