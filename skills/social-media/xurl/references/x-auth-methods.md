# X Auth — Metoder og Begrensninger

## Tre auth-nivåer i xurl

| Method | Hvem | Brukes til | Begrensning |
|--------|------|------------|-------------|
| `xurl auth apps add --client-id/secret` | App credentials | Registrere app | Ingen, men ingen tilgang alene |
| `xurl auth app --bearer-token` | App-only token | Søk, uautoriserte reads | Kan ikke bokmerker, poste, like |
| `xurl auth oauth2` | User access token | Alt som krever brukerkontekst | Krever interaktiv OAuth-flyt |

## OAuth 2.0 User Context — Slik får man det

### Metode 1: CLI OAuth (standard)
```bash
xurl auth oauth2 --app x-app
```
Åpner browser for PKCE-flyt. Krever at brukeren er til stede.

### Metode 2: User Access Token fra Developer Portal
Hvis brukeren har tilgang til https://developer.x.com → app → "Keys and tokens":
1. "User Access Token" seksjonen → generer
2. Velg scopes: `bookmark.read`, `offline.access` (+ andre etter behov)
3. Kopier token
4. Agent: `xurl auth oauth2 --app x-app USERNAME` er ikke mulig uten bruker-interaksjon

**Men:** X Developer Portal kan gi User Access Token uten interaktiv OAuth hvis brukeren er eier av appen.

### Metode 3: Manual cookie-extraction
Ekstrahér `auth_token` cookie fra browser:
1. Brukeren logger inn på x.com i egen browser
2. Developer tools → Application → Cookies → `auth_token`
3. Gi cookie-verdien til agenten
4. Agent: `xurl auth oauth2 --app x-app` med cookie-set

## Feilsøking: 403 Unsupported Authentication

```json
{"title":"Unsupported Authentication","detail":"Authenticating with OAuth 2.0 Application-Only is forbidden for this endpoint."}
```

Årsak: Prøvde Bearer token på et endepunkt som krever user context.
Fiks: Fullfør OAuth-flyten for å få User Access Token.

## Scopes for bokmerker

Minste scope for lesing av bokmerker: `bookmark.read`
Med offline access (for automatiserte workflows): `bookmark.read offline.access`

## Tweet fetching når OAuth er ufullstendig

Når `xurl read` feiler med 401 (Bearer token kun, ingen user context):

### Direkte metoder (som alle feilet i praksis)
- allorigins proxy → HTTP 522 (X-blokkerte)
- vxtwitter/fxtwitter → tidsavbrudd
- Nitter → Connection refused
- Browser-navigasjon → 60s timeout

### Det som fungerte: research sub-agent
En delegate_task med web-toolset kjørte 32 API-kall inkludert:
- TwStalker (twstalker.com) — historiske tweet-data, engagement metrics
- Wayback Machine API — `https://web.archive.org/web/*/<tweet-url>`

**Konklusjon:** Når direkte metoder feiler på en stubborn tweet, delegate en
research sub-agent med web toolset fremfor å prøve alle direkte metoder sekvensielt.
Sub-agenten fant tweet 2054564519280804028 (266 retweets, 2K likes, 931K views)
via Wayback Machine der alle andre metoder feilet.

### Hvilke data finnes via Wayback Machine
Tweet-text (selv om bare en lenke), engagement metrics (via TwStalker-cache),
opprettelsestidspunkt.适用于 tweets med høy engagement. Low-engagement tweets
er kanskje ikke arkivert.