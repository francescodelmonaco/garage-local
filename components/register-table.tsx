"use client"

import { Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { BlockError, Pending, PendingRows } from "@/components/bits"
import { Pagination } from "@/components/pagination"
import { RecordForm } from "@/components/record-form"
import { RegisterRows } from "@/components/register-rows"
import { RegisterTabs } from "@/components/register-tabs"
import { RowActions } from "@/components/row-actions"
import { TitleRow } from "@/components/title-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRegister, useVehicles } from "@/hooks/queries"
import { day, euro, plural } from "@/lib/format"
import { registerMeta, type RegisterName, type RegisterRow } from "@/lib/register-meta"
import { cn } from "@/lib/utils"

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * Registro paginato: ricerca, ordinamento e totale li calcola il database.
 * `page`: schermata intera con titolo, schede e ricerca. Con `vehicleId`: incorporato nel dettaglio veicolo.
 */
export function RegisterTable({ name, vehicleId, page: asPage = false }: { name: RegisterName; vehicleId?: string; page?: boolean }) {
    const meta = registerMeta[name]
    const [page, setPage] = useState(0)
    const [sort, setSort] = useState(meta.defaultSort)
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")
    const [form, setForm] = useState<{ row?: RegisterRow } | null>(null)
    const { data: vehicles } = useVehicles()

    // Ricerca dopo 300 ms di pausa, ripartendo dalla prima pagina
    useEffect(() => {
        const timer = setTimeout(() => { setSearch(searchInput.trim()); setPage(0) }, 300)
        return () => clearTimeout(timer)
    }, [searchInput])

    const { data, isPending, isError, isFetching, refetch } = useRegister(name, { page, search, sort, vehicleId })
    // Con un solo veicolo la colonna veicolo ripeterebbe la stessa targa su ogni riga
    const showVehicle = !vehicleId && (vehicles?.length ?? 0) > 1
    const nounTitle = capitalize(meta.noun)

    function toggleSort(key: string) {
        setSort(sort === `-${key}` ? key : `-${key}`)
        setPage(0)
    }

    const addButton = (
        <Button onClick={() => setForm({})} variant={asPage ? "default" : "outline"} size={asPage ? "default" : "sm"}><Plus />Aggiungi {meta.noun}</Button>
    )
    const summary = data ? (
        <>
            <span className="num">{data.count}</span> {plural(data.count, meta.noun, meta.title.toLowerCase())} · <span className="num">{euro(data.total)}</span> in totale
            {search && ` per “${search}”`}
        </>
    ) : <Pending className="h-4 w-56" />

    const actions = (row: RegisterRow) => (
        <RowActions
            label={`${meta.noun} del ${day((row.date ?? row.start_date ?? row.paid_date) as string | null)}`}
            noun={nounTitle}
            feminine={meta.feminine}
            url={`/api/registri/${name}/${row.id}`}
            onEdit={() => setForm({ row })}
        />
    )

    return (
        <section aria-label={meta.title} className="grid content-start">
            {asPage ? (
                <>
                    <TitleRow title={meta.title} subline={summary} actions={addButton} />
                    <RegisterTabs current={name} />
                </>
            ) : (
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">{summary}</p>
                    {addButton}
                </div>
            )}

            {asPage && (showVehicle || (data?.count ?? 0) > 15 || search) && (
                <div className="relative mb-4 w-full sm:w-80">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" />
                    <Input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Cerca marca, modello o targa" className="h-9 rounded-full pl-10" aria-label="Cerca" />
                </div>
            )}

            {isError ? (
                <BlockError what={meta.title.toLowerCase()} onRetry={() => refetch()} />
            ) : isPending ? (
                <div className="rounded-xl bg-card px-[22px] py-2"><PendingRows count={5} /></div>
            ) : data.rows.length === 0 ? (
                <div className="rounded-xl bg-card px-[22px] py-6 text-sm text-muted-foreground">
                    {search ? `Nessun risultato per “${search}”.` : meta.empty}
                </div>
            ) : (
                <div className={cn("transition-opacity", isFetching && "opacity-70")}>
                    <RegisterRows meta={meta} rows={data.rows} showVehicle={showVehicle} sort={sort} onSort={toggleSort} actions={actions} />
                    <Pagination page={page} pageSize={data.pageSize} count={data.count} onChange={setPage} />
                </div>
            )}

            <RecordForm
                open={form !== null}
                onClose={() => setForm(null)}
                title={form?.row ? `Modifica ${meta.noun}` : `Aggiungi ${meta.noun}`}
                fields={meta.fields}
                initial={form?.row ?? { vehicle_id: vehicleId ?? (vehicles?.length === 1 ? vehicles[0].id : undefined) }}
                request={form?.row ? { url: `/api/registri/${name}/${form.row.id}`, method: "PATCH" } : { url: `/api/registri/${name}`, method: "POST" }}
                successMessage={form?.row ? "Modifiche salvate" : `${nounTitle} aggiunt${meta.feminine ? "a" : "o"}`}
            />
        </section>
    )
}

