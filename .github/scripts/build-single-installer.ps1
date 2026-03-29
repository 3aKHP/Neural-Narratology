param(
    [Parameter(Mandatory = $true)]
    [string]$SourceDir,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath,

    [Parameter(Mandatory = $true)]
    [string]$InstallerName
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

function Resolve-OutputPath([string]$Path) {
    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $repoRoot $Path))
}

function Get-Sha256Hex([byte[]]$Bytes) {
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hashBytes = $sha256.ComputeHash($Bytes)
        return ([System.BitConverter]::ToString($hashBytes)).Replace("-", "").ToLowerInvariant()
    }
    finally {
        $sha256.Dispose()
    }
}

function Split-StringChunks([string]$Text, [int]$ChunkSize = 120) {
    $chunks = New-Object System.Collections.Generic.List[string]
    for ($offset = 0; $offset -lt $Text.Length; $offset += $ChunkSize) {
        $length = [Math]::Min($ChunkSize, $Text.Length - $offset)
        $chunks.Add($Text.Substring($offset, $length))
    }
    return $chunks
}

$sourcePath = Resolve-InsideRepo $SourceDir
$outputFile = Resolve-OutputPath $OutputPath
$outputDir = Split-Path -Parent $outputFile

if (-not (Test-Path $sourcePath)) {
    throw "Source directory not found: $sourcePath"
}

$installEntry = Join-Path $sourcePath "Install.ps1"
if (-not (Test-Path $installEntry)) {
    throw "Install.ps1 not found under source directory: $installEntry"
}

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("PrismInstallerBuild_" + [guid]::NewGuid().ToString("N"))
$payloadRoot = Join-Path $tempRoot "payload"
$zipPath = Join-Path $tempRoot "payload.zip"

New-Item -ItemType Directory -Path $payloadRoot -Force | Out-Null

try {
    Copy-Item -Path (Join-Path $sourcePath "*") -Destination $payloadRoot -Recurse -Force

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($payloadRoot, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)

    $zipBytes = [System.IO.File]::ReadAllBytes($zipPath)
    $zipBase64 = [System.Convert]::ToBase64String($zipBytes)
    $zipSha256 = Get-Sha256Hex $zipBytes
    $base64Lines = Split-StringChunks -Text $zipBase64 -ChunkSize 120
    $generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ssK")
    $payloadFileCount = (Get-ChildItem -Path $sourcePath -Recurse -File).Count

    $generatedLines = New-Object System.Collections.Generic.List[string]
    $generatedLines.Add('param(')
    $generatedLines.Add('    [ValidateSet("A", "B")]')
    $generatedLines.Add('    [string]$Mode,')
    $generatedLines.Add('    [string]$ProjectTemplatesRoot = "$env:APPDATA\Code\User\ProjectTemplates",')
    $generatedLines.Add('    [string]$ModesFile = "$env:APPDATA\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\custom_modes.yaml",')
    $generatedLines.Add('    [string]$TargetRoo = "$env:USERPROFILE\.roo",')
    $generatedLines.Add('    [switch]$Backup,')
    $generatedLines.Add('    [switch]$Force')
    $generatedLines.Add(')')
    $generatedLines.Add('')
    $generatedLines.Add('$ErrorActionPreference = "Stop"')
    $generatedLines.Add('$PayloadSha256 = "__PAYLOAD_SHA256__"')
    $generatedLines.Add('$PayloadBase64 = @''')
    foreach ($base64Line in $base64Lines) {
        $generatedLines.Add([string]$base64Line)
    }
    $generatedLines.Add('''@')
    $generatedLines.Add('')
    $generatedLines.Add('function Write-InstallerStep([string]$Message) {')
    $generatedLines.Add('    Write-Host "[Prism-Installer] $Message" -ForegroundColor Cyan')
    $generatedLines.Add('}')
    $generatedLines.Add('')
    $generatedLines.Add('function Get-ByteArraySha256Hex([byte[]]$Bytes) {')
    $generatedLines.Add('    $sha256 = [System.Security.Cryptography.SHA256]::Create()')
    $generatedLines.Add('    try {')
    $generatedLines.Add('        $hashBytes = $sha256.ComputeHash($Bytes)')
    $generatedLines.Add('        return ([System.BitConverter]::ToString($hashBytes)).Replace("-", "").ToLowerInvariant()')
    $generatedLines.Add('    }')
    $generatedLines.Add('    finally {')
    $generatedLines.Add('        $sha256.Dispose()')
    $generatedLines.Add('    }')
    $generatedLines.Add('}')
    $generatedLines.Add('')
    $generatedLines.Add('$extractRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("PrismInstaller_" + [guid]::NewGuid().ToString("N"))')
    $generatedLines.Add('$zipPath = Join-Path $extractRoot "payload.zip"')
    $generatedLines.Add('$installScript = Join-Path $extractRoot "Install.ps1"')
    $generatedLines.Add('')
    $generatedLines.Add('New-Item -ItemType Directory -Path $extractRoot -Force | Out-Null')
    $generatedLines.Add('')
    $generatedLines.Add('try {')
    $generatedLines.Add('    Write-InstallerStep "Rehydrating embedded payload"')
    $generatedLines.Add('    Add-Type -AssemblyName System.IO.Compression.FileSystem')
    $generatedLines.Add('')
    $generatedLines.Add('    $zipBytes = [System.Convert]::FromBase64String($PayloadBase64)')
    $generatedLines.Add('    $actualSha256 = Get-ByteArraySha256Hex $zipBytes')
    $generatedLines.Add('    if ($actualSha256 -ne $PayloadSha256) {')
    $generatedLines.Add('        throw "Embedded payload hash mismatch. Expected $PayloadSha256 but got $actualSha256"')
    $generatedLines.Add('    }')
    $generatedLines.Add('')
    $generatedLines.Add('    [System.IO.File]::WriteAllBytes($zipPath, $zipBytes)')
    $generatedLines.Add('    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $extractRoot)')
    $generatedLines.Add('')
    $generatedLines.Add('    if (-not (Test-Path $installScript)) {')
    $generatedLines.Add('        throw "Install.ps1 not found after payload extraction: $installScript"')
    $generatedLines.Add('    }')
    $generatedLines.Add('')
    $generatedLines.Add('    Write-InstallerStep "Launching packaged installer"')
    $generatedLines.Add('    $forwardParams = @{}')
    $generatedLines.Add('    foreach ($key in $PSBoundParameters.Keys) {')
    $generatedLines.Add('        $forwardParams[$key] = $PSBoundParameters[$key]')
    $generatedLines.Add('    }')
    $generatedLines.Add('')
    $generatedLines.Add('    & $installScript @forwardParams')
    $generatedLines.Add('}')
    $generatedLines.Add('finally {')
    $generatedLines.Add('    if (Test-Path $extractRoot) {')
    $generatedLines.Add('        Write-InstallerStep "Cleaning temporary payload"')
    $generatedLines.Add('        Remove-Item -Path $extractRoot -Recurse -Force')
    $generatedLines.Add('    }')
    $generatedLines.Add('}')

    $scriptContent = ([string]::Join([Environment]::NewLine, $generatedLines)).Replace('__PAYLOAD_SHA256__', $zipSha256) + [Environment]::NewLine

    $header = @(
        "# $InstallerName"
        "# Generated by .github/scripts/build-single-installer.ps1"
        "# Generated at: $generatedAt"
        "# Source: $SourceDir"
        "# Payload files: $payloadFileCount"
        "# Payload SHA256: $zipSha256"
        ""
    ) -join [Environment]::NewLine

    $utf8Bom = [System.Text.UTF8Encoding]::new($true)
    [System.IO.File]::WriteAllText($outputFile, $header + $scriptContent, $utf8Bom)

    Write-Host "Built single-file installer: $outputFile" -ForegroundColor Green
    Write-Host "Payload SHA256: $zipSha256" -ForegroundColor Green
}
finally {
    if (Test-Path $tempRoot) {
        Remove-Item -Path $tempRoot -Recurse -Force
    }
}
