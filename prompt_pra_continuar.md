# PROMPT PRA CONTINUAR — ARQUIVO UNICO

INSTRUCAO: copie e cole ESTE arquivo inteiro em um novo chat para continuar.
IMPORTANTE: este repo deve ser operado com comandos PowerShell (sem edicao manual).

Generated: 2026-02-28 14:33:32
Repo: serralheria-erp-localfirst
Branch: main
HEAD: d553a84
Checkpoint: cp-029-fim-do-dia

NEXT STEP: (adicione: PROXIMO PASSO: ... no CHECKLIST.md)

---

## 1) BASE FIXA DO PROJETO (PROMPT_BASE.md)
```markdown
# BASE FIXA DO PROJETO — ERP Serralheria (usar sempre no prompt)

## Contexto
Estamos construindo um ERP local-first/offline-first para serralheria, com sync via /sync, multi-tenant (companyId), e UI profissional.
A IA deve seguir o stack e arquitetura já definidos no repo.

---

## 1) Modelo do ERP (módulos)
### A) Cadastros (base)
- Empresas/filiais, usuários, permissões
- Clientes, obras/endereços, contatos
- Fornecedores
- Produtos/serviços
- Matérias-primas (barras, chapas, kg), unidades, conversões
- Tabelas: preços, impostos (se precisar), parâmetros de perda/sobra

### B) Comercial e Orçamentos (o coração da serralheria)
- Orçamento por item sob medida (dimensões, tipo de perfil, vidro, ferragens, pintura, instalação)
- Regras: perdas, aproveitamento, margem mínima, comissão
- Proposta (PDF/WhatsApp), versões do orçamento, aprovação
- Pedido de venda + contrato/condições

### C) Engenharia / Ficha Técnica (BOM)
- “Receita” por tipo de produto (ex.: portão, guarda-corpo, esquadria)
- Lista de materiais + consumos padrão por m²/metro linear
- Roteiro de produção (etapas) e tempos padrão

### D) Produção (OP)
- OP por pedido/obra
- Etapas: corte -> furação -> solda -> acabamento -> pintura -> montagem -> expedição
- Apontamentos (tempo, consumo real, refugos)
- Terceirização (pintura galvanização etc.) e retorno
- Controle de status e prazos

### E) Compras e Estoque
- Requisição de compra (gerada por OP/estoque mínimo)
- Cotação e pedido de compra
- Entrada (NF de compra) + custo médio/último custo
- Estoque por depósito/local (se quiser), inventário, baixa por consumo/OP
- Separação para produção + expedição

### F) Entrega / Instalação (campo)
- Agenda de instalação, equipe, checklist, fotos, termo de entrega
- OS de assistência/garantia

### G) Financeiro
- Contas a pagar/receber (por obra/centro de custo)
- Parcelas, boletos/PIX (integrações depois)
- Fluxo de caixa, DRE simples, inadimplência
- Comissão (vendedor/indicador)

### H) Relatórios (o que dono realmente usa)
- Rentabilidade por obra (previsto x real)
- Materiais mais consumidos / perdas
- OPs atrasadas / gargalos
- Giro de estoque / itens críticos

---

## 2) Integração Fiscal “opcional” (pluggable)
A ideia: o ERP não precisa emitir direto — ele pode “chamar” um emissor fiscal via API quando ativarem.

Como desenhar:
- Criar módulo FiscalGateway
- Recebe: cliente, itens, CFOP/impostos (se quiser), frete, pagamentos
- Envia para emissor fiscal via API (NFe/NFCe/NFSe/CTe/MDFe + eventos)

Resultado: fiscal vira um “plugin”. Se o cliente não quer fiscal, usa só orçamento/produção/financeiro.

---

## 3) Integração para o contador (bem importante)
O que o contador costuma precisar:
- XMLs de NF-e/NFS-e (emitidas e recebidas)
- Relatórios de faturamento por período (e por CFOP/serviço se tiver)
- Contas a pagar/receber (para conciliar)
- Plano de contas + centros de custo
- Base organizada para SPED (normalmente no sistema contábil)

Como implementar:
- “Portal do Contador” (perfil só leitura + exportação)
- Exportar XML por competência (zip)
- Exportar CSV/Excel: vendas, serviços, recebimentos, despesas, extrato de caixa
- Webhook do emissor fiscal -> ERP guarda XML/DANFE/status (futuro)

---

## 4) Entidades principais (modelo de dados)
- Cliente, Obra
- Orçamento, OrçamentoItem (medidas, acabamentos)
- PedidoVenda
- ProdutoModelo (tipo), FichaTecnica (BOM), RoteiroOperacao
- OrdemProducao, OP_Etapa, Apontamento
- MateriaPrima, EstoqueMovimento, Depósito
- Compra, Cotação, Fornecedor
- FinanceiroTitulo (Pagar/Receber), Pagamento, CentroCusto
- FiscalDocumento (ref externa), FiscalEvento, XmlStorage
- Anexos (fotos, PDFs), ChecklistInstalação

---

## 5) Roadmap enxuto (pra não virar monstro)
MVP (primeiro que já dá ROI):
- Orçamento sob medida -> Pedido
- OP com etapas + consumo básico de material
- Estoque simples + compras
- Contas a receber/pagar + centro de custo por obra
- Exportações pro contador (CSV + anexos)

Depois:
- Apontamento detalhado, perdas, otimização de corte
- Instalação/OS
- Fiscal via API (ativável)
- BI/indicadores

---

## Regras para a IA trabalhar neste repo
- Respeitar o stack/arquitetura do repo (React+Vite+TS, MUI, TanStack Query, RHF+Zod; NestJS+Prisma+Postgres; Dexie; /sync).
- Local-first: salvar primeiro no Dexie, marcar pendingSync e sincronizar depois.
- Sync: last-write-wins + registrar conflitos em SyncConflict (mesmo que esqueleto).
- Sempre atualizar CHECKLIST.md (marcar o que está pronto + próximos passos + bugs).
- Não quebrar o que já está funcionando.
---

## REGRAS DE OPERACAO (IMPORTANTE - POWERSHELL)
- **TUDO via PowerShell (Windows).** Sempre envie comandos PowerShell prontos pra copiar/colar.
- **Nao pedir edicao manual** (ex: "abra no VSCode e edite"). Se precisar mudar arquivo, use comandos PowerShell (Set-Content / Add-Content / Replace / etc).
- Quando sugerir passos, priorize:
  1) comandos PowerShell
  2) scripts em .\scripts\
  3) salvar com checkpoint via .\scripts\savecp.ps1
- O objetivo e sempre manter o repo “rodando” e o CHECKLIST.md atualizado.


```

## 2) CHECKLIST ATUAL (CHECKLIST.md)
```markdown
\# CHECKLIST — serralheria-erp-localfirst (vivo)



Este checklist é o “documento oficial” do projeto.  

Objetivo: garantir entrega \*\*local-first + sync\*\* (Clientes, Obras, Orçamentos) com UI profissional e base escalável.



---



\## Como usar

\- Atualize \*\*Status atual\*\* antes de iniciar uma sessão de trabalho.

\- Trabalhe por \*\*Milestones\*\* (M0, M1, M2...).

\- Qualquer coisa “nova” que surgir entra no \*\*Backlog\*\*.

\- Qualquer problema entra em \*\*Bugs/Pendências\*\*.

\- Ao concluir algo estável: crie um \*\*Checkpoint\*\* (git tag).



---



\## Status atual (ATUALIZE SEMPRE)

\- \*\*Último checkpoint estável:\*\* `cp-000-base-rodando`

\- \*\*Milestone em andamento:\*\* `M0`

\- \*\*Próximo alvo:\*\* `M1`

\- \*\*Ambiente:\*\* Windows / Docker Desktop / Node 20 / pnpm 9

\- \*\*Notas rápidas:\*\*

&nbsp; - Ex.: "API e Web subindo ok"

&nbsp; - Ex.: "Seed ok"

&nbsp; - Ex.: "Dexie e sync ainda parcial"



---



\## O que está pronto hoje (resumo)

> Atualize conforme o projeto evolui.



\### ✅ Pronto

\- Monorepo `/apps/web`, `/apps/api`, `/packages/shared`

\- Docker: Postgres + pgAdmin

\- Prisma migrate + seed (admin/vendedor + dados fake)

\- API Nest rodando com CORS

\- Web Vite rodando

\- Sidebar colapsável + Topbar (chip online/offline + botão sincronizar)

\- Dashboard base (cards + gráfico + lista de atividades simples)

\- Dexie configurado (clientes/obras/orçamentos/itens) + hook `useSync` base



\### 🟡 Parcial

\- Local-first real (telas ainda precisam usar Dexie como fonte de verdade)

\- Sync (/sync) ainda precisa cobrir quoteItems, deletes do servidor e LWW + conflitos

\- Custom Fields / Workflows / Templates: UI ainda básica/placeholder

\- UI “profissional” ainda precisa polish (tema, componentes, tabelas com paginação)

\- PWA Workbox real (ainda não finalizado)



\### ❌ Falta

\- Contador (export + role read-only)

\- Temas configuráveis (persistência)

\- PWA Workbox real (cache + update prompt)

\- Catálogo serralheria (produtos/serviços/acabamentos/pagamentos/validade)

\- Produção / Estoque / Financeiro / Relatórios (placeholders evolutivos)



---



\# Milestones (execução recomendada)



\## M0 — Projeto rodando liso (obrigatório)

\*\*Definition of Done\*\*

\- Roda no Windows/Mac/Linux sem “ajustes manuais”.

\- `pnpm install`, `pnpm docker:up`, `pnpm prisma:migrate`, `pnpm prisma:seed`, `pnpm dev` funcionam.



\*\*Tarefas\*\*

\- \[ ] Corrigir e padronizar `pnpm-workspace.yaml` e `docker-compose.yml` (formatados, sem “colado”)

\- \[ ] `.env.example` com 1 variável por linha

\- \[ ] Criar `apps/web/.env.example` e `apps/api/.env.example`

\- \[ ] Garantir `apps/web/.env` com `VITE\_API\_URL=http://localhost:3001`

\- \[ ] Criar script raiz `dev` (api+web juntos): `pnpm -r --parallel dev`

\- \[ ] Criar script `db:reset` (down + remove volume + up + migrate + seed)

\- \[ ] README completo Windows/Mac/Linux



\*\*Checkpoint sugerido\*\*

\- `cp-000-base-rodando`



---



\## M1 — Infra Local-first (Dexie como fonte da verdade)

\*\*Definition of Done\*\*

\- Existe camada offline com repos Dexie e regras comuns.

\- CRUD local padrão marca `pendingSync=1` sempre.



\*\*Tarefas\*\*

\- \[ ] Finalizar schema Dexie:

&nbsp; - \[ ] clients

&nbsp; - \[ ] jobsites

&nbsp; - \[ ] quotes

&nbsp; - \[ ] quoteItems

&nbsp; - \[ ] deletes (fila de deletions)

\- \[ ] Criar repos (`apps/web/src/db/repos/\*`) com:

&nbsp; - \[ ] `list`, `getById`, `upsert`, `softDelete`

&nbsp; - \[ ] `getPendingUpserts()`, `getPendingDeletes()`

&nbsp; - \[ ] `markSynced(ids, serverTime)`

\- \[ ] Util `deviceId` (persistente) e `nowIso()`

\- \[ ] Padrão datas: ISO string no Dexie



\*\*Checkpoint sugerido\*\*

\- `cp-001-dexie-infra`



---



\## M2 — Sync completo (CRÍTICO)

\*\*Definition of Done\*\*

\- `/sync` aplica upserts + deletes do cliente e retorna mudanças do servidor desde `lastSync`.

\- quoteItems também sincroniza.

\- LWW + registro de conflitos em `SyncConflict`.



\### Backend (apps/api)

\- \[ ] Validar payload (preferir zod em `packages/shared`)

\- \[ ] Aplicar upserts:

&nbsp; - \[ ] clients

&nbsp; - \[ ] jobsites

&nbsp; - \[ ] quotes

&nbsp; - \[ ] quoteItems

\- \[ ] Aplicar deletes recebidos

\- \[ ] Retornar server changes + deletes desde `lastSync`

\- \[ ] LWW por `updatedAt` (ou version) + registrar `SyncConflict` quando ignorar update do cliente



\### Frontend (apps/web)

\- \[ ] `useSync`:

&nbsp; - \[ ] enviar upserts + deletes pendentes

&nbsp; - \[ ] aplicar changes no Dexie (incluindo deletes)

&nbsp; - \[ ] limpar `pendingSync` e setar `lastSyncedAt`

&nbsp; - \[ ] atualizar `lastSync` no storage

\- \[ ] UX: feedback de sync (loading / ok / erro)



\*\*Checkpoint sugerido\*\*

\- `cp-002-sync-completo`



---



\## M3 — Clientes 100% offline + sync

\*\*Definition of Done\*\*

\- UI usa Dexie como fonte de verdade.

\- CRUD completo offline (create/edit/delete soft).

\- Sync garante consistência.



\*\*Tarefas\*\*

\- \[ ] ClientList lê do Dexie (não API)

\- \[ ] ClientForm salva primeiro no Dexie + `pendingSync=1`

\- \[ ] Soft delete no Dexie + fila de deletes

\- \[ ] Filtros + paginação simples

\- \[ ] Empty states + loading states



\*\*Checkpoint sugerido\*\*

\- `cp-003-clientes-offline`



---



\## M4 — Obras (JobSites) 100% offline + sync

\*\*Definition of Done\*\*

\- Igual clientes, vinculadas ao cliente.



\*\*Tarefas\*\*

\- \[ ] JobSiteList lê do Dexie

\- \[ ] Form vincula clientId e salva offline

\- \[ ] Soft delete + fila deletes

\- \[ ] Filtros por cliente



\*\*Checkpoint sugerido\*\*

\- `cp-004-obras-offline`



---



\## M5 — Orçamentos + Itens 100% offline + sync

\*\*Definition of Done\*\*

\- Orçamento CRUD offline.

\- Itens dinâmicos (add/remove).

\- Totais e margens calculados.

\- Detalhe com abas.



\*\*Tarefas\*\*

\- \[ ] QuoteList lê do Dexie

\- \[ ] QuoteFormDrawer:

&nbsp; - \[ ] usar RHF FieldArray para múltiplos itens

&nbsp; - \[ ] calcular subtotal/total/margem em tempo real

\- \[ ] QuoteDetail:

&nbsp; - \[ ] abas (Itens/Anexos placeholder/Histórico placeholder)

\- \[ ] Sync inclui quoteItems corretamente

\- \[ ] Status básico: DRAFT/SENT/APPROVED/REJECTED



\*\*Checkpoint sugerido\*\*

\- `cp-005-orcamentos-offline`



---



\## M6 — UI profissional (polish)

\*\*Definition of Done\*\*

\- Tema MUI moderno e consistente.

\- Tabelas padronizadas com filtros/paginação.

\- Topbar com busca (placeholder ok).



\*\*Tarefas\*\*

\- \[ ] Melhorar `theme.ts` (cores, radius, paper, typography)

\- \[ ] Criar componentes reutilizáveis:

&nbsp; - \[ ] `PageHeader`

&nbsp; - \[ ] `DataTable`

&nbsp; - \[ ] `EmptyState`

&nbsp; - \[ ] `ConfirmDialog`

&nbsp; - \[ ] `LoadingSkeleton`

\- \[ ] Dashboard mais bonito (layout consistente)

\- \[ ] Sidebar/Topbar refinados (spacing, estados ativos)



\*\*Checkpoint sugerido\*\*

\- `cp-006-ui-polish`



---



\## M7 — Workflows + Roles no Quote

\*\*Definition of Done\*\*

\- Transições validam role no backend.

\- UI mínima para configurar workflow.

\- Quote muda status só por transição válida.



\*\*Tarefas\*\*

\- \[ ] Backend: validar transições por role

\- \[ ] UI Workflows: configurar estados/transições (mínimo)

\- \[ ] QuoteDetail: botões de transição conforme role



\*\*Checkpoint sugerido\*\*

\- `cp-007-workflow-quote`



---



\## M8 — Custom Fields + render dinâmico

\*\*Definition of Done\*\*

\- UI CRUD de campos customizados.

\- Forms renderizam dinamicamente.

\- Values offline + sync.



\*\*Tarefas\*\*

\- \[ ] UI CustomFields CRUD (por entidade)

\- \[ ] `CustomFieldRenderer` por tipo (text/number/select/boolean)

\- \[ ] Persistir CustomFieldValue no Dexie + sync

\- \[ ] Integrar renderer nos forms (Cliente/Obra/Orçamento)



\*\*Checkpoint sugerido\*\*

\- `cp-008-custom-fields`



---



\## M9 — Templates (CRUD + editor)

\*\*Definition of Done\*\*

\- CRUD UI com editor textarea + preview simples.



\*\*Tarefas\*\*

\- \[ ] Templates list + drawer

\- \[ ] editor textarea (placeholder)

\- \[ ] salvar no banco



\*\*Checkpoint sugerido\*\*

\- `cp-009-templates`



---



\## M10 — Integrações + Contador

\*\*Definition of Done\*\*

\- Fiscal config persistida (placeholder).

\- Export contador (placeholder funcional).

\- Role CONTADOR read-only.



\*\*Tarefas\*\*

\- \[ ] FiscalGateway config (provider/apiKey) persistida

\- \[ ] ContadorExporter:

&nbsp; - \[ ] endpoint export (CSV/JSON)

&nbsp; - \[ ] UI com filtros e botão exportar

\- \[ ] Role CONTADOR: read-only (front + back)



\*\*Checkpoint sugerido\*\*

\- `cp-010-integracoes-contador`



---



\## M11 — PWA Workbox real

\*\*Definition of Done\*\*

\- Service Worker Workbox real + cache app shell + update prompt.



\*\*Tarefas\*\*

\- \[ ] Setup Workbox no build do Vite

\- \[ ] SW register no `main.tsx`

\- \[ ] cache estático (app shell)

\- \[ ] update prompt



\*\*Checkpoint sugerido\*\*

\- `cp-011-pwa`



---



\## M12 — Temas configuráveis

\*\*Definition of Done\*\*

\- Tela de aparência + persistência (localStorage).



\*\*Tarefas\*\*

\- \[ ] Criar 2–3 temas (dark slate / dark blue / light)

\- \[ ] Persistir tema selecionado

\- \[ ] UI em Configurações > Aparência



\*\*Checkpoint sugerido\*\*

\- `cp-012-themes`



---



\# Backlog (sempre cresce)

\- \[ ] Catálogo serralheria: produtos/serviços/acabamentos/pagamentos/validade

\- \[ ] Produção (OPs/Etapas)

\- \[ ] Estoque (Itens/Movimentos)

\- \[ ] Financeiro (Receber/Pagar)

\- \[ ] Relatórios

\- \[ ] Anexos em Quote (upload + sync)

\- \[ ] Auditoria/histórico por entidade

\- \[ ] Multi-empresa real (companyId múltiplas)



---



\# Bugs / Pendências técnicas (ATUALIZE SEMPRE)

\- \[ ] (exemplo) `/sync` não retorna deletes do servidor

\- \[ ] (exemplo) `/sync` não aplica quoteItems vindos do cliente

\- \[ ] (exemplo) QuoteForm só suporta 1 item (antes de FieldArray)

\- \[ ] (exemplo) UI CustomFields ainda placeholder

\- \[ ] (exemplo) Conflitos LWW não registram `SyncConflict` corretamente



---



\# Checkpoints (pra voltar quando bugar)

\*\*Regra:\*\* checkpoint = commit + tag.



\## Criar checkpoint

```bash

git add -A

git commit -m "cp-003: clientes offline + sync ok"

git tag cp-003-clientes-offline

git push --follow-tags









```

## 3) STATUS DO REPO (git)
```text
## main...origin/main

LAST COMMITS:
d553a84 delima.m1.sync.v1: schema Dexie v2 + repos base + utils (deviceId/companyId/nowIso) + sync payload alinhado + deletes entity/entityId
98d726a delima.orcamento.finalizado: fix build (vite/ts), proxy /api, sync hook e dexie schema ESM; migrar pnpm->npm
832cb1a chore: fim do dia
d178baf sync-service-deletes-lastSyncDate-update
bf062d2 chore: update CHECKLIST (M0 done + status cp-001)
624ee22 cp-001: dexie infra (schema v2 + deletes queue + repos + utils + useSync deletes)
58353d3 docs: update checklist + add README setup
b3e8a71 chore: add env examples (root/web/api)
1141842 chore: fix prompt final
7727c32 chore: fim do dia

TAGS:
delima.m1.sync.v1
sync-service-deletes-lastSyncDate-update
cp-001-dexie-infra
cp-fix-prompt-final
delima.orcamento.finalizado
cp-029-fim-do-dia
cp-fix-genprompt-format
cp-28.02v1
cp-20260228-0708
cp-28.02
ultimadanoite28;02
cp-xxx
cp-003-status-improved
cp-002-status-script
cp-001-clientes-offline
```

## 4) AMBIENTE (best-effort)
PORTS:
```text
localhost:3001 OK
localhost:5173 OK
localhost:5432 OK
localhost:5050 OK
```

DOCKER:
```text
- serralheria-pgadmin
- serralheria-postgres
- medusa-postgres
- medusa-redis
- dolibarr
- mariadb
- frappe_docker-frontend-1
- frappe_docker-backend-1
- frappe_docker-websocket-1
- frappe_docker-queue-long-1
- frappe_docker-scheduler-1
- frappe_docker-queue-short-1
```

## 5) COMO SALVAR (sempre com checkpoint)
```powershell
.\scripts\savecp.ps1 "mensagem" "cp-xx-descricao"
```

