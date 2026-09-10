#!/usr/bin/env bash
# Poll the app's health endpoints; on a state change (up<->down) send one alert
# to ALERT_WEBHOOK_URL. Meant to run every ~2 min from a systemd timer.
#
#   READYZ_URL   default http://127.0.0.1:4321/readyz   (frontend -> CMS -> DB)
#   HEALTH_URL   default http://127.0.0.1:3000/health   (backend liveness)
#   ALERT_WEBHOOK_URL   Slack / Discord / Mattermost / … incoming webhook
#   STATE_DIR    default /var/lib/treenweb   (remembers last state to debounce)
#   SITE_LABEL   default "treenweb"
#
# Exit 0 when everything is healthy, 1 otherwise (so `systemctl status` shows it).
set -uo pipefail

READYZ_URL="${READYZ_URL:-http://127.0.0.1:4321/readyz}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/health}"
STATE_DIR="${STATE_DIR:-/var/lib/treenweb}"
STATE_FILE="$STATE_DIR/health.state"
SITE_LABEL="${SITE_LABEL:-treenweb}"
TIMEOUT="${TIMEOUT:-10}"

check() { # url -> HTTP status, or "000" when unreachable
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time "$TIMEOUT" "$1" 2>/dev/null)" || true
  echo "${code:-000}"
}

ready_code="$(check "$READYZ_URL")"
health_code="$(check "$HEALTH_URL")"

fails=""
[[ "$ready_code" == 2?? ]] || fails+="  readyz  $READYZ_URL -> $ready_code"$'\n'
[[ "$health_code" == 2?? ]] || fails+="  health  $HEALTH_URL -> $health_code"$'\n'

if [[ -z "$fails" ]]; then
  now=up
  summary="$SITE_LABEL healthy (readyz $ready_code, health $health_code)"
else
  now=down
  summary="$SITE_LABEL DOWN"$'\n'"$fails"
fi

mkdir -p "$STATE_DIR" 2>/dev/null || true
last="$(cat "$STATE_FILE" 2>/dev/null || echo unknown)"

notify() {
  echo "$1"
  [[ -n "${ALERT_WEBHOOK_URL:-}" ]] || return 0
  local text
  text="$(printf '%s' "$1" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')"
  curl -s -o /dev/null --max-time "$TIMEOUT" -X POST "$ALERT_WEBHOOK_URL" \
    -H 'content-type: application/json' \
    -d "{\"text\":\"$text\",\"content\":\"$text\"}" || echo "WARNING: alert POST failed" >&2
}

if [[ "$now" != "$last" ]]; then
  if [[ "$now" == down ]]; then
    notify "🔴 $summary"
  elif [[ "$last" != unknown ]]; then
    notify "🟢 $SITE_LABEL recovered (readyz $ready_code, health $health_code)"
  else
    echo "$summary"
  fi
  printf '%s' "$now" >"$STATE_FILE" 2>/dev/null || true
else
  echo "$summary (unchanged)"
fi

[[ "$now" == up ]]
