---
name: multi-skill-pipeline
description: Run multiple skills in a compounding chain where each skill's verified output becomes the next skill's input. For content production pipelines where research → assets → content → layout → distribution must all be coordinated and each step's output validated before the next begins.
version: 1.0.0
author: hermes-internal
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [pipeline, compounding, multi-skill, orchestration, content-production]
    related_skills: [kanban-orchestrator, systematic-debugging]
---

# Multi-Skill Pipeline

A compounding workflow where each skill's verified output feeds into the next skill. Designed for content production, research-to-delivery pipelines, and systematic skill testing.

## When to Use This

Use this pattern when:
- A task requires multiple skills in sequence, each depending on prior output
- You want to test a chain of skills working together
- Content must flow through: research → assets → content → layout → distribution
- You need verifiable checkpoints between steps

Do NOT use this when:
- The task is a single skill invocation
- Steps are independent and can run in parallel (use `delegate_task` batch instead)
- The user wants just the final output with no checkpoint visibility

## Pipeline Structure

```
01-input/        ← raw input: URL, PDF, video, text, file
02-research/     ← research-assistant: analyze, extract, summarize
03-assets/       ← hyperframes, meme-generation: create visuals
04-content/      ← ai-prompts-assistant, text-variator, copywriting: refine copy
05-layout/       ← markdown-layout: structure and format
06-distribution/ ← xurl, telephonics, himalaya: post and send
07-delivery/     ← final output to hermy desktop
```

Each step outputs to its folder. The next step reads from that folder. Every step must produce verified output before the pipeline advances.

## Running the Pipeline

### Full pipeline
```bash
# Create structure
mkdir -p ~/.hermes/pipelines/test-run/{01-input,02-research,03-assets,04-content,05-layout,06-distribution,07-delivery}

# Run each step sequentially, verifying output before advancing
# Step 1: Put input in 01-input/
# Step 2: Run research, output to 02-research/
# Step 3: Run asset creation, output to 03-assets/
# ... etc
```

### Segment pipeline (start from step N)
```bash
# If 02-research is done and verified, skip to 03-assets
cp pipelines/test-run/02-research/output.md pipelines/test-run/03-assets/input.md
```

### Single-skill test
```bash
# Test one skill in isolation with known input
cp test-data/04-content-sample.md pipelines/test-run/04-content/input.md
# Run the step and verify output
```

## Step-by-Step Procedure

### Step 0 — Define the pipeline
Before touching anything:
1. Identify the input type (URL, PDF, video, text)
2. Identify all skills needed in sequence
3. Map each skill to its pipeline step folder
4. Confirm with user: "Pipeline: research → assets → content → layout → distribution. Start?"
5. Create the folder structure

### Step 1 — Input (01-input/)
- Place raw input: URL (as `.url` file), PDF (copy to folder), video path, or text (as `.md`/`.txt`)
- If multiple inputs, number them: `input-01.pdf`, `input-02.url`
- Verify: file exists, readable, relevant to goal

### Step 2 — Research (02-research/)
- Load `research-assistant` skill
- Run research against input
- Output: summary, key findings, extracted data — as `.md` file
- Verify before advancing: does the output answer the core question? If not, re-run before proceeding.

### Step 3 — Assets (03-assets/)
- Load `hyperframes` and/or `meme-generation` as needed
- Create visual assets from research output
- Output: MP4, PNG, GIF — saved to folder
- Verify before advancing: asset renders, plays, or displays correctly. If using hyperframes: run `npx hyperframes lint` and check output file exists and is non-zero size.

### Step 4 — Content (04-content/)
- Load `ai-prompts-assistant`, `text-variator`, and/or `copywriting-top-master` (if installed)
- Refine, rewrite, vary the copy based on research and assets
- Output: refined text as `.md`
- Verify before advancing: copy is coherent, on-brand, ready for layout

### Step 5 — Layout (05-layout/)
- Load `markdown-layout`
- Apply structure and formatting to content
- Output: formatted document (HTML, MD, or PDF)
- Verify before advancing: document renders correctly, structure is clean

### Step 6 — Distribution (06-distribution/)
- Load skills for target platform: `xurl` (X/Twitter), `telephonics` (phone), `himalaya` (email), etc.
- Execute distribution: post, send, or schedule
- Output: delivery confirmation (URL, message ID, timestamp)
- Verify: delivery succeeded (check platform, confirm receipt)

### Step 7 — Delivery (07-delivery/)
- Copy final output to desktop: `/mnt/c/Users/krisf/Desktop/hermy desktop/`
- Include pipeline manifest: `pipeline-run-YYYYMMDD-HHMMSS.json` with step outputs and timestamps
- Notify user of completion

## Verification Gate

Before advancing from any step:
1. Output file exists and is non-empty
2. Content is relevant to the goal (not just noise)
3. Format is correct for next step's input requirements

If verification fails: fix the step before advancing. Do not carry bad output forward — it compounds.

## Testing Individual Skills

To test a single skill in isolation:
```bash
# 1. Create isolated test folder
mkdir -p ~/.hermes/pipelines/skill-tests/<skill-name>

# 2. Copy known-good input to 01-input/
cp /path/to/known-input.pdf pipelines/skill-tests/<skill-name>/01-input/

# 3. Run the skill against the input
# (load skill, run, save output to 02-output/)

# 4. Verify output
# - File exists: ls -lh
# - Content correct: read_file
# - Format valid: relevant check (lint, ffprobe, etc.)

# 5. Log result
echo "<skill-name> | PASS/FAIL | $(date)" >> ~/.hermes/pipelines/skill-tests/results.md
```

## Compounding Test Pattern

To test a skill chain (skills building on each other):
```bash
# Run skill A with test input
# Verify A's output
# Use A's output as input to skill B
# Verify B's output
# Use B's output as input to skill C
# ... and so on
```

Each successful step validates the chain can continue. Any failure halts the chain — fix and restart from the failing step with the same input.

## Directory Conventions

- All pipeline runs: `~/.hermes/pipelines/<pipeline-name>/`
- Desktop deliverables: `/mnt/c/Users/krisf/Desktop/hermy desktop/`
- Test results: `~/.hermes/pipelines/skill-tests/results.md`
- Never overwrite previous step outputs — each step writes to its own folder with timestamp

## Model Benchmarking

When setting up auxiliary models (vision, compression, web extraction), benchmark before committing. See `references/vision-model-benchmark.md` for the OpenRouter vision model comparison procedure. Key finding: `qwen/qwen3-vl-8b-instruct` at $0.08/1M tokens is sufficient for image analysis — no need for more expensive models.

## Pitfalls

- **Skipping verification** — bad output from step N becomes input to step N+1 and makes both fail. Always check.
- **Wrong input format for next step** — research output might need reformatting before assets can use it. Check next step's requirements.
- **Running full pipeline on untested input** — test each step individually before chaining. A broken input breaks every step.
- **Not cleaning previous run outputs** — leftover files from a failed run can confuse the next run. Use timestamped folders or clean between runs.