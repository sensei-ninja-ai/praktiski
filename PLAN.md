# Praktisk Intelligens — praktiski.no

## Stack
- **Domene:** praktiski.no (Domeneshop)
- **Frontend:** Vercel (gratis)
- **Database:** Supabase (gratis, Postgres)
- **Framework:** Vanilla HTML/JS (quizer) + minimal API

## Sider
- `praktiski.no/` — landing page
- `praktiski.no/quiz` — bedrifts-quiz (KI-modenhetsscore)
- `praktiski.no/test` — personlig KI-quiz
- `praktiski.no/dashboard` — kundekort/CRM (passordbeskyttet)

## Database-skjema (Supabase)

### leads
| Kolonne | Type | Beskrivelse |
|---------|------|-------------|
| id | uuid | PK |
| created_at | timestamp | Når quiz ble tatt |
| quiz_type | text | 'bedrift' eller 'personlig' |
| name | text | Navn |
| email | text | E-post |
| phone | text | Telefon |
| company | text | Bedriftsnavn (bedrift-quiz) |
| website | text | Nettside (bedrift-quiz) |
| role | text | Stilling |
| total_score | integer | 0-100 |
| category_scores | jsonb | {kategori: score} |
| answers | jsonb | {q1: svar, q2: svar, ...} |
| scan_results | jsonb | PageSpeed/nettside-funn |
| pipeline_stage | text | ny/kontaktet/booket/møte/tilbud/kunde |
| notes | text | Krisfred sine notater |
| next_followup | date | Neste oppfølging |
| source | text | Hvor de kom fra (fb-ad, direkte, etc.) |
| device | text | Mobil/desktop |

### interactions
| Kolonne | Type | Beskrivelse |
|---------|------|-------------|
| id | uuid | PK |
| lead_id | uuid | FK → leads |
| created_at | timestamp | |
| type | text | call/email/meeting/note |
| content | text | Hva skjedde |

## Setup-steg
1. [x] Plan
2. [ ] Registrer domene (Krisfred, BankID)
3. [ ] Opprett Supabase-prosjekt
4. [ ] Sett opp database-tabeller
5. [ ] Koble quiz → Supabase API
6. [ ] Bygg dashboard med persona-kort
7. [ ] Deploy til Vercel
8. [ ] Koble domene → Vercel
