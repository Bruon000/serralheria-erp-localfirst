param([string]$CheckpointTag = "")

$ErrorActionPreference = "SilentlyContinue"
$nl = [Environment]::NewLine

function ReadFileRaw($p, $fallback) {
  if (Test-Path $p) { return (Get-Content $p -Raw) }
  return $fallback
}

function PortLine($port) {
  try {
    $ok = Test-NetConnection -ComputerName "localhost" -Port $port -WarningAction SilentlyContinue
    if ($ok.TcpTestSucceeded) { return ("localhost:" + $port + " ✅") }
    return ("localhost:" + $port + " ❌")
  } catch {
    return ("localhost:" + $port + " (nao verificado)")
  }
}

$repoName = (Split-Path -Leaf (Get-Location))
$branch = ((git rev-parse --abbrev-ref HEAD) 2>$null)
$commit = ((git rev-parse --short HEAD) 2>$null)
if ($branch) { $branch = $branch.Trim() } else { $branch = "(sem git?)" }
if ($commit) { $commit = $commit.Trim() } else { $commit = "(sem git?)" }

$gitStatusArr   = (git status -sb) 2>$null
$lastCommitsArr = (git --no-pager log --oneline -n 10) 2>$null
$tagsArr        = (git tag --sort=-creatordate | Select-Object -First 30) 2>$null

$gitStatus   = if($gitStatusArr){ ($gitStatusArr -join $nl) } else { "(git status indisponivel)" }
$lastCommits = if($lastCommitsArr){ ($lastCommitsArr -join $nl) } else { "(sem commits ainda)" }
$tags        = if($tagsArr){ ($tagsArr -join $nl) } else { "(sem checkpoints/tags ainda)" }

$checklist = ReadFileRaw "CHECKLIST.md" "(CHECKLIST.md nao encontrado)"

$ports = @((PortLine 3001),(PortLine 5173),(PortLine 5432),(PortLine 5050)) -join $nl

$dockerRunning = "(docker nao disponivel)"
try {
  $names = docker ps --format "{{.Names}}"
  if ($names) { $dockerRunning = ($names | ForEach-Object { "- " + $_ }) -join $nl }
  else { $dockerRunning = "(docker ps vazio)" }
} catch {}

$nextStep = ""
foreach ($l in ($checklist -split $nl)) {
  if ($l -match "^\s*(PR[ÓO]XIMO PASSO|PROXIMO PASSO)\s*:\s*(.+)\s*$") {
    $nextStep = $Matches[2].Trim()
    break
  }
}
if (-not $nextStep) { $nextStep = "(adicione no CHECKLIST.md uma linha: PRÓXIMO PASSO: ...)" }

$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$outPath = "prompt_pra_continuar.md"

$lines = @()
$lines += "# PROMPT PRA CONTINUAR — serralheria-erp-localfirst (ARQUIVO ÚNICO)"
$lines += ""
$lines += "✅ Copie e cole ESTE arquivo inteiro em um novo chat para continuar o projeto."
$lines += "✅ Esse arquivo é atualizado quando você salvar (commit/checkpoint)."
$lines += ""
$lines += ("Gerado em: **" + $now + "**")
$lines += ("Repo: **" + $repoName + "**")
$lines += ("Branch: **" + $branch + "**")
$lines += ("HEAD: **" + $commit + "**")
$lines += ("Checkpoint/tag (se informado): **" + $CheckpointTag + "**")
$lines += ""
$lines += "---"
$lines += ""
$lines += "## 1) ONDE PARAMOS / PRÓXIMO PASSO"
$lines += ("**PRÓXIMO PASSO:** " + $nextStep)
$lines += ""
$lines += "---"
$lines += ""
$lines += "## 2) CHECKLIST ATUAL (copiado do CHECKLIST.md)"
$lines += "```markdown"
$lines += $checklist.TrimEnd()
$lines += "```"
$lines += ""
$lines += "---"
$lines += ""
$lines += "## 3) STATUS DO REPO (git)"
$lines += "```text"
$lines += $gitStatus.TrimEnd()
$lines += ""
$lines += "Últimos commits:"
$lines += $lastCommits.TrimEnd()
$lines += ""
$lines += "Checkpoints/tags:"
$lines += $tags.TrimEnd()
$lines += "```"
$lines += ""
$lines += "---"
$lines += ""
$lines += "## 4) SAÚDE DO AMBIENTE (best-effort)"
$lines += ""
$lines += "### Portas"
$lines += "```text"
$lines += $ports.TrimEnd()
$lines += "```"
$lines += ""
$lines += "### Docker containers (rodando)"
$lines += "```text"
$lines += $dockerRunning.TrimEnd()
$lines += "```"
$lines += ""
$lines += "---"
$lines += ""
$lines += "## 5) COMO SUBIR TUDO (Windows - PowerShell)"
$lines += "> Rode na raiz do repo (onde está o package.json)"
$lines += ""
$lines += "```powershell"
$lines += "pnpm install"
$lines += "if (!(Test-Path '.env')) { copy .env.example .env }"
$lines += ""
$lines += "pnpm docker:up"
$lines += ""
$lines += "cd apps\api"
$lines += "copy ..\..\.env .\.env"
$lines += "pnpm prisma:generate"
$lines += "pnpm prisma:migrate"
$lines += "pnpm prisma:seed"
$lines += "cd ..\.."
$lines += ""
$lines += "# 2 terminais:"
$lines += "pnpm dev:api"
$lines += "pnpm dev:web"
$lines += "```"
$lines += ""
$lines += "---"
$lines += ""
$lines += "## 6) COMO SALVAR + CHECKPOINT (padrão do projeto)"
$lines += "```powershell"
$lines += ".\scripts\savecp.ps1 ""mensagem do commit"""
$lines += ".\scripts\savecp.ps1 ""mensagem do commit"" ""cp-XXX-descricao"""
$lines += "```"
$lines += ""

Set-Content -Path $outPath -Value ($lines -join $nl) -Encoding utf8
Write-Output ("OK: gerado " + $outPath)
