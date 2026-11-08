import type { BarLayout } from "@/lib/charts/bar-layout"

export function BarAxes({ layout, width }: { layout: BarLayout; width: number }) {
    return (
        <g fill="var(--axis-ink)" fontSize={12}>
            {layout.ticks.map((tick) => (
                <g key={tick.value}>
                    <line x1={layout.paddingLeft} x2={width} y1={tick.y} y2={tick.y} stroke="var(--grid)" shapeRendering="crispEdges" />
                    <text x={layout.paddingLeft - 8} y={tick.y + 4} textAnchor="end">{tick.label}</text>
                </g>
            ))}
            {layout.labels.map(({ index, label, x }) => <text key={index} x={x} y={layout.bottom + 18}>{label}</text>)}
        </g>
    )
}
