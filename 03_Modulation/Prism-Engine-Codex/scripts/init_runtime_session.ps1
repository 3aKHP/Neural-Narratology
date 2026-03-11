param(
    [Parameter(Mandatory = $true)]
    [string]$SessionName,

    [Parameter(Mandatory = $true)]
    [string]$CharacterCard,

    [Parameter(Mandatory = $true)]
    [string]$ScenarioCard
)

$ErrorActionPreference = "Stop"

$engineRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$sessionFile = Join-Path $engineRoot "test_runs/${SessionName}_log.md"

@"
# Runtime Session: $SessionName

- Character Card: `$CharacterCard`
- Scenario Card: `$ScenarioCard`
- Status: Initialized

## Turn 0
### System
- Read `workspace/$CharacterCard`
- Read `workspace/$ScenarioCard`
- Prepare opening response

### User
[Pending user input]
"@ | Set-Content -Path $sessionFile -Encoding UTF8

Write-Output "Initialized runtime session: $sessionFile"
