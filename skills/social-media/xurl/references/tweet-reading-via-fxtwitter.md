# fxtwitter API — Reading X/Tweets Without Auth

## When to use this

When `xurl read` returns 401 (OAuth not configured), or when you need tweet data including engagement metrics (likes, retweets, views, bookmarks) that `publish.twitter.com/oembed` doesn't provide.

## The method

```
GET https://api.fxtwitter.com/{account}/status/{tweet_id}
```

Returns JSON with full tweet data. No authentication required for public tweets.

## Python via terminal()

```python
import urllib.request, json

account = "akshay_pachaar"
tweet_id = "2054861039804772827"

url = f"https://api.fxtwitter.com/{account}/status/{tweet_id}"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
data = json.loads(urllib.request.urlopen(req, timeout=15).read().decode("utf-8", errors="ignore"))

t = data["tweet"]
print(f"Text: {t.get('raw_text', {}).get('text', t.get('text', ''))}")
print(f"Date: {t.get('created_at', '?')}")
print(f"Likes: {t.get('likes', '?')} | Retweets: {t.get('retweets', '?')} | Views: {t.get('views', '?')}")
```

## Response shape

```json
{
  "code": 200,
  "tweet": {
    "id": "...",
    "text": "...",
    "raw_text": {"text": "...", "display_text_range": [0, 23], "facets": []},
    "author": {
      "screen_name": "...",
      "name": "...",
      "followers": N,
      "verified": true
    },
    "replies": N,
    "retweets": N,
    "likes": N,
    "bookmarks": N,
    "views": N,
    "created_at": "Wed May 13 14:08:48 +0000 2026",
    "possibly_sensitive": false,
    "lang": "en",
    ...
  }
}
```

## Important field notes

- `tweet.text` — display text (may be empty for article shares)
- `tweet.raw_text.text` — actual tweet content; for link-only tweets contains the t.co URL
- `tweet.lang` — `"en"` for English text, `"zxx"` for non-text (article cards with only a URL), `null` for some link tweets
- Engagement metrics: `likes`, `retweets`, `views`, `bookmarks`, `quotes`, `replies`

## What fails

- Private accounts — returns error JSON
- Rate limiting — returns 429; wait and retry
- Deleted tweets — returns 404

## Alternative: publish.twitter.com/oembed

Returns HTML snippet with tweet text only. No metrics, no author detail.

```python
url = f"https://publish.twitter.com/oembed?url=https://x.com/{account}/status/{tweet_id}"
```

Good when you just need the text and don't need engagement data.

## Workflow for reading a tweet

1. Try `api.fxtwitter.com` first (full data, no auth)
2. If that fails, try `publish.twitter.com/oembed` (text only)
3. If both fail, use research sub-agent with web toolset (slow but thorough)
4. Last resort: ask user to paste the text