export class ApiError extends Error {
    constructor(message: string, readonly field?: string) {
        super(message)
    }
}

/** fetch JSON verso le API interne; errori come ApiError con il campo da evidenziare. */
export async function api<T = unknown>(url: string, init?: { method?: string; body?: unknown }): Promise<T> {
    const response = await fetch(url, {
        method: init?.method ?? "GET",
        headers: init?.body === undefined ? undefined : { "content-type": "application/json" },
        body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    })
    if (response.status === 401) {
        window.location.replace("/login")
        throw new ApiError("Sessione scaduta.")
    }
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new ApiError(data.error ?? "Qualcosa è andato storto.", data.field)
    return data as T
}
