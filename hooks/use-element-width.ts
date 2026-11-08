"use client"

import { useEffect, useRef, useState } from "react"

/** Larghezza del contenitore: valore iniziale stabile per SSR e observer rilasciato all'unmount. */
export function useElementWidth<T extends HTMLElement>(initialWidth = 600) {
    const ref = useRef<T>(null)
    const [width, setWidth] = useState(initialWidth)

    useEffect(() => {
        const element = ref.current
        if (!element) return
        const observer = new ResizeObserver(([entry]) => {
            setWidth(Math.max(240, Math.round(entry.contentRect.width)))
        })
        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    return { ref, width }
}
