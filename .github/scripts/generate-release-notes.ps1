param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("resonance", "modulation", "installers")]
    [string]$ReleaseClass,

    [ValidateSet("manual", "changelog", "commits", "auto")]
    [string]$NotesSource = "auto",

    [string]$Tag = "",

    [string]$Ref = "HEAD",

    [string]$UserNotes = "",

    [Parameter(Mandatory = $true)]
    [string]$OutputPath,

    [int]$MaxChangelogEntries = 5,

    [int]$MaxCommitGroups = 5,

    [int]$MaxCommits = 20
)

$ErrorActionPreference = "Stop"
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "../.."))

function Resolve-OutputPath([string]$Path) {
    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $repoRoot $Path))
}

function Invoke-GitCapture {
    param([string[]]$CommandArgs)

    $output = & git -C $repoRoot @CommandArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "git command failed: git $($CommandArgs -join ' ')`n$output"
    }
    return [string[]]$output
}

function Get-ReleaseClassConfig([string]$Class) {
    switch ($Class) {
        "resonance" {
            return @{
                DisplayName = "Resonance"
                TagPrefix = "resonance-"
                ChangelogLabel = "Resonance"
                Pathspecs = @("02_Resonance")
                PreferredSource = "changelog"
                InstallerKeywordRegex = $null
            }
        }
        "modulation" {
            return @{
                DisplayName = "Modulation"
                TagPrefix = "modulation-"
                ChangelogLabel = "Modulation"
                Pathspecs = @("03_Modulation")
                PreferredSource = "changelog"
                InstallerKeywordRegex = $null
            }
        }
        "installers" {
            return @{
                DisplayName = "Installers"
                TagPrefix = "installer-"
                ChangelogLabel = "Modulation"
                Pathspecs = @(
                    "03_Modulation/Prism-Engine-V7.x-Installer",
                    "03_Modulation/Prism-Engine-V8.x-Installer",
                    ".github/scripts/build-single-installer.ps1",
                    ".github/scripts/build-installer-assets.ps1",
                    ".github/release/installers.json",
                    ".github/workflows/release-installers.yml"
                )
                PreferredSource = "commits"
                InstallerKeywordRegex = '(?i)(installer|singleinstaller|prism-engine-v7\.x-installer|prism-engine-v8\.x-installer|rules-prism)'
            }
        }
    }
}

function Get-PreviousReleaseTag([hashtable]$Config, [string]$CurrentTag) {
    $tags = Invoke-GitCapture -CommandArgs @("tag", "--list", "$($Config.TagPrefix)*", "--sort=-creatordate")
    foreach ($tag in $tags) {
        $trimmed = $tag.Trim()
        if (-not $trimmed) {
            continue
        }
        if ($CurrentTag -and $trimmed -eq $CurrentTag) {
            continue
        }
        return $trimmed
    }
    return $null
}

function Get-RangeCommitSet([string]$PreviousTag, [string]$RefSpec) {
    $args = @("rev-list")
    if ($PreviousTag) {
        $args += "$PreviousTag..$RefSpec"
    }
    else {
        $args += $RefSpec
    }

    $commits = Invoke-GitCapture -CommandArgs $args
    return [System.Collections.Generic.HashSet[string]]::new([string[]]($commits | Where-Object { $_.Trim() }))
}

function Get-CommitSummary([hashtable]$Config, [string]$PreviousTag, [string]$RefSpec, [int]$MaxGroups, [int]$MaxItems) {
    $args = @("log", "--no-merges", "--format=%H%x09%s")
    if ($PreviousTag) {
        $args += "$PreviousTag..$RefSpec"
    }
    else {
        $args += $RefSpec
    }
    $args += "--"
    $args += $Config.Pathspecs

    $lines = Invoke-GitCapture -CommandArgs $args | Where-Object { $_.Trim() }
    if (-not $lines) {
        return $null
    }

    $typeOrder = @("Added", "Fixed", "Refactored", "Documentation", "Maintenance", "Other")
    $groups = [ordered]@{}
    foreach ($typeName in $typeOrder) {
        $groups[$typeName] = New-Object System.Collections.Generic.List[string]
    }

    foreach ($line in $lines | Select-Object -First $MaxItems) {
        $parts = $line -split "`t", 2
        if ($parts.Count -ne 2) {
            continue
        }

        $sha = $parts[0].Substring(0, [Math]::Min(7, $parts[0].Length))
        $subject = $parts[1]
        $bucket = "Other"
        $rendered = "- $subject (`sha: $sha`)"

        if ($subject -match '^(?<type>[a-zA-Z]+)(\((?<scope>[^)]+)\))?(!)?: (?<desc>.+)$') {
            $type = $Matches.type.ToLowerInvariant()
            $scope = $Matches.scope
            $desc = $Matches.desc

            switch ($type) {
                "feat" { $bucket = "Added" }
                "fix" { $bucket = "Fixed" }
                "refactor" { $bucket = "Refactored" }
                "docs" { $bucket = "Documentation" }
                "chore" { $bucket = "Maintenance" }
                "ci" { $bucket = "Maintenance" }
                "build" { $bucket = "Maintenance" }
                "test" { $bucket = "Maintenance" }
                default { $bucket = "Other" }
            }

            if ($scope) {
                $rendered = "- $desc (`scope: $scope`, `sha: $sha`)"
            }
            else {
                $rendered = "- $desc (`sha: $sha`)"
            }
        }

        $groups[$bucket].Add($rendered)
    }

    $sections = New-Object System.Collections.Generic.List[string]
    $sections.Add("## Commit Highlights")
    $emitted = 0

    foreach ($typeName in $typeOrder) {
        if ($groups[$typeName].Count -eq 0) {
            continue
        }

        $sections.Add("")
        $sections.Add("### $typeName")
        foreach ($item in $groups[$typeName]) {
            $sections.Add($item)
        }

        $emitted++
        if ($emitted -ge $MaxGroups) {
            break
        }
    }

    if ($lines.Count -gt $MaxItems) {
        $sections.Add("")
        $sections.Add("_Additional filtered commits omitted after the first $MaxItems entries._")
    }

    return ($sections -join "`n")
}

function Get-ChangelogEntries([string[]]$Lines) {
    $entries = New-Object System.Collections.Generic.List[object]
    $current = $null

    foreach ($line in $Lines) {
        if ($line -match '^##\s+(.+)$') {
            if ($current) {
                $entries.Add([pscustomobject]$current)
            }
            $current = @{
                Title = $Matches[1].Trim()
                Lines = New-Object System.Collections.Generic.List[string]
            }
            continue
        }

        if ($current) {
            $current.Lines.Add($line)
        }
    }

    if ($current) {
        $entries.Add([pscustomobject]$current)
    }

    return $entries
}

function Split-ChangelogSubsections([string[]]$Lines) {
    $sections = New-Object System.Collections.Generic.List[object]
    $current = $null

    foreach ($line in $Lines) {
        if ($line -match '^###\s+(.+)$') {
            if ($current) {
                $sections.Add([pscustomobject]$current)
            }
            $current = @{
                Heading = $Matches[1].Trim()
                Lines = New-Object System.Collections.Generic.List[string]
            }
            continue
        }

        if ($current) {
            $current.Lines.Add($line)
        }
    }

    if ($current) {
        $sections.Add([pscustomobject]$current)
    }

    return $sections
}

function Get-ChangelogSummary([hashtable]$Config, [System.Collections.Generic.HashSet[string]]$CommitSet, [int]$MaxEntries) {
    $changelogPath = Join-Path $repoRoot "CHANGELOG.md"
    if (-not (Test-Path $changelogPath)) {
        return $null
    }

    $lines = Get-Content $changelogPath
    $entries = Get-ChangelogEntries $lines
    $blocks = New-Object System.Collections.Generic.List[string]

    foreach ($entry in $entries) {
        $gitLine = $entry.Lines | Where-Object { $_ -match '^>\s+Git:' } | Select-Object -First 1
        $entryHashes = @()
        if ($gitLine) {
            $entryHashes = [regex]::Matches($gitLine, '\b[0-9a-f]{7,40}\b') | ForEach-Object { $_.Value }
        }

        $subsections = Split-ChangelogSubsections $entry.Lines
        $selectedSections = New-Object System.Collections.Generic.List[string]

        foreach ($subsection in $subsections) {
            $joined = (($subsection.Heading) + "`n" + (($subsection.Lines -join "`n"))).Trim()

            if ($ReleaseClass -eq "installers") {
                if ($subsection.Heading -match '\[Modulation\]' -and $joined -match $Config.InstallerKeywordRegex) {
                    $selectedSections.Add(("### " + $subsection.Heading + "`n" + (($subsection.Lines -join "`n").Trim())))
                }
            }
            elseif ($subsection.Heading -match "\[$([regex]::Escape($Config.ChangelogLabel))\]") {
                $selectedSections.Add(("### " + $subsection.Heading + "`n" + (($subsection.Lines -join "`n").Trim())))
            }
        }

        if ($selectedSections.Count -eq 0) {
            continue
        }

        $includeEntry = $false
        if ($CommitSet.Count -gt 0 -and $entryHashes.Count -gt 0) {
            foreach ($hash in $entryHashes) {
                if ($CommitSet.Contains($hash)) {
                    $includeEntry = $true
                    break
                }
                foreach ($commit in $CommitSet) {
                    if ($commit.StartsWith($hash, [System.StringComparison]::OrdinalIgnoreCase)) {
                        $includeEntry = $true
                        break
                    }
                }
                if ($includeEntry) {
                    break
                }
            }
        }
        elseif ($CommitSet.Count -eq 0) {
            $includeEntry = $true
        }

        if (-not $includeEntry) {
            continue
        }

        $entryLines = New-Object System.Collections.Generic.List[string]
        $entryLines.Add("### $($entry.Title)")
        if ($gitLine) {
            $entryLines.Add("")
            $entryLines.Add($gitLine)
        }
        foreach ($sectionText in $selectedSections) {
            $entryLines.Add("")
            $entryLines.Add($sectionText)
        }

        $blocks.Add(($entryLines -join "`n"))
        if ($blocks.Count -ge $MaxEntries) {
            break
        }
    }

    if ($blocks.Count -eq 0) {
        return $null
    }

    return "## Changelog Highlights`n`n" + ($blocks -join "`n`n")
}

$config = Get-ReleaseClassConfig $ReleaseClass
$resolvedOutputPath = Resolve-OutputPath $OutputPath
$outputDir = Split-Path -Parent $resolvedOutputPath
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

$headSha = (Invoke-GitCapture -CommandArgs @("rev-parse", "--short", $Ref) | Select-Object -First 1).Trim()
$previousTag = Get-PreviousReleaseTag -Config $config -CurrentTag $Tag
$commitSet = Get-RangeCommitSet -PreviousTag $previousTag -RefSpec $Ref

$effectiveSource = $NotesSource
$generatedBody = $null

switch ($NotesSource) {
    "manual" {
        $generatedBody = $null
    }
    "changelog" {
        $generatedBody = Get-ChangelogSummary -Config $config -CommitSet $commitSet -MaxEntries $MaxChangelogEntries
    }
    "commits" {
        $generatedBody = Get-CommitSummary -Config $config -PreviousTag $previousTag -RefSpec $Ref -MaxGroups $MaxCommitGroups -MaxItems $MaxCommits
    }
    "auto" {
        if ($config.PreferredSource -eq "changelog") {
            $generatedBody = Get-ChangelogSummary -Config $config -CommitSet $commitSet -MaxEntries $MaxChangelogEntries
            if ($generatedBody) {
                $effectiveSource = "changelog"
            }
            else {
                $generatedBody = Get-CommitSummary -Config $config -PreviousTag $previousTag -RefSpec $Ref -MaxGroups $MaxCommitGroups -MaxItems $MaxCommits
                $effectiveSource = "commits"
            }
        }
        else {
            $generatedBody = Get-CommitSummary -Config $config -PreviousTag $previousTag -RefSpec $Ref -MaxGroups $MaxCommitGroups -MaxItems $MaxCommits
            if ($generatedBody) {
                $effectiveSource = "commits"
            }
            else {
                $generatedBody = Get-ChangelogSummary -Config $config -CommitSet $commitSet -MaxEntries $MaxChangelogEntries
                $effectiveSource = "changelog"
            }
        }
    }
}

$lines = New-Object System.Collections.Generic.List[string]
if ($UserNotes) {
    $lines.Add($UserNotes.TrimEnd())
    $lines.Add("")
}

$lines.Add("Release class: $($config.DisplayName)")
if ($Tag) {
    $lines.Add("Tag: $Tag")
}
$lines.Add("Notes source: $effectiveSource")
$lines.Add("Commit: $headSha")
if ($previousTag) {
    $lines.Add("Previous class tag: $previousTag")
}
else {
    $lines.Add("Previous class tag: (none)")
}

if ($generatedBody) {
    $lines.Add("")
    $lines.Add($generatedBody)
}
elseif ($NotesSource -ne "manual") {
    $lines.Add("")
    $lines.Add("_No matching changelog sections or filtered commits were found for this release class._")
}

Set-Content -Path $resolvedOutputPath -Value ($lines -join "`n") -Encoding UTF8
