#!/usr/bin/env python3
"""
Enrich-All — KI-kartlegging Bedriftsdata Enrichment
Enricher 1886 bedrifter fra scan-results.json med kontaktinfo og kilde-tracking.

Kilder (prioritert rekkefølge):
1. 1881.no — telefon, adresse, kategori
2. Proff.no — nettside, daglig leder, styremedlemmer
3. Bedriftens nettside — scrape kontaktsider for e-post og telefon
4. Google fallback — "bedriftsnavn Tromsø kontakt"

Bruk: python enrich-all.py [--start N] [--limit N] [--dry-run]
"""

import argparse
import json
import re
import time
import logging
import traceback
from pathlib import Path
from typing import Optional, Dict, List, Set
from urllib.parse import urljoin, quote, urlparse
from datetime import datetime

import requests
from bs4 import BeautifulSoup

# ── Config ──────────────────────────────────────────────────────────────────

INPUT_FILE = Path("/home/krisf/.openclaw/workspace/projects/ki-kartlegging/scan-results.json")
OUTPUT_FILE = Path(__file__).parent / "enriched-all.json"
PROGRESS_FILE = Path(__file__).parent / "enrichment-progress.json"
LOG_FILE = Path(__file__).parent / "enrichment.log"

REQUEST_TIMEOUT = 10
RATE_LIMIT_BETWEEN_REQUESTS = 1.0  # 1 sekund mellom requests
RATE_LIMIT_BETWEEN_COMPANIES = 3.0  # 3 sekunder mellom bedrifter
BATCH_SIZE = 50

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
CONTACT_PATHS = ["/kontakt", "/contact", "/kontakt-oss", "/om-oss", "/about", "/contact-us"]

# Regex patterns
PHONE_RE = re.compile(r"(?<!\d)(\+47\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{3}\s?\d{2}\s?\d{3})(?!\d)")
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
ORGNR_RE = re.compile(r"(\d{3}\s?\d{3}\s?\d{3})")

# Validation patterns
INVALID_EMAILS = {
    "noreply@", "no-reply@", "donotreply@", "@gmail.com", "@hotmail.com", 
    "@outlook.com", "@yahoo.com", "example.com", "test@", "admin@localhost",
    "webmaster@", "postmaster@", "@facebook.com", "@google.com", "support@wordpress"
}

# ── Logging ─────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("enrich")

# ── Helpers ─────────────────────────────────────────────────────────────────

def get_timestamp() -> str:
    """Returner timestamp i ønsket format."""
    return datetime.now().strftime("%Y-%m-%d")

def normalize_phone(raw: str) -> str:
    """Normaliser telefonnummer til 8 siffer."""
    digits = re.sub(r"[^\d]", "", raw)
    if digits.startswith("47") and len(digits) == 10:
        digits = digits[2:]
    return digits

def is_valid_phone(phone: str) -> bool:
    """Valider norsk telefonnummer."""
    normalized = normalize_phone(phone)
    if len(normalized) != 8:
        return False
    # Ignorer 800-numre og andre spesialnumre
    if normalized.startswith(("800", "801", "802", "803", "804", "805", "806", "807", "808", "809")):
        return False
    return True

def is_valid_email(email: str) -> bool:
    """Valider e-postadresse."""
    email_lower = email.lower()
    if any(invalid in email_lower for invalid in INVALID_EMAILS):
        return False
    if not re.match(EMAIL_RE, email):
        return False
    return True

def is_valid_website(url: str, session: requests.Session) -> bool:
    """Sjekk om nettside laster (status 200)."""
    try:
        resp = session.head(url, timeout=5, allow_redirects=True)
        return resp.status_code == 200
    except:
        return False

def safe_request(url: str, session: requests.Session, method: str = "GET") -> Optional[requests.Response]:
    """Sikker HTTP request med error handling."""
    try:
        if method.upper() == "GET":
            resp = session.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        else:
            resp = session.head(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        resp.raise_for_status()
        return resp
    except requests.exceptions.Timeout:
        log.debug(f"Timeout: {url}")
        return None
    except requests.exceptions.RequestException as e:
        log.debug(f"Request error for {url}: {e}")
        return None
    except Exception as e:
        log.debug(f"Unexpected error for {url}: {e}")
        return None

def extract_emails_from_html(html: str) -> Set[str]:
    """Ekstraher e-postadresser fra HTML."""
    emails = set()
    
    # Finn mailto: links
    soup = BeautifulSoup(html, "html.parser")
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("mailto:"):
            email = href[7:].split("?")[0].lower().strip()
            if is_valid_email(email):
                emails.add(email)
    
    # Finn e-poster i tekst
    text = soup.get_text(" ", strip=True)
    for match in EMAIL_RE.finditer(text):
        email = match.group().lower().strip()
        if is_valid_email(email):
            emails.add(email)
    
    return emails

def extract_phones_from_html(html: str) -> Set[str]:
    """Ekstraher telefonnumre fra HTML."""
    phones = set()
    
    # Finn tel: links
    soup = BeautifulSoup(html, "html.parser")
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("tel:"):
            phone = normalize_phone(href[4:])
            if is_valid_phone(phone):
                phones.add(phone)
    
    # Finn telefonnumre i tekst
    text = soup.get_text(" ", strip=True)
    for match in PHONE_RE.finditer(text):
        phone = normalize_phone("".join(match.groups()))
        if is_valid_phone(phone):
            phones.add(phone)
    
    return phones

def rate_limit_request():
    """Rate limiting mellom requests."""
    time.sleep(RATE_LIMIT_BETWEEN_REQUESTS)

def rate_limit_company():
    """Rate limiting mellom bedrifter."""
    time.sleep(RATE_LIMIT_BETWEEN_COMPANIES)

# ── Scraping Functions ──────────────────────────────────────────────────────

def scrape_1881(bedriftsnavn: str, session: requests.Session) -> Dict:
    """Scrape 1881.no for telefon og adresse."""
    result = {"telefon": [], "adresse": [], "kategori": []}
    
    try:
        query = f"{bedriftsnavn} tromsø"
        url = f"https://www.1881.no/q?query={quote(query)}"
        
        rate_limit_request()
        resp = safe_request(url, session)
        if not resp:
            return result
        
        soup = BeautifulSoup(resp.text, "html.parser")
        text = soup.get_text(" ", strip=True)
        
        # Ekstraher telefonnumre
        phones = extract_phones_from_html(resp.text)
        for phone in phones:
            result["telefon"].append({
                "nummer": phone,
                "kilde": "1881.no",
                "hentet": get_timestamp()
            })
        
        # Prøv å finne adresse og kategori fra resultatet
        # Dette er en forenkling - 1881.no struktur kan variere
        
    except Exception as e:
        log.warning(f"1881.no error for '{bedriftsnavn}': {e}")
    
    return result

def scrape_proff(orgnr: str, session: requests.Session) -> Dict:
    """Scrape Proff.no for nettside og lederinfo."""
    result = {"nettside": [], "daglig_leder": [], "styre": []}
    
    try:
        url = f"https://www.proff.no/selskap/-/{orgnr}"
        
        rate_limit_request()
        resp = safe_request(url, session)
        if not resp:
            return result
        
        soup = BeautifulSoup(resp.text, "html.parser")
        
        # Finn nettside
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if href.startswith("http") and "proff.no" not in href:
                # Valider at nettsiden faktisk laster
                if is_valid_website(href, session):
                    result["nettside"].append({
                        "url": href,
                        "kilde": "proff.no",
                        "hentet": get_timestamp()
                    })
                    break
        
        # Finn daglig leder og styremedlemmer
        text = soup.get_text(" ", strip=True)
        
        # Søk etter "Daglig leder" mønster
        daglig_leder_match = re.search(r"[Dd]aglig leder[:\s]+([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)+)", text)
        if daglig_leder_match:
            result["daglig_leder"].append({
                "navn": daglig_leder_match.group(1).strip(),
                "kilde": "proff.no",
                "hentet": get_timestamp()
            })
    
    except Exception as e:
        log.warning(f"Proff.no error for orgnr '{orgnr}': {e}")
    
    return result

def scrape_website(nettside: str, session: requests.Session) -> Dict:
    """Scrape bedriftens nettside for kontaktinfo."""
    result = {"telefon": [], "epost": []}
    
    if not nettside:
        return result
    
    try:
        # Normaliser URL
        if not nettside.startswith("http"):
            nettside = f"https://{nettside}"
        
        parsed = urlparse(nettside)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        
        all_emails = set()
        all_phones = set()
        
        # Scrape hovedside
        rate_limit_request()
        resp = safe_request(nettside, session)
        if resp:
            all_emails.update(extract_emails_from_html(resp.text))
            all_phones.update(extract_phones_from_html(resp.text))
        
        # Scrape kontaktsider
        for contact_path in CONTACT_PATHS:
            rate_limit_request()
            contact_url = urljoin(base_url + "/", contact_path.lstrip("/"))
            resp = safe_request(contact_url, session)
            if resp and resp.status_code == 200:
                all_emails.update(extract_emails_from_html(resp.text))
                all_phones.update(extract_phones_from_html(resp.text))
                break  # Bare én kontaktside trengs
        
        # Konverter til ønsket format
        for email in all_emails:
            result["epost"].append({
                "adresse": email,
                "kilde": "nettside kontaktside",
                "hentet": get_timestamp()
            })
        
        for phone in all_phones:
            result["telefon"].append({
                "nummer": phone,
                "kilde": "nettside kontaktside", 
                "hentet": get_timestamp()
            })
    
    except Exception as e:
        log.warning(f"Website scraping error for '{nettside}': {e}")
    
    return result

def google_fallback(bedriftsnavn: str, session: requests.Session) -> Dict:
    """Google søk som fallback for kontaktinfo."""
    result = {"telefon": [], "epost": [], "nettside": []}
    
    try:
        # Dette er en forenklet implementasjon
        # I praksis ville man brukt Google Custom Search API
        query = f"{bedriftsnavn} Tromsø kontakt"
        # Her ville man implementert Google søk
        # For nå returnerer vi tom result
        pass
    
    except Exception as e:
        log.warning(f"Google fallback error for '{bedriftsnavn}': {e}")
    
    return result

# ── Progress Management ─────────────────────────────────────────────────────

def load_progress() -> Dict:
    """Last inn progress fra forrige kjøring."""
    if PROGRESS_FILE.exists():
        try:
            return json.loads(PROGRESS_FILE.read_text())
        except:
            log.warning("Kunne ikke lese progress-fil - starter fra begynnelsen")
    return {"processed": 0, "last_batch": 0, "enriched_companies": {}}

def save_progress(progress: Dict):
    """Lagre progress."""
    PROGRESS_FILE.write_text(json.dumps(progress, ensure_ascii=False, indent=2))

def needs_enrichment(company: Dict) -> bool:
    """Sjekk om bedrift mangler kontaktinfo."""
    missing_email = not company.get("epost")
    missing_phone = not company.get("tlf")  
    missing_website = not company.get("nettside")
    return missing_email or missing_phone or missing_website

def merge_kontaktinfo(existing: Dict, new_data: Dict) -> Dict:
    """Merge ny kontaktinfo med eksisterende uten duplikater."""
    merged = {
        "telefon": existing.get("telefon", []).copy(),
        "epost": existing.get("epost", []).copy(),
        "nettside": existing.get("nettside", []).copy()
    }
    
    # Merge telefonnumre
    existing_phones = {item["nummer"] for item in merged["telefon"]}
    for item in new_data.get("telefon", []):
        if item["nummer"] not in existing_phones:
            merged["telefon"].append(item)
    
    # Merge e-poster
    existing_emails = {item["adresse"] for item in merged["epost"]}
    for item in new_data.get("epost", []):
        if item["adresse"] not in existing_emails:
            merged["epost"].append(item)
    
    # Merge nettsider
    existing_websites = {item["url"] for item in merged["nettside"]}
    for item in new_data.get("nettside", []):
        if item["url"] not in existing_websites:
            merged["nettside"].append(item)
    
    return merged

# ── Main Enrichment Function ────────────────────────────────────────────────

def enrich_company(company: Dict, session: requests.Session) -> Dict:
    """Enrich én bedrift med kontaktinfo fra alle kilder."""
    orgnr = company["orgnr"]
    navn = company["navn"]
    
    log.info(f"Enricher {navn} ({orgnr})")
    
    # Start med tom kontaktinfo
    kontaktinfo = {"telefon": [], "epost": [], "nettside": []}
    
    try:
        # 1. Søk 1881.no
        if not company.get("tlf"):
            log.debug(f"  Søker 1881.no...")
            data_1881 = scrape_1881(navn, session)
            kontaktinfo = merge_kontaktinfo(kontaktinfo, data_1881)
        
        # 2. Søk Proff.no
        if not company.get("nettside"):
            log.debug(f"  Søker Proff.no...")
            data_proff = scrape_proff(orgnr, session)
            kontaktinfo = merge_kontaktinfo(kontaktinfo, data_proff)
        
        # 3. Scrape nettside (hvis den finnes)
        nettside = company.get("nettside") or (kontaktinfo["nettside"][0]["url"] if kontaktinfo["nettside"] else "")
        if nettside and (not company.get("epost") or not company.get("tlf")):
            log.debug(f"  Scraper nettside...")
            data_website = scrape_website(nettside, session)
            kontaktinfo = merge_kontaktinfo(kontaktinfo, data_website)
        
        # 4. Google fallback (hvis fortsatt mangler info)
        still_missing = not kontaktinfo["telefon"] and not kontaktinfo["epost"]
        if still_missing:
            log.debug(f"  Google fallback...")
            data_google = google_fallback(navn, session)
            kontaktinfo = merge_kontaktinfo(kontaktinfo, data_google)
        
        # Legg til kontaktinfo i company object
        enriched_company = company.copy()
        if kontaktinfo["telefon"] or kontaktinfo["epost"] or kontaktinfo["nettside"]:
            enriched_company["kontaktinfo"] = kontaktinfo
            
            # Oppdater også de gamle feltene for kompatibilitet
            if kontaktinfo["telefon"] and not company.get("tlf"):
                enriched_company["tlf"] = kontaktinfo["telefon"][0]["nummer"]
            if kontaktinfo["epost"] and not company.get("epost"):
                enriched_company["epost"] = kontaktinfo["epost"][0]["adresse"]
            if kontaktinfo["nettside"] and not company.get("nettside"):
                enriched_company["nettside"] = kontaktinfo["nettside"][0]["url"]
        
        # Log hva som ble funnet
        found_items = []
        if kontaktinfo["telefon"]:
            found_items.append(f"{len(kontaktinfo['telefon'])} tlf")
        if kontaktinfo["epost"]:
            found_items.append(f"{len(kontaktinfo['epost'])} e-post")
        if kontaktinfo["nettside"]:
            found_items.append(f"{len(kontaktinfo['nettside'])} nettside")
        
        if found_items:
            log.info(f"  ✅ Fant: {', '.join(found_items)}")
        else:
            log.info(f"  ❌ Ingen ny kontaktinfo funnet")
        
        return enriched_company
    
    except Exception as e:
        log.error(f"Error enriching {navn}: {e}")
        log.error(traceback.format_exc())
        return company

# ── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Enrich bedriftsdata fra scan-results.json")
    parser.add_argument("--start", type=int, default=0, help="Start fra bedrift nummer N")
    parser.add_argument("--limit", type=int, default=0, help="Maksimalt antall bedrifter (0=alle)")
    parser.add_argument("--dry-run", action="store_true", help="Vis bare hva som ville blitt gjort")
    parser.add_argument("--resume", action="store_true", help="Fortsett fra forrige progress")
    args = parser.parse_args()
    
    # Last inn bedriftsdata
    log.info(f"Laster bedriftsdata fra {INPUT_FILE}")
    companies = json.loads(INPUT_FILE.read_text())
    log.info(f"Lastet {len(companies)} bedrifter")
    
    # Last inn progress
    progress = load_progress() if args.resume else {"processed": 0, "last_batch": 0, "enriched_companies": {}}
    
    # Filtrer bedrifter som trenger enrichment
    companies_to_process = []
    for i, company in enumerate(companies):
        if i < args.start:
            continue
        if args.limit > 0 and len(companies_to_process) >= args.limit:
            break
        if needs_enrichment(company) and company["orgnr"] not in progress["enriched_companies"]:
            companies_to_process.append((i, company))
    
    log.info(f"Fant {len(companies_to_process)} bedrifter som trenger enrichment")
    
    if args.dry_run:
        log.info("Dry-run - viser kun hva som ville blitt prosessert:")
        for i, (idx, company) in enumerate(companies_to_process[:10]):
            missing = []
            if not company.get("epost"):
                missing.append("e-post")
            if not company.get("tlf"):
                missing.append("telefon")
            if not company.get("nettside"):
                missing.append("nettside")
            log.info(f"  {idx+1}: {company['navn']} - mangler: {', '.join(missing)}")
        if len(companies_to_process) > 10:
            log.info(f"  ... og {len(companies_to_process) - 10} til")
        
        # Estimert kjøretid
        total_requests_per_company = 4  # 1881, Proff, nettside, google
        total_time_per_company = (total_requests_per_company * RATE_LIMIT_BETWEEN_REQUESTS) + RATE_LIMIT_BETWEEN_COMPANIES
        estimated_hours = (len(companies_to_process) * total_time_per_company) / 3600
        log.info(f"Estimert kjøretid: {estimated_hours:.1f} timer")
        return
    
    # Setup session
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})
    
    # Last inn eksisterende resultat hvis det finnes
    enriched_companies = {}
    if OUTPUT_FILE.exists():
        try:
            existing_data = json.loads(OUTPUT_FILE.read_text())
            for company in existing_data:
                enriched_companies[company["orgnr"]] = company
            log.info(f"Lastet {len(enriched_companies)} eksisterende enriched bedrifter")
        except:
            log.warning("Kunne ikke lese eksisterende output-fil")
    
    # Prosesser i batches
    processed_in_session = 0
    
    for batch_start in range(0, len(companies_to_process), BATCH_SIZE):
        batch_end = min(batch_start + BATCH_SIZE, len(companies_to_process))
        batch_companies = companies_to_process[batch_start:batch_end]
        
        batch_num = (batch_start // BATCH_SIZE) + 1
        log.info(f"=== BATCH {batch_num} ===")
        log.info(f"Prosesserer bedrifter {batch_start + 1}-{batch_end} av {len(companies_to_process)}")
        
        # Prosesser bedrifter i denne batchen
        for idx_in_batch, (global_idx, company) in enumerate(batch_companies):
            display_idx = global_idx + 1
            total_idx = batch_start + idx_in_batch + 1
            
            log.info(f"[{total_idx}/{len(companies_to_process)}] {company['navn']}")
            
            enriched_company = enrich_company(company, session)
            enriched_companies[company["orgnr"]] = enriched_company
            
            processed_in_session += 1
            progress["processed"] = processed_in_session
            
            # Rate limit mellom bedrifter
            if idx_in_batch < len(batch_companies) - 1:  # Ikke vent etter siste i batch
                rate_limit_company()
        
        # Lagre progress etter hver batch
        progress["last_batch"] = batch_num
        progress["enriched_companies"] = {orgnr: True for orgnr in enriched_companies.keys()}
        save_progress(progress)
        
        # Lagre output etter hver batch
        output_list = list(enriched_companies.values())
        OUTPUT_FILE.write_text(json.dumps(output_list, ensure_ascii=False, indent=2))
        log.info(f"Lagret batch {batch_num} til {OUTPUT_FILE}")
        
        # Status oppdatering
        log.info(f"Batch {batch_num} ferdig. Prosessert {processed_in_session} bedrifter denne økta.")
    
    # Final output
    output_list = list(enriched_companies.values())
    OUTPUT_FILE.write_text(json.dumps(output_list, ensure_ascii=False, indent=2))
    
    # Sammendrag
    total_enriched = sum(1 for c in output_list if c.get("kontaktinfo"))
    log.info(f"=== FERDIG ===")
    log.info(f"Totalt prosessert: {processed_in_session} bedrifter")
    log.info(f"Totalt enriched: {total_enriched} bedrifter")
    log.info(f"Output lagret til: {OUTPUT_FILE}")
    
    print(f"\n✅ Enrichment ferdig!")
    print(f"📊 {processed_in_session} bedrifter prosessert")
    print(f"📁 {total_enriched} bedrifter enriched med ny kontaktinfo")
    print(f"💾 Resultat lagret til: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()