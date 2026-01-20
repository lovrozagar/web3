#!/bin/bash

# Generate COMMITS.md with colored type indicators
# Format: {number}. {date} `{hash}` {type_emoji} {message}

OUTPUT_FILE="COMMITS.md"

get_emoji() {
  case "$1" in
    feat*) echo "🟢" ;;
    fix*) echo "🔴" ;;
    chore*) echo "🟡" ;;
    refactor*) echo "🔵" ;;
    perf*) echo "⚡" ;;
    test*) echo "🧪" ;;
    docs*) echo "📝" ;;
    build*) echo "📦" ;;
    style*) echo "🎨" ;;
    config*) echo "⚙️" ;;
    *) echo "⚪" ;;
  esac
}

commits=()
count=1
while IFS= read -r line; do
  date=$(echo "$line" | cut -d' ' -f1)
  hash=$(echo "$line" | cut -d' ' -f2)
  message=$(echo "$line" | cut -d' ' -f3-)
  emoji=$(get_emoji "$message")
  commits+=("${count}. ${date} \`${hash}\` ${emoji} ${message}")
  ((count++))
done < <(git log --format="%ad %h %s" --date=short --reverse)

echo "# Commits" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

for ((i=${#commits[@]}-1; i>=0; i--)); do
  echo "${commits[i]}" >> "$OUTPUT_FILE"
done

echo "Generated $OUTPUT_FILE with $((count-1)) commits"
