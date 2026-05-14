# Hermes Disk Layout — Reference from 2026-05-14

Directory: `/home/krisf/.hermes` (total 18 GB)

## Largest Consumers

| Path | Size | Notes |
|------|------|-------|
| `.git/objects` | 9.9 GB | Git history of the Hermes installation itself |
| `checkpoints/legacy-20260514-160522` | 1.4 GB | Fersk legacy-checkpoint (keep) |
| `backups/pre-update-20260417-163652` | 1.2 GB | Pre-update backup, 4+ weeks old (safe to delete) |
| `backup/pre-update-20260413-151256` | 1.1 GB | Duplicate pre-update backup (safe to delete) |
| `workspace.bak.20260415221637` | 1.1 GB | Old workspace copy from 15 Apr (safe to delete) |
| `workspace/` | 1.1 GB | Active workspace (keep) |
| `backups/` (daily .json) | ~56K each | Tiny; not worth individual deletion |

## Backup Naming Convention

- `YYYY-MM-DD_HHMM_daily` — daily config snapshot
- `YYYY-MM-DD_HHMM_weekly` — weekly snapshot
- `YYYY-MM-DD_HHMM_monthly` — monthly snapshot
- `pre-update-YYYYMMDD-HHMMSS` — full pre-update backup (large)

## Git Cleanup

`git gc --aggressive` in `~/.hermes` can reclaim several GB from the 9.9 GB `.git/objects`.
