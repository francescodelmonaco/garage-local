# Architettura

Garage usa Next.js App Router, TypeScript, PostgreSQL e Drizzle. È pensato per
un solo utente su una macchina o rete locale. Non esiste un modello multiutente.

## Confini

| Area | Responsabilità |
| --- | --- |
| `app/(app)/` | Dashboard, veicoli e registri protetti dal layout comune |
| `app/**/_components/`, `_lib/` | UI e calcoli usati soltanto da quella pagina |
| `app/api/` | Route Handlers: validazione, query e risposte HTTP |
| `components/` | UI condivisa; `ui/` contiene le primitive shadcn/Radix |
| `hooks/` | Query, mutazioni e risorse client condivise |
| `lib/` | Dominio, formattazione, metadati e utilità |
| `db/`, `drizzle/` | Connessione/schema e migrazioni versionate |
| `scripts/` | Backup, ripristino e controlli della repository |

Le pagine interattive usano TanStack Query attraverso `hooks/queries.ts`.
`lib/fetcher.ts` traduce gli errori API e rimanda al login sulle risposte 401.
Le mutazioni invalidano la cache: il volume di dati locale è ridotto.
Non importare connessione o schema DB nei componenti client.

## Registri e form

I cinque registri sono manutenzioni, rifornimenti, assicurazioni, bollo e revisioni.
`lib/register-meta.ts` è la fonte comune per colonne, campi, ordinamenti e testi.
`lib/registers.ts` associa i registri a tabelle e validatori sul server.
`RecordForm` rende i campi e invia le stringhe del form; la conversione e la
validazione spettano agli schemi Zod in `lib/input-validation.ts`.
`lib/api.ts` gestisce parsing ed errori HTTP; non duplicare questi meccanismi.

`components/register-rows.tsx` compone la tabella desktop e la lista mobile in
`components/registers/`: celle e tipi sono condivisi. `components/pagination.tsx`
è il controllo di navigazione usato dal registro. I suggerimenti marca/modello
passano da `hooks/use-brand-suggestions.ts`, con cache e retry TanStack Query.

## Grafici

`components/bar-chart.tsx` rende colonne SVG e usa gli assi in `components/charts/`.
`lib/charts/` contiene geometria e posizionamento delle annotazioni, senza DOM.
`hooks/use-element-width.ts` osserva il contenitore e rilascia l'observer quando
il componente viene smontato. Formati e palette rimangono quelli del progetto;
non ci sono globali sul browser né una libreria di grafici aggiuntiva.

## Invarianti del dominio

- Scadenze: solo l'ultima polizza, revisione e bollo del veicolo sono correnti;
  le altre righe restano nello storico. Il bollo scade un anno dopo il pagamento.
- Finanziamento: il veicolo deve avere una data di acquisto non successiva alla
  prima rata. Il vincolo è protetto anche da un trigger nella migrazione SQL.
- `lib/financing.ts` calcola rate, residuo, maxi-rata ed estinzione per scheda e
  dashboard. Una maxi-rata scaduta senza esito non entra ancora nelle spese.
- I totali includono l'acquisto anche senza data; il grafico mensile include solo
  pagamenti datati. Le medie richiedono la data di acquisto.
- Eliminare un veicolo elimina anche i suoi registri e il finanziamento.

## Sessione e avvio

`proxy.ts` verifica il cookie firmato; `app/api/login/route.ts` gestisce il login.
`lib/session.ts` contiene firma e durata. Il login non ha rate limit.
`instrumentation.ts` applica le migrazioni all'avvio del runtime Node, anche in
sviluppo: usa un database dedicato per prove che richiedono scritture.
