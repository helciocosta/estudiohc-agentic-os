#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DESKTOP_DIR="$REPO_DIR/desktop"
MISSION_DIR="$REPO_DIR/mission-control"
DREAMING_DIR="$REPO_DIR/dreaming"

BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[32m'
RED='\033[31m'
YELLOW='\033[33m'
BLUE='\033[34m'
NC='\033[0m'

check_port() {
  timeout 1 bash -c "echo >/dev/tcp/localhost/$1" 2>/dev/null && echo -e "${GREEN}●${NC}" || echo -e "${RED}○${NC}"
}

print_header() {
  echo -e "${BOLD}  🧠 Agentic OS${NC}  ${DIM}EstudioHC${NC}"
  echo -e "  $(date '+%d/%m/%Y %H:%M')"
  echo ""
}

print_services() {
  echo -e "${BOLD}  COMPONENTES${NC}"
  for svc in "41651:OpenCode (Morpheus)" "20128:OmniRoute (Gateway)" "9120:Hermes (Agent)" "11434:llama.cpp" "3000:Open WebUI" "4000:LiteLLM" "8888:SearXNG" "9000:Portainer"; do
    port="${svc%%:*}"
    name="${svc#*:}"
    status=$(check_port "$port")
    echo -e "  $status $name"
  done
  echo ""
}

usage() {
  echo -e "${BOLD}USO${NC}"
  echo "  ./scripts/agentic-os.sh [comando]"
  echo ""
  echo -e "${BOLD}COMANDOS${NC}"
  echo "  status              Mostra status de todos os componentes"
  echo "  dashboard           Abre o dashboard web (:3456)"
  echo "  dream               Executa o Dreaming Engine manualmente"
  echo "  dreams              Lista os últimos dreams"
  echo "  cost                Mostra relatório de custos"
  echo "  help                Este help"
  echo ""
}

case "${1:-status}" in
  status)
    print_header
    print_services
    ;;
  dashboard)
    echo -e "${BOLD}Abrindo dashboard web...${NC}"
    node "$DESKTOP_DIR/server.js" --web --open
    ;;
  dream)
    echo -e "${BOLD}Executando Dreaming Engine...${NC}"
    node "$DREAMING_DIR/dreamer.js"
    ;;
  dreams)
    node "$DREAMING_DIR/report.js" --all
    ;;
  cost)
    node "$MISSION_DIR/cost-tracker.js"
    ;;
  help|--help|-h)
    usage
    ;;
  *)
    echo -e "${RED}Comando desconhecido: $1${NC}"
    usage
    exit 1
    ;;
esac
