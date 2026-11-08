"use client"

import { CircleAlert, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DEADLINE_LABELS, daysUntil, deadlineStatus, describeDeadline } from "@/lib/deadlines"
import { day } from "@/lib/format"
import type { Deadline as DeadlineRow } from "@/lib/types"
import { cn } from "@/lib/utils"

// Piccoli componenti di presentazione condivisi da tutte le schermate.

// Formato targhe italiane dal 1994: AA 000 AA
const ITALIAN_PLATE = /^([A-Z]{2})(\d{3})([A-Z]{2})$/

/** Marchio: la banda gialla della targa con la "I", accanto al nome. */
export function Mark() {
    return (
        <span className="flex items-center gap-2 text-[15px] font-semibold">
            <span aria-hidden className="flex h-5 w-3.5 items-center justify-center rounded-[3px] bg-brand text-[10px] font-bold text-background">I</span>
            Garage
        </span>
    )
}

/** Targa in stile italiano: banda gialla con la "I" e caratteri mono (la seconda famiglia ha un solo compito). */
export function LicensePlate({ plate, className }: { plate: string; className?: string }) {
    if (!plate) return null
    const match = plate.match(ITALIAN_PLATE)
    return (
        <span className={cn("inline-flex h-6 w-fit shrink-0 items-stretch overflow-hidden rounded-[5px] bg-foreground text-xs text-background", className)}>
            <span aria-hidden className="flex w-4 items-center justify-center bg-brand text-[10px] font-bold">I</span>
            <span className="flex items-center px-1.5 font-mono font-semibold whitespace-nowrap">
                <span className="sr-only">Targa </span>
                {match ? `${match[1]} ${match[2]} ${match[3]}` : plate}
            </span>
        </span>
    )
}

/**
 * Data di scadenza con il suo stato. Colore solo dove serve una decisione:
 * scaduta (coppia rossa piena), entro 30 giorni (contorno rosso); valida in grigio.
 * Le righe storiche (`current` falso) mostrano solo la data: sono state sostituite.
 */
export function Deadline({ date, current = true }: { date: string | null; current?: boolean }) {
    if (!date) return <span className="text-faint">—</span>
    if (!current) return <span className="text-faint num">{day(date)}</span>
    const days = daysUntil(date)
    const status = deadlineStatus(days)
    return (
        <span className="inline-flex flex-wrap items-center gap-2">
            <span className="num">{day(date)}</span>
            {status === "ok" ? (
                <span className="text-xs text-muted-foreground">{describeDeadline(days)}</span>
            ) : (
                <span className={cn("inline-flex h-5 flex-none items-center gap-1 rounded-full px-2 text-xs font-medium whitespace-nowrap text-destructive",
                    status === "expired" ? "bg-negative-bg" : "ring-1 ring-destructive/50 ring-inset")}>
                    {status === "expired" ? <CircleAlert className="size-3" aria-hidden /> : <Clock className="size-3" aria-hidden />}
                    {describeDeadline(days)}
                </span>
            )}
        </span>
    )
}

/** "Bollo · 2026": tipo di scadenza e dettaglio in grigio. */
export function DeadlineLabel({ deadline }: { deadline: Pick<DeadlineRow, "kind" | "detail"> }) {
    return <>{DEADLINE_LABELS[deadline.kind]}{deadline.detail && <span className="text-muted-foreground"> · {deadline.detail}</span>}</>
}

/** Sezione vuota: tiene la cornice e dice in una frase il primo passo. */
export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <div className="flex flex-col items-start gap-3 rounded-xl bg-card px-[22px] py-8">
            <p className="text-sm text-muted-foreground">{title}</p>
            {children}
        </div>
    )
}

/** Nota tratteggiata dentro un pannello: dati mancanti, primo passo. */
export function Note({ children }: { children: React.ReactNode }) {
    return <p className="rounded-lg border border-dashed border-input px-4 py-3 text-sm text-muted-foreground">{children}</p>
}

/** Errore dentro il blocco che è fallito, con Riprova. */
export function BlockError({ what, onRetry }: { what: string; onRetry?: () => void }) {
    return (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-card px-[22px] py-5 text-sm">
            <CircleAlert className="size-4 text-destructive" aria-hidden />
            <span>Impossibile caricare {what}.</span>
            {onRetry && <Button variant="link" size="sm" className="h-auto p-0" onClick={onRetry}>Riprova</Button>}
        </div>
    )
}

/** Valore in attesa: barra grigia alla sua dimensione reale, senza shimmer. */
export function Pending({ className }: { className?: string }) {
    return <span aria-hidden className={cn("inline-block rounded-sm bg-muted align-middle", className)} />
}

/** Righe in caricamento di un elenco: etichetta a sinistra, importo a destra. */
export function PendingRows({ count, className }: { count: number; className?: string }) {
    return (
        <div aria-busy="true" className="grid divide-y divide-rule">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className={cn("flex h-12 items-center justify-between", className)}>
                    <Pending className="h-4 w-36" />
                    <Pending className="h-4 w-16" />
                </div>
            ))}
        </div>
    )
}
