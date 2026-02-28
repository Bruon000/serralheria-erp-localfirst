$ErrorActionPreference = "SilentlyContinue"

Write-Host "==============================="
Write-Host " SERRALHERIA ERP - STATUS"
Write-Host "==============================="

# Git info
Write-Host ""
Write-Host "== GIT =="

$inside = (git rev-parse --is-inside-work-tree 2>$null)
if ($inside -ne "true") {
  Write-Host "Nao esta dentro de um repo git."
  exit 1
}

git status -sb

$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace($changes)) {
  Write-Host "Working tree: LIMPO ✅"
} else {
  Write-Host "Working tree: TEM MUDANCAS ⚠️"
  $changes | Select-Object -First 20 | ForEach-Object { "  $_" }
  if (($changes | Measure-Object).Count -gt 20) { Write-Host "  ... (mais arquivos)" }
}

Write-Host ""
Write-Host "Ultimos commits:"
git --no-pager log --oneline -n 8

Write-Host ""
Write-Host "Checkpoints (tags):"
git tag --sort=-creatordate | Select-Object -First 20

# Env quick check
Write-Host ""
Write-Host "== ENV (resumo) =="

$envRoot = ".env"
$envWeb  = "apps\web\.env"
$envApi  = "apps\api\.env"

function Show-Env($path) {
  if (Test-Path $path) {
    Write-Host "[$path] OK"
    $content = Get-Content $path | Where-Object { $_ -match "^(VITE_API_URL|API_PORT|DATABASE_URL|CORS_ORIGIN)=" }
    if ($content) {
      $content | ForEach-Object { "  $_" }
    } else {
      Write-Host "  (sem chaves principais encontradas)"
    }
  } else {
    Write-Host "[$path] NAO EXISTE ⚠️"
  }
}

Show-Env $envRoot
Show-Env $envWeb
Show-Env $envApi

# Ports
Write-Host ""
Write-Host "== PORTAS =="

function Test-Port($port) {
  $ok = Test-NetConnection -ComputerName "localhost" -Port $port -WarningAction SilentlyContinue
  if ($ok.TcpTestSucceeded) {
    Write-Host "localhost:$port ABERTA ✅"
  } else {
    Write-Host "localhost:$port FECHADA ❌"
  }
}

Test-Port 3001
Test-Port 5173
Test-Port 5432
Test-Port 5050

# Docker
Write-Host ""
Write-Host "== DOCKER =="

$docker = (Get-Command docker -ErrorAction SilentlyContinue)
if (-not $docker) {
  Write-Host "Docker nao encontrado no PATH ❌"
} else {
  $running = docker ps --format "{{.Names}}" 2>$null
  if ([string]::IsNullOrWhiteSpace($running)) {
    Write-Host "Nenhum container rodando (docker ps vazio)."
  } else {
    Write-Host "Containers rodando:"
    $running | ForEach-Object { "  - $_" }

    $need = @("serralheria-postgres","serralheria-pgadmin")
    foreach ($n in $need) {
      if ($running -contains $n) {
        Write-Host "OK: $n ✅"
      } else {
        Write-Host "FALTA: $n ⚠️"
      }
    }
  }
}

Write-Host ""
Write-Host "== DICAS RAPIDAS =="
Write-Host "Subir banco:      pnpm docker:up"
Write-Host "API (dev):        pnpm dev:api"
Write-Host "Web (dev):        pnpm dev:web"
Write-Host "Migrar+Seed:      cd apps\api; pnpm prisma:migrate; pnpm prisma:seed"
Write-Host "Salvar+Push:      .\scripts\savecp.ps1 ""msg"" ""cp-XXX"""
Write-Host ""