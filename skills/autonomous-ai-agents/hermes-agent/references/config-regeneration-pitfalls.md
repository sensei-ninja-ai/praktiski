# Config Regeneration Pitfalls: Real Incident Log

## Incident Summary

**Date:** 2026-05-14  
**Trigger:** Sub-agent ran `hermes update` → which triggered `hermes auth` for Nous Portal  
**Result:** Entire `config.yaml` was regenerated with defaults, overwriting all user customizations.

## Before / After

| Setting | Before (user's config) | After (regenerated default) |
|---------|----------------------|----------------------------|
| `model.provider` | `openrouter` (inferred from usage) | `nous` |
| `model.default` | `moonshotai/kimi-k2.6` (user's working model) | `stepfun/step-3.5-flash` |
| `display.busy_input_mode` | `queue` (user preference) | `interrupt` |
| `display.compact` | Unknown user setting | `false` (default) |
| `display.show_reasoning` | Unknown user setting | `false` (default) |
| `agent.max_turns` | Unknown user setting | `90` (default) |
| `terminal.timeout` | Unknown user setting | `180` (default) |

## Root Cause Chain

1. User asked to "kjør update" (run update)
2. Orchestrator spawned sub-agent to run `hermes update`
3. `hermes update` attempted to run but was blocked by system
4. However, at some point `hermes auth` was triggered for Nous Portal (timestamp 2026-05-14T13:56:04)
5. Nous Portal OAuth flow minted a new agent key (`sk-nou...i6xH`)
6. Agent key write triggered full config.yaml regeneration
7. All user customizations were lost; only `onboarding.seen` survived because it's appended at the bottom

## Why This Happens

When OAuth providers mint or refresh an agent key, Hermes writes a fresh `config.yaml` using `DEFAULT_CONFIG` from `hermes_cli/config.py` merged with provider-specific defaults. There is no "preserve existing values" logic — the file is rewritten from scratch.

## Prevention Checklist

- [ ] Before `hermes update`: `cp ~/.hermes/config.yaml ~/.hermes/config.yaml.backup`
- [ ] Before `hermes auth` (any provider): same backup
- [ ] After update/auth: `hermes config get model.provider` and `hermes config get model.default` to verify
- [ ] If changed: restore from backup immediately
- [ ] Never run `hermes update` or `hermes auth` via sub-agent without explicit user approval

## Recovery Without Backup

If config was already overwritten and no backup exists:

1. Check `~/.hermes/auth.json` — credential pools and provider tokens usually survive
2. Check `~/.hermes/.env` — API keys are stored separately
3. Run `hermes model` to re-select your preferred model
4. Re-apply custom settings:
   ```bash
   hermes config set display.busy_input_mode queue
   hermes config set display.compact true   # if you used it
   ```
5. Check `hermes config check` for any other missing/outdated keys

## Related Files

- `~/.hermes/config.yaml` — main config (gets regenerated)
- `~/.hermes/.env` — API keys (usually survives)
- `~/.hermes/auth.json` — OAuth tokens and credential pools (usually survives)
- `~/.hermes/hermes_cli/config.py` — source of `DEFAULT_CONFIG` defaults

## Lesson

Config regeneration is a **destructive, non-obvious side effect** of OAuth authentication in Hermes. Treat every `hermes auth` and `hermes update` as a potential config overwrite event. Always backup first, verify after.
