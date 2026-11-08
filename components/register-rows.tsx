"use client"

import { DesktopTable } from "@/components/registers/desktop-table"
import { MobileList } from "@/components/registers/mobile-list"
import type { RegisterRowsProps } from "@/components/registers/types"

/** Da 768px tabella, sotto righe su due livelli: stessi dati, stesse azioni. */
export function RegisterRows(props: RegisterRowsProps) {
    return (
        <>
            <div className="hidden rounded-xl bg-card px-3 py-1 md:block"><DesktopTable {...props} /></div>
            <MobileList {...props} />
        </>
    )
}

