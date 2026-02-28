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


