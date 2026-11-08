import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))
const limit = 200
const sourceFile = /\.(?:[cm]?[jt]sx?|css|sh)$/
const excluded = new Set(["components/ui"])

async function sourceFiles(directory) {
    const entries = await readdir(path.join(root, directory), { withFileTypes: true })
    const files = await Promise.all(entries.map(async (entry) => {
        const relative = path.posix.join(directory, entry.name)
        if (excluded.has(relative)) return []
        if (entry.isDirectory()) return sourceFiles(relative)
        return entry.isFile() && sourceFile.test(entry.name) ? [relative] : []
    }))
    return files.flat()
}

const directories = ["app", "components", "db", "hooks", "lib", "scripts"]
const files = (await Promise.all(directories.map(sourceFiles))).flat()
const rootEntries = await readdir(root, { withFileTypes: true })
files.push(...rootEntries.filter((entry) => entry.isFile() && sourceFile.test(entry.name) && entry.name !== "next-env.d.ts").map((entry) => entry.name))

const counts = await Promise.all(files.map(async (file) => {
    const content = await readFile(path.join(root, file), "utf8")
    const lines = content ? content.split("\n").length - Number(content.endsWith("\n")) : 0
    return { file, lines }
}))
const oversized = counts.filter(({ lines }) => lines > limit).sort((a, b) => b.lines - a.lines)

if (oversized.length) {
    for (const { file, lines } of oversized) console.error(`${file}: ${lines} righe (limite ${limit}). Separa le responsabilità del modulo.`)
    process.exitCode = 1
} else {
    console.log(`Struttura: OK (${counts.length} file, massimo ${Math.max(...counts.map(({ lines }) => lines))} righe; limite ${limit}, primitive UI escluse)`)
}
