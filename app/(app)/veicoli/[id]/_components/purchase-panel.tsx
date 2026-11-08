"use client"

import { addMonths, format, parseISO } from "date-fns"
import { CircleAlert, Plus } from "lucide-react"
import { useState } from "react"
import { DetailList, Panel } from "@/components/panel"
import { RecordForm } from "@/components/record-form"
import { RowActions } from "@/components/row-actions"
import { Button } from "@/components/ui/button"
import { summarizeFinancing, type FinancingSummary } from "@/lib/financing"
import { financingFields, purchaseDateField } from "@/lib/forms"
import { day, euro, num } from "@/lib/format"
import type { VehicleFinancing, VehicleWithFinancing } from "@/lib/types"

/** Acquisto e finanziamento: riepilogo calcolato da lib/financing.ts, contratto in un details. */
export function PurchasePanel({ vehicle }: { vehicle: VehicleWithFinancing }) {
    const [editing, setEditing] = useState(false)
    const { financing } = vehicle
    const url = `/api/vehicles/${vehicle.id}/financing`
    // Il trigger del database garantisce la data di acquisto per ogni veicolo finanziato
    const summary = financing && vehicle.purchase_date ? summarizeFinancing(financing, vehicle.purchase_date, vehicle.purchase_price) : null

    const rows: [string, React.ReactNode][] = [
        ["Data di acquisto", day(vehicle.purchase_date)],
        ["Prezzo di acquisto", euro(vehicle.purchase_price)],
        ...(financing && summary ? summaryRows(financing, summary) : [["Pagamento", "in contanti, senza finanziamento"] as [string, string]]),
    ]
    const contract = financing && summary ? contractRows(financing) : []

    return (
        <Panel
            title={<>Acquisto{financing && " e finanziamento"}</>}
            aside={financing ? (
                <RowActions label="il finanziamento" noun="Finanziamento" url={url} duplicate={false} onEdit={() => setEditing(true)}
                    deleteDescription="Spariscono rate e dati del contratto; il veicolo resta. Non si può annullare." />
            ) : (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Plus />Aggiungi finanziamento</Button>
            )}
        >
            {summary?.needsBalloonOutcome && (
                <p role="status" className="flex items-start gap-2 text-sm">
                    <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
                    La maxi-rata è scaduta il {day(summary.endDate)}: indica se hai riscattato o restituito il veicolo. Fino ad allora non entra nelle spese.
                </p>
            )}
            <DetailList rows={rows} />
            {contract.length > 0 && (
                <details className="rounded-lg bg-muted px-4 py-3">
                    <summary className="cursor-pointer text-sm">Dati del contratto</summary>
                    <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                        {contract.map(([label, value]) => (
                            <div key={label} className="grid gap-0.5">
                                <dt className="text-xs text-faint">{label}</dt>
                                <dd className="text-sm wrap-break-word">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </details>
            )}
            {vehicle.notes && <p className="border-t border-rule pt-3 text-sm whitespace-pre-line text-muted-foreground">{vehicle.notes}</p>}
            <RecordForm
                open={editing}
                onClose={() => setEditing(false)}
                title={financing ? "Modifica finanziamento" : "Aggiungi finanziamento"}
                fields={vehicle.purchase_date ? financingFields : [purchaseDateField, ...financingFields]}
                initial={financing ?? {
                    // Prima rata precompilata a un mese dall'acquisto
                    first_installment_date: vehicle.purchase_date ? format(addMonths(parseISO(vehicle.purchase_date), 1), "yyyy-MM-dd") : undefined,
                }}
                request={{ url, method: "PUT" }}
                successMessage="Finanziamento salvato"
            />
        </Panel>
    )
}

/** Stato del piano: pagato, residuo, costo e data di chiusura. */
function summaryRows(financing: VehicleFinancing, summary: FinancingSummary): [string, string][] {
    return [
        ["Pagato finora", euro(summary.paid)],
        ["Residuo", euro(summary.remaining)],
        ...(summary.financingCost !== null ? [["Costo del finanziamento", euro(summary.financingCost)] as [string, string]] : []),
        [summary.balloonDate ? "Maxi-rata" : financing.payoff_date ? "Estinto il" : "Ultima rata", day(summary.endDate)],
    ]
}

/** Dati d'archivio del contratto, solo quelli compilati. */
function contractRows(financing: VehicleFinancing): [string, string][] {
    const money = (value: number | null) => value !== null ? euro(value) : null
    const percent = (value: number | null) => value !== null ? `${num(value)}%` : null
    const rows: [string, string | null][] = [
        ["Rate", `${financing.installment_count} × ${euro(financing.installment_amount)} dal ${day(financing.first_installment_date)}`],
        ["Anticipo", financing.down_payment ? euro(financing.down_payment) : null],
        ["Spese alla firma", financing.upfront_fees ? euro(financing.upfront_fees) : null],
        ["Maxi-rata", financing.balloon_payment !== null ? `${euro(financing.balloon_payment)} · ${financing.balloon_outcome ?? "esito da decidere"}` : null],
        ["Estinzione", financing.payoff_date && financing.payoff_amount !== null ? `${euro(financing.payoff_amount)} il ${day(financing.payoff_date)}` : null],
        ["Finanziaria", financing.lender],
        ["Concessionaria", financing.dealer],
        ["Numero contratto", financing.contract_number],
        ["Capitale finanziato", money(financing.financed_amount)],
        ["TAN", percent(financing.tan)],
        ["TAEG", percent(financing.taeg)],
        ["Valore futuro garantito", money(financing.guaranteed_future_value)],
        ["Spese incasso rata", financing.collection_fee !== null ? `${euro(financing.collection_fee)} (già nella rata)` : null],
        ["Polizza sul credito", financing.credit_insurance],
        ["Note", financing.notes],
    ]
    return rows.filter((row): row is [string, string] => Boolean(row[1]))
}
