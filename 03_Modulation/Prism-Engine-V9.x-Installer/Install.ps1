param(
    [ValidateSet("A", "B")]
    [string]$Mode,
    [string]$ProjectTemplatesRoot = "$env:APPDATA\Code\User\ProjectTemplates",
    [string]$ModesFile = "$env:APPDATA\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\custom_modes.yaml",
    [string]$TargetRoo = "$env:USERPROFILE\.roo",
    [switch]$Backup,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$InstallerRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$TemplateSource = Join-Path $InstallerRoot "Prism-Engine-V9.x-Template"
$ModeAYamlDir = Join-Path $InstallerRoot "PresetYAML-ModeA"
$ModeBYamlDir = Join-Path $InstallerRoot "PresetYAML-ModeB"
$RuleDirs = @(
    "rules-prism-etl",
    "rules-prism-runtime",
    "rules-prism-evaluate",
    "rules-prism-weaver",
    "rules-prism-weaver-orch",
    "rules-prism-dyad"
)
$SystemPromptFiles = @(
    "system-prompt-prism-etl",
    "system-prompt-prism-runtime",
    "system-prompt-prism-evaluate",
    "system-prompt-prism-weaver",
    "system-prompt-prism-weaver-orch",
    "system-prompt-prism-dyad"
)

function Write-Step([string]$Message) {
    Write-Host "[Prism-Installer] $Message" -ForegroundColor Cyan
}

function Ensure-Directory([string]$Path) {
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Confirm-Continue([string]$Prompt) {
    while ($true) {
        $answer = Read-Host $Prompt
        switch ($answer.ToLowerInvariant()) {
            "y" { return $true }
            "n" { return $false }
            default { Write-Host "Please enter y or n." -ForegroundColor Yellow }
        }
    }
}

function Ensure-ProjectTemplatesRoot() {
    if (Test-Path $ProjectTemplatesRoot) {
        return
    }

    Write-Host "未检测到 ProjectTemplates 目录: $ProjectTemplatesRoot" -ForegroundColor Yellow
    Write-Host "请先手动安装 ProjectTemplate 插件。" -ForegroundColor Yellow
    $msg = "该脚本可以创建该文件夹以完成安装，你可以稍后手动安装ProjectTemplate插件，但可能导致意外的结果，是否继续？(y/n)"
    if (-not (Confirm-Continue $msg)) {
        throw "用户取消安装。"
    }
    Ensure-Directory $ProjectTemplatesRoot
    Write-Step "已创建 ProjectTemplates 目录: $ProjectTemplatesRoot"
}

function Backup-File([string]$Path) {
    if ((Test-Path $Path) -and $Backup) {
        $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $bak = "$Path.$stamp.bak"
        Copy-Item $Path $bak -Force
        Write-Step "Backup created: $bak"
    }
}

function Read-FileText([string]$Path) {
    if (Test-Path $Path) {
        return Get-Content $Path -Raw
    }
    return ""
}

function Ensure-ModesHeader([string]$Content) {
    if ([string]::IsNullOrWhiteSpace($Content)) {
        return "customModes:`r`n"
    }
    if ($Content -notmatch "(?m)^customModes:") {
        return "customModes:`r`n" + $Content.TrimStart()
    }
    return $Content
}

function Extract-ModeBlocksFromContent([string]$YamlContent) {
    $matches = [regex]::Matches($YamlContent, '(?ms)^  - slug: .*?(?=^  - slug: |\z)')
    $result = @()
    foreach ($m in $matches) {
        $block = $m.Value.TrimEnd()
        $slugMatch = [regex]::Match($block, '(?m)^  - slug: (.+)$')
        if (-not $slugMatch.Success) {
            throw "Could not determine slug from block.`n$block"
        }
        $result += [pscustomobject]@{
            Slug  = $slugMatch.Groups[1].Value.Trim()
            Block = $block
        }
    }
    return $result
}

function Upsert-ModeBlock([string]$Content, [string]$Slug, [string]$Block) {
    $pattern = "(?ms)^  - slug: $([regex]::Escape($Slug))\r?\n.*?(?=^  - slug: |\z)"
    if ([regex]::IsMatch($Content, $pattern)) {
        return [regex]::Replace($Content, $pattern, $Block + "`r`n")
    }
    $content = Ensure-ModesHeader $Content
    return $content.TrimEnd() + "`r`n" + $Block + "`r`n"
}

function Merge-PresetFolderIntoModesFile([string]$PresetDir) {
    if (-not (Test-Path $PresetDir)) {
        throw "Preset directory not found: $PresetDir"
    }

    Ensure-Directory (Split-Path -Parent $ModesFile)
    Backup-File $ModesFile
    $current = Ensure-ModesHeader (Read-FileText $ModesFile)

    $yamlFiles = Get-ChildItem -Path $PresetDir -Filter *.yaml | Sort-Object Name
    if (-not $yamlFiles) {
        throw "No preset YAML files found in: $PresetDir"
    }

    foreach ($file in $yamlFiles) {
        $content = Get-Content $file.FullName -Raw
        $blocks = Extract-ModeBlocksFromContent $content
        foreach ($b in $blocks) {
            $current = Upsert-ModeBlock -Content $current -Slug $b.Slug -Block $b.Block
            Write-Step "Merged preset block: $($b.Slug) from $($file.Name)"
        }
    }

    Set-Content -Path $ModesFile -Value $current -Encoding UTF8
    Write-Step "Updated custom modes file: $ModesFile"
}

function Copy-Template([string]$SourceDir, [string]$DestinationDir) {
    if (-not (Test-Path $SourceDir)) {
        throw "Template source not found: $SourceDir"
    }
    if ((Test-Path $DestinationDir) -and -not $Force) {
        throw "Target template already exists: $DestinationDir . Re-run with -Force to overwrite."
    }
    if (Test-Path $DestinationDir) {
        Remove-Item $DestinationDir -Recurse -Force
    }
    Copy-Item $SourceDir $DestinationDir -Recurse -Force
    Write-Step "Copied template -> $DestinationDir"
}

function Install-RuleDirs() {
    Ensure-Directory $TargetRoo
    foreach ($dir in $RuleDirs) {
        $src = Join-Path $InstallerRoot $dir
        $dst = Join-Path $TargetRoo $dir
        if (-not (Test-Path $src)) {
            throw "Missing rule directory: $src"
        }
        if ((Test-Path $dst) -and -not $Force) {
            throw "Target rule directory already exists: $dst . Re-run with -Force to overwrite."
        }
        if (Test-Path $dst) {
            Remove-Item $dst -Recurse -Force
        }
        Copy-Item $src $dst -Recurse -Force
        Write-Step "Installed rule directory: $dst"
    }
}

function New-NoRooTemplateTempCopy() {
    $tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("Prism-Engine-V9.x-Template-NoPrompts-" + [guid]::NewGuid().ToString("N"))
    Copy-Item $TemplateSource $tempDir -Recurse -Force
    $rooDir = Join-Path $tempDir ".roo"
    Ensure-Directory $rooDir
    foreach ($file in $SystemPromptFiles) {
        $path = Join-Path $rooDir $file
        if (Test-Path $path) {
            Remove-Item $path -Force
            Write-Step "Removed template prompt file for Mode B: $file"
        }
    }
    return $tempDir
}

function Select-ModeIfNeeded() {
    if ($Mode) { return $Mode }
    while ($true) {
        $selected = Read-Host "请选择安装模式：A=传统模式，B=Rules 模式"
        switch ($selected.ToUpperInvariant()) {
            "A" { return "A" }
            "B" { return "B" }
            default { Write-Host "请输入 A 或 B。" -ForegroundColor Yellow }
        }
    }
}

$selectedMode = Select-ModeIfNeeded
Ensure-ProjectTemplatesRoot

switch ($selectedMode) {
    "A" {
        Write-Step "Starting Mode A installation"
        $targetTemplate = Join-Path $ProjectTemplatesRoot "Prism-Engine-V9.x-Template"
        Copy-Template -SourceDir $TemplateSource -DestinationDir $targetTemplate
        Merge-PresetFolderIntoModesFile -PresetDir $ModeAYamlDir
        Write-Step "Mode A installation complete"
    }
    "B" {
        Write-Step "Starting Mode B installation"
        Install-RuleDirs
        Merge-PresetFolderIntoModesFile -PresetDir $ModeBYamlDir
        $tempTemplate = New-NoRooTemplateTempCopy
        try {
            $targetTemplate = Join-Path $ProjectTemplatesRoot "Prism-Engine-V9.x-Template"
            Copy-Template -SourceDir $tempTemplate -DestinationDir $targetTemplate
        }
        finally {
            if (Test-Path $tempTemplate) {
                Remove-Item $tempTemplate -Recurse -Force
            }
        }
        Write-Step "Mode B installation complete"
    }
}

Write-Step "Installation complete. Restart VS Code / RooCode if the updated templates or modes are not immediately visible."
