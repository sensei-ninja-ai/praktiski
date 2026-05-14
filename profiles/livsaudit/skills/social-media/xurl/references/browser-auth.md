# Browser-basert X-autentisering

## Når CLI OAuth ikke er tilgjengelig

Brukeren har ikke alltid tilgang til terminalen sin for `xurl auth oauth2`. I slike tilfeller kan
browser-basert auth være et alternativ — men det krever et fungerende browser-MCP.

## Forutsetning

Playwright MCP eller tilsvarende browser-automasjons-MCP må være konfigurert:
```
hermes mcp add playwright --command npx --args playwright --browser chromium
```
Playwright må være tilgjengelig i PATH.

## Flyt

1. Naviger til `https://x.com/login`
2. Brukeren logger inn manuelt i browser-vinduet
3. Etter innlogging, hent session-cookies via `document.cookie` i DevTools
4. Lagre cookies i en JSON-fil: `~/.hermes/sessions/x.json`
5. Bruk deretter xurl med `--session ~/.hermes/sessions/x.json` hvis xurl støtter det,
   eller les filen og sett cookies via custom header i raw API-kall

## Begrensning: exec-blokkert miljø

Hvis exec-kommandoer er blokkert av sikkerhetsfilter (f.eks. "User denied"), kan
verken Playwright, Puppeteer eller Selenium kjøres. I slike miljøer finnes det to alternativer:

1. **Manuell cookie-eksport**: Brukeren eksporterer cookies fra sin egen browser
   via en cookie-editor extension, deretter gir filstien til agenten
2. **X session-fil**: Plasser en gyldig X-session-cookie i
   `~/.hermes/sessions/x.json` som agenten kan lese og bruke ved behov

## JSON-format for X-session

```json
{
  "ct0": "<csrf_token>",
  "auth_token": "<auth_token>",
  "expiry": "<ISO timestamp>"
}
```

Hent `ct0` og `auth_token` fra browser-cookies etter innlogging på x.com.

## Advarsel

- Cookies har kort levetid (dager til uker). Ingen cookie-løsning er permanent.
- X's offisielle API (xurl) er mer pålitelig og langvarig. CLI OAuth bør prioriteres.
- Aldri send session-filer til LLM-kontekst eller tredjepart.