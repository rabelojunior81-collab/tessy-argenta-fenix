[CmdletBinding()]
param(
    [string]$Module,
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path,
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'sync.config.json'),
    [switch]$DryRun,
    [switch]$NoFetch,
    [switch]$Json,
    [switch]$Help
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$EXIT_SUCCESS = 0
$EXIT_BLOCKED = 2
$EXIT_CONFIG = 3

function Show-Usage {
    @'
import-module-changes.ps1

Usage:
  pwsh -File scripts/sync/import-module-changes.ps1 -Module <name> [-DryRun] [-NoFetch] [-Json]

Behavior:
  - validates root and module state
  - previews the file diff between the root-tracked module ref and module HEAD
  - stages the selected embedded module entry in the root when run live
'@
}

if ($Help) {
    Show-Usage
    exit $EXIT_SUCCESS
}

if (-not $Module) {
    Write-Error 'The -Module parameter is required.'
    exit $EXIT_CONFIG
}

function Invoke-Git {
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

function Find-ModuleConfig {
    param(
        [object[]]$Modules,
        [string]$RequestedName
    )

    foreach ($entry in $Modules) {
        if ($entry.name -eq $RequestedName -or $entry.path -eq $RequestedName) {
            return $entry
        }
    }

    return $null
}

function Get-TrackingEntry {
    param(
        [string]$RootDirectory,
        [string]$ModulePath
    )

    $entry = Invoke-Git -WorkingDirectory $RootDirectory -Arguments @('ls-files', '--stage', '--', $ModulePath) -AllowFailure
    if ($entry.Code -ne 0 -or -not $entry.Text) {
        return [pscustomobject]@{
            Mode = ''
            Sha = ''
        }
    }

    $parts = $entry.Text -split '\s+', 4
    return [pscustomobject]@{
        Mode = $parts[0]
        Sha = $parts[1]
    }
}

function Test-Ancestor {
    param(
        [string]$ModuleRoot,
        [string]$Older,
        [string]$Newer
    )

    if (-not $Older -or -not $Newer) {
        return $false
    }

    $result = Invoke-Git -WorkingDirectory $ModuleRoot -Arguments @('merge-base', '--is-ancestor', $Older, $Newer) -AllowFailure
    return ($result.Code -eq 0)
}

$repoRootPath = (Resolve-Path -LiteralPath $RepoRoot).Path
$configPathResolved = (Resolve-Path -LiteralPath $ConfigPath).Path
$config = Load-Config -Path $configPathResolved

if (-not (Test-Path -LiteralPath (Join-Path $repoRootPath '.git'))) {
    Write-Error "Root repository not found at $repoRootPath"
    exit $EXIT_CONFIG
}

$moduleConfig = Find-ModuleConfig -Modules $config.modules -RequestedName $Module
if (-not $moduleConfig) {
    Write-Error "Module not found in config: $Module"
    exit $EXIT_CONFIG
}

$moduleRoot = Join-Path $repoRootPath ([string]$moduleConfig.path)
if (-not (Test-Path -LiteralPath (Join-Path $moduleRoot '.git'))) {
    Write-Error "Module repository not found: $moduleRoot"
    exit $EXIT_CONFIG
}

$remoteLookup = Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('remote', 'get-url', 'origin') -AllowFailure
$actualRemote = if ($remoteLookup.Code -eq 0) { $remoteLookup.Text } else { '' }
if ((Normalize-Remote -Value $actualRemote) -ne (Normalize-Remote -Value ([string]$moduleConfig.expectedRemote))) {
    Write-Error "Module origin mismatch for $($moduleConfig.name)."
    exit $EXIT_BLOCKED
}

if (-not $NoFetch -and $actualRemote) {
    $fetchResult = Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('fetch', '--quiet', 'origin') -AllowFailure
    if ($fetchResult.Code -ne 0) {
        Write-Error "Fetch failed for $($moduleConfig.name): $($fetchResult.Text)"
        exit $EXIT_BLOCKED
    }
}

$rootStatus = (Invoke-Git -WorkingDirectory $repoRootPath -Arguments @('status', '--porcelain=v1', '--ignore-submodules=dirty')).Text
$rootAllowedPattern = "^\s*[MADRCU\?]{0,2}\s+$([regex]::Escape([string]$moduleConfig.path))$"
$rootExtraChanges = @()

if ($rootStatus) {
    foreach ($line in ($rootStatus -split "`r?`n")) {
        if (-not $line) {
            continue
        }

        if ($line -notmatch $rootAllowedPattern) {
            $rootExtraChanges += $line
        }
    }
}

if ($rootExtraChanges.Count -gt 0) {
    if ($Json) {
        [pscustomobject]@{
            Module = $moduleConfig.name
            Path = $moduleConfig.path
            State = 'blocked'
            Reason = 'root-has-unrelated-changes'
            Detail = $rootExtraChanges
        } | ConvertTo-Json -Depth 8
        exit $EXIT_BLOCKED
    }

    Write-Host "BLOCKED: root has unrelated changes."
    $rootExtraChanges | ForEach-Object { Write-Host ("  {0}" -f $_) }
    exit $EXIT_BLOCKED
}

$moduleStatus = (Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('status', '--porcelain=v1')).Text
if ($moduleStatus) {
    if ($Json) {
        [pscustomobject]@{
            Module = $moduleConfig.name
            Path = $moduleConfig.path
            State = 'blocked'
            Reason = 'module-dirty'
            Detail = $moduleStatus
        } | ConvertTo-Json -Depth 8
        exit $EXIT_BLOCKED
    }

    Write-Host "BLOCKED: module $($moduleConfig.name) is dirty."
    Write-Host $moduleStatus
    exit $EXIT_BLOCKED
}

$trackingEntry = Get-TrackingEntry -RootDirectory $repoRootPath -ModulePath ([string]$moduleConfig.path)
$moduleHeadFull = (Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('rev-parse', 'HEAD')).Text
$moduleHeadShort = (Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('rev-parse', '--short', 'HEAD')).Text

if (-not $trackingEntry.Sha) {
    Write-Error "Root does not track module path $($moduleConfig.path)."
    exit $EXIT_BLOCKED
}

if ($trackingEntry.Sha -eq $moduleHeadFull) {
    if ($Json) {
        [pscustomobject]@{
            Module = $moduleConfig.name
            Path = $moduleConfig.path
            State = 'noop'
            Detail = 'Root already matches module HEAD.'
        } | ConvertTo-Json -Depth 8
        exit $EXIT_SUCCESS
    }

    Write-Host "No import needed for $($moduleConfig.name). Root already matches module HEAD."
    exit $EXIT_SUCCESS
}

if (-not (Test-Ancestor -ModuleRoot $moduleRoot -Older $trackingEntry.Sha -Newer $moduleHeadFull)) {
    if ($Json) {
        [pscustomobject]@{
            Module = $moduleConfig.name
            Path = $moduleConfig.path
            State = 'blocked'
            Reason = 'non-ancestor-history'
            Detail = "Root-tracked ref $($trackingEntry.Sha) is not an ancestor of $moduleHeadFull."
        } | ConvertTo-Json -Depth 8
        exit $EXIT_BLOCKED
    }

    Write-Host "BLOCKED: root-tracked ref is not an ancestor of the current module HEAD."
    exit $EXIT_BLOCKED
}

$diffFilesResult = Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('diff', '--name-only', "$($trackingEntry.Sha)..$moduleHeadFull") -AllowFailure
$diffFiles = if ($diffFilesResult.Text) { @($diffFilesResult.Text -split "`r?`n") } else { @() }

if (-not $DryRun) {
    Invoke-Git -WorkingDirectory $repoRootPath -Arguments @('add', '--', [string]$moduleConfig.path) | Out-Null
}

$result = [pscustomobject]@{
    Module = $moduleConfig.name
    Path = $moduleConfig.path
    TrackingMode = $trackingEntry.Mode
    RootTrackedRef = $trackingEntry.Sha
    ModuleHead = $moduleHeadFull
    ModuleHeadShort = $moduleHeadShort
    DryRun = [bool]$DryRun
    Files = $diffFiles
    SuggestedCommit = [string]::Format([string]$config.root.commitMessages.importTemplate, [string]$moduleConfig.path)
}

if ($Json) {
    $result | ConvertTo-Json -Depth 8
    exit $EXIT_SUCCESS
}

Write-Host '== Module Import Preview =='
Write-Host ("Module: {0} [{1}]" -f $moduleConfig.name, $moduleConfig.path)
Write-Host ("Tracking mode: {0}" -f $trackingEntry.Mode)
Write-Host ("Root tracked ref: {0}" -f $trackingEntry.Sha)
Write-Host ("Module head: {0}" -f $moduleHeadShort)
Write-Host ("DryRun: {0}" -f $DryRun)
Write-Host ''
Write-Host 'Files to reconcile:'

if ($diffFiles.Count -eq 0) {
    Write-Host '  [no file diff available]'
}
else {
    $diffFiles | ForEach-Object { Write-Host ("  {0}" -f $_) }
}

Write-Host ''

if ($DryRun) {
    Write-Host 'Dry-run only. No root staging was performed.'
}
else {
    Write-Host ("Staged root reconciliation for {0}. Review with `git diff --cached -- {0}`." -f $moduleConfig.path)
}

Write-Host ("Suggested root commit: {0}" -f $result.SuggestedCommit)
exit $EXIT_SUCCESS
