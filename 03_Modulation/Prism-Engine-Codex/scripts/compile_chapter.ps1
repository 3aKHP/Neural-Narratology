param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectName,

    [Parameter(Mandatory = $true)]
    [int]$ChapterNumber
)

$ErrorActionPreference = "Stop"

$engineRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$chapterPadded = "{0:D2}" -f $ChapterNumber
$sceneDir = Join-Path $engineRoot "novels/$ProjectName/chapters/Chapter_$chapterPadded"
$outputFile = Join-Path $engineRoot "novels/$ProjectName/Chapter_$chapterPadded.md"

if (-not (Test-Path $sceneDir)) {
    throw "Scene directory not found: $sceneDir"
}

$sceneFiles = Get-ChildItem -Path $sceneDir -Filter "Scene_*.md" | Sort-Object Name
if ($sceneFiles.Count -eq 0) {
    throw "No scene shards found in: $sceneDir"
}

$content = foreach ($sceneFile in $sceneFiles) {
    Get-Content -Path $sceneFile.FullName -Raw -Encoding UTF8
}

($content -join "`n`n") | Set-Content -Path $outputFile -Encoding UTF8
Write-Output "Compiled chapter: $outputFile"
