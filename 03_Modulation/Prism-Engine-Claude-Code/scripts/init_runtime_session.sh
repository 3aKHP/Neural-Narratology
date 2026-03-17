#!/usr/bin/env bash

set -euo pipefail

ENGINE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  echo "Usage: $(basename "$0") <session_name> <character_card> <scenario_card>" >&2
}

SESSION_NAME="${1:-}"
CHARACTER_CARD="${2:-}"
SCENARIO_CARD="${3:-}"

if [[ -z "$SESSION_NAME" || -z "$CHARACTER_CARD" || -z "$SCENARIO_CARD" ]]; then
  usage
  exit 1
fi

SESSION_FILE="$ENGINE_ROOT/test_runs/${SESSION_NAME}_log.md"

cat > "$SESSION_FILE" <<EOF
# Runtime Session: $SESSION_NAME

- Character Card: \`$CHARACTER_CARD\`
- Scenario Card: \`$SCENARIO_CARD\`
- Status: Initialized

## Turn 0
### System
- Read \`workspace/$CHARACTER_CARD\`
- Read \`workspace/$SCENARIO_CARD\`
- Prepare opening response

### User
[Pending user input]
EOF

echo "Initialized runtime session: $SESSION_FILE"
