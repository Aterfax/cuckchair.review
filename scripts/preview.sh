#!/usr/bin/env bash
#
# preview.sh — Build and locally preview the cuckchair.review static site.
#
# Usage:
#   ./scripts/preview.sh              # build once and serve out/ on :8080
#   ./scripts/preview.sh --watch      # build, serve, and rebuild on source changes
#   ./scripts/preview.sh --port 9000  # custom port
#
# Requires: Node.js (npm run build) and a static file server (npx serve by default).
# Set SERVE_CMD to override the server command.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-8080}"
SERVE_CMD="${SERVE_CMD:-npx serve}"
WATCH=0

usage() {
  echo "Usage: $0 [--watch|-w] [--port|-p PORT]"
  echo ""
  echo "Options:"
  echo "  --watch, -w   Rebuild automatically when app/, content/ or scripts/ change"
  echo "  --port, -p    Port to serve on (default: 8080)"
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --watch|-w)
      WATCH=1
      shift
      ;;
    --port|-p)
      PORT="${2:-}"
      shift 2
      ;;
    --help|-h)
      usage
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      ;;
  esac
done

build() {
  echo "[preview] Building static site (output: out/)..."
  npm run build
  echo "[preview] Build complete. Files ready in out/"
}

serve_bg() {
  echo "[preview] Serving out/ at http://localhost:${PORT}/  (Ctrl-C to stop)"
  $SERVE_CMD out -l "$PORT" &
  SERVE_PID=$!
}

if [[ "$WATCH" -eq 1 ]]; then
  build
  serve_bg

  cleanup() {
    echo ""
    echo "[preview] Stopping server..."
    kill "$SERVE_PID" 2>/dev/null || true
  }
  trap cleanup EXIT INT TERM

  echo "[preview] Watching app/, components/, content/, scripts/ for changes..."
  while true; do
    if command -v inotifywait >/dev/null 2>&1; then
      inotifywait -q -r -e modify,create,delete,move \
        app components content scripts 2>/dev/null || true
    else
      # Fallback: poll every 3 seconds if inotifywait isn't available
      sleep 3
    fi

    echo "[preview] Change detected — rebuilding..."
    kill "$SERVE_PID" 2>/dev/null || true
    build
    serve_bg
  done
else
  build
  # Serve in the foreground so this script blocks while the site is live.
  $SERVE_CMD out -l "$PORT"
fi
