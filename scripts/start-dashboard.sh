#!/usr/bin/env bash
# Start Agentic OS Dashboard server
# Usage: ./scripts/start-dashboard.sh [--install]

DASHBOARD_DIR="$(cd "$(dirname "$0")/../desktop" && pwd)"
PID_FILE="/tmp/agentic-os-dashboard.pid"

start() {
  if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo "Dashboard já está rodando (PID $(cat $PID_FILE))"
    return
  fi
  setsid -f node "$DASHBOARD_DIR/server.js" --web &>/tmp/agentic-os-dashboard.log &
  echo $! > "$PID_FILE"
  sleep 1
  echo "Dashboard iniciado em http://localhost:3456 (PID $!)"
}

stop() {
  if [ -f "$PID_FILE" ]; then
    kill $(cat "$PID_FILE") 2>/dev/null
    rm -f "$PID_FILE"
    echo "Dashboard parado."
  fi
}

install_service() {
  SERVICE_FILE="/etc/systemd/system/agentic-os-dashboard.service"
  if [ "$EUID" -ne 0 ]; then
    echo "Use sudo para instalar o service."
    return
  fi
  cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Agentic OS Dashboard
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$DASHBOARD_DIR
ExecStart=$(which node) $DASHBOARD_DIR/server.js --web
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
  systemctl daemon-reload
  systemctl enable agentic-os-dashboard
  systemctl start agentic-os-dashboard
  echo "Service instalado e iniciado."
}

case "${1:-start}" in
  start) start ;;
  stop) stop ;;
  restart) stop; sleep 1; start ;;
  --install) install_service ;;
  *) echo "Uso: $0 {start|stop|restart|--install}" ;;
esac
