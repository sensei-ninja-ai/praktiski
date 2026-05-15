Brukeren har OpenRouter API-nøkkel konfigurert og bruker den som primær LLM-provider via Hermes Agent.
§
approvals.mode: off + security.tirith_enabled: false = ingen blokkering av exec. Pauser hermes-agent-skillen når dette er satt, men tipser bruker.
§
X auth state (May 2026): App "x-app" registered with Client ID. Access token NOT obtained — OAuth flow requires user to run `xurl auth oauth2 --app x-app` in their own terminal. Bookmark-reading, posting, and all X operations are blocked until OAuth completes.

Exec block fix verified working: `hermes config set approvals.mode off`. Browser backend still broken (all browser_* tool calls timeout). CLI-only path confirmed viable for all X operations via xurl.
§
Bruker har X Developer-konto med x-app (Client ID: -1432395374942171136-). Har gitt Bearer token (xai-...) men det gir kun app-only tilgang — ikke nok for bokmerker. Trenger OAuth2 user context token fra developer.x.com for full tilgang.
§
Ikke installer skills proaktivt fra en liste brukeren refererer til — kun fordi et navn dukker opp betyr ikke "installer dette". Spør alltid først eller bekreft. Brukeren kan selv si "ja" eller "nei" til hvert enkelt navn.
§
Installerte 14 nye skills i løpet av én session (14. mai 2026). Foretrekker action framfor discussjon — når noe er verdt det, bare installer. Liker spesielt hyperframes, meme-generation, og creative/video-verktøy generelt. Han nevner verktøy han vil ha uten å trenge mye forklaring.
§
Brukeren liker kompakt output — minimal verbose. Display: compact=true, show_reasoning=false, tool_preview_length=0, interim_assistant_messages=false, show_cost=false. Vision model: qwen/qwen3-vl-8b-instruct via OpenRouter (satt som auxiliary.vision.model).