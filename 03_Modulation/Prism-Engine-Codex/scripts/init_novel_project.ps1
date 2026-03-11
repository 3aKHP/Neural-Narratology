param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectName,

    [switch]$Force
)

$ErrorActionPreference = "Stop"

$engineRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$projectDir = Join-Path $engineRoot "novels/$ProjectName"
$reportDir = Join-Path $engineRoot "reports/$ProjectName"
$chaptersDir = Join-Path $projectDir "chapters"
$outlineFile = Join-Path $projectDir "outline.md"
$storyBibleFile = Join-Path $projectDir "story_bible.md"

if ((Test-Path $projectDir) -and -not $Force) {
    throw "Project already exists: $projectDir`nRe-run with -Force to refresh the scaffold."
}

New-Item -ItemType Directory -Force -Path $chaptersDir, $reportDir | Out-Null
Copy-Item (Join-Path $engineRoot "templates/tpl_outline.md") $outlineFile -Force
Copy-Item (Join-Path $engineRoot "templates/tpl_story_bible.md") $storyBibleFile -Force

@"
# $ProjectName

- `outline.md`: 结构化章节大纲
- `story_bible.md`: 世界状态层与连续性记录
- `chapters/Chapter_XX/Scene_YYY.md`: 场景碎片
- `Chapter_XX.md`: 编译后的章节产物
"@ | Set-Content -Path (Join-Path $projectDir "README.md") -Encoding UTF8

Write-Output "Initialized novel project: $projectDir"
