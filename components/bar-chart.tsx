"use client"

import { BarAxes } from "@/components/charts/bar-axes"
import { useElementSize } from "@/hooks/use-element-size"
import type { BarAnnotation } from "@/lib/charts/annotations"
import { createBarLayout } from "@/lib/charts/bar-layout"

type BarChartProps = {
    label: string
    labels: string[]
    values: number[]
    format: (value: number) => string
    tickFormat?: (value: number) => string
    height?: number
    highlight?: number | number[]
    annotations?: BarAnnotation[]
}

/**
 * Colonne SVG: la geometria è pura e React aggiorna anche formato, altezza e annotazioni.
 * `height` è il minimo: in un contenitore flex il grafico occupa lo spazio libero.
 */
export function BarChart({ label, labels, values, format, tickFormat = format, height: minHeight = 200, highlight, annotations }: BarChartProps) {
    const { ref, width, height: measured } = useElementSize<HTMLDivElement>(600, minHeight)
    const height = Math.max(minHeight, measured)
    const layout = createBarLayout({ labels, values, width, height, tickFormat, annotations })
    const highlighted = (index: number) => highlight == null || (Array.isArray(highlight) ? highlight.includes(index) : highlight === index)

    // SVG assoluto: non contribuisce all'altezza del contenitore, così il grafico può anche restringersi
    return (
        <div ref={ref} className="relative w-full flex-1" style={{ minHeight }}>
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label={label} className="absolute inset-x-0 top-0 block overflow-visible num">
                <BarAxes layout={layout} width={width} />
                {layout.bars.map((bar) => (
                    <rect key={bar.index} x={bar.x} y={bar.y} width={bar.width} height={bar.height}
                        fill={highlighted(bar.index) ? "var(--chart-1)" : "var(--chart-muted)"} shapeRendering="crispEdges">
                        <title>{[`${labels[bar.index]}: ${format(bar.value)}`, ...bar.annotations].join(" · ")}</title>
                    </rect>
                ))}
                <g fill="var(--axis-ink)" stroke="var(--axis-ink)" fontSize={11}>
                    {layout.annotations.map((note) => (
                        <g key={`${note.at}-${note.label}`}>
                            <line x1={note.leader} x2={note.leader} y1={note.y - 8} y2={note.end} opacity={0.45} shapeRendering="crispEdges" />
                            <text x={note.x} y={note.y} stroke="none">{note.label}</text>
                        </g>
                    ))}
                </g>
            </svg>
        </div>
    )
}
