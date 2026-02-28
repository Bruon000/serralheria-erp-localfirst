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

