#!/usr/bin/env bash
# Roda os testes do banco num Postgres temporário (precisa do Postgres instalado).
set -euo pipefail
cd "$(dirname "$0")/.."

BIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)
[ -n "$BIN" ] || BIN=$(dirname "$(command -v initdb)")
DIR=$(mktemp -d)
PORTA=54329
RUN_AS=""
[ "$(id -u)" = "0" ] && RUN_AS="runuser -u postgres --" && chown -R postgres "$DIR"

$RUN_AS "$BIN/initdb" -D "$DIR/dados" -U postgres -A trust >/dev/null
$RUN_AS "$BIN/pg_ctl" -D "$DIR/dados" -o "-p $PORTA -k $DIR" -l "$DIR/log" -w start >/dev/null
trap '$RUN_AS "$BIN/pg_ctl" -D "$DIR/dados" -m immediate stop >/dev/null; rm -rf "$DIR"' EXIT

PSQL="$BIN/psql -o /dev/null -h $DIR -p $PORTA -U postgres -d postgres -v ON_ERROR_STOP=1 -q"
$PSQL -f supabase/tests/simulador_supabase.sql
for f in supabase/migrations/*.sql; do $PSQL -f "$f"; done
for f in supabase/tests/*.test.sql; do $PSQL -f "$f"; done
