[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($env:SUPERPROJECT_SYNC_BYPASS -eq '1') {
    exit 0
}

if ($env:SUPERPROJECT_SYNC_ACTIVE -eq '1') {
    exit 0
}

$env:SUPERPROJECT_SYNC_ACTIVE = '1'

try {
    $repoRoot = (& git rev-parse --show-toplevel 2>$null).Trim()
    if (-not $repoRoot) {
        exit 0
    }

    $syncScript = Join-Path $repoRoot 'scripts/sync/superproject-sync.ps1'
    if (-not (Test-Path -LiteralPath $syncScript)) {
        Write-Host '[sync] skipped: sync engine not found.'
        exit 0
    }

    & $syncScript -RepoRoot $repoRoot
    $code = if ($null -ne $LASTEXITCODE) { [int]$LASTEXITCODE } else { 0 }

    switch ($code) {
        0 {
            exit 0
        }
        2 {
            Write-Warning 'Automatic outbound sync blocked. Run scripts/sync/superproject-sync-status.ps1 for details.'
            exit 0
        }
        default {
            Write-Warning "Automatic outbound sync finished with exit code $code. Review sync output manually."
            exit 0
        }
    }
}
catch {
    Write-Warning "Automatic outbound sync failed: $($_.Exception.Message)"
    exit 0
}
