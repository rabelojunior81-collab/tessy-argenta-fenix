[CmdletBinding()]
param(
    [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path,
    [switch]$KeepFixture,
    [switch]$Help
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Show-Usage {
    @'
test-superproject-sync.ps1

Usage:
  pwsh -File scripts/sync/test-superproject-sync.ps1 [-KeepFixture]

Behavior:
  - creates a disposable local fixture under .tmp/sync-harness/
  - exercises status, outbound dry-run/live, inbound dry-run/live, and a blocked behind-upstream case
  - exits non-zero on regression
'@
}

if ($Help) {
    Show-Usage
    exit 0
}

function Invoke-Git {
    param(
        [string]$WorkingDirectory,
        [string[]]$Arguments
    )

    $output = & git '-C' $WorkingDirectory @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed in ${WorkingDirectory}: $($output -join [Environment]::NewLine)"
    }

    return (($output | ForEach-Object { "$_" }) -join [Environment]::NewLine).Trim()
}

function Run-PowerShellJson {
    param(
        [string]$ScriptPath,
        [string[]]$Arguments
    )

    $output = & pwsh -NoLogo -NoProfile -File $ScriptPath @Arguments 2>&1
    $exitCode = $LASTEXITCODE
    return [pscustomobject]@{
        ExitCode = $exitCode
        Text = (($output | ForEach-Object { "$_" }) -join [Environment]::NewLine).Trim()
    }
}

function Assert-True {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function New-RemoteRepo {
    param(
        [string]$Path,
        [string]$Branch
    )

    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    Invoke-Git -WorkingDirectory $Path -Arguments @('init', '-b', $Branch) | Out-Null
    Invoke-Git -WorkingDirectory $Path -Arguments @('config', 'receive.denyCurrentBranch', 'updateInstead') | Out-Null
}

function Initialize-NestedModule {
    param(
        [string]$RootPath,
        [string]$Path,
        [string]$Branch,
        [string]$RemotePath
    )

    $moduleRoot = Join-Path $RootPath $Path
    New-Item -ItemType Directory -Path $moduleRoot -Force | Out-Null
    Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('init', '-b', $Branch) | Out-Null
    Set-Content -LiteralPath (Join-Path $moduleRoot 'README.md') -Value "# $Path`n" -NoNewline
    Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('add', 'README.md') | Out-Null
    Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('commit', '-m', "chore: bootstrap $Path") | Out-Null
    Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('remote', 'add', 'origin', $RemotePath) | Out-Null
    Invoke-Git -WorkingDirectory $moduleRoot -Arguments @('push', '-u', 'origin', $Branch) | Out-Null
}

function Write-Config {
    param(
        [string]$ConfigPath,
        [string]$RootRemote,
        [string]$TessyRemote,
        [string]$InceptionRemote,
        [string]$TuiRemote
    )

    $config = [ordered]@{
        root = [ordered]@{
            name = 'fixture-root'
            expectedOrigin = $RootRemote
            defaultBranch = 'master'
            healthCheck = 'git status --porcelain=v1 --ignore-submodules=dirty'
            hook = [ordered]@{
                trackedShellPath = '.githooks/post-commit'
                trackedPowerShellPath = '.githooks/post-commit.ps1'
                installedHookPath = '.git/hooks/post-commit'
            }
            commitMessages = [ordered]@{
                outboundTemplate = 'sync: auto-commit from superproject ({0}) [root {1}]'
                importTemplate = 'sync: import {0} after module reconciliation'
            }
        }
        modules = @(
            [ordered]@{
                name = 'tessy'
                path = 'tessy-antigravity-rabelus-lab'
                expectedRemote = $TessyRemote
                defaultBranch = 'main'
                allowOutbound = $true
                allowInbound = $true
                protectedPaths = @('.git/')
            },
            [ordered]@{
                name = 'inception-v2'
                path = 'inception-v2'
                expectedRemote = $InceptionRemote
                defaultBranch = 'main'
                allowOutbound = $true
                allowInbound = $true
                protectedPaths = @('.git/')
            },
            [ordered]@{
                name = 'inception-tui'
                path = 'inception-tui'
                expectedRemote = $TuiRemote
                defaultBranch = 'master'
                allowOutbound = $true
                allowInbound = $true
                protectedPaths = @('.git/')
            }
        )
    }

    $json = $config | ConvertTo-Json -Depth 6
    Set-Content -LiteralPath $ConfigPath -Value $json -NoNewline
}

$fixtureRoot = Join-Path $WorkspaceRoot ('.tmp/sync-harness-' + [guid]::NewGuid().ToString('N'))
$fixtureWorkspace = Join-Path $fixtureRoot 'workspace'
$fixtureRemotes = Join-Path $fixtureRoot 'remotes'
$scriptsRoot = Join-Path $WorkspaceRoot 'scripts/sync'
$statusScript = Join-Path $scriptsRoot 'superproject-sync-status.ps1'
$syncScript = Join-Path $scriptsRoot 'superproject-sync.ps1'
$importScript = Join-Path $scriptsRoot 'import-module-changes.ps1'
$configPath = Join-Path $fixtureRoot 'sync.config.json'
$rootRemote = Join-Path $fixtureRemotes 'root-remote'
$tessyRemote = Join-Path $fixtureRemotes 'tessy-remote'
$inceptionRemote = Join-Path $fixtureRemotes 'inception-v2-remote'
$tuiRemote = Join-Path $fixtureRemotes 'inception-tui-remote'

New-Item -ItemType Directory -Path $fixtureWorkspace -Force | Out-Null
New-Item -ItemType Directory -Path $fixtureRemotes -Force | Out-Null

try {
    New-RemoteRepo -Path $rootRemote -Branch 'master'
    New-RemoteRepo -Path $tessyRemote -Branch 'main'
    New-RemoteRepo -Path $inceptionRemote -Branch 'main'
    New-RemoteRepo -Path $tuiRemote -Branch 'master'

    Invoke-Git -WorkingDirectory $fixtureWorkspace -Arguments @('init', '-b', 'master') | Out-Null
    Invoke-Git -WorkingDirectory $fixtureWorkspace -Arguments @('remote', 'add', 'origin', $rootRemote) | Out-Null
    Set-Content -LiteralPath (Join-Path $fixtureWorkspace 'README.md') -Value "fixture root`n" -NoNewline
    Invoke-Git -WorkingDirectory $fixtureWorkspace -Arguments @('add', 'README.md') | Out-Null
    Invoke-Git -WorkingDirectory $fixtureWorkspace -Arguments @('commit', '-m', 'chore: bootstrap root') | Out-Null
    Invoke-Git -WorkingDirectory $fixtureWorkspace -Arguments @('push', '-u', 'origin', 'master') | Out-Null

    Initialize-NestedModule -RootPath $fixtureWorkspace -Path 'tessy-antigravity-rabelus-lab' -Branch 'main' -RemotePath $tessyRemote
    Initialize-NestedModule -RootPath $fixtureWorkspace -Path 'inception-v2' -Branch 'main' -RemotePath $inceptionRemote
    Initialize-NestedModule -RootPath $fixtureWorkspace -Path 'inception-tui' -Branch 'master' -RemotePath $tuiRemote

    Invoke-Git -WorkingDirectory $fixtureWorkspace -Arguments @('add', 'tessy-antigravity-rabelus-lab', 'inception-v2', 'inception-tui') | Out-Null
    Invoke-Git -WorkingDirectory $fixtureWorkspace -Arguments @('commit', '-m', 'chore: add embedded modules') | Out-Null
    Invoke-Git -WorkingDirectory $fixtureWorkspace -Arguments @('push') | Out-Null

    Write-Config -ConfigPath $configPath -RootRemote $rootRemote -TessyRemote $tessyRemote -InceptionRemote $inceptionRemote -TuiRemote $tuiRemote

    $statusClean = Run-PowerShellJson -ScriptPath $statusScript -Arguments @('-RepoRoot', $fixtureWorkspace, '-ConfigPath', $configPath, '-NoFetch', '-Json')
    Assert-True -Condition ($statusClean.ExitCode -eq 0) -Message 'Status command failed on clean fixture.'
    $statusCleanJson = $statusClean.Text | ConvertFrom-Json
    Assert-True -Condition (@($statusCleanJson.Modules).Count -eq 3) -Message 'Status command did not report all modules.'

    Set-Content -LiteralPath (Join-Path $fixtureWorkspace 'tessy-antigravity-rabelus-lab' 'feature.txt') -Value "fixture outbound`n" -NoNewline
    $outboundDryRun = Run-PowerShellJson -ScriptPath $syncScript -Arguments @('-RepoRoot', $fixtureWorkspace, '-ConfigPath', $configPath, '-NoFetch', '-DryRun', '-Json')
    Assert-True -Condition ($outboundDryRun.ExitCode -eq 0) -Message 'Outbound dry-run failed.'
    $outboundDryRunJson = $outboundDryRun.Text | ConvertFrom-Json
    Assert-True -Condition (@($outboundDryRunJson.ChangedModules).Count -ge 1) -Message 'Outbound dry-run did not detect the changed module.'

    $outboundLive = Run-PowerShellJson -ScriptPath $syncScript -Arguments @('-RepoRoot', $fixtureWorkspace, '-ConfigPath', $configPath, '-NoFetch', '-Json')
    Assert-True -Condition ($outboundLive.ExitCode -eq 0) -Message 'Outbound live sync failed.'

    $importDryRun = Run-PowerShellJson -ScriptPath $importScript -Arguments @('-Module', 'tessy', '-RepoRoot', $fixtureWorkspace, '-ConfigPath', $configPath, '-NoFetch', '-DryRun', '-Json')
    Assert-True -Condition ($importDryRun.ExitCode -eq 0) -Message 'Import dry-run failed.'
    $importDryRunJson = $importDryRun.Text | ConvertFrom-Json
    Assert-True -Condition (@($importDryRunJson.Files).Count -ge 1) -Message 'Import dry-run did not surface file differences.'

    $importLive = Run-PowerShellJson -ScriptPath $importScript -Arguments @('-Module', 'tessy', '-RepoRoot', $fixtureWorkspace, '-ConfigPath', $configPath, '-NoFetch', '-Json')
    Assert-True -Condition ($importLive.ExitCode -eq 0) -Message 'Import live run failed.'
    $cachedRootDiff = Invoke-Git -WorkingDirectory $fixtureWorkspace -Arguments @('diff', '--cached', '--name-only')
    Assert-True -Condition ($cachedRootDiff -match 'tessy-antigravity-rabelus-lab') -Message 'Import live run did not stage the module in root.'

    $remoteClone = Join-Path $fixtureRoot 'tessy-remote-clone'
    Invoke-Git -WorkingDirectory $fixtureRoot -Arguments @('clone', $tessyRemote, $remoteClone) | Out-Null
    Set-Content -LiteralPath (Join-Path $remoteClone 'upstream.txt') -Value "upstream change`n" -NoNewline
    Invoke-Git -WorkingDirectory $remoteClone -Arguments @('add', 'upstream.txt') | Out-Null
    Invoke-Git -WorkingDirectory $remoteClone -Arguments @('commit', '-m', 'feat: upstream change') | Out-Null
    Invoke-Git -WorkingDirectory $remoteClone -Arguments @('push', 'origin', 'HEAD:main') | Out-Null

    Set-Content -LiteralPath (Join-Path $fixtureWorkspace 'tessy-antigravity-rabelus-lab' 'blocked.txt') -Value "local dirty change`n" -NoNewline
    $blockedOutbound = Run-PowerShellJson -ScriptPath $syncScript -Arguments @('-RepoRoot', $fixtureWorkspace, '-ConfigPath', $configPath, '-Json')
    Assert-True -Condition ($blockedOutbound.ExitCode -eq 2) -Message 'Blocked outbound scenario did not return exit code 2.'

    Write-Host 'Superproject sync smoke harness passed.'
    exit 0
}
finally {
    if (-not $KeepFixture -and (Test-Path -LiteralPath $fixtureRoot)) {
        Get-ChildItem -LiteralPath $fixtureRoot -Force -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
            $_.Attributes = 'Normal'
        }
        try {
            Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
        }
        catch {
            Write-Warning "Fixture cleanup skipped: $fixtureRoot"
        }
    }
}
