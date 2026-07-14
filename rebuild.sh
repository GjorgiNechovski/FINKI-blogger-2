#!/usr/bin/env bash
#
# Clean teardown + full rebuild of the FINKI-blogger stack (app + observability).
# Recreates EVERY service (including Kong + email-service) so nothing is left
# behind by a partial rebuild or a chaos run.
#
#   ./rebuild.sh              rebuild everything, KEEP database data (the blogs)
#   ./rebuild.sh --no-cache   same, but rebuild images from scratch (slower, surest)
#   ./rebuild.sh --wipe       ALSO delete the databases (empties the blogs table!)
#
set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # run from repo root

COMPOSE="docker compose -f docker-compose.yaml -f observability/docker-compose.observability.yaml"

WIPE_DATA=0
NO_CACHE=0
for arg in "$@"; do
  case "$arg" in
    --wipe)     WIPE_DATA=1 ;;
    --no-cache) NO_CACHE=1 ;;
    -h|--help)  grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $arg (try --help)"; exit 2 ;;
  esac
done

echo "==> 1/4  Tearing down containers + networks..."
if [ "$WIPE_DATA" -eq 1 ]; then
  echo "         (--wipe: also removing volumes — DATABASE DATA WILL BE DELETED)"
  $COMPOSE down --remove-orphans --volumes
else
  $COMPOSE down --remove-orphans        # volumes (DB data) are kept
fi

echo "==> 2/4  Building all images${NO_CACHE:+ (no cache)}..."
if [ "$NO_CACHE" -eq 1 ]; then
  $COMPOSE build --no-cache
else
  $COMPOSE build                        # picks up source changes via COPY layers
fi

echo "==> 3/4  Starting the whole stack..."
$COMPOSE up -d

echo "==> 4/4  Waiting for the API gateway on :8000 (what the load test hits)..."
code=000
for _ in $(seq 1 45); do                # up to ~90s
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://localhost:8000/ 2>/dev/null || echo 000)
  [ "$code" != "000" ] && { echo "         Kong is up (http=$code)."; break; }
  sleep 2
done

echo ""
echo "==> Container status:"
$COMPOSE ps
echo ""
if [ "$code" = "000" ]; then
  echo "⚠  Kong never answered on :8000 — check '$COMPOSE logs api-gateway'."
  exit 1
fi
echo "✅ Stack is up. Now run the full analysis (load sweep + chaos/failure injection):"
echo "     python3 -m analyzer systems/finki-blogger.toml"
