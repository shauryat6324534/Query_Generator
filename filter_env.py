#!/usr/bin/env python3
"""Filter script to remove secrets from .env files in git history."""
import sys
import os

# Read the file content
file_path = sys.argv[1]
secret_patterns = [
    'GEMINI_API_KEY=',  # Google AI Studio
    'OPENROUTER_API_KEY=sk-or-v1-',  # OpenRouter keys starting with sk-or-v1-
]

with open(file_path, 'r') as f:
    content = f.read()

# Remove only secret patterns, preserve everything else
for pattern in secret_patterns:
    content = content.replace(pattern, 'xxx_xxx_xxx_xxx_xxx')

# Write back
with open(file_path, 'w') as f:
    f.write(content)