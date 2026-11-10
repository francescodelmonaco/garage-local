"use client"

import { useEffect, useRef, useState } from "react"

/** Dimensioni del contenitore: valori iniziali stabili per SSR e observer rilasciato all'unmount. */
export function useElementSize<T extends HTMLElement>(initialWidth = 600, initialHeight = 0) {
    const ref = useRef<T>(null)
    const [size, setSize] = useState({ width: initialWidth, height: initialHeight })

    useEffect(() => {
        const element = ref.current
        if (!element) return
        const observer = new ResizeObserver(([entry]) => {
            setSize({ width: Math.max(240, Math.round(entry.contentRect.width)), height: Math.round(entry.contentRect.height) })
        })
        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    return { ref, ...size }
}
