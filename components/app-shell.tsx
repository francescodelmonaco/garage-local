"use client"

import { LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Mark } from "@/components/bits"
import { Button } from "@/components/ui/button"
import { REGISTER_NAMES, registerMeta } from "@/lib/register-meta"
import { cn } from "@/lib/utils"

// Shell senza sidebar: barra di 48px in alto, colonna centrata da 1152px.
// Griglia: colonna 1152 = 3 × 373 + 2 × 16 (KPI) = 2 × 568 + 16 (coppie di card).
const NAV = [
    { href: "/dashboard", label: "Panoramica", match: ["/dashboard"] },
    { href: "/veicoli", label: "Veicoli", match: ["/veicoli"] },
    { href: "/rifornimenti", label: "Registri", match: REGISTER_NAMES.map((name) => `/${name}`) },
]

async function logout() {
    await fetch("/api/login", { method: "DELETE" })
    window.location.replace("/login")
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)
    const scrolled = useScrolled()
    const isActive = (match: string[]) => match.some((m) => pathname === m || pathname.startsWith(`${m}/`))

    return (
        <>
            {/* La riga da 1px compare solo quando il contenuto scorre sotto la barra */}
            <header className={cn("sticky top-0 z-20 bg-background", scrolled && "border-b border-rule")}>
                <div className="mx-auto flex h-12 max-w-[1152px] items-center gap-8 px-4 lg:px-0">
                    <Link href="/dashboard" aria-label="Garage, panoramica"><Mark /></Link>
                    <nav aria-label="Principale" className="hidden items-center gap-6 md:flex">
                        {NAV.map(({ href, label, match }) => (
                            <Link key={href} href={href} aria-current={isActive(match) ? "page" : undefined}
                                className={cn("text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground", isActive(match) && "text-foreground")}>
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <Button variant="ghost" size="sm" className="ml-auto hidden md:inline-flex" onClick={logout}><LogOut />Esci</Button>
                    <Button variant="ghost" size="icon" className="ml-auto md:hidden" aria-label="Apri il menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu /></Button>
                </div>
            </header>

            {menuOpen && <MobileMenu pathname={pathname} isActive={isActive} onClose={() => setMenuOpen(false)} />}

            <main className="mx-auto w-full max-w-[1152px] px-4 pt-6 pb-16 md:pt-9 lg:px-0">{children}</main>
        </>
    )
}

/** Telefono: menu a tutto schermo con le destinazioni e i registri; si chiude toccando un link. */
function MobileMenu({ pathname, isActive, onClose }: { pathname: string; isActive: (match: string[]) => boolean; onClose: () => void }) {
    return (
        <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-30 flex flex-col bg-background px-4 md:hidden"
            onClick={(e) => (e.target as HTMLElement).closest("a") && onClose()}>
            <div className="flex h-12 items-center justify-between">
                <Mark />
                <Button variant="ghost" size="icon" aria-label="Chiudi il menu" onClick={onClose}><X /></Button>
            </div>
            <nav aria-label="Principale" className="mt-6 grid gap-1">
                {NAV.slice(0, 2).map(({ href, label, match }) => (
                    <Link key={href} href={href} className={cn("flex h-12 items-center text-lg font-semibold text-muted-foreground", isActive(match) && "text-foreground")}>{label}</Link>
                ))}
                <p className="mt-6 mb-1 text-xs text-faint">Registri</p>
                {REGISTER_NAMES.map((name) => (
                    <Link key={name} href={`/${name}`} className={cn("flex h-11 items-center text-base text-muted-foreground", pathname === `/${name}` && "text-foreground")}>{registerMeta[name].title}</Link>
                ))}
            </nav>
            <Button variant="outline" className="mt-auto mb-8" onClick={logout}><LogOut />Esci</Button>
        </div>
    )
}

function useScrolled() {
    const [scrolled, setScrolled] = useState(false)
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 0)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])
    return scrolled
}
