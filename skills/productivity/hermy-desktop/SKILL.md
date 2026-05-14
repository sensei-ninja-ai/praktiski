---
name: hermy-desktop
description: Monitor hermy desktop folder, auto-read files the user drops there, and surface summaries without being asked.
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [windows, wsl]
metadata:
  hermes:
    tags: [hermy-desktop, auto-read, file-watching, user-files, pdf, documents]
---

# hermy desktop — Auto-Read User Files

Kristoffer drops files into `hermy desktop` on his Windows desktop when he wants you to read them. The pattern is: drop → expect summary. Never ask "do you want me to read this?" 

## Folder Location

```
/mnt/c/Users/krisf/Desktop/hermy desktop/
```

Always use this exact path. Not `~/Desktop`, not a WSL path, not OneDrive.

## Auto-Detect New Files

When starting a session or when the user mentions they've added something, check for new files:

```bash
ls -lt /mnt/c/Users/krisf/Desktop/hermy\ desktop/*.pdf /mnt/c/Users/krisf/Desktop/hermy\ desktop/PDF/*.pdf 2>/dev/null | head -10
```

Check by file age to find the newest. The user typically drops files moments before mentioning them.

## Reading PDFs

**Use terminal with `python3`, NOT `execute_code`.** The sandbox environment for `execute_code` does NOT have `pymupdf` installed — it will raise `ModuleNotFoundError`. System Python has it.

```bash
python3 -c "
import fitz
doc = fitz.open('/mnt/c/Users/krisf/Desktop/hermy desktop/FILENAME.pdf')
print(f'Sider: {len(doc)}')
text = ''
for page in doc:
    text += page.get_text()
print(text[:10000])
"
```

For shorter texts (single-page or article tweets captured as PDF), extract all and print. For long documents (papers, reports), extract first 5-10 pages then ask if they want the rest.

## Reading Tweets via URL

Use `api.fxtwitter.com` — no auth required, returns full JSON:

```python
import urllib.request, json

url = f"https://api.fxtwitter.com/{account}/status/{tweet_id}"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
data = json.loads(urllib.request.urlopen(req, timeout=15).read().decode("utf-8", errors="ignore"))
t = data["tweet"]
print(f"Text: {t.get('raw_text', {}).get('text', t.get('text', ''))}")
print(f"Date: {t.get('created_at', '?')}")
print(f"Likes: {t.get('likes', '?')} | Retweets: {t.get('retweets', '?')} | Views: {t.get('views', '?')}")
```

This is already documented in the `xurl` skill but lives here too for the autonomous flow.

## Reading Other File Types

| Type | Tool | Command |
|------|------|---------|
| PDF (text) | pymupdf via terminal | `python3 -c "import fitz; ..."` |
| PDF (scanned/OCR) | marker-pdf | `marker_single file.pdf --output_dir out/` |
| DOCX | python-docx | `pip install python-docx` |
| PPTX | python-pptx | see `powerpoint` skill |
| Images | vision_analyze | `vision_analyze(image_url=..., question=...)` |
| Video | video_analyze | `video_analyze(video_url=..., question=...)` |

## Save Useful Content to Obsidian

When reading articles with lasting value (guides, research, reference material), save a summary to the Obsidian vault:

- Long-term value → `03-RESOURCES/Evergreen/`
- Project-relevant → `01-PROJECTS/{name}/`
- Insights/decisions → `Sensei Log/Læring/` or `Sensei Log/Beslutninger/`

Don't save everything — only content the user would plausibly reference again. A tweet thread about Hermes Agent memory architecture = evergreen. A random link post = skip unless it has clear reference value.

## The Rule

**Never ask "do you want me to read this?"** The user's behavior signals intent: they dropped a file in hermy desktop, or they sent you a link. Act on that signal. Read it, summarize it, save if relevant, report concisely.

If the file is huge (100+ MB PDF), mention the size and what it is before diving in. Let them throttle if needed.