param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectName,

    [Parameter(Mandatory = $true)]
    [int]$ChapterNumber,

    [Parameter(Mandatory = $true)]
    [int]$SceneNumber
)

$ErrorActionPreference = "Stop"

$engineRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$chapterPadded = "{0:D2}" -f $ChapterNumber
$scenePadded = "{0:D3}" -f $SceneNumber
$chapterDir = Join-Path $engineRoot "novels/$ProjectName/chapters/Chapter_$chapterPadded"
$sceneFile = Join-Path $chapterDir "Scene_$scenePadded.md"

New-Item -ItemType Directory -Force -Path $chapterDir | Out-Null

if (-not (Test-Path $sceneFile)) {
@"
# Chapter $chapterPadded Scene $scenePadded

## Scene Goal

## Draft
"@ | Set-Content -Path $sceneFile -Encoding UTF8
}

Write-Output "Initialized scene shard: $sceneFile"
