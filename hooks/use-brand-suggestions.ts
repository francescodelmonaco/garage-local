"use client"

import { useQuery } from "@tanstack/react-query"

type Brand = { name: string; models: string[] }
type BrandCatalog = { brands: Brand[] }

async function fetchBrands(): Promise<Brand[]> {
    const response = await fetch("/brands-models.json")
    if (!response.ok) throw new Error("Impossibile caricare marche e modelli.")
    const catalog: BrandCatalog = await response.json()
    return catalog.brands
}

/** Un'unica query condivisa dai form, con retry e senza Promise globali bloccate su un errore. */
export function useBrandSuggestions(enabled: boolean, selectedBrand: string) {
    const { data: brands = [] } = useQuery({
        queryKey: ["brand-catalog"],
        queryFn: fetchBrands,
        enabled,
        staleTime: Infinity,
    })
    const normalizedBrand = selectedBrand.trim().toLowerCase()

    return {
        brand: brands.map(({ name }) => name),
        model: brands.find(({ name }) => name.toLowerCase() === normalizedBrand)?.models ?? [],
    }
}
