#!/bin/bash

# Loop through all .webp files in the current directory
for file in *.webp; do
    # Skip if no .webp files found
    [ -e "$file" ] || continue

    # Remove spaces from base name (without extension)
    base="${file%.webp}"
    clean_base="${base// /}"
    output="${clean_base}.png"  # Change to .jpg if needed

    # Convert using dwebp
    dwebp "$file" -o "$output"

    # Check result
    if [ $? -eq 0 ]; then
        echo "Converted: '$file' -> '$output'"
    else
        echo "Failed to convert: '$file'"
    fi
done

for file in *_1.png; do
    # Skip if no .webp files found
    [ -e "$file" ] || continue
    new_name="${file/_1.png/.png}"
    git mv "$file" "$new_name"
done
