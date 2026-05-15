---
name: content-pipeline
description: Multi-stage compounding workflow where each skill stage builds on the previous output. Input drops in 01-input/, each stage reads the prior output, final delivery goes to 07-delivery/. Use when the user wants end-to-end production from raw material (URL, PDF, text, video) to distributed content.
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [workflow, pipeline, compounding, multi-stage]
    related_skills: [hyperframes, meme-generation, research-assistant, ai-prompts-assistant, markdown-layout, xurl, telephonics]
    requires_toolsets: [terminal, file]
---

# Content Pipeline

A compounding workflow where each skill stage consumes the previous stage's
output as its input. The pipeline turns raw material (PDF, URL, text, video)
into researched, visualized, formatted, and distributed content with minimal
manual intervention.

**Not for:** one-off tasks that don't compound. Use direct tool calls instead.

## When to Use

- User says "build a pipeline", "process this end-to-end", "run it through the workflow"
- Input material needs: research → visual creation → content variants → layout → distribution
- The same class of work will recur with different inputs

## Directory Structure

```
Desktop/hermy desktop/skills-pipeline/
├── 01-input/        ← Drop raw material here (PDF, URL, text, video, audio)
├── 02-research/    ← research-assistant output
├── 03-assets/       ← hyperframes (video) + meme-generation (images)
├── 04-content/     ← ai-prompts-assistant + text-variator variants
├── 05-layout/      ← markdown-layout builds structure
├── 06-distribution/ ← xurl posts + telephonics calls + himalaya email
├── 07-delivery/    ← Final report/product to desktop
├── pipeline.py      ← Main orchestrator
└── run-pipeline.sh  ← Bash entry point
```

**Output path:** `C:\Users\krisf\Desktop\hermy desktop\skills-pipeline\`

## Pipeline Stages

### Stage 1: Research
**Skill:** `research-assistant`
**Input:** Raw file from `01-input/`
**Output:** `02-research/report.md`

Task: Analyze input, produce structured research report with:
- Hovedpoeng (main findings)
- Nøkkelinzikter (key insights)
- Handlingspunkter (actionable items)
- Sources and references

### Stage 2: Assets
**Skills:** `hyperframes`, `meme-generation`
**Input:** `02-research/report.md`
**Output:** `03-assets/` (video + 3 shareable images)

Task: Create one captioned video (~15-30s) explaining key findings, plus
3 meme-style shareable images for social distribution.

### Stage 3: Content
**Skills:** `ai-prompts-assistant`, `text-variator`
**Input:** `02-research/report.md`
**Output:** `04-content/variants.md`

Task: Produce 5 distinct content variants:
- Tweet (280 chars)
- Blog post paragraph
- Email summary
- LinkedIn post
- Short video script

### Stage 4: Layout
**Skill:** `markdown-layout`
**Input:** `04-content/variants.md`
**Output:** `05-layout/final-document.md`

Task: Build clean structured document with proper headers, formatting,
and ready-for-distribution layout.

### Stage 5: Distribution
**Skills:** `xurl`, `telephonics`, `himalaya`
**Input:** `05-layout/final-document.md`
**Output:** `06-distribution/distribution-log.md`

Tasks:
1. Post to X via xurl (check `xurl auth status` first)
2. Initiate outreach call via telephonics
3. Send email summary via himalaya

### Stage 6: Delivery
**Input:** All stage outputs
**Output:** `07-delivery/pipeline-report.md`

Task: Compile all outputs into final report, save to desktop.

## Running the Pipeline

```bash
# Full pipeline (all 6 stages)
python pipeline.py

# Single stage
python pipeline.py 1   # research only
python pipeline.py 2   # assets only
python pipeline.py all # full, explicit

# Bash wrapper (alternative)
bash run-pipeline.sh
```

## Critical Notes

**Skip if output exists.** Each stage checks if its output file already exists
before running. Delete the output file to force re-run of that stage.

**Input detection:** Pipeline finds the newest file in `01-input/` automatically.
Drop one file at a time for clean runs.

**hermes chat flags:** Use `-Q` (quiet mode) for suppressed banner and tool
previews. Use `-q` for single-query mode. The `-y` flag does NOT bypass
interaction — it auto-accepts approvals, not CLI prompts.

**PDF text extraction:** Use `fitz` (PyMuPDF) via terminal for PDF reading,
not execute_code (which runs in a sandboxed venv without fitz):

```bash
python3 -c "
import fitz
doc = fitz.open('/path/to/file.pdf')
text = ''.join(page.get_text() for page in doc)
print(text)
"
```

## Adding New Skills to the Pipeline

1. Create new stage directory under `skills-pipeline/`
2. Add function `stepN_name(input_path)` in `pipeline.py`
3. Register in main() with conditional run logic
4. Update this SKILL.md with the new stage description

## Prerequisites

- `hermes config set approvals.mode off` (pipeline runs autonomously)
- All skills installed: `research-assistant`, `hyperframes`, `meme-generation`,
  `ai-prompts-assistant`, `text-variator`, `markdown-layout`, `xurl`,
  `telephonics`, `himalaya`
- Vision model set: `hermes config set auxiliary.vision.model qwen/qwen3-vl-8b-instruct`