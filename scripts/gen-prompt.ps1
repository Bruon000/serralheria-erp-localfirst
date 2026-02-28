param([string]$CheckpointTag = '')

$ErrorActionPreference = 'SilentlyContinue'
$nl = [Environment]::NewLine

function ReadFileRaw($p, $fallback) {
  if (Test-Path $p) { return (Get-Content $p -Raw) }
  return $fallback
}

function PortLine($port) {
  try {
    $ok = Test-NetConnection -ComputerName 'localhost' -Port $port -WarningAction SilentlyContinue
    if ($ok.TcpTestSucceeded) { return ('localhost:' + $port + ' OK') }
    return ('localhost:' + $port + ' FAIL')
  } catch {
    return ('localhost:' + $port + ' UNKNOWN')
  }
}

function AppendBlock([System.Text.StringBuilder]$sb, [string]$text) {
  if ([string]::IsNullOrWhiteSpace($text)) { return }
  foreach ($line in ($text -split "`r?`n")) {
    [void]$sb.AppendLine($line)
  }
}

$repoName = (Split-Path -Leaf (Get-Location))
$branch = (git rev-parse --abbrev-ref HEAD) 2>$null
$commit = (git rev-parse --short HEAD) 2>$null
if ($branch) { $branch = $branch.Trim() } else { $branch = '(no git?)' }
if ($commit) { $commit = $commit.Trim() } else { $commit = '(no git?)' }

$gitStatusArr   = (git status -sb) 2>$null
$lastCommitsArr = (git --no-pager log --oneline -n 10) 2>$null
$tagsArr        = (git tag --sort=-creatordate | Select-Object -First 30) 2>$null

$gitStatus   = if ($gitStatusArr)   { $gitStatusArr   -join $nl } else { '(git status unavailable)' }
$lastCommits = if ($lastCommitsArr) { $lastCommitsArr -join $nl } else { '(no commits)' }
$tags        = if ($tagsArr)        { $tagsArr        -join $nl } else { '(no tags)' }

$checklist = ReadFileRaw 'CHECKLIST.md' '(CHECKLIST.md not found)'
$base      = ReadFileRaw 'PROMPT_BASE.md' '(PROMPT_BASE.md not found)'

$nextStep = ''
foreach ($l in ($checklist -split "`r?`n")) {
  if ($l -match '^\s*(PR[ÓO]XIMO PASSO|PROXIMO PASSO)\s*:\s*(.+)\s*$') {
    $nextStep = $Matches[2].Trim()
    break
  }
}
if (-not $nextStep) { $nextStep = '(adicione: PROXIMO PASSO: ... no CHECKLIST.md)' }

$ports = @((PortLine 3001),(PortLine 5173),(PortLine 5432),(PortLine 5050)) -join $nl

$dockerRunning = '(docker unavailable)'
try {
  $names = docker ps --format '{{.Names}}'
  if ($names) { $dockerRunning = ($names | ForEach-Object { '- ' + $_ }) -join $nl }
  else { $dockerRunning = '(docker ps empty)' }
} catch {}

$now = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$outPath = 'prompt_pra_continuar.md'

$sb = New-Object System.Text.StringBuilder

[void]$sb.AppendLine('# PROMPT PRA CONTINUAR — ARQUIVO ÚNICO')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('Cole este arquivo inteiro em um novo chat para continuar o projeto.')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('Generated: ' + $now)
[void]$sb.AppendLine('Repo: ' + $repoName)
[void]$sb.AppendLine('Branch: ' + $branch)
[void]$sb.AppendLine('HEAD: ' + $commit)
[void]$sb.AppendLine('Checkpoint: ' + $CheckpointTag)
[void]$sb.AppendLine('')
[void]$sb.AppendLine('NEXT STEP: ' + $nextStep)
[void]$sb.AppendLine('')
[void]$sb.AppendLine('---')
[void]$sb.AppendLine('')

[void]$sb.AppendLine('## 1) BASE FIXA DO PROJETO (PROMPT_BASE.md)')
[void]$sb.AppendLine('```markdown')
AppendBlock $sb $base
[void]$sb.AppendLine('```')
[void]$sb.AppendLine('')

[void]$sb.AppendLine('## 2) CHECKLIST ATUAL (CHECKLIST.md)')
[void]$sb.AppendLine('```markdown')
AppendBlock $sb $checklist
[void]$sb.AppendLine('```')
[void]$sb.AppendLine('')

[void]$sb.AppendLine('## 3) STATUS DO REPO (git)')
[void]$sb.AppendLine('```text')
AppendBlock $sb $gitStatus
[void]$sb.AppendLine('')
[void]$sb.AppendLine('LAST COMMITS:')
AppendBlock $sb $lastCommits
[void]$sb.AppendLine('')
[void]$sb.AppendLine('TAGS:')
AppendBlock $sb $tags
[void]$sb.AppendLine('```')
[void]$sb.AppendLine('')

[void]$sb.AppendLine('## 4) AMBIENTE (best-effort)')
[void]$sb.AppendLine('PORTS:')
[void]$sb.AppendLine('```text')
AppendBlock $sb $ports
[void]$sb.AppendLine('```')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('DOCKER:')
[void]$sb.AppendLine('```text')
AppendBlock $sb $dockerRunning
[void]$sb.AppendLine('```')
[void]$sb.AppendLine('')

[void]$sb.AppendLine('## 5) COMO SALVAR (sempre com checkpoint)')
[void]$sb.AppendLine('```powershell')
[void]$sb.AppendLine('.\scripts\savecp.ps1 "mensagem" "cp-xx-descricao"')
[void]$sb.AppendLine('```')

Set-Content -Path $outPath -Value $sb.ToString() -Encoding utf8
exit 0
