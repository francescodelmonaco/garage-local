import type { RegisterMeta, RegisterRow } from "@/lib/register-meta"

export type RegisterRowsProps = {
    meta: RegisterMeta
    rows: RegisterRow[]
    showVehicle: boolean
    /** Ordinamento corrente, "-chiave" = discendente */
    sort: string
    onSort: (key: string) => void
    actions: (row: RegisterRow) => React.ReactNode
}
