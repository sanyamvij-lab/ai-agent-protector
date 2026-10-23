#!/usr/bin/env python3
"""
AI Protector — Agent Skills & Instruction Static Security Scanner (§8.6)
Implements SkillSpector-aligned static analysis rules for agent skills, prompt injection,
exfiltration hooks, dangerous execution, and secret exposure.
"""

import os
import re
import sys
from pathlib import Path

RULES = [
    {
        "id": "SKILL-INJ-001",
        "name": "Prompt Injection / Instruction Override",
        "severity": "CRITICAL",
        "pattern": re.compile(
            r"(ignore\s+(all\s+)?previous\s+instructions|system\s+prompt\s+override|disregard\s+all\s+prior\s+guidance|bypass\s+all\s+safety)",
            re.IGNORECASE,
        ),
    },
    {
        "id": "SKILL-EXFIL-001",
        "name": "Covert Data Exfiltration Command",
        "severity": "CRITICAL",
        "pattern": re.compile(
            r"(curl\s+-[A-Za-z0-9]*d\s+[@\$]|wget\s+--post-data|webhook\.site|pipedream\.net|ngrok-free\.app)",
            re.IGNORECASE,
        ),
    },
    {
        "id": "SKILL-EXEC-001",
        "name": "Arbitrary Shell Execution Pipe",
        "severity": "HIGH",
        "pattern": re.compile(
            r"(curl\s+[^\|]+\|\s*(ba)?sh|wget\s+[^\|]+\|\s*(ba)?sh)",
            re.IGNORECASE,
        ),
    },
    {
        "id": "SKILL-CRED-001",
        "name": "Sensitive Credential Path Access",
        "severity": "HIGH",
        "pattern": re.compile(
            r"(\.ssh/id_rsa|\.aws/credentials|\.gnupg/secring|\.config/gcloud/credentials)",
            re.IGNORECASE,
        ),
    },
    {
        "id": "SKILL-SEC-001",
        "name": "Hardcoded API Key Pattern",
        "severity": "CRITICAL",
        "pattern": re.compile(
            r"(AIzaSy[A-Za-z0-9_-]{33}|sk-[A-Za-z0-9]{32,}|ghp_[A-Za-z0-9]{36})",
        ),
    },
]

def scan_file(filepath: Path):
    findings = []
    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        return findings

    lines = content.splitlines()
    for idx, line in enumerate(lines, 1):
        for rule in RULES:
            match = rule["pattern"].search(line)
            if match:
                findings.append({
                    "rule_id": rule["id"],
                    "rule_name": rule["name"],
                    "severity": rule["severity"],
                    "file": str(filepath),
                    "line": idx,
                    "matched_text": match.group(0)[:80],
                })
    return findings

def main():
    root = Path(".")
    targets = [
        root / "AGENTS.md",
        root / ".agents",
    ]

    scanned_count = 0
    all_findings = []

    for target in targets:
        if target.is_file():
            scanned_count += 1
            all_findings.extend(scan_file(target))
        elif target.is_dir():
            for p in target.rglob("*"):
                if p.is_file() and p.suffix.lower() in [".md", ".json", ".yaml", ".yml", ".py", ".sh", ".js", ".ts"]:
                    # Skip git internals
                    if ".git" in p.parts:
                        continue
                    scanned_count += 1
                    all_findings.extend(scan_file(p))

    print(f"=== SkillSpector-Aligned Static Skill Audit ===")
    print(f"Total agent files/skills scanned: {scanned_count}")
    print(f"Total findings detected: {len(all_findings)}")
    print("-------------------------------------------------")

    critical_count = sum(1 for f in all_findings if f["severity"] == "CRITICAL")
    high_count = sum(1 for f in all_findings if f["severity"] == "HIGH")

    for f in all_findings:
        print(f"[{f['severity']}] {f['rule_id']}: {f['rule_name']}")
        print(f"  File: {f['file']}:{f['line']}")
        print(f"  Snippet: {f['matched_text']}")
        print()

    print(f"Audit Summary: {critical_count} Critical, {high_count} High")
    if critical_count > 0:
        print("FAIL: Critical security findings detected in agent skills.")
        sys.exit(1)
    else:
        print("PASS: Zero critical security risks detected in agent skills.")
        sys.exit(0)

if __name__ == "__main__":
    main()
