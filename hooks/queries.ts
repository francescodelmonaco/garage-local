"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/fetcher"
import type { RegisterName, RegisterRow } from "@/lib/register-meta"
import type { DashboardData, Vehicle, VehicleWithFinancing } from "@/lib/types"

export type RegisterParams = { page: number; search: string; sort: string; vehicleId?: string }
export type RegisterPage = { rows: RegisterRow[]; count: number; total: number; pageSize: number }

export const useVehicles = () => useQuery({ queryKey: ["vehicles"], queryFn: () => api<Vehicle[]>("/api/vehicles") })

export const useVehicle = (id: string) =>
    useQuery({ queryKey: ["vehicles", id], queryFn: () => api<VehicleWithFinancing>(`/api/vehicles/${id}`), retry: false })

export const useDashboard = () => useQuery({ queryKey: ["dashboard"], queryFn: () => api<DashboardData>("/api/dashboard") })

export function useRegister(name: RegisterName, params: RegisterParams) {
    const query = new URLSearchParams({ page: String(params.page), search: params.search, sort: params.sort })
    if (params.vehicleId) query.set("vehicleId", params.vehicleId)
    return useQuery({
        queryKey: ["register", name, params],
        queryFn: () => api<RegisterPage>(`/api/registri/${name}?${query}`),
        placeholderData: keepPreviousData, // durante paginazione e ricerca restano i dati precedenti
    })
}

/**
 * Mutazione verso le API: a successo invalida tutto.
 * Invalidazione globale: poche query locali; restringere se diventa lenta.
 */
export function useApiMutation<TVars>(request: (vars: TVars) => { url: string; method: string; body?: unknown }) {
    const client = useQueryClient()
    return useMutation({
        mutationFn: (vars: TVars) => {
            const { url, ...init } = request(vars)
            return api(url, init)
        },
        onSuccess: () => client.invalidateQueries(),
    })
}
