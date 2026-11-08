/** Riga del titolo di pagina: h1 a 20-24px, una frase sui dati, azioni a destra. */
export function TitleRow({ title, subline, actions, children }: {
    title: React.ReactNode
    subline?: React.ReactNode
    actions?: React.ReactNode
    /** Accanto al titolo, es. la targa */
    children?: React.ReactNode
}) {
    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="grid min-w-0 gap-1">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    {children}
                </div>
                {subline && <p className="text-sm text-muted-foreground">{subline}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    )
}
