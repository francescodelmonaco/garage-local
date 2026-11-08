import { placeAnnotations, textWidth, type BarAnnotation } from "./annotations.ts"

type LayoutOptions = {
    labels: string[]
    values: number[]
    width: number
    height: number
    tickFormat: (value: number) => string
    annotations?: BarAnnotation[]
}

/** Tick tondi con margine sopra il massimo, anche per una serie tutta a zero. */
export function roundTicks(maximum: number, count = 4) {
    const maximumValue = Number.isFinite(maximum) && maximum > 0 ? maximum : 1
    const rawStep = maximumValue / count
    const magnitude = 10 ** Math.floor(Math.log10(rawStep))
    const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((value) => value >= rawStep)!
    const last = Math.floor(maximumValue / step) + 1
    return Array.from({ length: last + 1 }, (_, index) => Number((index * step).toPrecision(12)))
}

/** Etichette con passo regolare, senza forzare l'ultima in uno spazio insufficiente. */
function labelIndices(labels: string[], width: number) {
    const longest = labels.reduce((length, label) => Math.max(length, label.length), 0)
    const capacity = Math.max(2, Math.min(8, Math.floor(width / (longest * 7 + 18))))
    if (labels.length <= capacity) return labels.map((_, index) => index)

    const step = Math.ceil(labels.length / capacity)
    return labels.map((_, index) => index).filter((index) => index % step === 0)
}

export function createBarLayout({ labels, values, width, height, tickFormat, annotations = [] }: LayoutOptions) {
    // Le spese non sono negative. Valori mancanti/non finiti non devono produrre SVG non validi.
    const amounts = labels.map((_, index) => Number.isFinite(values[index]) ? Math.max(0, values[index]) : 0)
    const ticks = roundTicks(amounts.reduce((max, value) => Math.max(max, value), 0))
    const paddingLeft = Math.min(width / 2, 12 + Math.max(...ticks.map((value) => textWidth(tickFormat(value), 12))))
    const bottom = height - 26
    const band = (width - paddingLeft) / Math.max(1, labels.length)
    const barWidth = Math.max(2, band * 0.62)
    const x = (index: number) => paddingLeft + band * index + band / 2
    const validAnnotations = annotations.filter(({ at }) => Number.isInteger(at) && at >= 0 && at < labels.length)
    const notes = placeAnnotations(validAnnotations, x, width)
    const noteRows = notes.reduce((count, note) => Math.max(count, note.row + 1), 0)
    const top = 8 + noteRows * 14 + (noteRows ? 4 : 0)
    const maximum = ticks[ticks.length - 1]
    const y = (value: number) => top + Math.max(0, bottom - top) * (1 - value / maximum)

    return {
        paddingLeft,
        bottom,
        top,
        ticks: ticks.map((value) => ({ value, label: tickFormat(value), y: y(value) })),
        labels: labelIndices(labels, width - paddingLeft).map((index) => ({
            index,
            label: labels[index],
            x: Math.max(0, Math.min(width - textWidth(labels[index], 12), x(index) - textWidth(labels[index], 12) / 2)),
        })),
        bars: amounts.map((value, index) => ({
            index, value, x: x(index) - barWidth / 2, y: y(value), width: barWidth, height: Math.max(0, y(0) - y(value)),
            annotations: validAnnotations.filter((note) => note.at === index).map((note) => note.label),
        })),
        annotations: notes.map((note) => ({ ...note, y: top - 9 - note.row * 14, end: Math.max(top, y(amounts[note.at]) - 4) })),
    }
}

export type BarLayout = ReturnType<typeof createBarLayout>
