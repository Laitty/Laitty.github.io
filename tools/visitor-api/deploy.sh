#!/usr/bin/env bash
# Deploy the visitor Worker. Requires: Cloudflare login (`npx wrangler login`).
set -euo pipefail
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:$PATH"

if [[ ! -f .dev.secrets ]]; then
  echo "missing .dev.secrets (gitignored). Ask the agent to recreate it." >&2
  exit 1
fi
# shellcheck disable=SC1091
source .dev.secrets

if [[ -z "${WRITE_TOKEN:-}" ]]; then
  WRITE_TOKEN="$(openssl rand -hex 32)"
  if grep -q '^WRITE_TOKEN=' .dev.secrets; then
    sed -i.bak "s/^WRITE_TOKEN=.*/WRITE_TOKEN=${WRITE_TOKEN}/" .dev.secrets
    rm -f .dev.secrets.bak
  else
    echo "WRITE_TOKEN=${WRITE_TOKEN}" >> .dev.secrets
  fi
  echo "generated WRITE_TOKEN (kept in .dev.secrets only)"
fi

npx --yes wrangler@4 secret put WRITE_TOKEN <<< "${WRITE_TOKEN}"
npx --yes wrangler@4 secret put EXTENDSCLASS_A <<< "${EXTENDSCLASS_A}"
npx --yes wrangler@4 secret put EXTENDSCLASS_B <<< "${EXTENDSCLASS_B}"
npx --yes wrangler@4 deploy
