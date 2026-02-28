param(
  [string]$msg = ""
)

# vai rodar a partir de qualquer pasta, mas aplica no repo atual
$ErrorActionPreference = "Stop"

# checa se é repo git
git rev-parse --is-inside-work-tree *> $null

# se não passou mensagem, usa timestamp
if ([string]::IsNullOrWhiteSpace($msg)) {
  $msg = "chore: update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# adiciona tudo (exceto ignorados)
git add -A

# se não tem mudanças, sai
$st = git status --porcelain
if ([string]::IsNullOrWhiteSpace($st)) {
  Write-Host "Nada para commitar."
  exit 0
}

# commit e push
git commit -m $msg
git push

Write-Host "OK: commit + push feitos."