# X Auth — Metoder og Begrensninger

## Tre auth-nivåer i xurl

| Method | Hvem | Brukes til | Begrensning |
|--------|------|------------|-------------|
| `xurl auth apps add --client-id/secret` | App credentials | Registrere app | Ingen, men ingen tilgang alene |
| `xurl auth app --bearer-token` | App-only token | Søk, uавtoriserte reads | Kan ikke bokmerker, poste, like |
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