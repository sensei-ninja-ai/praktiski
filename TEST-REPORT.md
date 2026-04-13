# TEST-REPORT: KI-kartlegging chatbot — Nordvik Bygg AS
**Dato:** 2026-03-30  
**Tester:** Subagent (simulert daglig leder Lars Nordvik, Nordvik Bygg AS)  
**Endpoint:** `http://localhost:3456/api/chat-kartlegging`  
**Antall runder:** 7 (brukermelding/AI-svar-par)

---

## Fullstendig Samtalelogg

### Runde 1
**Confidence etter steg: 15**

**Bruker:**  
> Hei, jeg heter Lars Nordvik og er daglig leder i Nordvik Bygg AS

**KI:**  
> Hei Lars! Hyggelig å møte deg.
> 
> Nordvik Bygg AS - det høres ut som dere jobber med byggeoppdrag. Kan du fortelle meg litt mer om hva slags type byggeprosjekter dere driver med? Er det boliger, næringslokaler, eller kanskje litt av begge deler?

---

### Runde 2
**Confidence etter steg: 25**

**Bruker:**  
> Vi driver mest med rehabilitering og oppussing av boliger, litt nybygg privat. Vi er 8 mann, holder til i Tromsø. Har drevet i 6 år nå.

**KI:**  
> Flott! Rehabilitering og oppussing er jo et marked som bare vokser, spesielt med alle de eldre husene i nord.
> 
> Med 8 mann så begynner dere å bli en grei størrelse. Hvilke digitale verktøy bruker dere i dag for å holde styr på økonomien - er det Fiken, Tripletex, eller noe annet? Og har dere noe system for å holde oversikt over prosjektene deres?

---

### Runde 3
**Confidence etter steg: 35**

**Bruker:**  
> Vi bruker Fiken til regnskap, det fungerer greit. Men prosjektstyring er litt mer hjemmelaget, haha. Jeg har et Excel-ark jeg prøver å holde oppdatert, og så har vi papirnotater ute på prosjektene. Timeregistrering gjøres manuelt på papir av karene, og det er litt... kaos. Jeg bruker nok 15-20 timer i uka bare på admin.

**KI:**  
> Uff, 15-20 timer admin i uka! Det er jo nesten en hel arbeidsuke. Skjønner at det blir kaotisk med papirnotater og manuell timeregistrering.
> 
> La meg spørre deg - av disse 15-20 timene, hva er det som tar mest tid? Er det å samle inn timelister fra gutta, kalkulere tilbud, eller noe helt annet? Og hvor frustrerende er det på en skala fra 1-10 når du skal prøve å finne ut hvor mye tid som faktisk er brukt på et prosjekt?

---

### Runde 4
**Confidence etter steg: 65**

**Bruker:**  
> Tilbudsberegning er verst. Det tar jo evigheter å regne ut et tilbud ordentlig - jeg bruker 3-4 timer per tilbud noen ganger. Og så sender jeg det avgårde og hører kanskje aldri noe mer. Det hender jeg glemmer å følge opp. Fakturering er også kaotisk, jeg glemmer faktisk å fakturere for alt vi gjør noen ganger. Frustrasjonsgrad? Lett 8 av 10.

**KI:**  
> Å høre, det var smertefullt å høre! 3-4 timer per tilbud, og så glemmer du å følge opp eller fakturere... Det er jo penger rett ut av vinduet.
> 
> To spørsmål: Hvor mange tilbud sender dere ut i måneden omtrent? Og hvis du hadde fått tilbake de 10-15 timene du bruker på unødvendig admin hver uke - hva ville du helst brukt tiden på da?

---

### Runde 5
**Confidence etter steg: 75**

**Bruker:**  
> Vi sender ut ca 6-8 tilbud i måneden. Hvis jeg fikk mer tid ville jeg brukt det på å snakke med kunder og skaffe nye oppdrag. Vi har lyst til å vokse - målet mitt er 12 ansatte neste år og doble omsetningen. Men nå kveler admin-jobben meg litt.

**KI:**  
> Perfekt - nå ser jeg bildet! 6-8 tilbud i måneden som tar 3-4 timer hver, og du vil doble omsetningen neste år. Det er jo en klar sammenheng der.
> 
> Har du prøvd noe KI-verktøy før, eller er det helt nytt for deg? Og hva tenker du det hadde vært verdt for deg per måned å slippe 10-15 timer admin og få bedre kontroll på tilbud og fakturering?

---

### Runde 6
**Confidence etter steg: 85 — DONE: true**

**Bruker:**  
> Jeg har tullet litt med ChatGPT privat, skrevet noen meldinger og sånt. Men i bedriften har vi ikke brukt KI til noe. Jeg vet ikke helt hva som er mulig egentlig. Budsjettet mitt for sånt ville vel vært 50-100k i året hvis det faktisk gir resultater. Men jeg er litt skeptisk til om det faktisk funker for oss i bygg.

**KI:**  
> Skjønner skepsisen - bygg er jo veldig fysisk og praktisk. Men jeg ser faktisk tre ganske konkrete områder hvor KI kan hjelpe deg mye:
> 
> **1. Automatisk tilbudsberegning**: I stedet for 3-4 timer kan du få det ned til 30 minutter. KI kan lese tegninger, foreslå materiallister og gi deg startpunkt for prisberegning basert på dine historiske data.
> 
> **2. Oppfølging og faktureringsassistent**: En KI kan automatisk sende oppfølgingsmeldinger på tilbud og påminne deg om hva som skal faktureres basert på timelistene.
> 
> **3. Smart timeregistrering**: I stedet for papir kan gutta bruke en app som automatisk foreslår aktiviteter basert på prosjekt og tidligere registreringer.
> 
> Med budsjettet ditt på 50-100k i året er dette helt realistisk å få til. Du ville sannsynligvis tjent inn investeringen bare på å ikke glemme fakturering og få flere tilbud ut døra.
> 
> Høres dette ut som noe som kunne fungert for dere?

---

## Confidence-utvikling

| Steg | Confidence | Kommentar |
|------|------------|-----------|
| 1 | 15 | Bare navn og bransje kjent |
| 2 | 25 | Antall ansatte og sted lagt til |
| 3 | 35 | Verktøy + admin-timer kartlagt |
| 4 | 65 | **Stort hopp** — smertepunkter avdekket med konkrete tall |
| 5 | 75 | Mål og tilbudsvolum klargjort |
| 6 | 85 → **DONE** | KI-erfaring og budsjett på plass |

---

## Collected Data ved avslutning

```json
{
  "bedriftsnavn": "Nordvik Bygg AS",
  "bransje": "Bygg - rehabilitering og oppussing boliger",
  "ansatte": "8",
  "omsetning": "",
  "rolle": "Daglig leder",
  "regnskap": ["Fiken"],
  "prosjektstyring": ["Excel hjemmelaget"],
  "kundeoppfolging": [],
  "timereg": ["Manuell papir"],
  "some": [],
  "nettside": "",
  "prosesser": [
    "Admin 15-20 timer/uke",
    "Tilbudsberegning 3-4 timer per tilbud",
    "6-8 tilbud per måned",
    "Glemmer oppfølging av tilbud",
    "Glemmer fakturering"
  ],
  "smertepunkter": "Tilbudsberegning tar 3-4 timer per tilbud, glemmer oppfølging, kaotisk fakturering, frustrasjonsgrad 8/10",
  "admin_pct": 0,
  "maal": "12 ansatte neste år, doble omsetningen. Vil bruke frigjort tid på kundearbeid og vekst",
  "ki_erfaring": "Tullet med ChatGPT privat, ikke brukt KI i bedriften",
  "budsjett": "50-100k i året",
  "ki_grenser": "Skeptisk til om KI funker for bygg",
  "konkurrenter": "",
  "kundekanaler": [],
  "analyse": "1. Automatisk tilbudsberegning (ned fra 3-4 timer til 30 min), 2. Oppfølging og faktureringsassistent, 3. Smart timeregistrering app"
}
```

---

## Vurdering

### ✅ Det som fungerte bra

**1. Naturlig samtaleflyt**  
Chatboten var overraskende naturlig — den brukte empati ("Å høre, det var smertefullt å høre!"), reflekterte tilbake det som ble sagt, og opplevdes ikke som et skjema-i-chat-klær. Den snakket som et menneske, ikke som et spørreskjema.

**2. Smertepunkt-graving**  
Steg 3 → 4 var veldig bra. Spørsmålet "hva tar mest tid?" med skalaen 1-10 fikk brukeren til å kvantifisere frustrasjonen (8/10) og konkretisere problemet (3-4 timer per tilbud). Det er gull for salgssituasjoner.

**3. Fremtidskobling**  
"Hvis du hadde fått tilbake 10-15 timer per uke — hva ville du brukt dem på?" er et klassisk pain-amplification-spørsmål fra Chase Hughes-skolen. Chatboten brukte det riktig.

**4. Avslutning med løsningsforslag**  
Chatboten avsluttet ikke med "takk for infoen" — den leverte faktisk 3 konkrete KI-løsninger tilpasset det brukeren hadde fortalt. Det er en god overgang til neste steg (salg/demo).

**5. Rask confidence-stigning på riktig tidspunkt**  
Hoppet fra 35 → 65 ved runde 4 viser at systemet forstår at smertepunkter med tall er mer verdifullt enn bare verktøy-info. God vekting.

---

### ⚠️ Problemer og hull

**1. Omsetning ikke innhentet**  
`omsetning` er tom i collected_data. Dette er kritisk for å vurdere ROI av KI-investering og for å segmentere leads. En bedrift med 5M omsetning trenger en annen pitch enn en med 20M.

**2. Sosiale medier og nettside aldri spurt om**  
`some` og `nettside` er tomme. Chatboten spurte ikke om disse. For Praktisk Intelligens er dette viktig — digitalt nærvær sier mye om modenhetsnivå.

**3. Kundekanaler ikke kartlagt**  
Hvordan skaffer Nordvik Bygg kunder i dag? Jungeltelegraf? Finn.no? Direkte kontakt? Dette er relevant for å forstå hvor KI kan hjelpe i salgsprosessen.

**4. Ikke spurt om konkurrenter**  
`konkurrenter` er tom. Heller ikke nødvendig for kartlegging, men kan gi kontekst.

**5. admin_pct alltid 0**  
Dette feltet beregnes aldri — det er åpenbart et bug eller manglende logikk. Med 15-20 timer admin av ~45-50 arbeidstimer er det 30-40% — veldig relevant å kommunisere.

**6. Chatboten gikk rett til løsningsforslag uten å bekrefte forståelsen**  
I runde 6 etter at brukeren nevnte budsjett og skepsis, hopper chatboten rett til "her er 3 løsninger". Det er litt aggressivt — et mellomsteg der chatboten oppsummerer det den har forstått ("Så bare for å sjekke at jeg har skjønt riktig: du bruker 15-20 timer på admin, tilbud tar 3-4 timer...") ville økt tillit og gitt mulighet for korreksjoner.

**7. Termineringskriterie uklart**  
`done: true` ble satt ved confidence 85 etter at budsjett ble oppgitt. Men manglende omsetning, SoMe og nettside er åpenbare hull. Boten avsluttet litt for tidlig — eller confidence-grensen for `done` er satt for lavt.

---

## Forbedringer

### Høy prioritet
1. **Legg til omsetningsspørsmål** — kan stilles naturlig etter at antall ansatte er kjent: "Med 8 mann, er dere i området 10-20 millioner i omsetning, eller mer?"
2. **Fix admin_pct-beregning** — regn ut `admin_timer / arbeidstimer * 100` og bruk det aktivt i analysen
3. **Legg til SoMe + nettside-spørsmål** — kan buntes med "Hvordan ser dere ut digitalt? Nettside, Facebook?" i runde 2-3
4. **Legg til oppsummeringsteg** før løsningsforslag — "Bare for å sikre at jeg har forstått riktig..." gir høyere tillit

### Medium prioritet
5. **Høyere done-terskel** — ikke avslutt med manglende `omsetning`, `some`, `nettside`. Sett done-trigger til confidence ≥ 90 OG minst disse feltene fylt: omsetning, smertepunkter, budsjett, ki_erfaring
6. **Kundekanal-spørsmål** — "Hvordan finner kundene dere vanligvis?" Avdekker om de har leadproblemer eller bare admin-problemer

### Lav prioritet  
7. **Lag bransjespesifikke eksempler** — chatboten brukte generiske KI-eksempler. "Tilbudsberegning for vindusbytte vs kjøkkenrenovering" ville treffe bedre
8. **Konkurrentbevissthet** — "Vet du om andre bygg-firmaer i Tromsø som har begynt å bruke digitale verktøy?" kan gi nyttig markedsinnsikt

---

## Konklusjon

Chatboten fungerer godt som en **første kartleggingssamtale** — den er naturlig, avdekker smertepunkter effektivt, og avslutter med et konkret verdiforslag. Den dekker ~70% av det som trengs for å kvalifisere en lead.

De kritiske manglene er omsetning og `admin_pct`-beregning. Disse to dataene er avgjørende for å lage en ROI-kalkulator i neste steg av salgsprosessen ("Du taper X kroner i uka på ineffektiv admin — med 50k investering tjener du det inn på 3 måneder").

**Score: 7/10** — solid fundament, 2-3 tweaks fra å være veldig bra.
