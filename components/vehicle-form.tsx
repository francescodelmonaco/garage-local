"use client"

import { RecordForm } from "@/components/record-form"
import { vehicleFields } from "@/lib/forms"
import type { Vehicle } from "@/lib/types"

export function VehicleForm({ open, onClose, vehicle, onSaved }: { open: boolean; onClose: () => void; vehicle?: Vehicle; onSaved?: (saved: unknown) => void }) {
    return (
        <RecordForm
            open={open}
            onClose={onClose}
            title={vehicle ? "Modifica veicolo" : "Aggiungi veicolo"}
            fields={vehicleFields}
            initial={vehicle}
            request={vehicle ? { url: `/api/vehicles/${vehicle.id}`, method: "PATCH" } : { url: "/api/vehicles", method: "POST" }}
            successMessage={vehicle ? "Modifiche salvate" : "Veicolo aggiunto"}
            onSaved={onSaved}
        />
    )
}
