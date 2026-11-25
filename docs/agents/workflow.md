# Lavorare con Codex e Claude Code

> Le regole generali (git, commit, delega, task e passaggio tra strumenti) stanno in
> `~/.codex/AGENTS.md`, caricato da Codex e Claude Code in ogni repo; le regole della repo in
> [AGENTS.md](../../AGENTS.md).

## Ingresso comune

Avvia lo strumento dalla radice della repository. Codex usa `AGENTS.md`; Claude Code lo importa
attraverso `CLAUDE.md`. Entrambi partono dall'[indice](../README.md) e dalle stesse guide.

## Flusso di un'attività

1. Identifica il risultato osservabile e conserva le modifiche già presenti.
2. Per modifiche su più aree copia `docs/tasks/TEMPLATE.md` in `docs/tasks/AAAA-MM-GG-nome.md`.
   Per un ritocco locale basta il riepilogo della sessione.
3. Implementa per responsabilità, mantenendo piccolo il perimetro.
4. Rivedi comportamento, duplicazioni, errori e accessibilità. Esegui `npm run verify` e, per
   codice dell'app, `npm run build`.
5. Riporta all'utente cosa cambia e come è stato verificato.

## Delega

Quando è autorizzata, contratti, schema DB e dipendenze condivise si risolvono prima di dividere
l'implementazione.
