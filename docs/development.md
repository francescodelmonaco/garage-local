# Sviluppo

## Preparazione

Serve Node.js 24 o successivo e Docker Compose per PostgreSQL.

```sh
npm ci
cp .env.example .env
# Imposta le credenziali e DATABASE_URL per il database locale.
docker compose up -d db
npm run dev
```

Se `.env` esiste già, mantienilo. Le migrazioni partono automaticamente con il
server; non avviare istanze di prova contro un database di cui vuoi conservare
immutati i dati. La build usa `next/font`: può richiedere accesso ai font remoti.

## Verifiche

| Comando | Scopo |
| --- | --- |
| `npm run lint` | ESLint e regole React/Next.js |
| `npm run typecheck` | Tipi TypeScript senza emissione |
| `npm run check` | Assert eseguibili con Node su logica e regressioni |
| `npm run check:structure` | Limite di 200 righe per i file applicativi |
| `npm run verify` | Tutti i controlli precedenti |
| `npm run build` | Build di produzione con controllo delle route |
| `npm run db:generate` | Genera migrazioni dalle modifiche allo schema |

I check puri non richiedono il database. I test sono `lib/*.check.mjs`, con import
espliciti dei moduli TypeScript supportati da Node. Per una modifica alla UI
verifica anche la pagina nel browser a dimensioni desktop e mobile, inclusi
caricamento, errore e stato vuoto quando pertinenti. `verify` non sostituisce
questa verifica né copre l'integrazione con PostgreSQL.

Se `npm run dev` riceve l'errore PostgreSQL `28P01` (password rifiutata), un altro
Postgres occupa probabilmente `127.0.0.1:5432`, per esempio il container di un
altro progetto. Controlla con `docker ps` o `lsof -iTCP:5432 -sTCP:LISTEN`, ferma
l'altro servizio e avvia `docker compose up -d db`. La password vale solo alla
prima creazione del volume `pgdata`: cambiarla dopo nel `.env` produce lo stesso errore.

Per prove con scritture o screenshot usa un database separato nello stesso container
(`docker compose exec db createdb -U garage garage_demo`) e passa a `npm run dev`
un `DATABASE_URL` che punta a `garage_demo`.

## Convenzioni

- Leggi le guide della versione installata in `node_modules/next/dist/docs/`
  prima di cambiare API o convenzioni Next.js.
- Usa TypeScript, import diretti, nomi di file in kebab-case e nomi espliciti.
- Separa calcoli puri, accesso ai dati e presentazione; evita dipendenze circolari.
- Riusa i componenti esistenti prima di introdurne altri. I form dei registri
  si estendono attraverso i metadati, non copiando una modale per registro.
- Preferisci TanStack Query per risorse remote: cache, errori e retry rimangono
  nel medesimo sistema. Rilascia observer ed eventi negli effetti React.
- Il limite di 200 righe è un invito a separare responsabilità: non accorciare
  artificialmente il codice. Primitive `components/ui/` e file generati esclusi.
- Mantieni le date di dominio come `YYYY-MM-DD`, il vuoto numerico come `null`
  e la formattazione italiana centralizzata in `lib/format.ts`.

Backup e restore sono descritti nel [README](../README.md#backup). Il restore
sostituisce i dati: non usarlo come passo ordinario di una verifica.
