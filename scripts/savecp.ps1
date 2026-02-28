param(
  [string]$msg = "",
  [string]$tag = ""
)

$ErrorActionPreference = "Stop"

# garante que esta dentro de um repo git
git rev-parse --is-inside-work-tree *> $null

if ([string]::IsNullOrWhiteSpace($msg)) {
  $msg = "chore: update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# 1) SEMPRE gera o prompt (arquivo unico)
.\scripts\gen-prompt.ps1 $tag | Out-Null
git add prompt_pra_continuar.md | Out-Null

# 2) adiciona tudo e commita
git add -A

$st = git status --porcelain
if ([string]::IsNullOrWhiteSpace($st)) {
  Write-Host "Nada para commitar."
  exit 0
}

git commit -m $msg
git push

# 3) checkpoint/tag opcional
if (-not [string]::IsNullOrWhiteSpace($tag)) {
  git tag $tag
  git push --tags
  Write-Host "OK: commit+push + checkpoint: $tag"
} else {
  Write-Host "OK: commit+push feitos."
}
