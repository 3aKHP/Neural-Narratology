param(
    [Parameter(Mandatory = $true)]
    [string]$ManifestPath,

    [Parameter(Mandatory = $true)]
    [string]$OutputDir
)

$ErrorActionPreference = "Stop"
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "../.."))
$builder = Join-Path $PSScriptRoot "build-single-installer.ps1"

function Resolve-InsideRepo([string]$Path) {
    $fullPath = if ([System.IO.Path]::IsPathRooted($Path)) {
        [System.IO.Path]::GetFullPath($Path)
    }
    else {
        [System.IO.Path]::GetFullPath((Join-Path $repoRoot $Path))
    }

    $repoRootWithSeparator = $repoRoot
    if (-not $repoRootWithSeparator.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
        $repoRootWithSeparator += [System.IO.Path]::DirectorySeparatorChar
    }

    if ($fullPath -ne $repoRoot -and -not $fullPath.StartsWith($repoRootWithSeparator, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Path must stay inside the repository root: $Path"
    }

    return $fullPath
}

function Resolve-OutputPath([string]$Path) {
    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $repoRoot $Path))
}

function Write-Sha256Sums([string]$TargetDir) {
    $hashLines = foreach ($file in Get-ChildItem -Path $TargetDir -File | Sort-Object Name) {
        if ($file.Name -eq "SHA256SUMS.txt") {
            continue
        }

        $hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        "{0} *{1}" -f $hash, $file.Name
    }

    Set-Content -Path (Join-Path $TargetDir "SHA256SUMS.txt") -Value $hashLines -Encoding UTF8
}

$manifestFile = Resolve-InsideRepo $ManifestPath
$resolvedOutputDir = Resolve-OutputPath $OutputDir

if (-not (Test-Path $manifestFile)) {
    throw "Manifest file not found: $manifestFile"
}
if (-not (Test-Path $builder)) {
    throw "Builder script not found: $builder"
}

New-Item -ItemType Directory -Force -Path $resolvedOutputDir | Out-Null
$manifest = Get-Content $manifestFile -Raw | ConvertFrom-Json

foreach ($item in $manifest) {
    if (-not $item.source_dir) {
        throw "Manifest entry is missing source_dir."
    }
    if (-not $item.output_name) {
        throw "Manifest entry is missing output_name for $($item.source_dir)."
    }
    if (-not $item.installer_name) {
        throw "Manifest entry is missing installer_name for $($item.source_dir)."
    }

    $sourceDir = Resolve-InsideRepo $item.source_dir
    if (-not (Test-Path $sourceDir)) {
        throw "Source directory not found: $sourceDir"
    }

    $outputPath = Join-Path $resolvedOutputDir ([string]$item.output_name)
    & $builder -SourceDir ([string]$item.source_dir) -OutputPath $outputPath -InstallerName ([string]$item.installer_name)
}

Write-Sha256Sums -TargetDir $resolvedOutputDir
