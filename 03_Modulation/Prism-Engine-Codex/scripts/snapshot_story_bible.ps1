param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectName,

    [Parameter(Mandatory = $true)]
    [int]$ChapterNumber
)

$ErrorActionPreference = "Stop"

$engineRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$chapterPadded = "{0:D2}" -f $ChapterNumber
$sourceFile = Join-Path $engineRoot "novels/$ProjectName/story_bible.md"
$targetFile = Join-Path $engineRoot "novels/$ProjectName/story_bible_ch$chapterPadded.bak.md"

if (-not (Test-Path $sourceFile)) {
    throw "Story Bible not found: $sourceFile"
}

Copy-Item $sourceFile $targetFile -Force
Write-Output "Snapshot created: $targetFile"
