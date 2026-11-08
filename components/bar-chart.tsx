"use client"

import { BarAxes } from "@/components/charts/bar-axes"
import { useElementWidth } from "@/hooks/use-element-width"
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

/** Colonne SVG: la geometria è pura e React aggiorna anche formato, altezza e annotazioni. */
export function BarChart({ label, labels, values, format, tickFormat = format, height = 200, highlight, annotations }: BarChartProps) {
    const { ref, width } = useElementWidth<HTMLDivElement>()
    const layout = createBarLayout({ labels, values, width, height, tickFormat, annotations })
    const highlighted = (index: number) => highlight == null || (Array.isArray(highlight) ? highlight.includes(index) : highlight === index)

    return (
        <div ref={ref} className="w-full" style={{ minHeight: height }}>
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label={label} className="block overflow-visible num">
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
