param(
  [string]$msg = "",
  [string]$tag = ""
)

$ErrorActionPreference = "Stop"
git rev-parse --is-inside-work-tree *> $null

if ([string]::IsNullOrWhiteSpace($msg)) {
  $msg = "chore: update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

git add -A

$st = git status --porcelain
if ([string]::IsNullOrWhiteSpace($st)) {
  Write-Host "Nada para commitar."
  exit 0
}

git commit -m $msg
git push

if (-not [string]::IsNullOrWhiteSpace($tag)) {
  git tag $tag
  git push --follow-tags
  Write-Host "OK: commit+push + checkpoint: $tag"
} else {
  Write-Host "OK: commit+push feitos."
}