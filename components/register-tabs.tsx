"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { NativeSelect } from "@/components/ui/native-select"
import { REGISTER_NAMES, registerMeta, type RegisterName } from "@/lib/register-meta"
import { cn } from "@/lib/utils"

/** Schede a sottolineatura dei registri su una riga da 1px: link ad altre schermate, oppure (onSelect) schede locali. */
export function RegisterTabs({ current, onSelect }: { current: RegisterName; onSelect?: (name: RegisterName) => void }) {
    const router = useRouter()
    const select = (name: RegisterName) => onSelect ? onSelect(name) : router.push(`/${name}`)
    const tabClass = (name: RegisterName) => cn("-mb-px shrink-0 border-b-2 border-transparent py-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
        current === name && "border-foreground text-foreground")

    return (
        <div className="mb-4 min-w-0">
            {/* Telefono: un select al posto di cinque schede che non ci stanno */}
            <NativeSelect aria-label="Registro" value={current} onChange={(e) => select(e.target.value as RegisterName)}
                className="rounded-full pl-4 text-base sm:hidden">
                {REGISTER_NAMES.map((name) => <option key={name} value={name}>{registerMeta[name].title}</option>)}
            </NativeSelect>
            <div role={onSelect ? "tablist" : undefined} className="hidden gap-6 border-b border-rule sm:flex">
                {REGISTER_NAMES.map((name) => onSelect ? (
                    <button key={name} role="tab" aria-selected={current === name} className={tabClass(name)} onClick={() => onSelect(name)}>
                        {registerMeta[name].title}
                    </button>
                ) : (
                    <Link key={name} href={`/${name}`} aria-current={current === name ? "page" : undefined} className={tabClass(name)}>
                        {registerMeta[name].title}
                    </Link>
                ))}
            </div>
        </div>
    )
}
