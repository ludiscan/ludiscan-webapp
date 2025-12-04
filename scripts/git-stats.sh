#!/bin/bash

# Git Statistics Generator
# Generates code statistics from git history
# Excludes: package.json, lock files, generated files

set -e

OUTPUT_FILE="${1:-STATS.md}"

# Exclusion patterns
EXCLUDE_PATTERNS=(
  ':!package.json'
  ':!package-lock.json'
  ':!bun.lockb'
  ':!bun.lock'
  ':!*.lock'
  ':!generated/*'
  ':!*.snap'
)

get_total_stats() {
  git log --use-mailmap --numstat --format='' -- . "${EXCLUDE_PATTERNS[@]}" | \
    awk 'NF==3 && $1 ~ /^[0-9]+$/ {added+=$1; deleted+=$2} END {
      printf "%d %d %d", added, deleted, added-deleted
    }'
}

get_author_stats() {
  local author="$1"
  git log --use-mailmap --author="$author" --numstat --format='' -- . "${EXCLUDE_PATTERNS[@]}" | \
    awk 'NF==3 && $1 ~ /^[0-9]+$/ {added+=$1; deleted+=$2} END {
      printf "%d %d %d", added, deleted, added-deleted
    }'
}

get_author_commits() {
  local author="$1"
  git log --all --format='%aN' | grep -Fxc "$author"
}

get_file_type_stats() {
  git log --numstat --format='' -- . "${EXCLUDE_PATTERNS[@]}" | \
    awk 'NF==3 && $1 ~ /^[0-9]+$/ {
      file=$3
      if (match(file, /\.[^.\/]+$/)) {
        ext=substr(file, RSTART)
      } else {
        ext="(no ext)"
      }
      added[ext]+=$1
      deleted[ext]+=$2
    }
    END {
      for (e in added) print added[e], deleted[e], e
    }' | sort -rn
}

format_number() {
  printf "%'d" "$1" 2>/dev/null || printf "%d" "$1"
}

# Generate report
{
  echo "# Git Statistics"
  echo ""
  echo "> Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo ">"
  echo "> Branch: $(git branch --show-current)"
  echo ">"
  echo "> Commit: $(git rev-parse --short HEAD)"
  echo ""

  # Total stats
  echo "## Overall Statistics"
  echo ""
  echo "Excludes: \`package.json\`, lock files, \`generated/*\`, \`*.snap\`"
  echo ""

  read -r total_added total_deleted total_net <<< "$(get_total_stats)"

  echo "| Metric | Lines |"
  echo "|--------|------:|"
  echo "| Added | $(format_number "$total_added") |"
  echo "| Deleted | $(format_number "$total_deleted") |"
  echo "| **Net** | **$(format_number "$total_net")** |"
  echo ""

  # Author stats
  echo "## By Author"
  echo ""
  echo "| Author | Commits | Added | Deleted | Net |"
  echo "|--------|--------:|------:|--------:|----:|"

  # Get unique authors (excluding bots)
  git log --all --format='%aN' | sort -u | grep -v -E '\[bot\]$' | while read -r author; do
    commits=$(get_author_commits "$author")
    if [ "$commits" -gt 0 ]; then
      read -r added deleted net <<< "$(get_author_stats "$author")"
      if [ -n "$added" ] && [ "$added" -gt 0 ]; then
        echo "| $author | $(format_number "$commits") | $(format_number "$added") | $(format_number "$deleted") | $(format_number "$net") |"
      fi
    fi
  done | sort -t'|' -k3 -rn

  echo ""

  # File type stats
  echo "## By File Type"
  echo ""
  echo "| Extension | Added | Deleted | Net |"
  echo "|-----------|------:|--------:|----:|"

  get_file_type_stats | head -15 | while read -r added deleted ext; do
    net=$((added - deleted))
    echo "| \`$ext\` | $(format_number "$added") | $(format_number "$deleted") | $(format_number "$net") |"
  done

  echo ""

  # Code-only stats (ts/tsx)
  echo "## TypeScript/TSX Only"
  echo ""

  ts_stats=$(git log --numstat --format='' -- '*.ts' '*.tsx' "${EXCLUDE_PATTERNS[@]}" | \
    awk 'NF==3 && $1 ~ /^[0-9]+$/ {added+=$1; deleted+=$2} END {
      printf "%d %d %d", added, deleted, added-deleted
    }')

  read -r ts_added ts_deleted ts_net <<< "$ts_stats"

  echo "| Metric | Lines |"
  echo "|--------|------:|"
  echo "| Added | $(format_number "$ts_added") |"
  echo "| Deleted | $(format_number "$ts_deleted") |"
  echo "| **Net** | **$(format_number "$ts_net")** |"
  echo ""

  # Recent activity (last 30 days)
  echo "## Recent Activity (Last 30 Days)"
  echo ""

  recent_stats=$(git log --since="30 days ago" --numstat --format='' -- . "${EXCLUDE_PATTERNS[@]}" | \
    awk 'NF==3 && $1 ~ /^[0-9]+$/ {added+=$1; deleted+=$2} END {
      printf "%d %d %d", added, deleted, added-deleted
    }')

  read -r recent_added recent_deleted recent_net <<< "$recent_stats"
  recent_commits=$(git rev-list --since="30 days ago" --count HEAD)

  echo "| Metric | Value |"
  echo "|--------|------:|"
  echo "| Commits | $(format_number "$recent_commits") |"
  echo "| Added | $(format_number "$recent_added") |"
  echo "| Deleted | $(format_number "$recent_deleted") |"
  echo "| **Net** | **$(format_number "$recent_net")** |"

} > "$OUTPUT_FILE"

echo "Stats generated: $OUTPUT_FILE"
