# Lavorare con Codex e Claude Code

## Ingresso comune

Codex usa `AGENTS.md`; Claude Code lo importa attraverso `CLAUDE.md`.
Entrambi partono dall'[indice](../README.md) e dalle stesse guide. Non servono
configurazioni specifiche di un modello, permessi globali o servizi aggiuntivi.
Avvia lo strumento dalla radice della repository.

Il meccanismo di istruzioni di Codex è descritto nella
[documentazione ufficiale](https://developers.openai.com/codex/guides/agents-md).
Piani e ruoli qui sotto sono convenzioni della repo, non agenti avviati
automaticamente dagli strumenti.

## Flusso di un'attività

1. Leggi richiesta, `AGENTS.md` e `git status`. Identifica il risultato osservabile
   e conserva le modifiche già presenti.
2. Per modifiche su più aree copia `docs/tasks/TEMPLATE.md` in
   `docs/tasks/AAAA-MM-GG-nome.md`. Indica criteri di accettazione, file coinvolti
   e verifiche. Per un ritocco locale è sufficiente il riepilogo della sessione.
3. Implementa per responsabilità, mantenendo piccolo il perimetro. Aggiorna il
   piano quando una scoperta cambia l'approccio o emerge un vincolo.
4. Rivedi il risultato per comportamento, duplicazioni, errori e accessibilità.
   Esegui `npm run verify` e, per codice dell'app, `npm run build`.
5. Concludi il task con esiti reali dei controlli e limiti ancora aperti. Riporta
   all'utente cosa cambia e come è stato verificato.

## Coordinamento quando viene richiesta la delega

| Ruolo | Risultato atteso |
| --- | --- |
| Responsabile | Piano, contratti condivisi, assegnazione dei file e integrazione |
| Implementatore | Modifica nel perimetro assegnato, verifiche locali e handoff |
| Revisore | Problemi concreti con file, scenario e gravità; controlli mancanti |

Una persona o un singolo agente può coprire i tre ruoli. Avvia altri agenti solo
se la richiesta o le istruzioni applicabili lo autorizzano esplicitamente.
Prima di lavorare in parallelo definisci input/output e un proprietario per ogni
file. Contratti, schema DB e dipendenze condivise si risolvono prima di dividere
l'implementazione. In checkout condivisi evita edit concorrenti dello stesso file;
in checkout isolati passa commit o patch al responsabile.

## Passaggio di consegne

Aggiorna il task prima di cambiare strumento, agente o sessione:

- obiettivo e stato attuale;
- file modificati e decisioni che spiegano il codice;
- comandi eseguiti con risultato, senza dichiarare controlli non fatti;
- problemi aperti e prossimo passo concreto.

Non usare chat locali, memorie private o cartelle di uno strumento come unica
fonte per una decisione necessaria al progetto. Non includere segreti nei task.
