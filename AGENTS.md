<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Garage — istruzioni condivise per gli agenti

Garage è un libretto digitale self-hosted, in italiano, per un singolo utente.
Stack e comandi effettivi sono in `package.json`; non aggiungere dipendenze per
funzionalità già coperte da React, TanStack Query o dai componenti del progetto.

## Orientamento

- Parti da [docs/README.md](docs/README.md) e leggi solo le guide pertinenti.
- [Architettura](docs/architecture.md): confini dei moduli e regole del dominio.
- [Sviluppo](docs/development.md): avvio, verifiche e convenzioni del codice.
- [Orchestrazione](docs/agents/workflow.md): pianificazione, ownership e handoff.
- `CLAUDE.md` importa questo file: le regole comuni si modificano qui.

## Lavorare sulla repo

- Leggi `git status` prima di modificare; conserva il lavoro preesistente.
- Per lavori su più aree usa un piano in `docs/tasks/`, partendo dal template.
  Mantieni aggiornati decisioni, verifiche e prossimi passi.
- Delega solo quando richiesto dall'utente o da un'istruzione applicabile.
  Assegna file distinti ai collaboratori; un solo responsabile integra il lavoro.
- Non fare push, deploy, restore o cancellazioni dei dati senza richiesta.
- Commit solo su richiesta esplicita, nello stile della repo scout-pro: una riga minuscola
  in italiano con prefisso `add`/`fix`/`restyle`/`remove`/`update`, più modifiche separate
  da virgola, nessun corpo, nessun `Co-Authored-By`.
- Non stampare né versionare `.env`, cookie, credenziali o backup.

## Codice e verifica

- Una responsabilità per modulo; preferisci nomi espliciti e flussi semplici.
- Riusa `components/ui`, `Panel`, `TitleRow`, `RecordForm` e i metadati dei registri.
- Componenti specifici vicino alla pagina in `_components/`; logica pura in
  `_lib/` o `lib/`; richieste client e cache negli hook TanStack Query.
- Tieni i file applicativi entro 200 righe fisiche. Separa responsabilità reali,
  senza comprimere righe né creare astrazioni per un solo frammento banale.
  I componenti di base in `components/ui/` e le migrazioni generate sono esclusi.
- Mantieni validazione server, messaggi italiani, accessibilità e confini client/server.
- Prima di consegnare esegui `npm run verify`; per modifiche al codice dell'app
  esegui anche `npm run build`. Segnala esplicitamente verifiche non eseguite.
- Aggiungi test per regressioni e logica di dominio, non per rispecchiare il markup.
- Aggiorna la guida pertinente quando cambiano struttura, comandi o comportamento.
