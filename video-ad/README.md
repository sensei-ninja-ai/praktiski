# Praktisk Intelligens Quiz-Ad (15-sekunders vertikal video)

En 15-sekunders video-ad for Praktisk Intelligens quiz-funnel, bygd med Remotion og React.

## Tekniske detaljer

**Format:** 1080x1920 (9:16 vertikal for Instagram Reels/TikTok)  
**Varighet:** 15 sekunder (450 frames @ 30fps)  
**Kodek:** H.264  
**Filstørrelse:** ~1.5MB  
**Fonter:** DM Sans, DM Serif Display, JetBrains Mono (Google Fonts)

## Storyboard

### Scene 1: Score Reveal (0-2s)
- Score-sirkel animerer fra 0 til 34/100 (RØD)
- Pulserer når den stopper
- Tekst: "Er dette din bedrift?"

### Scene 2: Quiz Speed-Run (2-5s)  
- Rask gjennomgang av quiz-spørsmål
- Progress bar: 1/12 → 12/12
- Slide-animasjoner mellom spørsmål
- Svar highlightes med blå glow

### Scene 3: Result Bars (5-8s)
- 6 kategori-bars animerer inn med spring-effekt
- KI-bruk: 12% (rød), Digitale verktøy: 67% (grønn), etc.
- Svakeste kategorier pulserer

### Scene 4: Dashboard (8-11s)
- Zoom-out til dashboard-view
- Kanban-kolonner: "Ny" → "Kontaktet" → "Booket"
- Brukerens kort drag-animerer fra "Ny" til "Kontaktet"

### Scene 5: CTA (11-15s)
- Alt blur-es gradvis
- "3 minutter. Helt gratis."
- Logo: "Praktisk Intelligens" 
- "praktiski.no/quiz" med pulserende underline

## Kommandoer

```bash
# Installer dependencies
npm install

# Preview i browser (port 3000)
npm start

# Render video
npm run build
# eller:
npx remotion render src/index.tsx QuizAd out/quiz-ad-vertical.mp4

# Render med custom props
npx remotion render src/index.tsx QuizAd out/video.mp4 \
  --props '{"score": 67, "companyName": "Arctic Tech AS"}'
```

## A/B Testing

Prosjektet er designet for lett A/B testing via props:

```bash
# Test lav score (urgency/fear)
--props '{"score": 34, "companyName": "Din bedrift"}'

# Test middels score (optimism)  
--props '{"score": 58, "companyName": "Din bedrift"}'

# Test spesifikk bedrift
--props '{"score": 45, "companyName": "Nordlys AS"}'
```

## Filer

```
src/
├── index.tsx              # Composition setup + registerRoot()
├── QuizAd.tsx            # Hovedkomponent med scene-switching
├── scenes/
│   ├── ScoreReveal.tsx   # Scene 1: Score-sirkel
│   ├── QuizSpeedRun.tsx  # Scene 2: Quiz speed-run  
│   ├── ResultBars.tsx    # Scene 3: Kategori-bars
│   ├── Dashboard.tsx     # Scene 4: Dashboard zoom-out
│   └── CTA.tsx           # Scene 5: Call-to-action
└── components/
    ├── ScoreCircle.tsx   # Animert score-sirkel
    ├── QuizCard.tsx      # Quiz-spørsmål kort
    ├── CategoryBar.tsx   # Kategori progress bar
    └── PersonaCard.tsx   # Mini persona-kort for dashboard
```

## Optimalisering

**Font-warnings:** Google Fonts laster mange subsets. Kan optimaliseres ved å spesifisere weights:

```tsx
const { fontFamily } = loadFont({
  family: "DM Sans",
  weights: ["400", "600", "700"],
});
```

**Rendering-tid:** ~1 minutt for 15-sekunders video på 4-core maskin.

---

**Status:** ✅ Kompilerer uten feil  
**Rendered:** ✅ 1.5MB video levert til `/mnt/c/Users/krisf/Desktop/fra sensei/Praktisk Intelligens/`