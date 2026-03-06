#Requires -Version 5.1
<#!
ConvertDocxToMdAndArchive.ps1

Purpose:
- Convert all .docx files in the given folder (default: current folder) into .md
- After a successful conversion, move the original .docx into ../drafts (create if missing)

Converter:
- Uses pandoc. If pandoc is not found, the script exits with a non-zero code.

Usage examples:
- Run in current folder:
  powershell -NoProfile -ExecutionPolicy Bypass -File .\ConvertDocxToMdAndArchive.ps1
- Specify a folder:
  powershell -NoProfile -ExecutionPolicy Bypass -File .\ConvertDocxToMdAndArchive.ps1 -Path "F:\docs"
!#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$Path = "."
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Always run relative to the script's own directory, and restore caller location on exit.
# This makes the default -Path "." deterministic.
$scriptExitCode = 0
Push-Location -Path $PSScriptRoot

function Resolve-FullPath {
    param([Parameter(Mandatory = $true)][string]$P)
    return (Resolve-Path -LiteralPath $P).Path
}

function Test-Pandoc {
    $cmd = Get-Command pandoc -ErrorAction SilentlyContinue
    if (-not $cmd) {
        return $false
    }
    return $true
}

function New-DraftDir {
    param([Parameter(Mandatory = $true)][string]$WorkDir)

    $parent = Split-Path -Path $WorkDir -Parent
    $draft = Join-Path -Path $parent -ChildPath 'drafts'
    New-Item -ItemType Directory -Force -Path $draft | Out-Null
    return $draft
}

function Get-UniqueDestinationPath {
    param(
        [Parameter(Mandatory = $true)][string]$DraftDir,
        [Parameter(Mandatory = $true)][string]$FileName
    )

    $dest = Join-Path -Path $DraftDir -ChildPath $FileName
    if (-not (Test-Path -LiteralPath $dest)) {
        return $dest
    }

    $base = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
    $ext  = [System.IO.Path]::GetExtension($FileName)
    $ts   = Get-Date -Format 'yyyyMMdd_HHmmss'
    return (Join-Path -Path $DraftDir -ChildPath ("${base}_${ts}${ext}"))
}

function Move-SelfToDrafts {
    param(
        [Parameter(Mandatory = $false)][string]$ScriptPath,
        [Parameter(Mandatory = $false)][string]$ScriptRoot
    )

    if ([string]::IsNullOrWhiteSpace($ScriptPath)) {
        return
    }
    if (-not (Test-Path -LiteralPath $ScriptPath)) {
        return
    }

    try {
        $parent = Split-Path -Path $ScriptRoot -Parent
        $draftDir = Join-Path -Path $parent -ChildPath 'drafts'
        New-Item -ItemType Directory -Force -Path $draftDir | Out-Null

        $fileName = [System.IO.Path]::GetFileName($ScriptPath)
        $destPath = Get-UniqueDestinationPath -DraftDir $draftDir -FileName $fileName

        if ($ScriptPath -ieq $destPath) {
            return
        }

        # Move in a detached PowerShell process so the current script file
        # is no longer in use when Move-Item executes.
        $moveScript = @"
Start-Sleep -Milliseconds 400
`$src = '$($ScriptPath.Replace("'", "''"))'
`$dst = '$($destPath.Replace("'", "''"))'
if (Test-Path -LiteralPath `$src) {
    Move-Item -LiteralPath `$src -Destination `$dst -Force
}
"@
        $encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($moveScript))
        Start-Process -FilePath 'powershell.exe' `
            -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', $encoded) `
            -WindowStyle Hidden | Out-Null

        Write-Host "Self-archive scheduled: $ScriptPath -> $destPath"
    }
    catch {
        Write-Warning "Failed to schedule self-archive for script: $($_.Exception.Message)"
    }
}

try {
    $workDir = Resolve-FullPath -P $Path

    if (-not (Test-Pandoc)) {
        $scriptExitCode = 2
        Write-Error "pandoc not found. Please install pandoc and ensure it is in PATH." -ErrorAction Continue
        return
    }

    $docxFiles = @(Get-ChildItem -LiteralPath $workDir -Filter '*.docx' -File | Sort-Object Name)
    if ($docxFiles.Count -eq 0) {
        Write-Host "No .docx files found in: $workDir"
        $scriptExitCode = 0
        return
    }

    $draftDir = New-DraftDir -WorkDir $workDir

    $failed = 0

    foreach ($f in $docxFiles) {
        $mdPath = Join-Path -Path $workDir -ChildPath ($f.BaseName + '.md')

        Write-Host "[1/2] Converting: $($f.Name) -> $([System.IO.Path]::GetFileName($mdPath))"
        & pandoc --from=docx --to=gfm --wrap=none --output $mdPath $f.FullName
        $code = $LASTEXITCODE
        if ($code -ne 0) {
            Write-Host "pandoc failed for $($f.Name) (exit code $code). Skipping move."
            $failed++
            continue
        }

        $dest = Get-UniqueDestinationPath -DraftDir $draftDir -FileName $f.Name
        Write-Host "[2/2] Archiving: $($f.Name) -> $dest"
        Move-Item -LiteralPath $f.FullName -Destination $dest
    }

    if ($failed -gt 0) {
        $scriptExitCode = 1
        Write-Error "$failed file(s) failed conversion." -ErrorAction Continue
        return
    }

    Write-Host "Done. Converted and archived all .docx files."
    $scriptExitCode = 0
}
catch {
    if ($scriptExitCode -eq 0) {
        $scriptExitCode = 1
    }
    Write-Error $_ -ErrorAction Continue
}
finally {
    Move-SelfToDrafts -ScriptPath $PSCommandPath -ScriptRoot $PSScriptRoot
    Pop-Location
    exit $scriptExitCode
}
