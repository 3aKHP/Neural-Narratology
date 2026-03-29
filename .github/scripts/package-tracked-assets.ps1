param(
    [Parameter(Mandatory = $true)]
    [string]$ManifestPath,

    [Parameter(Mandatory = $true)]
    [string]$OutputDir,

    [string]$GitRef = "HEAD"
)

$ErrorActionPreference = "Stop"
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "../.."))

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

function Resolve-RepoRelative([string]$Path) {
    $fullPath = Resolve-InsideRepo $Path
    $repoRootWithSeparator = $repoRoot
    if (-not $repoRootWithSeparator.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
        $repoRootWithSeparator += [System.IO.Path]::DirectorySeparatorChar
    }

    if ($fullPath -eq $repoRoot) {
        return "."
    }

    return $fullPath.Substring($repoRootWithSeparator.Length).Replace('\', '/')
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

New-Item -ItemType Directory -Force -Path $resolvedOutputDir | Out-Null
$manifest = Get-Content $manifestFile -Raw | ConvertFrom-Json

foreach ($item in $manifest) {
    if (-not $item.source_dir) {
        throw "Manifest entry is missing source_dir."
    }
    if (-not $item.output_name) {
        throw "Manifest entry is missing output_name for $($item.source_dir)."
    }

    $sourceDir = Resolve-InsideRepo $item.source_dir
    if (-not (Test-Path $sourceDir)) {
        throw "Source directory not found: $sourceDir"
    }

    $sourceRelative = Resolve-RepoRelative $item.source_dir
    $archiveRoot = if ($item.archive_root) { [string]$item.archive_root } else { Split-Path $sourceDir -Leaf }
    $outputFile = Join-Path $resolvedOutputDir ([string]$item.output_name)

    Write-Host "Packaging $sourceRelative -> $outputFile" -ForegroundColor Cyan
    $gitArgs = @(
        "-C", $repoRoot,
        "archive",
        "--format=zip",
        "--output=$outputFile",
        "--prefix=$archiveRoot/",
        $GitRef,
        $sourceRelative
    )

    & git @gitArgs
    if ($LASTEXITCODE -ne 0) {
        throw "git archive failed for $sourceRelative"
    }
}

Write-Sha256Sums -TargetDir $resolvedOutputDir
