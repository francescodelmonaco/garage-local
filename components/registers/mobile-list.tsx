import { vehicleName } from "@/lib/format"
import { findAmountColumn, RegisterCell, formatCellText } from "./cell"
import type { RegisterRowsProps } from "./types"

/** Telefono: identità e importo sopra, gli altri campi sotto in grigio. */
export function MobileList({ meta, rows, showVehicle, actions }: RegisterRowsProps) {
    const identity = meta.columns[0]
    const amount = findAmountColumn(meta)
    const secondary = meta.columns.filter((c) => c !== identity && c !== amount)

    return (
        <ul className="grid divide-y divide-rule rounded-xl bg-card px-4 md:hidden">
            {rows.map((row) => (
                <li key={row.id} className="flex items-center gap-2 py-3">
                    <div className="grid min-w-0 flex-1 gap-1">
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="truncate text-sm font-medium"><RegisterCell column={identity} row={row} /></span>
                            <span className="text-sm font-medium num">{formatCellText(amount, row) ?? "—"}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-faint">
                            {showVehicle && <span>{vehicleName(row.vehicle)} ·</span>}
                            {secondary.map((column) => {
                                if (column.kind === "deadline") return <RegisterCell key={column.key} column={column} row={row} />
                                const text = formatCellText(column, row)
                                return text && <span key={column.key} className="whitespace-nowrap">{text}</span>
                            })}
                        </div>
                    </div>
                    {actions(row)}
                </li>
            ))}
        </ul>
    )
}
