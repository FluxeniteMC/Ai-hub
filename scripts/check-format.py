#!/usr/bin/env python3
"""
✅ Markdown Table Format Checker
Validates that README.md table rows are properly formatted
"""

import re
import sys

def check_readme_format(filepath="README.md"):
    with open(filepath, "r") as f:
        content = f.read()

    lines = content.split("\n")
    errors = []
    warnings = []
    in_table = False
    table_cols = 0

    for i, line in enumerate(lines, 1):
        # Detect table rows
        if line.startswith("|") and line.endswith("|"):
            parts = [p.strip() for p in line.split("|")[1:-1]]
            
            if not in_table:
                in_table = True
                table_cols = len(parts)
            elif "---" not in line:
                # Check column count
                if len(parts) != table_cols:
                    errors.append(f"Line {i}: Column count mismatch (expected {table_cols}, got {len(parts)})")
                
                # Check for empty required cells
                if parts and not parts[0]:
                    warnings.append(f"Line {i}: Empty first column")
                
                # Check for markdown link in first column (API name)
                if parts and parts[0] and not re.match(r'\[.+\]\(https?://.+\)', parts[0]):
                    if not parts[0].startswith("**"):  # allow bold headers
                        warnings.append(f"Line {i}: First column may be missing a markdown link: {parts[0][:40]}")
        else:
            in_table = False
            table_cols = 0

    # Report
    print(f"✅ Format check complete")
    print(f"   Errors:   {len(errors)}")
    print(f"   Warnings: {len(warnings)}")

    if warnings:
        print("\n⚠️  Warnings:")
        for w in warnings[:20]:
            print(f"  {w}")

    if errors:
        print("\n❌ Errors:")
        for e in errors:
            print(f"  {e}")
        sys.exit(1)
    else:
        print("\n🎉 All tables are properly formatted!")

if __name__ == "__main__":
    check_readme_format()
