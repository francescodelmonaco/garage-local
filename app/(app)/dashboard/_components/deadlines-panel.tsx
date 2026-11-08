"use client"

import { addMonths, differenceInCalendarDays, format, parseISO } from "date-fns"
import { it } from "date-fns/locale"
import Link from "next/link"
import { Deadline, DeadlineLabel, LicensePlate, Note } from "@/components/bits"
import { Panel } from "@/components/panel"
import { DEADLINE_LABELS, DEADLINE_LINKS, daysUntil, deadlineStatus } from "@/lib/deadlines"
import { day, vehicleName } from "@/lib/format"
import type { Deadline as DeadlineRow } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Scadenze: la striscia dei prossimi 12 mesi (l'elemento di questo prodotto) e l'elenco. */
export function DeadlinesPanel({ deadlines, multi }: { deadlines: DeadlineRow[]; multi: boolean }) {
    return (
        <Panel title="Scadenze" aside={<span className="text-xs text-faint">prossimi 12 mesi</span>} className="gap-4">
            {deadlines.length === 0 ? (
                <Note>Registra assicurazione, bollo e revisione per vederne le scadenze.</Note>
            ) : (
                <>
                    <Timeline deadlines={deadlines} multi={multi} />
                    <ul className="grid divide-y divide-rule">
                        {deadlines.map((d) => (
                            <li key={`${d.kind}-${d.id}`}>
                                <Link href={DEADLINE_LINKS[d.kind]} className="grid min-h-14 gap-1 py-2 transition-colors hover:text-foreground">
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-medium">
                                            <KindBadge deadline={d} className="mr-2 inline-flex bg-muted" />
                                            <DeadlineLabel deadline={d} />
                                        </span>
                                        {multi && <LicensePlate plate={d.vehicle.plate} />}
                                    </span>
                                    <span className="pl-7 text-sm">
                                        {d.date ? <Deadline date={d.date} /> : <span className="text-muted-foreground">Inserisci la data di pagamento.</span>}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </Panel>
    )
}

/** Una striscia per veicolo: oggi a sinistra (riga gialla), i segni delle scadenze nei 12 mesi successivi. */
function Timeline({ deadlines, multi }: { deadlines: DeadlineRow[]; multi: boolean }) {
    const today = new Date()
    const span = differenceInCalendarDays(addMonths(today, 12), today)
    const position = (date: Date) => differenceInCalendarDays(date, today) / span
    const vehicles = [...new Map(deadlines.map((d) => [d.vehicle.id, d.vehicle])).values()]
    const ticks = [0, 3, 6, 9].map((m) => addMonths(today, m)).map((date) => ({ at: position(date), label: format(date, "MMM", { locale: it }) }))

    return (
        <div className="grid gap-2">
            {vehicles.map((vehicle) => {
                const marks = deadlines
                    .filter((d): d is DeadlineRow & { date: string } => d.vehicle.id === vehicle.id && d.date !== null)
                    .map((d) => ({ d, at: Math.min(1, Math.max(0, position(parseISO(d.date)))) }))
                return (
                    <div key={vehicle.id} className="grid gap-1">
                        {multi && <span className="text-xs text-muted-foreground">{vehicleName(vehicle)}</span>}
                        <div className="relative h-7 rounded-md bg-muted" aria-hidden>
                            <span className="absolute inset-y-0 left-0 w-px bg-brand" />
                            {spread(marks).map(({ d, at }) => (
                                <KindBadge key={d.kind} deadline={d} title={`${DEADLINE_LABELS[d.kind]}: ${day(d.date)}`}
                                    style={{ left: `calc(${at * 100}% - ${at * 20}px)` }}
                                    className={cn("absolute top-1 flex text-background", deadlineStatus(daysUntil(d.date)) === "ok" ? "bg-foreground" : "bg-destructive")} />
                            ))}
                        </div>
                    </div>
                )
            })}
            <div className="relative h-4 text-[11px] text-faint" aria-hidden>
                {ticks.map((t) => <span key={t.label} className="absolute" style={{ left: `${t.at * 100}%` }}>{t.label}</span>)}
            </div>
        </div>
    )
}

/** Cerchio con l'iniziale del tipo di scadenza (A, R, B). */
function KindBadge({ deadline, className, ...props }: { deadline: Pick<DeadlineRow, "kind"> } & React.ComponentProps<"span">) {
    return (
        <span aria-hidden className={cn("size-5 items-center justify-center rounded-full text-[11px] font-semibold", className)} {...props}>
            {deadline.kind[0].toUpperCase()}
        </span>
    )
}

/** Segni a meno di 7% l'uno dall'altro si affiancano invece di sovrapporsi. */
function spread<T extends { at: number }>(marks: T[]) {
    const sorted = [...marks].sort((a, b) => a.at - b.at)
    for (let i = 1; i < sorted.length; i++) sorted[i] = { ...sorted[i], at: Math.max(sorted[i].at, sorted[i - 1].at + 0.07) }
    // ponytail: se l'ultimo esce dalla striscia si ricompatta a destra; con 3 segni basta
    const overflow = (sorted.at(-1)?.at ?? 0) - 1
    return overflow > 0 ? sorted.map((m) => ({ ...m, at: m.at - overflow })) : sorted
}
