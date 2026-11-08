export type BarAnnotation = { at: number; label: string; short?: string }
export type PlacedAnnotation = { at: number; label: string; x: number; width: number; row: number; leader: number }

/** Stima prudente, utilizzabile anche nel rendering server senza misurazioni DOM. */
export const textWidth = (text: string, size: number) => text.length * size * 0.6

/** Le etichette occupano fino a tre righe sopra le colonne, senza incrociare altri richiami. */
export function placeAnnotations(annotations: BarAnnotation[], x: (index: number) => number, width: number) {
    const placed: PlacedAnnotation[] = []
    const ordered = [...annotations].sort((a, b) => a.at - b.at)

    for (const annotation of ordered) {
        const leader = x(annotation.at)
        const variants = [annotation.label, annotation.short].filter((label): label is string => Boolean(label))
        let candidate: PlacedAnnotation | undefined

        for (const label of variants) {
            const labelWidth = textWidth(label, 11)
            for (let row = 0; row < 3 && !candidate; row++) {
                for (const left of [leader + 4, leader - 4 - labelWidth]) {
                    const right = left + labelWidth
                    if (left < 0 || right > width) continue
                    const overlaps = placed.some((other) =>
                        (other.row === row && left < other.x + other.width + 6 && right > other.x - 6)
                        || (other.row >= row && other.leader > left - 3 && other.leader < right + 3)
                        || (other.row <= row && leader > other.x - 3 && leader < other.x + other.width + 3),
                    )
                    if (!overlaps) {
                        candidate = { at: annotation.at, label, x: left, width: labelWidth, row, leader }
                        break
                    }
                }
            }
            if (candidate) break
        }
        if (candidate) placed.push(candidate)
    }

    return placed
}
