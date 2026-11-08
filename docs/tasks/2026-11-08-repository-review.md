# Supporto Codex e revisione della struttura

Stato: completato
Responsabile: sessione Codex

## Obiettivo e accettazione

Istruzioni comuni per Codex e Claude Code, documentazione navigabile e workflow
con piano/handoff. Codice applicativo entro 200 righe per file, componenti
riutilizzati, nessun nuovo pacchetto. Verifiche statiche, di dominio e build.

## Perimetro e ownership

Un solo agente modifica documentazione, grafici, registri e suggerimenti dei form.
La repo non ha commit e tutti i file applicativi sono già non tracciati: non
creare commit e non confondere lo stato iniziale con i file di questa attività.
Conservare preferenze locali, dati, schema e migrazioni.

## Piano

- [x] Analisi di struttura, dipendenze e controlli iniziali
- [x] Istruzioni condivise, guide e template
- [x] Grafico React tipizzato, moduli dei registri e cache suggerimenti
- [x] Controllo dimensione file e revisione finale
- [x] Verifiche e aggiornamento dell'handoff

## Decisioni

- `AGENTS.md` è la fonte comune; `CLAUDE.md` la importa, senza duplicazioni.
- Il modulo grafici originale ha 622 righe e dieci grafici, ma l'app usa solo
  le colonne. Sostituire il globale `window.Charts` con SVG React e geometria
  pura; conservare palette, titoli dei valori, etichette e annotazione del picco.
- I registri condividono metadati e celle tra desktop e mobile.
- I suggerimenti marca/modello usano TanStack Query anziché una Promise globale
  che conserva anche un eventuale errore della prima richiesta.
- Il limite di 200 righe esclude primitive UI e file generati.

## Verifiche

Prima delle modifiche: `npm run lint`, `npm run typecheck`, `npm run check`
superati.

Dopo le modifiche:

- `npm run verify`: lint, tipi, check del dominio e grafici, controllo struttura.
  77 file applicativi controllati, massimo 166 righe, primitive UI escluse.
- `npm run build`: build Next.js e generazione delle pagine completate.
- Link locali di 9 file Markdown e import `@AGENTS.md`: verificati.
- Browser Chrome con fixture isolate a 1440 e 320 px: rendering desktop/mobile,
  assenza di overflow, resize e formattazione del grafico, serie tutta a zero,
  rilascio del ResizeObserver, ordinamento, paginazione, scadenze storiche,
  suggerimenti dipendenti dalla marca, errore con focus e salvataggio simulato.
  Nessun errore JavaScript. Script e catture in
  `/private/tmp/garage-repository-review/` (artefatti temporanei, non necessari
  per eseguire `verify`).
- Integrazione con il DB non verificata: l'avvio locale restituisce l'errore
  PostgreSQL `28P01` (password rifiutata). Server di prova arrestato; nessuna
  modifica a credenziali, schema o migrazioni. Le prove UI non usano il database.

## Handoff

Istruzioni e refactoring completati senza nuove dipendenze. Per le prossime
attività partire dall'indice in `docs/README.md` e dal template dei task.
Prima di una prova completa con dati reali, correggere la configurazione locale
del database e ripetere i flussi CRUD nell'app avviata con PostgreSQL.
