# Dashboard Web + Desktop

Interface web e CLI unificada para o Agentic OS.

## Uso

### CLI Dashboard
```bash
node desktop/server.js
```

### Web Dashboard
```bash
node desktop/server.js --web
# Abre em http://localhost:3456
```

### Portas Disponíveis

| Serviço | Porta |
|---------|-------|
| Agentic OS Dashboard | 3456 |
| Open WebUI | 3000 |
| ODS Dashboard | 3001 |
| OmniRoute | 20128 |
| Portainer | 9000 |
| SearXNG | 8888 |

### Script Unificado
```bash
bash scripts/agentic-os.sh status    # Status dos componentes
bash scripts/agentic-os.sh dashboard # Abre dashboard web
bash scripts/agentic-os.sh dream     # Executa Dreaming Engine
bash scripts/agentic-os.sh dreams    # Lista dreams
bash scripts/agentic-os.sh cost      # Relatório de custos
```

### npm scripts
```bash
npm run status        # CLI dashboard
npm run dashboard     # Web dashboard
npm run os            # Menu interativo
```
