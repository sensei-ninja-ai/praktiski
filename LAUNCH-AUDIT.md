# LAUNCH-AUDIT — Praktisk Intelligens
**Dato:** 2026-03-28  
**Revisor:** Sensei  
**Scope:** Full launch-readiness audit etter bug-fix runde

---

## 🎯 Oppsummering

| Kategori | Status |
|----------|--------|
| JavaScript runtime | ⚠️ 3 issues (2 blocking) |
| HTML validering | ✅ Ren (335 div åpne/lukke balansert, ingen duplikat IDs) |
| CSS | ✅ Fikset (wildcard borte, confirmScreen .visible fungerer) |
| Deployment-config | ⚠️ 1 manglende rute |
| Data-integritet | ✅ Ingen duplikat data-key |
| Submit-flyt | ✅ mailto fallback fungerer (ingen /api/submit kall igjen) |
| Performance | ✅ Akseptabel (124KB, html2pdf lazy-loaded) |

---

## 🚨 LAUNCH-BLOKKERE

### 1. `pkgDesc` er undefined i `buildPackageSection()`
**Problem:** `pkgDesc` er deklarert på linje 1986 — men kun **inne i `generateRapport()`** (local scope). Funksjonen `buildPackageSection()` bruker `pkgDesc[recPkg]` på linje 2317 — utenfor `generateRapport()`. Dette gir `ReferenceError: pkgDesc is not defined` når bruker klikker seg til pakkeseksjonen.

**Fix:** Flytt `pkgDesc` til modul-scope (globalt), rett etter `pkgNames`:

```js
// Etter linje 2377 (const pkgNames = ...)
const pkgDesc = {
  1: 'Perfekt for å komme i gang med KI uten stor investering. Remote oppsett og 1 KI-agent som hjelper deg med de viktigste oppgavene.',
  2: 'Komplett KI-oppsett med dedikert maskinvare og 3 skreddersydde KI-agenter. Ideelt for bedrifter som er klare for en reell KI-transformasjon.',
  3: 'Full pakke med 5–7 KI-agenter, integrasjoner mot eksisterende systemer og månedlig oppfølging. For bedrifter som vil automatisere store deler av hverdagen.',
  4: 'Den ultimate pakken med tale-til-tale KI, iPhone-oppsett og kvartalsvis strategioppfølging. For vekstbedrifter som vil ha KI som første kontaktpunkt.'
};
```

---

### 2. `/kartlegging` rute mangler i `vercel.json`
**Problem:** `vercel.json` har ingen rute for `/kartlegging`. Wildcard `/(.*) → /public/$1` mapper `/kartlegging` → `/public/kartlegging` — uten `.html`. Vercel static serving krever eksplisitt `.html` eller clean-url config.

**Konsekvens:** `https://praktiski.no/kartlegging` gir 404. Kun `https://praktiski.no/kartlegging.html` fungerer.

**Fix — legg til i vercel.json routes (før wildcard):**
```json
{
  "src": "/kartlegging",
  "dest": "/public/kartlegging.html"
},
```

**Og legg til i index.html** en lenke til kartleggingen.

---

## ⚠️ POST-LAUNCH (fiks innen 2 uker)

### 3. `pkgPrices` og `pkgNames` deklarert to ganger (inne i generateRapport + globalt)
**Problem:** `const pkgPrices` og `const pkgNames` er deklarert globalt på linje 2376-2377, OG lokalt inne i `generateRapport()` på linje 1984-1985. Dette gir ikke `SyntaxError` fordi de er i ulike scopes (function-scoped vs global), men det er forvirring og vedlikeholdsbyrde.

**Fix:** Fjern de lokale deklarasjonene inne i `generateRapport()` (linje 1984-1985) — funksjonen vil bruke de globale.

---

### 4. `updateBreakEven()` bruker `typeof recPkg !== 'undefined'` — alltid `false`
**Problem:** `recPkg` er deklarert lokalt med `let` inne i `buildPackageSection()`. `typeof recPkg` utenfor denne funksjonen returnerer alltid `"undefined"` (string). Betingelsen `typeof recPkg !== 'undefined'` er alltid `false` globalt. `activePkg` faller alltid tilbake til `selectedPkg || 1` — dette er OK i praksis, men semantisk feil.

**Fix (kosmetisk):** Fjern `typeof recPkg`-sjekken i `updateBreakEven()`:
```js
const activePkg = selectedPkg || 1;
```

---

### 5. Swipe-handler mangler `ty` — scrolling trigger navigasjon
**Problem:** Touch-swipe lytter på linje 1682-1683 lagrer kun `tx` (X-koordinat), ikke `ty` (Y-koordinat). Enhver horisontal scroll > 60px (inkl. skrå touch) navigerer mellom seksjoner. På seksjoner med mange prosess-kort kan brukere ved uhell navigere videre ved scrolling.

**Fix:**
```js
let tx=0, ty=0;
document.addEventListener('touchstart', e => { tx=e.touches[0].clientX; ty=e.touches[0].clientY; });
document.addEventListener('touchend', e => {
  const dx=e.changedTouches[0].clientX-tx;
  const dy=e.changedTouches[0].clientY-ty;
  if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.5){ dx<0?go(1):go(-1) }
});
```

---

### 6. index.html mangler lenke til kartlegging
**Problem:** `index.html` har kun lenker til `/quiz` og `/test`. Ingen lenke til `/kartlegging`. Brukere kan ikke finne skjemaet fra forsiden.

**Fix:** Legg til CTA-knapp i index.html:
```html
<a href="/kartlegging" class="btn btn-primary">Start KI-kartlegging →</a>
```

---

## ✅ Bekreftet OK

| Sjekk | Resultat |
|-------|---------|
| `<div>` balanse | 335 åpne / 335 lukke ✅ |
| Duplikat IDs | Ingen ✅ |
| Duplikat `data-key` | Ingen ✅ |
| `/api/submit` kall | Borte — erstattet med mailto ✅ |
| `collectAll()` circular override | Fjernet ✅ |
| `#confirmScreen.visible` CSS | Fungerer (display:none overstyres av .visible) ✅ |
| Wildcard `*` transition | Fjernet ✅ |
| `user-scalable=no` | Fjernet ✅ |
| `processCount` DOM-bug | Fikset ✅ |
| `DEFAULT_HOURLY_RATE` konsistent | 500 overalt ✅ |
| Debounce på save() | Implementert (300ms) ✅ |
| html2pdf lazy-loaded | Implementert ✅ |
| iOS safe-area padding | Implementert ✅ |
| DIV-balanse | 335/335 ✅ |
| Ingen duplikat IDs | ✅ |

---

## 📊 Performance Benchmark

| Metrikk | Verdi |
|---------|-------|
| Fil-størrelse | 124 KB |
| Estimert load-tid 4G (1Mbps) | ~1 sek |
| Estimert load-tid 3G (0.3Mbps) | ~3.3 sek |
| html2pdf (lazy) | 500KB kun ved PDF-click |
| CDN-kall ved sideload | 1 (preconnect hint) |
| CDN-kall ved PDF | 1 (cdnjs html2pdf) |
| Event listeners | ~5 globale (input, change, touchstart, touchend, blur) |

---

## 🚀 Deployment — Krisfred gjør dette

### Forutsetninger
- [ ] Vercel-konto (gratis OK)
- [ ] GitHub-repo koblet til Vercel (sensei-ninja-ai/praktiski eller nytt repo)
- [ ] Domain: praktiski.no peker til Vercel

### Kommandoer
```bash
# Logg inn (kun første gang)
cd /home/krisf/.openclaw/workspace/projects/praktiski
npx vercel login

# Deploy til preview (test)
npx vercel

# Deploy til prod
npx vercel --prod
```

### Vercel env-vars (kun nødvendig hvis Supabase legges til later)
```
SUPABASE_URL = din-supabase-url
SUPABASE_ANON_KEY = din-anon-key
```

### Custom domain (etter deploy)
1. Gå til vercel.com → ditt prosjekt → Settings → Domains
2. Legg til `praktiski.no`
3. Følg DNS-instruksjonene (A-record eller CNAME til Vercel)

---

## 🛠 Kritiske fikser å gjøre NÅ (2 stk)

### Fix 1 — pkgDesc global (5 min)
Flytt `const pkgDesc = {...}` fra inne i `generateRapport()` til etter linje 2377 (globalt, ved siden av `pkgPrices` og `pkgNames`).

### Fix 2 — /kartlegging rute (2 min)
Legg til i `vercel.json`:
```json
{ "src": "/kartlegging", "dest": "/public/kartlegging.html" },
```

**Etter disse to fikser: klar for deploy. 🎯**
