"use client"

import Link from "next/link"
import { BlockError, PendingRows } from "@/components/bits"
import { Panel } from "@/components/panel"
import { useRegister } from "@/hooks/queries"
import { day, euro, num } from "@/lib/format"
import { registerMeta, type RegisterRow } from "@/lib/register-meta"

// Le due anteprime in dashboard: cosa mostrare di ogni riga
const RECENT = {
    rifornimenti: {
        article: "gli",
        ending: "i",
        title: (row: RegisterRow) => (row.station as string | null) ?? "Rifornimento",
        detail: (row: RegisterRow) => num(row.liters as number, "l"),
    },
    manutenzioni: {
        article: "le",
        ending: "e",
        title: (row: RegisterRow) => row.title as string,
        detail: (row: RegisterRow) => row.workshop as string | null,
    },
}

/** Ultime 4 righe di un registro, con il totale e il link all'elenco completo. */
export function RecentPanel({ name }: { name: keyof typeof RECENT }) {
    const { data, isPending, isError, refetch } = useRegister(name, { page: 0, search: "", sort: "-date" })
    const meta = registerMeta[name]
    const { article, ending, title, detail } = RECENT[name]
    const what = meta.title.toLowerCase()
    if (isError) return <BlockError what={`${article} ultim${ending} ${what}`} onRetry={() => refetch()} />

    return (
        <Panel
            title={`Ultim${ending} ${what}`}
            aside={
                <Link href={`/${name}`} className="text-sm text-muted-foreground hover:text-foreground">
                    Vedi tutt{ending}{data && <span className="num"> {data.count}</span>}
                </Link>
            }
        >
            {isPending ? <PendingRows count={4} className="h-14" />
                : data.rows.length === 0 ? <p className="py-3 text-sm text-muted-foreground">{meta.empty}</p>
                    : (
                        <ul className="grid divide-y divide-rule">
                            {data.rows.slice(0, 4).map((row) => {
                                const extra = detail(row)
                                return (
                                    <li key={row.id} className="flex h-14 items-center justify-between gap-4">
                                        <span className="grid min-w-0">
                                            <span className="truncate text-sm">{title(row)}</span>
                                            <span className="truncate text-xs text-faint">{day(row.date as string)}{extra && ` · ${extra}`}</span>
                                        </span>
                                        <span className="text-sm num">{euro(row.cost as number | null)}</span>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
        </Panel>
    )
}
