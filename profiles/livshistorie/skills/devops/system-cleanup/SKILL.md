---
name: system-cleanup
description: Diagnose disk usage and clean up large directories on WSL/Linux. Fast diagnostic workflow for space hogs, Git bloat, old backups, and workspace copies.
title: System Cleanup and Disk Diagnostic
trigger: |
  User asks about disk usage, "what's taking up space", "clean up", "rydde",
  "free up disk", large folders, or wants to inspect any directory's size.
  Also trigger for WSL-specific path questions or Git repo bloat.
---

# System Cleanup and Disk Diagnostic

## When This Applies

- User asks "what's taking up space", "hva tar mest plass", "rydde disk"
- Inspecting any directory (especially `~/.hermes`, `~`, `/mnt/c/`)
- Git repo has grown unexpectedly large
- Need to clean old backups, checkpoints, or workspace copies

## Workflow — Fast Diagnostic

1. **Top-level scan** (instant): `du -sh <path>/*/` — shows which subdirs are big.
2. **Deep scan** (5-10 sec): `du -h --max-depth=2 <path>` — drill into the biggest offenders.
3. **Age check**: `ls -ld <path>/subdir/*` — identify what's old vs. fresh.
4. **Recommend and ask** — present a table of candidates with size, date, and keep/delete recommendation. Ask before deleting anything irreversible.

## WSL-Specific Paths

- Windows C: drive is at `/mnt/c/`
- User's Windows Desktop: `/mnt/c/Users/<username>/Desktop/`
- Hermes lives at `~/.hermes` (typically `/home/<user>/.hermes`)
- For user-facing deliverables, save to Windows Desktop, NOT WSL home.

## Common Bloat Sources on This System

| Source | Typical Fix |
|--------|-------------|
| `.git/objects` huge | `git gc --aggressive` inside the repo |
| Old `pre-update` backups | Safe to delete if >2 weeks old and newer backups exist |
| `workspace.bak.*` copies | Safe if there's a current `workspace/` and the backup is old |
| Legacy checkpoints | Keep if recent; evaluate age before deleting |
| Daily backups (tiny .json) | Not worth deleting individually; purge in bulk by date |

## User Style Preference

This user gets impatient with slow, verbose diagnostics. Move fast:
- Run the diagnostic commands immediately, don't narrate each step beforehand.
- Present findings in a compact table, not prose.
- One concise question at the end: "Vil du at jeg kjører oppryddingen nå?"

## Safety Rules

- Never delete before verifying age and purpose.
- Never delete the most recent backup/checkpoint unless user explicitly confirms.
- For Git cleanup, `git gc` is safe; `git repack` is more aggressive — ask first.
