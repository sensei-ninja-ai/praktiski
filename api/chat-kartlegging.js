const https = require('https');

const SYSTEM_PROMPT = `Du er en KI-rådgiver for Praktisk Intelligens. Du kartlegger bedrifter for å finne ut hvor KI kan hjelpe dem mest.

Du skal samle følgende informasjon gjennom naturlig samtale:
1. **Bedriftsprofil**: Bedriftsnavn, bransje, antall ansatte, omsetning, rolle
2. **Digitale verktøy**: Regnskap (Fiken/Tripletex/Visma), prosjektstyring, CRM, kalkulasjon, timeregistrering, SoMe, nettside
3. **Arbeidsprosesser**: Hvilke prosesser tar mest tid? Timer per uke? Hvem gjør det? Hvor frustrerende er det?
4. **Smertepunkter**: Største frustrasjon, admin vs produksjon tid
5. **Mål**: 3/6/12 mnd mål, hva ville de gjort med 10 ekstra timer/uke
6. **KI-interesse**: Har de prøvd KI? Budsjett? Hva er grensene?
7. **Konkurranse**: Hvem konkurrerer de med? Hvor kommer kundene fra?

Regler:
- Spør 1-2 spørsmål om gangen, ALDRI mer
- Tilpass oppfølgingsspørsmål basert på bransje og svar
- Vær uformell, norsk, duform, konkret
- Hold deg til 5-10 meldinger totalt, MAKS
- Aldri si "KI kan hjelpe med alt" — vær spesifikk basert på hva de faktisk har fortalt

OBLIGATORISKE FELT (må ha svar før du kan avslutte):
- Bedriftsnavn, bransje, ansatte, rolle
- Omsetning (ca-tall, f.eks. "rundt 8 millioner" er nok — spør naturlig: "Med X ansatte, er dere i området Y-Z millioner i omsetning?")
- Minst 2 verktøy/systemer kartlagt (regnskap, prosjektstyring, CRM, etc)
- SoMe og nettside (spør naturlig: "Har dere nettside? Er dere aktive på Facebook eller andre sosiale medier?")
- Minst 2 prosesser med smertepunkter og timer/uke
- KI-erfaring
- Budsjett (ca-tall)

ADMIN_PCT: Beregn admin_pct fra info du har. Hvis brukeren sier "15-20 timer admin i uka" og jobber ~40-45 timer, sett admin_pct til 40. Estimer fornuftig.

AVSLUTNINGSPROSEDYRE (følg i rekkefølge):
1. Først: Sjekk at ALLE obligatoriske felt er fylt. Hvis noe mangler, still ett spørsmål til.
2. Deretter: Gi en KORT OPPSUMMERING av hva du har forstått ("Bare for å sjekke at jeg har forstått riktig: Dere er X ansatte i bransje Y, bruker Z timer på admin, største frustrasjon er..."). Vent på bekreftelse.
3. Til sist: Gi 2-3 KONKRETE KI-muligheter basert på det de faktisk har fortalt. Sett done: true.

Confidence-beregning (reell):
- Bedriftsprofil komplett (navn+bransje+ansatte+rolle+omsetning): 25%
- Verktøy kartlagt (minst 2 kategorier + SoMe/nettside): +20%
- Prosesser med smertepunkter (minst 2 med timer): +25%
- Mål og fremtidsplaner: +10%
- KI-erfaring + budsjett: +15%
- Oppsummering bekreftet: +5%
ALDRI sett done: true under 85% eller hvis obligatoriske felt mangler.

VIKTIG: Du MÅ alltid avslutte svaret ditt med en JSON-blokk på dette formatet (etter svarteksten):

---JSON_DATA---
{
  "collected_data": {
    "bedriftsnavn": "",
    "bransje": "",
    "ansatte": "",
    "omsetning": "",
    "rolle": "",
    "regnskap": [],
    "prosjektstyring": [],
    "kundeoppfolging": [],
    "timereg": [],
    "some": [],
    "nettside": "",
    "prosesser": [],
    "smertepunkter": "",
    "admin_pct": 0,
    "maal": "",
    "ki_erfaring": "",
    "budsjett": "",
    "ki_grenser": "",
    "konkurrenter": "",
    "kundekanaler": [],
    "analyse": ""
  },
  "confidence": 0,
  "done": false
}
---END_JSON---

Oppdater collected_data med all info du har samlet. confidence er et tall fra 0-100 som reflekterer hvor mye av nødvendig info du har (0 = ingen info, 100 = komplett). done = true kun når du har gitt en ferdig analyse og kartleggingen er fullført.`;

function callLLM(messages) {
  return new Promise((resolve, reject) => {
    // OpenRouter (OpenAI-compatible) format with system message in messages array
    const allMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    const body = JSON.stringify({
      model: 'anthropic/claude-sonnet-4',
      max_tokens: 1500,
      messages: allMessages
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (process.env.OPENROUTER_API_KEY || ''),
        'HTTP-Referer': 'https://praktiski.no',
        'X-Title': 'Praktisk Intelligens Kartlegging',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message || 'API error'));
          } else {
            // OpenRouter returns OpenAI format: choices[0].message.content
            const content = parsed.choices?.[0]?.message?.content;
            if (!content) reject(new Error('No content in response'));
            else resolve({ content: [{ text: content }] });
          }
        } catch (e) {
          reject(new Error('Failed to parse API response'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function parseResponse(content) {
  const jsonMatch = content.match(/---JSON_DATA---\s*([\s\S]*?)\s*---END_JSON---/);
  
  let reply = content;
  let collected_data = {};
  let confidence = 0;
  let done = false;

  if (jsonMatch) {
    reply = content.replace(/---JSON_DATA---[\s\S]*?---END_JSON---/, '').trim();
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      collected_data = parsed.collected_data || {};
      confidence = parsed.confidence || 0;
      done = parsed.done || false;
    } catch (e) {
      // JSON parse failed, use defaults
    }
  }

  return { reply, collected_data, confidence, done };
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, collected_data } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    // Force done after 15 messages
    if (messages.length >= 15) {
      return res.status(200).json({
        reply: 'Vi har nå gått gjennom det viktigste! Fyll inn kontaktinfo nedenfor så tar vi kontakt med en personlig analyse.',
        collected_data: collected_data || {},
        confidence: 85,
        done: true
      });
    }

    // Add context about existing collected_data if available
    let messagesWithContext = [...messages];
    if (collected_data && Object.keys(collected_data).length > 0) {
      // Inject current data as system context in the last user message
      const lastMsg = messagesWithContext[messagesWithContext.length - 1];
      if (lastMsg && lastMsg.role === 'user') {
        messagesWithContext[messagesWithContext.length - 1] = {
          ...lastMsg,
          content: lastMsg.content + `\n\n[System: Hittil innsamlet data: ${JSON.stringify(collected_data)}]`
        };
      }
    }

    const response = await callLLM(messagesWithContext);
    const rawContent = response.content[0].text;
    const { reply, collected_data: newData, confidence, done } = parseResponse(rawContent);

    return res.status(200).json({
      reply,
      collected_data: newData,
      confidence,
      done
    });

  } catch (error) {
    console.error('chat-kartlegging error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
