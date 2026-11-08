"use client"

import { useState } from "react"
import { Mark } from "@/components/bits"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [pending, setPending] = useState(false)

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setPending(true)
        setError(null)
        const passphrase = new FormData(event.currentTarget).get("passphrase")
        const response = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ passphrase }) })
        if (response.ok) {
            window.location.replace("/dashboard")
            return
        }
        setError((await response.json().catch(() => ({}))).error ?? "Accesso non riuscito.")
        setPending(false)
    }

    return (
        <main className="grid min-h-dvh place-items-center px-4">
            <form onSubmit={submit} className="grid w-full max-w-sm gap-6 rounded-xl bg-card p-8">
                <div className="grid gap-3">
                    <Mark />
                    <h1 className="text-xl font-semibold tracking-tight">Accedi al garage</h1>
                    <p className="text-sm text-muted-foreground">Inserisci la passphrase impostata in APP_PASSPHRASE.</p>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="passphrase">Passphrase</Label>
                    <Input id="passphrase" name="passphrase" type="password" autoComplete="current-password" autoFocus required
                        aria-invalid={error ? true : undefined} aria-describedby={error ? "login-error" : undefined} />
                    {error && <p id="login-error" role="alert" className="text-sm text-destructive">{error}</p>}
                </div>
                <Button type="submit" disabled={pending}>{pending ? "Accesso…" : "Entra"}</Button>
            </form>
        </main>
    )
}
