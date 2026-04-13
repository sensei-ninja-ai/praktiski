# KI-Kartlegging — Komplett Audit-rapport
**Fil:** `projects/praktiski/public/kartlegging.html`  
**Størrelse:** 124 659 bytes (121 KB) · 2491 linjer  
**Dato:** 2026-03-27  
**Revisor:** Sensei (subagent)

---

## Kritikalitets-oversikt

| # | Kategori | 🔴 Kritisk | 🟡 Medium | 🟢 Minor |
|---|----------|-----------|----------|--------|
| 1 | UX/Design | 2 | 5 | 4 |
| 2 | Accessibility | 3 | 4 | 3 |
| 3 | Performance | 2 | 4 | 3 |
| 4 | Funksjonalitet | 4 | 6 | 2 |
| 5 | Innhold/Copy | 0 | 3 | 5 |
| 6 | Kodekvalitet | 1 | 5 | 3 |
| 7 | SEO | 2 | 3 | 2 |
| **Total** | | **14** | **30** | **22** |

---

## 1. UX / Design

### 🔴 Nav-knapper blokkerer innhold på mobil
**Problem:** `.container` har `padding-bottom: 160px` og `.nav` er fixed. På iPhone SE (375px) og lavere er dette for lite — lange prosess-kort kuttes av under navigasjons-baren i portrait-modus med iOS Safari som legger til sin adresselinje.  
**Fix:** Øk padding-bottom på `.container` til `min(180px, 20vh)` og bruk `env(safe-area-inset-bottom)` for iOS notch:
```css
.container { padding-bottom: max(160px, calc(80px + env(safe-area-inset-bottom))); }
.nav { padding-bottom: max(12px, env(safe-area-inset-bottom)); }
```

### 🔴 Confirmation screen bruker `display:flex` men er satt til `display:none` — vil aldri vises
**Problem:** `#confirmScreen` style i CSS: `display:flex`. Inline style setter `display:none`. Når JS gjør `cs.style.display='flex'` fungerer det — men hvis CSS-reset eller nettleseren prioriterer inline style inkonsekvent, brytes flyten. Viktigere: `startKartlegging()` setter `introScreen` til `display:none` men sjekker aldri om `confirmScreen` er synlig.  
**Fix:** Bruk en dedikert class-toggle istedenfor direkte style:
```css
#confirmScreen { display: none; }
#confirmScreen.visible { display: flex; }
```
```js
document.getElementById('confirmScreen').classList.add('visible');
```

### 🟡 Ingen loading-indikator under PDF-generering
**Problem:** `generateRapport()` kaller html2pdf (tung ekstern lib). Brukeren ser ingenting i 3-8 sekunder på mobil, og kan tro appen har kræsjet.  
**Fix:** Vis en spinner med `setLoading(true)` før `html2pdf().set(opt).from(container).save()` og `setLoading(false)` i `.then()`.

### 🟡 Swipe-navigasjon kolliderer med scroll i prosess-seksjonen
**Problem:** Touch-listener på `document` fanger alle swipes, inkludert vertical scroll. På seksjoner med mange prosess-kort vil brukeren tilfeldig navigere til neste seksjon istedenfor å scrolle.  
**Fix:** Sjekk både `dx` og `dy` — kun trigger swipe hvis det er en klar horisontal gestus:
```js
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty; // must store ty on touchstart too
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    dx < 0 ? go(1) : go(-1);
  }
});
```

### 🟡 Dots-navigasjon: 8 dots er for smale på mobil (14px + 8px gap = 176px total)
**Problem:** På 320px-skjermer fyller dots-raden nesten all tilgjengelig plass mellom Back og Next knappene. Klikk på dots er vanskelig.  
**Fix:** På `@media (max-width: 480px)`: skjul dots eller erstatt dem med `Seksjon X av Y`-tekst som allerede vises i header.

### 🟡 `input[type=number]` spinner-piler vises på desktop — forstyrrer layout
**Problem:** Native number spinners på desktop er stygge og bryter den dark-UI-estetikken.  
**Fix:**
```css
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
input[type=number] { -moz-appearance: textfield; }
```

### 🟡 `user-scalable=no` i viewport meta — dårlig UX og dårlig aksessibilitet
**Problem:** `<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">` hindrer brukeren i å zoome. Dette er et problem for synsnedsatte og brukere som trenger å lese tekst tettere.  
**Fix:** Fjern `user-scalable=no` — skjemaet fungerer godt nok uten det.

### 🟢 Radios og checkboxes: span-tekst mangler `pointer-events: none` — klikk-area inkonsekvent
**Problem:** Klikkbar area på radio-labels er korrekt, men brukere som klikker på kanten av span-teksten kan oppleve at input ikke triggres.  
**Fix:** Allerede håndtert med full label-størrelse, men eksplisitt `cursor: pointer` på span ville bedret opplevelsen.

### 🟢 Slider-combo på seksjon 4 mangler visuell progress-fill
**Problem:** Slideren for `kontor_pct` ser lik ut uansett verdi (ingen fargefill til venstre). Andre slidere har det samme problemet.  
**Fix:** Bruk JS til å oppdatere en CSS custom property som driver background-gradient på range-input.

### 🟢 Emoji-rad (frustrasjonsnivå): ingen label eller forklaring av emoji-rekkefølgen
**Problem:** 5 emojier uten tallforklaring. Er 😀 bra eller dårlig? Brukere som er usikre kan velge feil.  
**Fix:** Legg til `<div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--muted)"><span>😀 Bra</span><span>🤬 Ekstremt</span></div>` under emoji-raden.

### 🟢 Ingen "er du sikker?"-bekreftelse ved tilbakenavigasjon fra seksjon 7/8
**Problem:** Brukeren kan ved uhell trykke Tilbake og miste ROI-kalkulatorverdier (disse er ikke data-key-lagrede).  
**Fix:** localStorage lagrer alt via `save()` + `change`-event, så data bevares — men det er ikke kommunisert til brukeren. Legg til en liten toast: "Fremgang er lagret automatisk."

---

## 2. Accessibility

### 🔴 Ingen `<label for="">` koblet til inputs via `id` — screen readers leser ingenting
**Problem:** Alle `<label>` tags omslutter en `<div class="radio-group">` eller er standalone `<label>` uten `for`-attributt koblet til input. Screen readers som NVDA/VoiceOver vet ikke hva feltet handler om.  
**Eksempel:**
```html
<!-- NÅVÆRENDE (feil) -->
<div class="field"><label>Bedriftsnavn</label><input type="text" data-key="bedriftsnavn" ...></div>

<!-- RIKTIG -->
<div class="field">
  <label for="bedriftsnavn">Bedriftsnavn</label>
  <input type="text" id="bedriftsnavn" data-key="bedriftsnavn" ...>
</div>
```
**Skala:** Gjelder alle ~30+ input-felt i applikasjonen.

### 🔴 Emoji-knapper mangler `aria-label`
**Problem:** `<button type="button" onclick="selEmoji(this,1)">😀</button>` — screen reader leser bare "😀" eller "Smilende fjes". Brukeren vet ikke at dette er en frustrasjonskala.  
**Fix:**
```js
const emojiLabels = ['Veldig bra (1)', 'Greit (2)', 'Nøytralt (3)', 'Frustrerende (4)', 'Ekstremt frustrerende (5)'];
`<button type="button" aria-label="${emojiLabels[i]}" ...>`
```

### 🔴 `user-scalable=no` bryter WCAG 1.4.4 (Resize Text, Level AA)
**Problem:** Allerede nevnt under UX. Som accessibility-brudd er det imidlertid kritisk — WCAG 2.1 krever at tekst kan skaleres til 200% uten tap av innhold.  
**Fix:** Fjern `user-scalable=no`.

### 🟡 Fargekontrast: `--muted: #8a9bb5` på `--navy: #1a2332` bakgrunn
**Problem:** Kontrastforhold: ca. 3.8:1. WCAG AA krever 4.5:1 for normal tekst. Hint-tekster, footer og mange subtekster bruker `var(--muted)` og er dermed under kravet.  
**Fix:** Endre `--muted` til `#9aadc5` (ca. 4.6:1 kontrast på navy-bakgrunn) — minimale visuell endring.

### 🟡 Prosess-kort fjern-knapp (`✕`) har ingen aria-label
**Problem:** `<button class="remove-card" onclick="removeProcessCard(this)">✕</button>` — screen reader sier "X" uten kontekst.  
**Fix:** `<button class="remove-card" aria-label="Fjern prosess" ...>✕</button>`

### 🟡 Rank-list pilknapper mangler aria-labels
**Problem:** `<button onclick="moveRank(this,-1)">▲</button>` — screen reader sier "Opp-trekant".  
**Fix:** `<button onclick="moveRank(this,-1)" aria-label="Flytt opp">▲</button>`

### 🟡 Focus management ved seksjonsbytte er delvis implementert
**Problem:** `render()` kaller `focus()` på første input etter 350ms timeout, men dette fungerer ikke alltid (iOS Safari ignorer programmatisk fokus uten user gesture). Dessuten fokuserer den alltid første input, ikke nødvendigvis det semantisk riktige elementet.  
**Fix:** Fokuser seksjons-headingen heller enn input, og bruk `tabIndex=-1` på headingen:
```js
const heading = sections[current].querySelector('h2, .section-intro');
if (heading) { heading.tabIndex = -1; heading.focus(); }
```

### 🟡 Ingen `role="alert"` eller live region for validasjonsfeil
**Problem:** Det er null validering i appen — verken client-side eller server-side. Hvis brukeren sender inn uten e-post, skjer ingenting (bortsett fra at `submitToSupabase` sender tom verdi).  
**Fix:** Legg til minimum e-post-validering ved submit, og bruk `aria-live="polite"` for feilmeldinger.

### 🟢 Intro-screen `h1` er stilt som `.intro-title` men er semantisk en `<h1>`
**Problem:** Siden har to `<h1>` — ett i intro-screen og ett implisitt via brand-header. Screen readers lister alle H1 tags.  
**Fix:** Gjør intro-title til `<h2>` eller `<p>` og behold den stilede utseendet.

### 🟢 SOP-tabs mangler `role="tablist"` og `role="tab"` ARIA-attributter
**Problem:** Tab-komponenten er laget med `<div>` elements uten ARIA-roller.  
**Fix:**
```html
<div class="sop-tabs" role="tablist" id="sopTabs">
  <!-- each tab: role="tab" aria-selected="true/false" -->
```

### 🟢 Checkboxes i `.sop-processes` mangler group label
**Problem:** Prosesslistene per bransje har en `<h4>` header, men checkboxene er ikke koblet til den via `aria-labelledby` eller `<fieldset>/<legend>`.

---

## 3. Performance

### 🔴 Massiv CSS bloat: to separate `<style>` blokker med overlappende regler
**Problem:** Filen har en første `<style>` blokk (~300 linjer) og en andre `<!-- MANHWA HUD -->` blokk (~600 linjer). Begge definerer regler for de samme elementene (`input:focus`, `.radio-group label:has(input:checked)`, `.progress-fill`, osv.) med den andre blokken som overskriver den første. Dette er ~30KB ren CSS.

Eksempler på duplikater:
- `.radio-group label:has(input:checked)` definert to ganger
- `input[type=text]:focus` med forskjellig `border-color` i begge blokker  
- `transition: box-shadow 0.3s ease, border-color 0.3s ease` på `*` selector + individuelle transitions overalt
- `.progress-bar` definert to ganger (height, background, border-radius)

**Fix:** Slå sammen til én CSS-blokk. Estimer ~40% reduksjon i CSS-størrelse (~12KB spart).

### 🔴 Global `transition` på `*` selector — performance problem
**Problem:**
```css
*, *::before, *::after {
  transition: box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
}
```
Dette betyr at HVERT DOM-element i siden animeres ved enhver state-endring. På en side med mange inputs og radio-buttons, fører dette til janky scroll på eldre telefoner og unødig GPU-bruk.  
**Fix:** Fjern wildcard-transition. Legg heller eksplisitte transitions på de elementene som trenger det.

### 🟡 html2pdf.js lastes fra CDN for alle brukere — selv de som aldri genererer PDF
**Problem:** `<script src="https://cdnjs.cloudflare.com/...html2pdf.bundle.min.js">` er ~500KB JS lastet synkront i `<head>`. Dette blokkerer rendering og er unødvendig for de fleste brukere.  
**Fix:** Lazy-load biblioteket kun når brukeren trykker "Generer Rapport":
```js
async function generateRapport() {
  if (!window.html2pdf) {
    await loadScript('https://cdnjs.cloudflare.com/.../html2pdf.bundle.min.js');
  }
  // ... resten av funksjonen
}
```

### 🟡 Ingen debounce på `save()` som kalles ved hvert `input`-event
**Problem:**
```js
document.addEventListener('input', save);
document.addEventListener('change', save);
```
`save()` kaller `collectAll()` som traverserer alle DOM-noder, deretter skriver til localStorage. For hver tastetrykk i et textarea. På lavpris-Android med 50+ inputs og process-cards, kan dette forårsake frysing.  
**Fix:**
```js
let saveTimer;
function debouncedSave() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 300); }
document.addEventListener('input', debouncedSave);
document.addEventListener('change', save); // change er ok uten debounce
```

### 🟡 `#rapport-content` div er alltid i DOM med `position:absolute; left:-9999px`
**Problem:** Dette er et gammelt hack for å skjule print-innhold. Det tar opp DOM-minne og kan forstyrre screen readers (innhold er "synlig" men off-screen).  
**Fix:** Opprett div-en dynamisk i JS kun ved PDF-generering, og fjern den etterpå (som koden allerede gjør med `container.innerHTML=''`, men div-en selv forblir i DOM).

### 🟡 `scan-line` bakgrunn på `body::after` med `z-index: 9999`
**Problem:** Et `position:fixed; z-index:9999` overlay over hele siden som alltid er rendert. Dette er en performance-cost (composite layer) og kan blokkere klikk-events på elementer som er nærmere brukeren visuelt (selv om `pointer-events:none` er satt).  
**Fix:** Vurder å fjerne scan-line effekten helt på mobil (allerede gjort for `opacity:0.2`, men den composite layer-kostnaden er fortsatt der). Bruk `will-change: auto` eksplisitt for å unngå unødig promotion.

### 🟢 Inline SVG i CSS for select-pil er ikke cached
**Problem:** `background-image:url("data:image/svg+xml,...")` på select-element betyr at browseren dekoder SVG ved parse-time. Liten effekt, men overflødig når pilene finnes i CSS-biblioteker.

### 🟢 Ingen `<link rel="preconnect">` for cdnjs.cloudflare.com
**Problem:** html2pdf.js hentes fra CDN uten preconnect-hint. Legg til:
```html
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
```

### 🟢 `@keyframes gridPulse` endrer `background-size` — trigger layout
**Problem:** Animasjonen på `#introScreen` endrer `background-size: 40px → 42px`. Dette trigger paint (ikke bare composite), som er suboptimalt for GPU-animasjoner.  
**Fix:** Bruk `transform: scale()` på et pseudo-element istedenfor å endre background-size.

---

## 4. Funksjonalitet Bugs

### 🔴 `getRate()` returnerer `500` som default men ROI-kalkulatoren bruker `800` som hardkodet default
**Problem:** Inkonsistens mellom to steder:
```js
// getRate():
function getRate(){ return Number(document.getElementById('roiHourlyRate')?.value||500) }

// buildPackageSection():
const curHourly = document.getElementById('roiHourlyRate')?.value || 500;
// men:
roiEl.innerHTML = `...value="${curSaving}" ...` // bruker 'curSaving' som ikke er definert på dette tidspunktet!
```
`curSaving` er brukt i `buildPackageSection()` **før** `const saving = Math.round(totalH*0.5)` er definert på linje som kommer ETTER. Dette er en `ReferenceError` i streng modus.  
**Fix:** Flytt `const saving = Math.round(totalH*0.5)` til toppen av `buildPackageSection()`, og standardiser hourly rate til én konstant.

### 🔴 `processCount` teller aldri ned — max 15 prosesser håndheves feil
**Problem:**
```js
function makeProcessCard(data){
  processCount++;
  if(processCount>15) return;
  ...
}
```
Når brukeren fjerner et kort med `removeProcessCard()`, dekrementeres ikke `processCount`. Etter 15 tillegg (inkludert fjerning), kan brukeren ikke legge til nye selv om det er <15 aktive kort.  
**Fix:** Tell faktiske DOM-kort i stedet:
```js
function makeProcessCard(data){
  const activeCards = document.querySelectorAll('.process-card').length;
  if(activeCards >= 15) { alert('Maks 15 prosesser'); return; }
  ...
}
```

### 🔴 `collectAll()` overskrives med IIFE-pattern men er kalt via `_origCollect` — circular reference risiko
**Problem:**
```js
const _origCollect = collectAll;
collectAll = function(){
  const d = _origCollect();  // kaller original
  d.valgt_pakke = ...;
  return d;
};
```
Denne override skjer i global scope. Hvis `buildPackageSection()` kalles mer enn én gang, skjer override-en igjen og `_origCollect` peker nå på den ALLEREDE-overridede versjonen. Resultat: `valgt_pakke` legges til to ganger og potensielt andre data-felt overskrives.  
**Fix:** Flytt pakke-data-innsamling inn i den originale `collectAll()` direkte:
```js
function collectAll(){
  const d = { ... };
  // ... eksisterende kode ...
  d.valgt_pakke = selectedPkg ? pkgNames[selectedPkg] + ' (' + pkgPrices[selectedPkg].toLocaleString('nb-NO') + ' kr)' : '';
  d.valgt_pakke_pris = selectedPkg ? pkgPrices[selectedPkg] : 0;
  return d;
}
```

### 🔴 `submitToSupabase()` kaller `/api/submit` — denne ruten eksisterer ikke for en statisk HTML-fil
**Problem:** Applikasjonen er en single-file HTML, men sender en POST til `/api/submit`. Dette vil alltid returnere 404 med mindre det kjøres bak en spesifikk server. Feilen er fanget med `try/catch` og logget som "non-fatal", men i praksis sendes **ingen data** til Krisfred.  
**Konsekvens:** Alle kartlegginger forsvinner etter at brukeren lukker fanen.  
**Fix:** Implementer en faktisk backend (Supabase direct, Netlify function, osv.) ELLER som midlertidig løsning, send data via e-post med mailto-link og vis det som en "kopier JSON" flyt. Minst bruk localStorage og gi brukeren en "kopier link med data"-knapp.

### 🟡 `updateBreakEven()` refererer `recPkg` som lokal variabel i `buildPackageSection()` — `undefined` utenfor scope
**Problem:**
```js
function updateBreakEven(){
  const activePkg = selectedPkg || (typeof recPkg !== 'undefined' ? recPkg : 1);
  ...
}
```
`recPkg` er deklarert med `let` inne i `buildPackageSection()`. `typeof recPkg !== 'undefined'` vil alltid returnere `true` i global scope (variabelen eksisterer ikke, men `typeof` av ikke-eksisterende variabel returnerer `'undefined'` string). Resultatet: `activePkg` vil alltid falle tilbake til `1` (Ultra Basic) når ingen pakke er valgt.  
**Fix:** Flytt `recPkg` til modul-scope som `let recommendedPkg = 1`.

### 🟡 `loadSaved()` kaller `getStoreKey()` som baseres på `bedriftsnavn` input — men input kan være tom ved første load
**Problem:** Når siden lastes, er `bedriftsnavn` input tom. `getStoreKey()` returnerer `'ki_kartlegging_default'`. Koden faller tilbake til default key — som er korrekt — men hvis brukeren skriver et bedriftsnavn, lagres data under ny key, og ved reload lastes `default`-data (tom). Data-migrasjon skjer ikke.  
**Fix:** Bruk alltid én fast key basert på session, eller lagre bedriftsnavnet som metadata og last siste lagrede session uavhengig av navn.

### 🟡 `makeProcessCard()` genererer radio-inputs med `name="freq${idx}"` — men `idx` er alltid `processCount` ved opprettelse, ikke unik etter reload
**Problem:** Etter reload fra localStorage kalles `makeProcessCard(p)` for hver lagret prosess. `processCount` telles opp, men hvis rekkefølgen endres (f.eks. brukeren fjernet midterste kort), vil radio-name-attributter kollidere mellom gamle og nye kort.  
**Fix:** Bruk `crypto.randomUUID()` eller en timestamp-basert unik ID istedenfor `processCount`.

### 🟡 Touch-swipe lytter mangler `ty` referanse
**Problem:**
```js
let tx=0;
document.addEventListener('touchstart', e => tx = e.touches[0].clientX);
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx;
  if(Math.abs(dx) > 60){ dx < 0 ? go(1) : go(-1) }
});
```
`ty` (Y-koordinat) lagres ikke, men brukes ikke heller. Buggen er at enhver horisontal swipe > 60px trigger navigasjon, inkludert scrolling. Se UX-punkt 4.

### 🟡 `generateRapport()` bruker `rapportHTML` streng med kompleks template literal — variabel `saving` ikke alltid definert
**Problem:** Inne i `generateRapport()` er `const saving = Math.round(totalH*0.5)` definert, men `getRate()` refererer til `roiHourlyRate` input som kun eksisterer etter `buildPackageSection()` er kjørt (seksjon 8). Hvis brukeren genererer PDF fra confirmation screen uten å ha besøkt seksjon 8, returnerer `getRate()` fallback `500`.  
**Fix:** Gi `generateRapport()` muligheten til å beregne rate uavhengig av DOM-input:
```js
const hourlyRate = Number(document.getElementById('roiHourlyRate')?.value) || 500;
```
(allerede gjort — men sjekk at `||500` brukes konsistent, ikke `||800`).

### 🟢 `addKundeKanalChip()` tillater duplikater
**Problem:** Brukeren kan legge til "Annet" to ganger. Ingen duplikat-sjekk.  
**Fix:** `if(kanalChips.includes(inp.value.trim())) return;`

### 🟢 `selEmoji()` finner ikke riktig hidden input når det er mange prosess-kort
**Problem:**
```js
btn.parentElement.nextElementSibling.value = val;
```
Antar at hidden input alltid er umiddelbart etter emoji-row-div. Hvis HTML-strukturen endres (ekstra div, etc.), brytes denne.  
**Fix:** Bruk `card.querySelector('input[data-pkey=frustrasjon]')` fra card-kontekst.

---

## 5. Innhold / Copy

### 🟡 "Krisfred tar kontakt innen 24 timer" — hardkodet navn i confirmation screen
**Problem:** Bekreftelsesteksten sier `<strong>Krisfred tar kontakt innen 24 timer</strong>`. Dette er bra for personlig touch, men hvis en annen konsulent bruker verktøyet, er det feil.  
**Fix:** Lag en konfigurerbar konstant øverst i filen: `const KONSULENT_NAVN = 'Krisfred'` — eller behold det (dette er OK for nåværende bruk).

### 🟡 Seksjon 4: "Tid på admin vs produksjon" — slider-label er forvirrende
**Problem:** Label sier "Dra slideren — hvor mye av arbeidsdagen går til kontor/admin-arbeid?" men slider-val viser `30% admin — 70% produksjon`. Ordet "kontor" og "admin" brukes om hverandre. Noen tømrere vil oppfatte "kontor" som "sitter på kontoret" og ikke forstå at det inkluderer tilbudsskriving i bilen.  
**Fix:** Endre tekst til: "Hvor mye av arbeidstiden brukes på kontorarbeid, administrasjon og papirarbeid?"

### 🟡 "ROI-kalkulator" header vises i seksjon 7 men ROI-inputs er i seksjon 8
**Problem:** Brukeren ser ROI-oppsummeringen i seksjon 7 uten å ha sett ROI-kalkulatoren i seksjon 8. Tallene er beregnet med default verdier. Dette er forvirrende.  
**Fix:** Flytt ROI-kalkulatoren til seksjon 6 (KI-Interesse) eller seksjon 7 (før oppsummeringen).

### 🟢 "praktiski.no" — domenet er ikke registrert ifølge USER.md
**Problem:** PDF-rapporten inneholder `praktiski.no` som URL i footer. USER.md sier "Domain: praktiski.no (ikke registrert ennå)".  
**Fix:** Bruk en midlertidig placeholder eller registrer domenet FØR distribusjon av denne kartleggingsappen.

### 🟢 "Ultra Basic" er et fremmedord i en norsk kontekst
**Problem:** Pakkenavnene er norsk/norsk/norsk... og så "Ultra Basic". Inkonsistent.  
**Fix:** Vurder "Komme i gang" eller "Grunnpakke" istedenfor "Ultra Basic".

### 🟢 Tilbakemeldings-seksjon ("Tilbakemelding på kartleggingen") er i seksjon 8 — etter at brukeren har valgt pakke
**Problem:** Logisk rekkefølge burde være: velg pakke → send inn → tilbakemelding. I nåværende flyt er tilbakemelding blandet inn mellom pakkevalg og submit-knapp.  
**Fix:** Flytt tilbakemeldings-blokken til en dedikert siste seksjon, eller vis den på confirmation screen.

### 🟢 Seksjon 2: "Nettsider dere besøker ofte i jobbsammenheng" — uklart formål
**Problem:** Spørsmålet samler data om vanlige nettsider (yr.no, Optimera, etc.) men det er uklart hva dette brukes til i rapporten. Det dukker ikke opp i PDF-rapporten.  
**Fix:** Enten vis dette i rapporten under "Digital modenhet" eller fjern spørsmålet.

### 🟢 "Org.nummer" — bør formateres automatisk (XXX XXX XXX)
**Problem:** Placeholder sier "F.eks. 912 345 678" men ingen formatering eller validering.  
**Fix:** Legg til `inputmode="numeric"` og en `oninput` formateringshandler.

---

## 6. Kodekvalitet

### 🔴 `pkgPrices` og `pkgNames` er definert to ganger — i global scope og inne i `generateRapport()`
**Problem:**
```js
// Global scope:
const pkgPrices = {1:20000, 2:79000, 3:119000, 4:149000};
const pkgNames = {1:'Ultra Basic', 2:'Basis', 3:'Komplett', 4:'Premium'};

// Inne i generateRapport():
const pkgPrices = {1:20000, 2:79000, 3:119000, 4:149000};
const pkgNames = {1:'Ultra Basic', 2:'Basis', 3:'Komplett', 4:'Premium'};
```
Dette gir en `SyntaxError: Identifier 'pkgPrices' has already been declared` i strict mode. I sloppy mode (uten `"use strict"`) vil den lokale `const` skygge den globale, men det er duplisering og potensiell bug ved fremtidig endring.  
**Fix:** Fjern den interne redefinisjon og bruk global scope-variablene i `generateRapport()`.

### 🟡 Mangler `"use strict"` — global scope pollution og stille feil
**Problem:** Hele scriptet kjører i sloppy mode. `recPkg`, `saving`, `weeklySaving`, etc. brukt uten eksplisitt scope. Faktisk `var` brukes ikke, men uten strict mode er det ingen garanti mot utilsiktede globals.  
**Fix:** Pakk hele script i IIFE med strict mode:
```js
(function() {
  'use strict';
  // ... all code
})();
```

### 🟡 `buildSummary()` genererer HTML via string concatenation — XSS-risiko
**Problem:** Brukerdefinerte verdier interpoleres direkte i HTML:
```js
html += `<tr><td>${d.bedriftsnavn||'—'}</td>...`
```
Hvis en bruker skriver `<script>alert(1)</script>` som bedriftsnavn, vil dette renderes (og kjøres) i oppsummeringen og i PDF-rapporten.  
**Fix:** Skaff en enkel escape-funksjon:
```js
function esc(s){ const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }
// Bruk: `<td>${esc(d.bedriftsnavn)||'—'}</td>`
```

### 🟡 `buildSopTabs()` og `renderSopProcesses()` kalles ved hver tab-klikk — ikke cached
**Problem:** `buildSopTabs()` rekonstruerer hele tab-DOM ved hver klikk, selv om tabs-listen ikke endres. `renderSopProcesses()` liknende.  
**Fix:** Cache SOP-tab elementene og kun oppdater active state.

### 🟡 Bruk av `onclick=""` inline i HTML for alle interaktive elementer
**Problem:** All event-håndtering er via inline `onclick` attributter. Dette er en anti-pattern som:
1. Setter globale scope-funksjoner som krav
2. Gjør testing vanskelig
3. Bryter CSP (Content Security Policy) hvis den noen gang implementeres  
**Fix:** Erstatt med `addEventListener` i JS. Minst for de kritiske elementene.

### 🟡 Ingen error boundary rundt `generateRapport()` — hvis html2pdf feiler kræsjer siden stille
**Problem:** `html2pdf().set(opt).from(container).save()` er asynkron. En feil (nettverk, minne, ugyldig DOM) vil bli swallowed. Brukeren ser ingen feilmelding.  
**Fix:**
```js
html2pdf().set(opt).from(container).save()
  .then(() => { container.innerHTML = ''; setLoading(false); })
  .catch(err => { console.error(err); alert('PDF-generering feilet. Prøv igjen.'); setLoading(false); });
```

### 🟢 `emojis` array er definert i global scope men brukes kun i to funksjoner
**Fix:** Flytt inne i de funksjonene som bruker dem, eller eksplisitt mark som "konstant konfigurering" øverst i filen.

### 🟢 `let currentStoreKey = null` initialiseres men `currentStoreKey = getStoreKey()` på slutten av `loadSaved()` er overflødig — `getStoreKey()` ble allerede kalt øverst i funksjonen
**Fix:** Fjern duplikatlinjen.

### 🟢 Funksjonen `getCardData(card)` brukes kun i `updateKIBadge(card)` men de to funksjonene er definert langt fra hverandre
**Fix:** Flytt `getCardData` rett over `updateKIBadge` for lokasjonsmessig kohesjon.

---

## 7. SEO

### 🔴 Ingen Open Graph / Twitter Card meta tags
**Problem:** Ingen `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card` osv. Hvis URL deles på Facebook, LinkedIn eller Twitter, vises ingen preview — bare blank link.  
**Fix:**
```html
<meta property="og:title" content="KI-Kartlegging — Praktisk Intelligens">
<meta property="og:description" content="Finn ut hva KI kan gjøre for din bedrift. Gratis 10-minutters kartlegging.">
<meta property="og:image" content="https://praktiski.no/og-image.png">
<meta property="og:url" content="https://praktiski.no/kartlegging">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

### 🔴 Ingen `<meta name="description">` tag
**Problem:** Google bruker meta description i søkeresultater. Uten den viser Google tilfeldig tekst fra siden.  
**Fix:**
```html
<meta name="description" content="Gratis KI-kartlegging for norske SMB-er. Finn ut hvilke prosesser KI kan automatisere og få en personlig rapport med ROI-estimat.">
```

### 🟡 Ingen `<link rel="canonical">` tag
**Problem:** Hvis siden er tilgjengelig på flere URLs (med/uten trailing slash, http vs https), kan det føre til duplicate content-issues i Google.  
**Fix:** `<link rel="canonical" href="https://praktiski.no/kartlegging.html">`

### 🟡 Title-tag er generisk: "KI-Kartlegging — Praktisk Intelligens"
**Problem:** Ingen nøkkelord som søkere faktisk bruker. "KI" er mindre søkt enn "AI" og "kunstig intelligens".  
**Fix:** `<title>Gratis KI-kartlegging for din bedrift | Praktisk Intelligens — Finn ditt KI-potensial</title>`

### 🟡 Ingen structured data (JSON-LD)
**Problem:** For et lead-gen tool burde siden ha `LocalBusiness` eller `Service` schema markup for å forbedre Google rich results.  
**Fix:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "KI-Kartlegging",
  "provider": { "@type": "LocalBusiness", "name": "Praktisk Intelligens" },
  "description": "Gratis KI-kartlegging for norske SMB-er",
  "areaServed": "NO",
  "isAccessibleForFree": true
}
</script>
```

### 🟢 `<html lang="no">` er riktig — bra
**Nå:** Korrekt implementert. Ingen endring nødvendig.

### 🟢 Ingen `robots.txt` eller `sitemap.xml` tilgjengelig (utenfor scope for denne filen, men nevnes)

### 🟢 Ingen `<link rel="icon">` / favicon
**Problem:** Browser-tab viser standard-ikon. Profesjonelt utseende krever favicon.  
**Fix:** `<link rel="icon" href="/favicon.ico" type="image/x-icon">`

---

## Prioritert tiltaksliste

### 🔴 Gjør først (kritisk, påvirker funksjonalitet og data)

1. **`/api/submit` eksisterer ikke** — data forsvinner. Koble til Supabase eller alternativ backend.
2. **`pkgPrices`/`pkgNames` dobbel-definisjon** — fjern interne redefinisjon fra `generateRapport()`.
3. **`processCount` teller aldri ned** — bruk `querySelectorAll('.process-card').length`.
4. **`collectAll` override-bug** — flytt pakke-data inn i original funksjon.
5. **`curSaving` undefined i `buildPackageSection()`** — flytt `const saving` til toppen.
6. **Fjern `user-scalable=no`** — WCAG-brudd og dårlig UX.
7. **Legg til `<meta name="description">` og OG-tags** — kritisk for deling og SEO.

### 🟡 Gjør innen en uke (medium)

8. Fjern global wildcard `transition` — bytt med spesifikke transitions.
9. Lazy-load html2pdf.js — store performance-gevinst.
10. Legg til debounce på `save()`.
11. Fiks swipe-navigasjon (sjekk dy vs dx).
12. Legg til ARIA-labels på emoji-knapper, rank-piler og fjern-knapper.
13. Koble `<label for="">` til alle inputs.
14. XSS-escape i `buildSummary()` — brukerdata i HTML.
15. Legg til error handling i `generateRapport()`.
16. Fiks `recommendedPkg` scope-bug i `updateBreakEven()`.

### 🟢 Gjør når tid tillater (minor / polish)

17. Slå sammen de to CSS-blokkene.
18. Legg til emoji-skala-forklaring (😀 Bra ← → 🤬 Ekstremt).
19. Legg til duplikat-sjekk i `addKundeKanalChip()`.
20. Registrer `praktiski.no` domenet.
21. Legg til favicon.
22. Vurder å fjerne "Ultra Basic" — norsk alternativ.
23. Flytt tilbakemeldings-seksjon til slutten av flyt.

---

## Sammendrag

Applikasjonen er **funksjonelt imponerende for en single-file HTML** — den er tydelig designet med omhu og inneholder mye kompleks logikk. De kritiske funnene er:

1. **Data forsvinner** — ingen backend fungerer. Dette er den største showstopper.
2. **JS-feil** — `pkgPrices` re-deklarasjon og `collectAll` override er potensielle runtime-feil.
3. **Accessibility** — siden er nesten ubrukelig for screen reader-brukere.
4. **SEO** — ingen meta tags betyr null organisk distribusjon.
5. **Performance** — 500KB synkron JS-last og wildcard CSS-transitions bør fikses.

Det positive: mobil-responsiviteten er gjennomtenkt, det visuelle designet er distinkt og profesjonelt, og user flow er logisk og godt strukturert.

---
*Rapport generert av Sensei (Praktisk Intelligens subagent) — 2026-03-27*
