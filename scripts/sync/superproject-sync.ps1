[CmdletBinding()]
param(
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path,
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'sync.config.json'),
    [string[]]$Module,
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
superproject-sync.ps1

Usage:
  pwsh -File scripts/sync/superproject-sync.ps1 [-Module <name>] [-DryRun] [-NoFetch] [-Json]

Behavior:
  - resolves configured modules
  - detects modules with local working tree changes
  - validates remote state
  - commits and pushes module-local changes
  - reports whether root reconciliation is now required
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

$repoRootPath = (Resolve-Path -LiteralPath $RepoRoot).Path
$configPathResolved = (Resolve-Path -LiteralPath $ConfigPath).Path
$config = Load-Config -Path $configPathResolved

if (-not (Test-Path -LiteralPath (Join-Path $repoRootPath '.git'))) {
    Write-Error "Root repository not found at $repoRootPath"
    exit $EXIT_CONFIG
}

$rootHead = (Invoke-Git -WorkingDirectory $repoRootPath -Arguments @('rev-parse', '--short', 'HEAD')).Text
$requestedModules = @()

if ($Module) {
    foreach ($requestedName in $Module) {
        $match = Find-ModuleConfig -Modules $config.modules -RequestedName $requestedName
        if (-not $match) {
            Write-Error "Module not found in config: $requestedName"
            exit $EXIT_CONFIG
        }
        $requestedModules += $match
    }
}
else {
    $requestedModules = @($config.modules)
}

$changedModules = New-Object System.Collections.Generic.List[object]
$blockedModules = New-Object System.Collections.Generic.List[object]
$processedModules = New-Object System.Collections.Generic.List[object]

foreach ($entry in $requestedModules) {
    $moduleRoot = Join-Path $repoRootPath ([string]$entry.path)
    if (-not (Test-Path -LiteralPath (Join-Path $moduleRoot '.git'))) {
        $blockedModules.Add([pscustomobject]@{
            Module = $entry.name
            Path = $entry.path
            Reason = 'module-repo-missing'
            Detail = $moduleRoot
        }) | Out-Null
        continue
    }

    $statusText = (Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('status', '--porcelain=v1')).Text
    if (-not $statusText) {
        continue
    }

    $remoteLookup = Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('remote', 'get-url', 'origin') -AllowFailure
    $actualRemote = if ($remoteLookup.Code -eq 0) { $remoteLookup.Text } else { '' }
    $normalizedActualRemote = Normalize-Remote -Value $actualRemote
    $normalizedExpectedRemote = Normalize-Remote -Value ([string]$entry.expectedRemote)

    if (-not $normalizedActualRemote) {
        $blockedModules.Add([pscustomobject]@{
            Module = $entry.name
            Path = $entry.path
            Reason = 'origin-missing'
            Detail = 'Module origin is not configured.'
        }) | Out-Null
        continue
    }

    if ($normalizedActualRemote -ne $normalizedExpectedRemote) {
        $blockedModules.Add([pscustomobject]@{
            Module = $entry.name
            Path = $entry.path
            Reason = 'origin-mismatch'
            Detail = "Expected $($entry.expectedRemote) but found $actualRemote."
        }) | Out-Null
        continue
    }

    if (-not $NoFetch) {
        $fetchResult = Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('fetch', '--quiet', 'origin') -AllowFailure
        if ($fetchResult.Code -ne 0) {
            $blockedModules.Add([pscustomobject]@{
                Module = $entry.name
                Path = $entry.path
                Reason = 'fetch-failed'
                Detail = $fetchResult.Text
            }) | Out-Null
            continue
        }
    }

    $currentBranch = (Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('rev-parse', '--abbrev-ref', 'HEAD')).Text
    $upstream = Get-UpstreamInfo -ModuleRoot $moduleRoot -CurrentBranch $currentBranch
    $aheadBehind = Get-AheadBehind -ModuleRoot $moduleRoot -Reference $upstream

    if ($aheadBehind.Behind -gt 0) {
        $blockedModules.Add([pscustomobject]@{
            Module = $entry.name
            Path = $entry.path
            Reason = 'behind-upstream'
            Detail = "Branch $currentBranch is behind $($aheadBehind.Reference)."
        }) | Out-Null
        continue
    }

    if ($aheadBehind.Ahead -gt 0 -and $aheadBehind.Behind -gt 0) {
        $blockedModules.Add([pscustomobject]@{
            Module = $entry.name
            Path = $entry.path
            Reason = 'diverged-upstream'
            Detail = "Branch $currentBranch diverged from $($aheadBehind.Reference)."
        }) | Out-Null
        continue
    }

    if ($aheadBehind.Ahead -gt 0 -and -not $DryRun) {
        $blockedModules.Add([pscustomobject]@{
            Module = $entry.name
            Path = $entry.path
            Reason = 'ahead-upstream-before-sync'
            Detail = "Branch $currentBranch already has unpushed commits relative to $($aheadBehind.Reference)."
        }) | Out-Null
        continue
    }

    $trackingEntry = Get-TrackingEntry -RootDirectory $repoRootPath -ModulePath ([string]$entry.path)
    $moduleHeadBefore = (Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('rev-parse', '--short', 'HEAD')).Text
    $commitMessage = [string]::Format([string]$config.root.commitMessages.outboundTemplate, [string]$entry.name, $rootHead)

    $changedModules.Add([pscustomobject]@{
        Module = $entry.name
        Path = $entry.path
        Branch = $currentBranch
        Upstream = $upstream
        TrackingMode = $trackingEntry.Mode
        RootTrackedRef = $trackingEntry.Sha
        ModuleHeadBefore = $moduleHeadBefore
        CommitMessage = $commitMessage
        Status = $statusText
    }) | Out-Null
}

if ($blockedModules.Count -gt 0) {
    if ($Json) {
        [pscustomobject]@{
            RepoRoot = $repoRootPath
            ChangedModules = $changedModules
            BlockedModules = $blockedModules
        } | ConvertTo-Json -Depth 8
        exit $EXIT_BLOCKED
    }

    Write-Host '== Superproject Outbound Sync =='
    foreach ($blocked in $blockedModules) {
        Write-Host ("BLOCKED: {0} [{1}] - {2}" -f $blocked.Module, $blocked.Path, $blocked.Reason)
        Write-Host ("  {0}" -f $blocked.Detail)
    }
    exit $EXIT_BLOCKED
}

if ($changedModules.Count -eq 0) {
    if ($Json) {
        [pscustomobject]@{
            RepoRoot = $repoRootPath
            ChangedModules = @()
            Message = 'No configured modules require outbound sync.'
        } | ConvertTo-Json -Depth 8
        exit $EXIT_SUCCESS
    }

    Write-Host '== Superproject Outbound Sync =='
    Write-Host 'No configured modules require outbound sync.'
    exit $EXIT_SUCCESS
}

foreach ($item in $changedModules) {
    if ($DryRun) {
        $processedModules.Add([pscustomobject]@{
            Module = $item.Module
            Path = $item.Path
            CommitMessage = $item.CommitMessage
            RootReconciliationNeeded = $true
            Mode = 'dry-run'
        }) | Out-Null
        continue
    }

    $moduleRoot = Join-Path $repoRootPath $item.Path
    Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('add', '-A') | Out-Null

    $diffCheck = Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('diff', '--cached', '--quiet') -AllowFailure
    if ($diffCheck.Code -eq 0) {
        $processedModules.Add([pscustomobject]@{
            Module = $item.Module
            Path = $item.Path
            CommitMessage = ''
            RootReconciliationNeeded = $false
            Mode = 'no-op'
        }) | Out-Null
        continue
    }

    Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('commit', '-m', $item.CommitMessage) | Out-Null
    Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('push', 'origin', 'HEAD') | Out-Null
    $moduleHeadAfter = (Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('rev-parse', '--short', 'HEAD')).Text

    $processedModules.Add([pscustomobject]@{
        Module = $item.Module
        Path = $item.Path
        CommitMessage = $item.CommitMessage
        RootReconciliationNeeded = $true
        ModuleHeadAfter = $moduleHeadAfter
        Mode = 'live'
    }) | Out-Null
}

$result = [pscustomobject]@{
    RepoRoot = $repoRootPath
    RootHead = $rootHead
    DryRun = [bool]$DryRun
    ChangedModules = $changedModules
    ProcessedModules = $processedModules
}

if ($Json) {
    $result | ConvertTo-Json -Depth 8
    exit $EXIT_SUCCESS
}

Write-Host '== Superproject Outbound Sync =='
Write-Host ("ChangedModules: {0}" -f ($changedModules.Module -join ', '))
Write-Host ''

foreach ($item in $processedModules) {
    Write-Host ("Module: {0} [{1}]" -f $item.Module, $item.Path)
    Write-Host ("  mode: {0}" -f $item.Mode)
    if ($item.CommitMessage) {
        Write-Host ("  commit: {0}" -f $item.CommitMessage)
    }
    Write-Host ("  root reconciliation needed: {0}" -f $item.RootReconciliationNeeded)
}

if ($DryRun) {
    Write-Host ''
    Write-Host 'Dry-run only. No module commits or pushes were made.'
}
else {
    Write-Host ''
    Write-Host 'Next step: run superproject-sync-status.ps1 and reconcile any module pointer updates in the root.'
}

exit $EXIT_SUCCESS
