# Garage

Libretto digitale self-hosted per auto e moto. Tiene in un posto solo spese, scadenze e finanziamenti dei tuoi veicoli. Gira in locale, per un solo utente, protetto da una passphrase.

## Cosa fa

- **Panoramica:** spesa dell'anno confrontata con gli stessi mesi dell'anno prima, grafico mensile per categoria, prossime scadenze sulla striscia dei 12 mesi, ultimi rifornimenti e manutenzioni.
- **Veicoli:** scheda per ogni auto o moto, con costi, scadenze, acquisto e piano di finanziamento.
- **Registri:** rifornimenti, manutenzioni, assicurazioni, bollo e revisioni, con ricerca, ordinamento e paginazione.
- **Scadenze:** stato solo per la polizza, il bollo e la revisione in corso. Le righe vecchie restano come storico.

Stack: Next.js 16 (App Router, Route Handlers), TypeScript, Drizzle ORM, Postgres 17, Tailwind v4, shadcn/ui, TanStack Query.

## Avvio con Docker

Serve Docker con Compose.

```sh
cp .env.example .env
# imposta APP_PASSPHRASE e SESSION_SECRET (es. `openssl rand -hex 32`)
docker compose up -d --build
```

L'app risponde su http://localhost:3000. Le migrazioni si applicano da sole all'avvio (`instrumentation.ts`). I dati restano nel volume Docker `pgdata`.

Dopo una modifica al `.env`, ricrea il container dell'app: `docker compose up -d app`. Dopo una modifica al codice, aggiungi `--build`.

### Rete locale

Per raggiungere l'app da altri dispositivi della rete locale imposta `APP_BIND=0.0.0.0` nel `.env`. L'app non è pensata per essere esposta su internet: il login non ha rate limit. Dietro un reverse proxy HTTPS il cookie di sessione diventa `Secure` in automatico.

## Variabili d'ambiente

| Variabile | Uso |
|---|---|
| `APP_PASSPHRASE` | Passphrase della pagina di login |
| `SESSION_SECRET` | Firma del cookie di sessione. Cambiarla chiude tutte le sessioni |
| `SESSION_DAYS` | Durata della sessione in giorni (default 30) |
| `POSTGRES_PASSWORD` | Password del database |
| `DATABASE_URL` | Solo per `npm run dev`. In Docker la imposta `docker-compose.yml` |
| `APP_PORT` / `APP_BIND` | Porta e interfaccia esposte da Docker |

## Backup

```sh
npm run db:backup                            # crea backups/garage-AAAAMMGG-HHMMSS.dump
npm run db:restore -- backups/<file>.dump    # sostituisce i dati attuali
```

Gli script usano il container `db`: non serve `pg_dump` sull'host. I file `.dump` sono esclusi da git.

## Sviluppo

La guida completa è in [docs/development.md](docs/development.md).
Per lavorare con Codex o Claude Code parti dalle [istruzioni comuni](AGENTS.md)
e dal [workflow degli agenti](docs/agents/workflow.md). L'[indice](docs/README.md)
collega architettura, convenzioni e piani delle attività.

Serve Node.js 24 o più recente.

```sh
npm install
docker compose up -d db
npm run dev
```

| Comando | Cosa fa |
|---|---|
| `npm run verify` | Lint, tipi, check della logica e limite dimensione dei file |
| `npm run check` | Verifiche della logica pura: scadenze, finanziamento, validazioni, sessione e grafici |
| `npm run check:structure` | Limite di 200 righe per file applicativo (primitive UI escluse) |
| `npm run typecheck` / `npm run lint` | TypeScript ed ESLint |
| `npm run db:generate` | Nuova migrazione da `db/schema.ts` in `drizzle/` |

### Struttura

```
app/(app)/                  pagine: dashboard, veicoli, veicoli/[id], [register] (i 5 registri)
app/api/                    Route Handlers: login, vehicles, registri/[register], dashboard
app/login/                  pagina della passphrase
proxy.ts                    protegge pagine e API con il cookie firmato
db/schema.ts                tabelle, enum e vincoli (Drizzle); drizzle/ contiene le migrazioni
lib/register-meta.ts        colonne, campi e testi dei registri (client e server)
lib/registers.ts            tabelle, validazione e ordinamenti dei registri (server)
lib/financing.ts            piano rate, usato da scheda veicolo e dashboard
components/record-form.tsx  modale generica guidata dalle definizioni dei campi
```

## Licenza

[MIT](LICENSE) © 2026 Francesco Delmonaco
