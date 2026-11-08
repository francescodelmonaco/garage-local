import { ArrowDown, ArrowUp } from "lucide-react"
import Link from "next/link"
import { LicensePlate } from "@/components/bits"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { vehicleName } from "@/lib/format"
import { cn } from "@/lib/utils"
import { findAmountColumn, RegisterCell, isNumericColumn } from "./cell"
import type { RegisterRowsProps } from "./types"

/** Regole e allineamento, numeri a destra, un solo kebab per riga. */
export function DesktopTable({ meta, rows, showVehicle, sort, onSort, actions }: RegisterRowsProps) {
    const amount = findAmountColumn(meta)
    const sortIcon = (key: string) => sort === `-${key}` ? <ArrowDown className="size-3" /> : sort === key ? <ArrowUp className="size-3" /> : null

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    {showVehicle && <TableHead><SortButton onClick={() => onSort("vehicle")}>Veicolo{sortIcon("vehicle")}</SortButton></TableHead>}
                    {meta.columns.map((column) => (
                        <TableHead key={column.key} className={cn(isNumericColumn(column) && "text-right")}>
                            {column.sort
                                ? <SortButton onClick={() => onSort(column.sort!)} right={isNumericColumn(column)}>{column.label}{sortIcon(column.sort)}</SortButton>
                                : column.label}
                        </TableHead>
                    ))}
                    <TableHead className="w-10"><span className="sr-only">Azioni</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.id} className="h-12">
                        {showVehicle && (
                            <TableCell>
                                <Link href={`/veicoli/${row.vehicle.id}`} className="flex items-center gap-2">
                                    <LicensePlate plate={row.vehicle.plate} />
                                    <span className="text-muted-foreground">{vehicleName(row.vehicle)}</span>
                                </Link>
                            </TableCell>
                        )}
                        {meta.columns.map((column, i) => (
                            <TableCell key={column.key} className={cn(
                                isNumericColumn(column) && "text-right",
                                column === amount ? "font-medium" : i > 0 && !isNumericColumn(column) && "text-muted-foreground",
                            )}>
                                <RegisterCell column={column} row={row} />
                            </TableCell>
                        ))}
                        <TableCell className="text-right">{actions(row)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function SortButton({ children, onClick, right }: { children: React.ReactNode; onClick: () => void; right?: boolean }) {
    return <button type="button" className={cn("inline-flex items-center gap-1 hover:text-foreground", right && "flex-row-reverse")} onClick={onClick}>{children}</button>
}
