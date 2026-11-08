#!/bin/sh
# Backup e ripristino del database tramite il container `db` (non serve pg_dump sull'host).
#   npm run db:backup                         -> backups/garage-AAAAMMGG-HHMMSS.dump
#   npm run db:restore -- backups/file.dump   -> sostituisce i dati attuali
set -eu
cd "$(dirname "$0")/.."

case "${1:-}" in
  backup)
    file="backups/garage-$(date +%Y%m%d-%H%M%S).dump"
    docker compose exec -T db pg_dump -U garage -d garage --format=custom > "$file"
    echo "Backup salvato in $file"
    ;;
  restore)
    file="${2:?Indica il file: npm run db:restore -- backups/garage-....dump}"
    docker compose exec -T db pg_restore -U garage -d garage --clean --if-exists --no-owner < "$file"
    echo "Ripristinato $file"
    ;;
  *)
    echo "Uso: backup.sh backup | restore <file>" >&2
    exit 1
    ;;
esac
