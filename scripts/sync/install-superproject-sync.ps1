[CmdletBinding()]
param(
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path,
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'sync.config.json'),
    [string]$OriginUrl,
    [switch]$SkipOrigin,
    [switch]$SkipHooks,
    [switch]$DryRun,
    [switch]$Json,
    [switch]$Help
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$EXIT_SUCCESS = 0
$EXIT_CONFIG = 3

function Show-Usage {
    @'
install-superproject-sync.ps1

Usage:
  pwsh -File scripts/sync/install-superproject-sync.ps1 [-DryRun] [-SkipOrigin] [-SkipHooks] [-OriginUrl <url>] [-Json]

Behavior:
  - validates the root repository
  - reports and optionally configures root origin
  - installs a thin .git/hooks/post-commit delegator
  - keeps tracked hook logic in .githooks/
'@
}

if ($Help) {
    Show-Usage
    exit $EXIT_SUCCESS
}

function Invoke-GitText {
    param(
        [string]$WorkingDirectory,
        [string[]]$Arguments,
        [switch]$AllowFailure
    )

    $output = & git '-C' $WorkingDirectory @Arguments 2>&1
    $code = $LASTEXITCODE
    if (-not $AllowFailure -and $code -ne 0) {
        throw "git $($Arguments -join ' ') failed in ${WorkingDirectory}: $($output -join [Environment]::NewLine)"
    }

    return @{
        Code = $code
        Text = (($output | ForEach-Object { "$_" }) -join [Environment]::NewLine).Trim()
    }
}

function Normalize-Remote {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return ''
    }

    $trimmed = $Value.Trim()
    if ($trimmed.EndsWith('.git')) {
        $trimmed = $trimmed.Substring(0, $trimmed.Length - 4)
    }
    return $trimmed.TrimEnd('/')
}

function Load-Config {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Config not found: $Path"
    }

    return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

function Get-InstalledHookContent {
    param([string]$TrackedHookPath)

    @"
#!/bin/sh
exec "$TrackedHookPath" "$@"
"@.TrimStart()
}

$repoRootPath = (Resolve-Path -LiteralPath $RepoRoot).Path
$configPathResolved = (Resolve-Path -LiteralPath $ConfigPath).Path
$config = Load-Config -Path $configPathResolved

if (-not (Test-Path -LiteralPath (Join-Path $repoRootPath '.git'))) {
    Write-Error "Root repository not found at $repoRootPath"
    exit $EXIT_CONFIG
}

$desiredOrigin = if ($OriginUrl) { $OriginUrl } else { [string]$config.root.expectedOrigin }
$originLookup = Invoke-GitText -WorkingDirectory $repoRootPath -Arguments @('remote', 'get-url', 'origin') -AllowFailure
$currentOrigin = if ($originLookup.Code -eq 0) { $originLookup.Text } else { '' }
$trackedHookShell = Join-Path $repoRootPath ([string]$config.root.hook.trackedShellPath)
$trackedHookPowerShell = Join-Path $repoRootPath ([string]$config.root.hook.trackedPowerShellPath)
$installedHookPath = Join-Path $repoRootPath ([string]$config.root.hook.installedHookPath)
$installedHookDir = Split-Path -Parent $installedHookPath
$trackedHookShellUnix = (([string]$trackedHookShell) -replace '\\', '/')
$operations = New-Object System.Collections.Generic.List[object]

if (-not $SkipOrigin) {
    if ([string]::IsNullOrWhiteSpace($desiredOrigin)) {
        Write-Error 'No desired origin available. Provide -OriginUrl or set root.expectedOrigin in sync.config.json.'
        exit $EXIT_CONFIG
    }

    $normalizedCurrent = Normalize-Remote -Value $currentOrigin
    $normalizedDesired = Normalize-Remote -Value $desiredOrigin

    if (-not $normalizedCurrent) {
        $operations.Add([pscustomobject]@{
            Action = 'set-origin'
            Mode = 'add'
            From = ''
            To = $desiredOrigin
        }) | Out-Null

        if (-not $DryRun) {
            Invoke-GitText -WorkingDirectory $repoRootPath -Arguments @('remote', 'add', 'origin', $desiredOrigin) | Out-Null
        }
    }
    elseif ($normalizedCurrent -ne $normalizedDesired) {
        $operations.Add([pscustomobject]@{
            Action = 'set-origin'
            Mode = 'update'
            From = $currentOrigin
            To = $desiredOrigin
        }) | Out-Null

        if (-not $DryRun) {
            Invoke-GitText -WorkingDirectory $repoRootPath -Arguments @('remote', 'set-url', 'origin', $desiredOrigin) | Out-Null
        }
    }
    else {
        $operations.Add([pscustomobject]@{
            Action = 'set-origin'
            Mode = 'noop'
            From = $currentOrigin
            To = $desiredOrigin
        }) | Out-Null
    }
}

if (-not $SkipHooks) {
    if (-not (Test-Path -LiteralPath $trackedHookShell)) {
        Write-Error "Tracked hook shell entry point not found: $trackedHookShell"
        exit $EXIT_CONFIG
    }

    if (-not (Test-Path -LiteralPath $trackedHookPowerShell)) {
        Write-Error "Tracked hook PowerShell entry point not found: $trackedHookPowerShell"
        exit $EXIT_CONFIG
    }

    if (-not (Test-Path -LiteralPath $installedHookDir) -and -not $DryRun) {
        New-Item -ItemType Directory -Path $installedHookDir -Force | Out-Null
    }

    $targetContent = Get-InstalledHookContent -TrackedHookPath $trackedHookShellUnix
    $currentContent = if (Test-Path -LiteralPath $installedHookPath) {
        Get-Content -LiteralPath $installedHookPath -Raw
    }
    else {
        ''
    }

    $mode = if ($currentContent -eq $targetContent) { 'noop' } elseif ($currentContent) { 'update' } else { 'create' }
    $operations.Add([pscustomobject]@{
        Action = 'install-hook'
        Mode = $mode
        Path = $installedHookPath
    }) | Out-Null

    if (-not $DryRun -and $currentContent -ne $targetContent) {
        Set-Content -LiteralPath $installedHookPath -Value $targetContent -NoNewline
    }
}

$result = [pscustomobject]@{
    RepoRoot = $repoRootPath
    DryRun = [bool]$DryRun
    OriginBefore = $currentOrigin
    OriginAfter = if ($SkipOrigin) { $currentOrigin } else { $desiredOrigin }
    HookInstalledPath = if ($SkipHooks) { '' } else { $installedHookPath }
    Operations = $operations
}

if ($Json) {
    $result | ConvertTo-Json -Depth 6
    exit $EXIT_SUCCESS
}

Write-Host '== Superproject Sync Installer =='
Write-Host "Root: $repoRootPath"
Write-Host "Config: $configPathResolved"
Write-Host "DryRun: $([bool]$DryRun)"
Write-Host ''

foreach ($operation in $operations) {
    switch ($operation.Action) {
        'set-origin' {
            Write-Host ("origin: {0}" -f $operation.Mode)
            if ($operation.From) {
                Write-Host ("  current: {0}" -f $operation.From)
            }
            Write-Host ("  desired: {0}" -f $operation.To)
        }
        'install-hook' {
            Write-Host ("hook: {0}" -f $operation.Mode)
            Write-Host ("  path: {0}" -f $operation.Path)
        }
    }
}

if (-not $operations.Count) {
    Write-Host 'No installer work was requested.'
}

exit $EXIT_SUCCESS
