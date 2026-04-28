[CmdletBinding()]
param(
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path,
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'sync.config.json'),
    [switch]$NoFetch,
    [switch]$Json,
    [switch]$Help
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$EXIT_SUCCESS = 0
$EXIT_CONFIG = 3

function Show-Usage {
    @'
superproject-sync-status.ps1

Usage:
  pwsh -File scripts/sync/superproject-sync-status.ps1 [-NoFetch] [-Json]

Behavior:
  - reports root sync readiness
  - reports module remote, branch, divergence, and dirtiness
  - recommends the next safe command
'@
}

if ($Help) {
    Show-Usage
    exit $EXIT_SUCCESS
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

function Get-UpstreamInfo {
    param(
        [string]$ModuleRoot,
        [string]$CurrentBranch
    )

    $direct = Invoke-Git -WorkingDirectory $ModuleRoot -Arguments @('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}') -AllowFailure
    if ($direct.Code -eq 0 -and $direct.Text) {
        return $direct.Text
    }

    if (-not $CurrentBranch -or $CurrentBranch -eq 'HEAD') {
        return ''
    }

    $candidate = "origin/$CurrentBranch"
    $candidateRef = Invoke-Git -WorkingDirectory $ModuleRoot -Arguments @('show-ref', '--verify', "--", "refs/remotes/$candidate") -AllowFailure
    if ($candidateRef.Code -eq 0) {
        return $candidate
    }

    return ''
}

function Get-AheadBehind {
    param(
        [string]$ModuleRoot,
        [string]$Reference
    )

    if (-not $Reference) {
        return [pscustomobject]@{
            Ahead = 0
            Behind = 0
            Reference = ''
        }
    }

    $result = Invoke-Git -WorkingDirectory $ModuleRoot -Arguments @('rev-list', '--left-right', '--count', "HEAD...$Reference") -AllowFailure
    if ($result.Code -ne 0 -or -not $result.Text) {
        return [pscustomobject]@{
            Ahead = -1
            Behind = -1
            Reference = $Reference
        }
    }

    $parts = $result.Text -split '\s+'
    return [pscustomobject]@{
        Ahead = [int]$parts[0]
        Behind = [int]$parts[1]
        Reference = $Reference
    }
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

$repoRootPath = (Resolve-Path -LiteralPath $RepoRoot).Path
$configPathResolved = (Resolve-Path -LiteralPath $ConfigPath).Path
$config = Load-Config -Path $configPathResolved

if (-not (Test-Path -LiteralPath (Join-Path $repoRootPath '.git'))) {
    Write-Error "Root repository not found at $repoRootPath"
    exit $EXIT_CONFIG
}

$rootBranch = (Invoke-Git -WorkingDirectory $repoRootPath -Arguments @('rev-parse', '--abbrev-ref', 'HEAD')).Text
$rootOriginLookup = Invoke-Git -WorkingDirectory $repoRootPath -Arguments @('remote', 'get-url', 'origin') -AllowFailure
$rootOrigin = if ($rootOriginLookup.Code -eq 0) { $rootOriginLookup.Text } else { '' }
$rootHealth = (Invoke-Git -WorkingDirectory $repoRootPath -Arguments @('status', '--porcelain=v1', '--ignore-submodules=dirty')).Text
$moduleResults = New-Object System.Collections.Generic.List[object]

foreach ($entry in $config.modules) {
    $moduleRoot = Join-Path $repoRootPath ([string]$entry.path)
    $moduleRepoExists = Test-Path -LiteralPath (Join-Path $moduleRoot '.git')
    if (-not $moduleRepoExists) {
        $moduleResults.Add([pscustomobject]@{
            Module = $entry.name
            Path = $entry.path
            State = 'blocked'
            NextAction = 'repair module checkout'
            Detail = 'Module repository not found.'
        }) | Out-Null
        continue
    }

    $remoteLookup = Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('remote', 'get-url', 'origin') -AllowFailure
    $actualRemote = if ($remoteLookup.Code -eq 0) { $remoteLookup.Text } else { '' }
    $normalizedActualRemote = Normalize-Remote -Value $actualRemote
    $normalizedExpectedRemote = Normalize-Remote -Value ([string]$entry.expectedRemote)

    if (-not $NoFetch -and $actualRemote) {
        Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('fetch', '--quiet', 'origin') -AllowFailure | Out-Null
    }

    $branch = (Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('rev-parse', '--abbrev-ref', 'HEAD')).Text
    $upstream = Get-UpstreamInfo -ModuleRoot $moduleRoot -CurrentBranch $branch
    $aheadBehind = Get-AheadBehind -ModuleRoot $moduleRoot -Reference $upstream
    $moduleStatus = (Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('status', '--porcelain=v1')).Text
    $moduleHead = (Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('rev-parse', '--short', 'HEAD')).Text
    $trackingEntry = Get-TrackingEntry -RootDirectory $repoRootPath -ModulePath ([string]$entry.path)
    $rootTrackedShort = if ($trackingEntry.Sha) { $trackingEntry.Sha.Substring(0, [Math]::Min(7, $trackingEntry.Sha.Length)) } else { '' }

    $state = 'safe'
    $nextAction = 'no action'
    $detail = 'Module and root are aligned.'

    if (-not $normalizedActualRemote) {
        $state = 'blocked'
        $nextAction = 'fix module origin'
        $detail = 'Module origin is missing.'
    }
    elseif ($normalizedActualRemote -ne $normalizedExpectedRemote) {
        $state = 'blocked'
        $nextAction = 'fix module origin mismatch'
        $detail = "Expected $($entry.expectedRemote) but found $actualRemote."
    }
    elseif ($aheadBehind.Behind -gt 0) {
        $state = 'blocked'
        $nextAction = "update $($entry.path) from upstream first"
        $detail = "Behind upstream by $($aheadBehind.Behind) commit(s)."
    }
    elseif ($aheadBehind.Ahead -gt 0 -and $aheadBehind.Behind -gt 0) {
        $state = 'blocked'
        $nextAction = "resolve divergence in $($entry.path)"
        $detail = 'Branch diverged from upstream.'
    }
    elseif ($moduleStatus) {
        $state = 'outbound-ready'
        $nextAction = "pwsh -File scripts/sync/superproject-sync.ps1 -Module $($entry.name) -DryRun"
        $detail = 'Module has local changes ready for outbound sync.'
    }
    elseif ($trackingEntry.Sha -and $trackingEntry.Sha.Substring(0, [Math]::Min(7, $trackingEntry.Sha.Length)) -ne $moduleHead) {
        $state = 'import-ready'
        $nextAction = "pwsh -File scripts/sync/import-module-changes.ps1 -Module $($entry.name) -DryRun"
        $detail = 'Module HEAD differs from the root-tracked embedded-repo reference.'
    }

    $moduleResults.Add([pscustomobject]@{
        Module = $entry.name
        Path = $entry.path
        Branch = $branch
        Upstream = $upstream
        Ahead = $aheadBehind.Ahead
        Behind = $aheadBehind.Behind
        Remote = $actualRemote
        RemoteMatches = ($normalizedActualRemote -eq $normalizedExpectedRemote)
        ModuleHead = $moduleHead
        RootTracked = $rootTrackedShort
        Dirty = [bool]$moduleStatus
        State = $state
        NextAction = $nextAction
        Detail = $detail
    }) | Out-Null
}

$result = [pscustomobject]@{
    RepoRoot = $repoRootPath
    Root = [pscustomobject]@{
        Branch = $rootBranch
        Origin = $rootOrigin
        OriginConfigured = [bool]$rootOrigin
        Health = if ($rootHealth) { 'dirty' } else { 'clean' }
        HealthDetail = $rootHealth
    }
    Modules = $moduleResults
}

if ($Json) {
    $result | ConvertTo-Json -Depth 8
    exit $EXIT_SUCCESS
}

Write-Host '== Superproject Sync Status =='
Write-Host ("Root: {0}" -f $repoRootPath)
Write-Host ("  branch: {0}" -f $rootBranch)
Write-Host ("  origin: {0}" -f $(if ($rootOrigin) { $rootOrigin } else { '[missing]' }))
Write-Host ("  health: {0}" -f $(if ($rootHealth) { 'dirty' } else { 'clean' }))
if ($rootHealth) {
    Write-Host ("  detail: {0}" -f $rootHealth)
}
Write-Host ''

foreach ($moduleResult in $moduleResults) {
    Write-Host ("Module: {0} [{1}]" -f $moduleResult.Module, $moduleResult.Path)
    Write-Host ("  state: {0}" -f $moduleResult.State)
    Write-Host ("  branch: {0}" -f $moduleResult.Branch)
    Write-Host ("  upstream: {0}" -f $(if ($moduleResult.Upstream) { $moduleResult.Upstream } else { '[none]' }))
    Write-Host ("  ahead/behind: {0}/{1}" -f $moduleResult.Ahead, $moduleResult.Behind)
    Write-Host ("  remote: {0}" -f $(if ($moduleResult.Remote) { $moduleResult.Remote } else { '[missing]' }))
    Write-Host ("  remote matches: {0}" -f $moduleResult.RemoteMatches)
    Write-Host ("  dirty: {0}" -f $moduleResult.Dirty)
    Write-Host ("  root tracked: {0}" -f $(if ($moduleResult.RootTracked) { $moduleResult.RootTracked } else { '[none]' }))
    Write-Host ("  module head: {0}" -f $moduleResult.ModuleHead)
    Write-Host ("  detail: {0}" -f $moduleResult.Detail)
    Write-Host ("  next: {0}" -f $moduleResult.NextAction)
    Write-Host ''
}

exit $EXIT_SUCCESS
