# Enrich-All — Bedriftsdata Enrichment

Enricher 1886 bedrifter fra `scan-results.json` med kontaktinfo og kilde-tracking.

## Oversikt

Scriptet leser bedriftsdata fra `/home/krisf/.openclaw/workspace/projects/ki-kartlegging/scan-results.json` og beriker hver bedrift som mangler kontaktinfo ved å scrape:

1. **1881.no** — telefon, adresse, kategori  
2. **Proff.no** — nettside, daglig leder, styremedlemmer
3. **Bedriftens nettside** — scraper kontaktsider for e-post og telefon
4. **Google fallback** — søk etter "bedriftsnavn Tromsø kontakt"

### Output Format

```json
{
  "orgnr": "990860467",
  "navn": "HJEM EIENDOMSMEGLING AS",
  "kontaktinfo": {
    "telefon": [
      {"nummer": "90066700", "kilde": "1881.no", "hentet": "2026-03-20"}
    ],
    "epost": [
      {"adresse": "post@hjemeiendom.no", "kilde": "nettside kontaktside", "hentet": "2026-03-20"},
      {"adresse": "espen@hjemeiendom.no", "kilde": "1881.no", "hentet": "2026-03-20"}
    ],
    "nettside": [
      {"url": "https://www.hjemeiendomsmegling.no", "kilde": "proff.no", "hentet": "2026-03-20"}
    ]
  }
}
```

## Installasjon

```bash
cd /home/krisf/.openclaw/workspace/projects/praktiski/enrichment
pip install -r requirements.txt
```

## Bruk

### Standard kjøring
```bash
python enrich-all.py
```

### Dry-run (vis hva som ville blitt gjort)
```bash
python enrich-all.py --dry-run
```

### Kjør kun første 100 bedrifter
```bash
python enrich-all.py --limit 100
```

### Start fra bedrift #500
```bash
python enrich-all.py --start 500
```

### Resume etter crash
```bash
python enrich-all.py --resume
```

## Estimert Kjøretid

**Rate limiting:**
- 1 sekund mellom HTTP requests
- 3 sekunder mellom bedrifter
- ~7 sekunder per bedrift

**Total estimat:**
- 1886 bedrifter × 7 sekunder = ~3.7 timer
- Med batch-lagring: sikker progress tracking

## Resumable Operations

Scriptet lagrer progress til `enrichment-progress.json` etter hver batch (50 bedrifter). Ved crash:

1. Kjør `python enrich-all.py --resume`
2. Scriptet fortsetter der det stoppet
3. Eksisterende data overskrives ikke

## Output Filer

| Fil | Beskrivelse |
|-----|-------------|
| `enriched-all.json` | Komplett liste med alle bedrifter + ny kontaktinfo |
| `enrichment-progress.json` | Progress tracking for resume |
| `enrichment.log` | Detaljert logg med errors og progress |

## Eksport til CSV

Etter enrichment kan du eksportere til CSV:

```python
import json
import csv

# Last data
with open('enriched-all.json') as f:
    data = json.load(f)

# Eksporter til CSV
with open('enriched-bedrifter.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    
    # Header
    writer.writerow(['Org Nr', 'Navn', 'Bransje', 'Telefon', 'E-post', 'Nettside', 'Nye Telefoner', 'Nye E-poster', 'Kilder'])
    
    # Data
    for company in data:
        kontakt = company.get('kontaktinfo', {})
        nye_tlf = '; '.join([t['nummer'] for t in kontakt.get('telefon', [])])
        nye_epost = '; '.join([e['adresse'] for e in kontakt.get('epost', [])])
        kilder = set()
        for items in kontakt.values():
            for item in items:
                kilder.add(item.get('kilde', ''))
        
        writer.writerow([
            company['orgnr'],
            company['navn'], 
            company['bransje'],
            company.get('tlf', ''),
            company.get('epost', ''),
            company.get('nettside', ''),
            nye_tlf,
            nye_epost,
            '; '.join(kilder)
        ])
```

## Valideringer

**E-post:**
- Regex validering
- Ignorer `noreply@`, `@gmail.com`, `@hotmail.com` etc.
- Ignorer `webmaster@`, `admin@localhost` etc.

**Telefon:**
- Norsk format (8 siffer)
- Ignorer 800-numre
- Normaliser: fjern +47 prefix og mellomrom

**Nettside:**
- Sjekk at siden faktisk laster (HTTP 200)
- Timeout etter 5 sekunder

## Tekniske Detaljer

**Dependencies:**
- `requests` — HTTP requests
- `beautifulsoup4` — HTML parsing
- `lxml` — Fast XML/HTML parser

**Rate Limiting:**
- Max 1 request per sekund
- 3 sekunder pause mellom bedrifter
- 10 sekunder timeout per request

**Error Handling:**
- Alle exceptions fanget og logget
- Fortsetter til neste bedrift ved feil
- Detaljert logging til `enrichment.log`

**Batch Processing:**
- Prosesserer 50 bedrifter per batch
- Lagrer progress mellom hver batch
- Sikrer at lange kjøringer kan resumes

## Eksempel Kjøring

```
$ python enrich-all.py --limit 10

2026-03-20 20:45:00 [INFO] Laster bedriftsdata fra /home/krisf/.openclaw/workspace/projects/ki-kartlegging/scan-results.json
2026-03-20 20:45:00 [INFO] Lastet 1886 bedrifter
2026-03-20 20:45:00 [INFO] Fant 743 bedrifter som trenger enrichment
2026-03-20 20:45:00 [INFO] === BATCH 1 ===
2026-03-20 20:45:00 [INFO] Prosesserer bedrifter 1-10 av 10
2026-03-20 20:45:01 [INFO] [1/10] HARILA EIENDOM AS
2026-03-20 20:45:01 [INFO] Enricher HARILA EIENDOM AS (995916835)
2026-03-20 20:45:04 [INFO]   ✅ Fant: 1 tlf, 2 e-post
2026-03-20 20:45:07 [INFO] [2/10] REVISORKOMPANIET TROMSØ AS
...
2026-03-20 20:46:30 [INFO] Lagret batch 1 til enriched-all.json
2026-03-20 20:46:30 [INFO] === FERDIG ===
2026-03-20 20:46:30 [INFO] Totalt prosessert: 10 bedrifter
2026-03-20 20:46:30 [INFO] Totalt enriched: 7 bedrifter

✅ Enrichment ferdig!
📊 10 bedrifter prosessert  
📁 7 bedrifter enriched med ny kontaktinfo
💾 Resultat lagret til: enriched-all.json
```

## Feilsøking

**Problem:** `ModuleNotFoundError: No module named 'requests'`
**Løsning:** `pip install -r requirements.txt`

**Problem:** `FileNotFoundError: scan-results.json`
**Løsning:** Sjekk at input-filen finnes på riktig sted

**Problem:** `TimeoutError`/`ConnectionError`
**Løsning:** Sjekk internett-forbindelse, prøv `--resume` 

**Problem:** Script stopper uten error
**Løsning:** Sjekk `enrichment.log` for detaljer

## Monitorering

Scriptet printer progress til stdout og logger detaljert til fil. For å følge med i sanntid:

```bash
# Kjør i bakgrunnen
python enrich-all.py > run.log 2>&1 &

# Følg progress
tail -f run.log
tail -f enrichment.log
```