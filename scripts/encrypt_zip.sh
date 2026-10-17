#!/bin/bash
PASSWORD=${1:-"BookLeaf2026Secure!"}
OUTPUT_ZIP="bookleaf-submission-encrypted.zip"

echo "Creating encrypted ZIP archive: $OUTPUT_ZIP"
rm -f "$OUTPUT_ZIP"

zip -q -r -P "$PASSWORD" "$OUTPUT_ZIP" . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".git/*" \
  -x "*.zip" \
  -x ".DS_Store" \
  -x "*.log"

echo "Encrypted ZIP created successfully: $OUTPUT_ZIP"
echo "Password: $PASSWORD"
