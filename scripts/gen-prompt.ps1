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
    if ($ok.TcpTestSucceeded) { return ("localhost:" + $port + " OK") }
    return ("localhost:" + $port + " FAIL")
  } catch {
    return ("localhost:" + $port + " UNKNOWN")
  }
}

$repoName = (Split-Path -Leaf (Get-Location))
$branch = (git rev-parse --abbrev-ref HEAD) 2>$null
$commit = (git rev-parse --short HEAD) 2>$null
if ($branch) { $branch = $branch.Trim() } else { $branch = "(no git?)" }
if ($commit) { $commit = $commit.Trim() } else { $commit = "(no git?)" }

$gitStatusArr   = (git status -sb) 2>$null
$lastCommitsArr = (git --no-pager log --oneline -n 10) 2>$null
$tagsArr        = (git tag --sort=-creatordate | Select-Object -First 30) 2>$null

$gitStatus   = if ($gitStatusArr)   { $gitStatusArr   -join $nl } else { "(git status unavailable)" }
$lastCommits = if ($lastCommitsArr) { $lastCommitsArr -join $nl } else { "(no commits)" }
$tags        = if ($tagsArr)        { $tagsArr        -join $nl } else { "(no tags)" }

$checklist = ReadFileRaw "CHECKLIST.md" "(CHECKLIST.md not found)"

$nextStep = ""
foreach ($l in ($checklist -split $nl)) {
  if ($l -match "^\s*(PROXIMO PASSO|PR.OXIMO PASSO)\s*:\s*(.+)\s*$") {
    $nextStep = $Matches[2].Trim()
    break
  }
}
if (-not $nextStep) { $nextStep = "(add PROXIMO PASSO: ... in CHECKLIST.md)" }

$ports = @((PortLine 3001),(PortLine 5173),(PortLine 5432),(PortLine 5050)) -join $nl

$dockerRunning = "(docker unavailable)"
try {
  $names = docker ps --format "{{.Names}}"
  if ($names) { $dockerRunning = ($names | ForEach-Object { "- " + $_ }) -join $nl }
  else { $dockerRunning = "(docker ps empty)" }
} catch {}

$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$outPath = "prompt_pra_continuar.md"
$sb = New-Object System.Text.StringBuilder

[void]$sb.AppendLine("# PROMPT PRA CONTINUAR (SINGLE FILE)")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Generated: " + $now)
[void]$sb.AppendLine("Repo: " + $repoName)
[void]$sb.AppendLine("Branch: " + $branch)
[void]$sb.AppendLine("HEAD: " + $commit)
[void]$sb.AppendLine("Checkpoint: " + $CheckpointTag)
[void]$sb.AppendLine("")
[void]$sb.AppendLine("NEXT STEP: " + $nextStep)
[void]$sb.AppendLine("")
[void]$sb.AppendLine("-----")
[void]$sb.AppendLine("CHECKLIST:")
[void]$sb.AppendLine($checklist.TrimEnd())
[void]$sb.AppendLine("-----")
[void]$sb.AppendLine("GIT STATUS:")
[void]$sb.AppendLine($gitStatus.TrimEnd())
[void]$sb.AppendLine("")
[void]$sb.AppendLine("LAST COMMITS:")
[void]$sb.AppendLine($lastCommits.TrimEnd())
[void]$sb.AppendLine("")
[void]$sb.AppendLine("TAGS:")
[void]$sb.AppendLine($tags.TrimEnd())
[void]$sb.AppendLine("-----")
[void]$sb.AppendLine("PORTS:")
[void]$sb.AppendLine($ports.TrimEnd())
[void]$sb.AppendLine("-----")
[void]$sb.AppendLine("DOCKER:")
[void]$sb.AppendLine($dockerRunning.TrimEnd())

Set-Content -Path $outPath -Value $sb.ToString() -Encoding utf8
exit 0
