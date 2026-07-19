#!/usr/bin/env bash
set -euo pipefail

INTERVAL=${1:-60m}
DREAMER_DIR="$(cd "$(dirname "$0")" && pwd)"

ln -sf "$DREAMER_DIR/dreamer.js" /home/helcio/.hermes/scripts/dreamer.js 2>/dev/null || \
  cp "$DREAMER_DIR/dreamer.js" /home/helcio/.hermes/scripts/dreamer.js

cat > /home/helcio/.hermes/scripts/dreamer.sh << 'SCRIPT'
#!/usr/bin/env bash
cd /home/helcio/estudiohc-agentic-os/dreaming
exec node dreamer.js "$@"
SCRIPT
chmod +x /home/helcio/.hermes/scripts/dreamer.sh

echo "Registering Dreaming Engine no Hermes cron..."
echo "   Intervalo: a cada ${INTERVAL}"
echo "   Script: dreamer.sh"

hermes cron remove dreaming-engine 2>/dev/null || true

hermes cron create "${INTERVAL}" \
  --name dreaming-engine \
  --script dreamer.sh \
  --no-agent \
  --workdir "$DREAMER_DIR"

echo ""
echo "Done! Job registered."
echo "  hermes cron list                 # ver jobs"
echo "  hermes cron run dreaming-engine  # executar agora"
echo "  hermes cron runs dreaming-engine # ver historico"
