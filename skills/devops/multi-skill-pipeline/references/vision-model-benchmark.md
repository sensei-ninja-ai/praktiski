# Vision Model Benchmark — OpenRouter

Tested May 2026. Input: 960x1200 PNG document screenshot, compressed to 512px JPEG (182KB base64). Task: describe image content in Norwegian.

## Results

| Model | Price/1M tokens | Tokens | Cost | Quality |
|-------|----------------|--------|------|---------|
| `qwen/qwen3-vl-8b-instruct` | $0.08 | 642 | $0.000051 | ✓ Good |
| `qwen/qwen3-vl-32b-instruct` | $0.10 | 642 | $0.000051 | ✓ Good |
| `qwen/qwen2.5-vl-72b-instruct` | $0.25 | 742 | $0.000059 | ✓ Good, slightly more verbose |

All three models correctly identified the image content. No meaningful quality difference on document-screenshot tasks.

## Recommendation

**qwen3-vl-8b-instruct** is sufficient for image analysis tasks. No need to use more expensive models for vision.

Cost at $0.08/1M: ~$0.00005 per image = ~19,600 images per dollar.

## Config

Set as auxiliary vision model in `~/.hermes/config.yaml`:
```yaml
auxiliary:
  vision:
    provider: openrouter
    model: qwen/qwen3-vl-8b-instruct
```

## Other Vision Models Available

- `meta-llama/llama-3.2-11b-vision-instruct` — $0.24/1M (131K ctx)
- `mistralai/pixtral-large-2411` — $2.00/1M (131K ctx)
- `qwen/qwen3-vl-235b-a22b-instruct` — $0.20/1M (131K ctx)
- `qwen/qwen3-vl-30b-a3b-instruct` — $0.13/1M (128K ctx)
- `qwen/qwen3-vl-8b-instruct` — $0.08/1M (128K ctx) ← recommended

No completely free vision models available on OpenRouter as of May 2026.