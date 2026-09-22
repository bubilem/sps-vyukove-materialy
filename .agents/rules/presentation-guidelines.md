---
description: Závazná pravidla a standardy pro tvorbu webových výukových prezentací v projektu sps_vyukove_materialy
globs: ["**/*.html", "**/assets/**"]
---

# Pravidla pro tvorbu výukových prezentací (SPŠ)

Při vytváření nebo úpravách výukových materiálů a prezentací v tomto repozitáři vždy striktně dodržuj následující pravidla (podrobná dokumentace viz `docs/presentation_framework_guide.md`):

1. **Čtyřúrovňová navigační hierarchie webu:**
   Projekt pro střední průmyslovou školu (SPŠ) využívá přehlednou 4-úrovňovou strukturu:

   ```text
   Úroveň 0: Hlavní rozcestník  →  index.html (kořen projektu)
             ↓ Celá dlaždice předmětu (<a class="subject-card">) je odkaz
   Úroveň 1: Stránka předmětu   →  KYME/index.html | ...
             • Drobečková navigace: Rozcestník SPŠ / Název předmětu
             • Společný skript: assets/js/dashboard-core.js
             ↓ Celá dlaždice tématu (.lesson-card) je klikatelná
   Úroveň 2: Téma (prezentace)  →  KYME/XXX-Nazev-tematu/index.html
             • V záhlaví .presentation-header: Drobečková navigace s dynamickým indikátorem
               Rozcestník SPŠ / Předmět / XXX Název tématu / Snímek N
             • Spodní lišta .controls-bar: Přechod mezi tématy, katalog, TOC, motiv, fullscreen, nápověda
             • Společný skript: assets/js/presentation-core.js
             ↓ šipky / mezerník / TOC
   Úroveň 3: Snímek             →  #slide-N (řízeno JS enginem, URL hash, swipe, klávesnice)
   ```

2. **Tříciferné číslování témat a vkládání appletů:**
   - Témata jsou číslována **tříciferně s krokem po 10**: `010`, `020`, `030`, `040`, `050`, `060`.
   - Formát složky: `XXX-Nazev-tematu`, uvnitř vždy spouštěcí `index.html`.
   - **Vložené interaktivní ukázky:** Mezi teoretické prezentace lze vložit samostatnou laboratorní ukázku či trenažér s mezilehlým číslem (např. `041-Karnaughovy-mapy/index.html` mezi 040 a 050).

3. **ZÁKAZ BAREVNÝCH EMOJI (V HTML I MARKDOWNU):**
   - Je přísně zakázáno používat jakékoli barevné emotikony – v HTML prezentacích, CSS, JS i ve všech Markdown (`.md`) souborech, dokumentaci a komentářích.
   - V HTML musí být všechny ikony výhradně **jednobarevné vektorové inline SVG** (`viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`), které přebírají barvu textu (`currentColor`).
   - V Markdown souborech nepoužívej žádné emotikony. Text formátuj čistou typografií a standardním Markdownem.

4. **Architektura assetů a DRY strategie (Don't Repeat Yourself):**
   - Všechny sdílené definice vzhledu, typografie, layoutu slidů, ovládací lišty a JS enginů jsou uloženy v `/assets/`:
     - `assets/css/presentation-core.css` – sdílené jádro prezentací (včetně stylů drobečkové navigace a pravdivostních tabulek).
     - `assets/css/dashboard-core.css` – sdílené jádro katalogů a rozcestníků modulů.
     - `assets/js/presentation-core.js` – společný JavaScriptový engine prezentací (s dynamickou aktualizací `#breadcrumbSlide`).
     - `assets/js/dashboard-core.js` – společný JavaScript pro rozcestníky (správa motivu, vyhledávání, klikatelnost karet).
   - Všechny cesty musí být relativní (`../../assets/...`), aby materiály fungovaly 100% offline bez serveru z protokolu `file://` i na GitHub Pages.
   - Kódování všech souborů je striktně **UTF-8 bez BOM**.

5. **Standardní Controls Bar v prezentaci:**
   Každá prezentace obsahuje spodní `<nav class="controls-bar">` se sdruženým blokem přechodu:

   ```html
   <nav class="controls-bar" aria-label="Ovládání prezentace">
     <!-- PŘECHOD MEZI TÉMATY A KATALOG PŘEDMĚTU -->
     <a href="../030-Uziti-mechatroniky/index.html" class="control-btn" id="prevLessonBtn" title="Předchozí téma (Ctrl+Šipka vlevo)">
       <svg class="icon" viewBox="0 0 24 24"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
     </a>
     <a href="../index.html" class="control-btn" id="moduleBtn" title="Katalog předmětu">
       <svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
     </a>
     <a href="../041-Karnaughovy-mapy/index.html" class="control-btn" id="nextLessonBtn" title="Další téma (Ctrl+Šipka vpravo)">
       <svg class="icon" viewBox="0 0 24 24"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
     </a>
     <div class="controls-divider"></div>
     <!-- POSUN PO SNÍMCÍCH -->
     <button class="control-btn" id="prevSlideBtn" title="Předchozí snímek"><svg class="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
     <span class="slide-counter" id="slideCounter">1 / 7</span>
     <button class="control-btn btn-nav-primary" id="nextSlideBtn" title="Další snímek"><svg class="icon" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
     <div class="controls-divider"></div>
     <!-- NÁSTROJE -->
     <button class="control-btn" id="tocToggleBtn" title="Osnova tématu (M)"><svg class="icon" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></button>
     <button class="control-btn" id="fullscreenBtn" title="Celá obrazovka (F)"><svg class="icon" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg></button>
     <button class="control-btn" id="helpToggleBtn" title="Klávesové zkratky (?)"><svg class="icon" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="6" y1="8" x2="6.01" y2="8"></line><line x1="10" y1="8" x2="10.01" y2="8"></line><line x1="14" y1="8" x2="14.01" y2="8"></line><line x1="18" y1="8" x2="18.01" y2="8"></line><line x1="6" y1="12" x2="6.01" y2="12"></line><line x1="10" y1="12" x2="10.01" y2="12"></line><line x1="14" y1="12" x2="14.01" y2="12"></line><line x1="18" y1="12" x2="18.01" y2="12"></line><line x1="8" y1="16" x2="16" y2="16"></line></svg></button>
   </nav>
   ```

   - U 1. tématu: `#prevLessonBtn` má třídu `control-btn disabled`, `aria-disabled="true"`, `tabindex="-1"`, `href="#"`.
   - U posledního tématu: `#nextLessonBtn` má třídu `control-btn disabled`, `aria-disabled="true"`, `tabindex="-1"`, `href="#"`.

6. **Didaktická struktura tématu a shrnutí:**
   - Prezentace nejsou omezeny na 45 minut ani na 5–8 slidů; pokrývají ucelená odborná témata SPŠ, která se vyučují i několik vyučovacích hodin a mohou obsahovat desítky propracovaných snímků.
   - Obsahuje Titulní slide s metadaty modulu, teoretický základ, interaktivní ukázky a schémata, praktické aplikace a závěrečný slide se strukturovaným shrnutím a opakovacími kontrolními otázkami. V materiálech neuvádět propojení na maturity ani označení „Maturitní okruh“ (maturity zatím nejsou definovány).

7. **Cílová skupina a student-first obsah (15–19 let):**
   - Webové prezentace i katalogy jsou primárně určeny **žákům středních průmyslových škol (SPŠ) ve věku 15 až 19 let**.
   - Styl, jazyk a vizuální prvky musí být moderní, poutavé, vysoce profesionální a motivující.
   - **Přísný zákaz meta-informací pro autory/vývojáře:** Na veřejných stránkách žáka nezajímají vývojářské instrukce (jak jsou číslovány složky, konvence kroků po 10, interní návody na framework). Stránky musí obsahovat výhradně věcné, didakticky hodnotné informace k danému předmětu a tématu.
   - V patičkách katalogů uvádět pouze čistou navigaci (např. tlačítko návratu na rozcestník SPŠ) bez zbytečných a náhodných odkazů na dílčí témata či interní technickou dokumentaci.

8. **Lokální dedikované skripty a styly tématu:**
   - Jakékoli skripty (např. interaktivní simulátory, laboratorní demonstrace, canvas kalkulátory) a doplňkové styly specifické pro konkrétní téma se ukládají v samostatných souborech přímo v lokální složce dané prezentace (např. `style.css`, `graph-playground.js`).
   - Do sdílené složky `/assets/` patří výhradně prvky (společné jádro JS/CSS, společné ikony a rozcestníkové enginy), které jsou využívány více prezentacemi napříč systémem.
