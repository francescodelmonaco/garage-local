import { useId } from "react"
import { Pending } from "@/components/bits"
import { cn } from "@/lib/utils"

/** Card di contenuto: titolo h2 con un'azione o una nota a destra, poi il corpo. */
export function Panel({ title, aside, className, children }: {
    title: React.ReactNode
    aside?: React.ReactNode
    className?: string
    children: React.ReactNode
}) {
    const id = useId()
    return (
        <section aria-labelledby={id} className={cn("grid min-w-0 content-start gap-2 rounded-xl bg-card p-[22px]", className)}>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <h2 id={id} className="text-base font-semibold">{title}</h2>
                {aside}
            </div>
            {children}
        </section>
    )
}

/** Fila di saldi in un contenitore diviso: la cifra che risponde alla domanda per prima. */
export function StatGroup({ label, children }: { label?: string; children: React.ReactNode }) {
    return <section aria-label={label} className="grid rounded-xl bg-card sm:grid-cols-3">{children}</section>
}

/** Un saldo: etichetta, cifra (`null` = in caricamento) e riga di contesto. `lead` per la cifra principale. */
export function Stat({ label, value, sub, lead }: { label: React.ReactNode; value: React.ReactNode | null; sub?: React.ReactNode; lead?: boolean }) {
    return (
        <div className="grid content-start gap-1 border-rule p-[22px] not-first:border-t sm:not-first:border-t-0 sm:not-first:border-l">
            <span className="text-xs text-muted-foreground">{label}</span>
            {value === null ? <Pending className="my-2 h-6 w-32" /> : (
                <span className={cn("num tracking-tight", lead ? "text-[32px] leading-10 font-semibold" : "text-2xl leading-10 font-medium")}>{value}</span>
            )}
            {sub && <span className="text-xs text-faint">{sub}</span>}
        </div>
    )
}

/** Elenco etichetta → valore su righe divise da 1px. */
export function DetailList({ rows }: { rows: [label: string, value: React.ReactNode][] }) {
    return (
        <dl className="grid divide-y divide-rule">
            {rows.map(([label, value]) => (
                <div key={label} className="flex min-h-10 items-center justify-between gap-3">
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="text-sm num">{value}</dd>
                </div>
            ))}
        </dl>
    )
}
