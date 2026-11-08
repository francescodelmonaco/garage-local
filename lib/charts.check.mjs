import assert from "node:assert/strict"
import { createBarLayout, roundTicks } from "./charts/bar-layout.ts"

const labels = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"]
const options = { labels, values: [100, 200, 50, 1000, 30, 80, 60, 150, 90, 70, 40, 20], width: 600, height: 200, tickFormat: String }

for (const maximum of [0, 0.001, 0.1, 1, 50, 1000, 1000000]) {
    const ticks = roundTicks(maximum)
    assert.equal(ticks[0], 0)
    assert.ok(ticks.at(-1) > maximum, `L'asse deve lasciare spazio sopra ${maximum}`)
    assert.ok(ticks.every((value, index) => Number.isFinite(value) && (index === 0 || value > ticks[index - 1])))
}

for (const width of [240, 320, 600, 1200]) {
    const layout = createBarLayout({ ...options, width, annotations: [{ at: 3, label: "Acquisto 1.000 €", short: "Acquisto" }] })
    assert.equal(layout.bars.length, labels.length)
    for (const bar of layout.bars) {
        assert.ok(bar.x >= layout.paddingLeft && bar.x + bar.width <= width)
        assert.ok(bar.y >= layout.top && bar.y + bar.height <= layout.bottom + 1e-8)
        assert.ok(Number.isFinite(bar.height))
    }
    assert.ok(layout.bars[3].height > layout.bars[1].height)
    assert.equal(layout.annotations.length, 1)
    for (const note of layout.annotations) assert.ok(note.x >= 0 && note.x + note.width <= width)
    assert.deepEqual(layout.bars[3].annotations, ["Acquisto 1.000 €"])
}

const empty = createBarLayout({ ...options, labels: [], values: [] })
assert.deepEqual(empty.bars, [])
assert.deepEqual(empty.labels, [])
assert.deepEqual(empty.annotations, [])

const zeros = createBarLayout({ ...options, values: labels.map(() => 0) })
assert.ok(zeros.bars.every((bar) => bar.height === 0))
assert.ok(zeros.ticks.every((tick) => Number.isFinite(tick.y)))

const invalid = createBarLayout({ ...options, values: [-1, NaN, Infinity], annotations: [{ at: 20, label: "Fuori serie" }] })
assert.ok(invalid.bars.every((bar) => bar.value === 0 && bar.height === 0))
assert.deepEqual(invalid.annotations, [])

const shortened = createBarLayout({ ...options, width: 240, annotations: [{ at: 11, label: "Una descrizione molto lunga che non entra nel grafico", short: "Picco" }] })
assert.equal(shortened.annotations[0].label, "Picco")
assert.equal(shortened.bars[11].annotations[0], "Una descrizione molto lunga che non entra nel grafico")

const crowded = createBarLayout({ ...options, width: 320, annotations: labels.map((label, at) => ({ at, label: `Spese ${label}` })) })
for (const note of crowded.annotations) {
    assert.ok(note.row < 3)
    for (const other of crowded.annotations) {
        if (other === note || other.row !== note.row) continue
        assert.ok(note.x + note.width + 6 <= other.x || other.x + other.width + 6 <= note.x)
    }
}
// Le annotazioni senza spazio restano nei titoli delle rispettive colonne.
assert.ok(crowded.bars.every((bar) => bar.annotations.length === 1))

const taller = createBarLayout({ ...options, height: 300, tickFormat: (value) => `${value} €` })
const original = createBarLayout(options)
assert.ok(taller.bars[3].height > original.bars[3].height)
assert.ok(taller.ticks.every((tick) => tick.label.endsWith(" €")))

console.log("Grafici: OK (scale, serie vuote, resize, annotazioni e formattazione)")
