# Výukové materiály SPŠ – Pokyny pro vývoj a AI asistenty

Tento repozitář obsahuje komplexní výukové materiály pro **Střední průmyslovou školu (SPŠ)** zaměřené na technické, informatické a kybernetické obory.

Stěžejní předmět v repozitáři:
- **KYME** (Kybernetika a mechatronika – katalog `KYME/index.html`, témata `010` až `060` a interaktivní applet `041 Karnaughovy mapy`)

---

## Standard tvorby prezentací a materiálů SPŠ

Při vytváření dalších výukových prezentací a témat se řiďte dokumentací v:
- **Kompletní manuál a design systém:** [docs/presentation-framework-guide.md](docs/presentation-framework-guide.md)
- **Pravidla pro asistenta:** [.agents/rules/presentation-guidelines.md](.agents/rules/presentation-guidelines.md)

### Klíčové zásady ve zkratce:
1. **Sdílené jádro & DRY strategie:** Společný vzhled, typografie, komponenty a JavaScriptové enginy se nacházejí v kořenové složce `/assets/` (`presentation-core.css`, `dashboard-core.css`, `presentation-core.js`, `dashboard-core.js`, `syntax/`). Všechny cesty jsou striktně relativní pro 100% offline provoz (protokol `file://`) i živý běh na GitHub Pages.
2. **Čtyřúrovňová hierarchie a drobečková navigace:**
   - **Úroveň 0 (Index):** Centrální rozcestník `index.html`
   - **Úroveň 1 (Předmět):** Katalog předmětu, např. `KYME/index.html` (drobečky: `Rozcestník SPŠ / Kybernetika a mechatronika`)
   - **Úroveň 2 (Téma / Prezentace / Applet):** `XXX-Nazev/index.html`, např. `KYME/040-Booleova-algebra/index.html` (drobečky: `Rozcestník SPŠ / KYME / XXX Téma / Snímek N`)
   - **Úroveň 3 (Snímek):** Řízeno enginem `presentation-core.js`, URL hash `#slide-N`, dynamicky provázáno do drobečkové navigace (`#breadcrumbSlide`).
3. **Tříciferné číslování témat (krokování po 10):**
   - Témata jsou číslována `010`, `020`, `030`, `040`, `050`, `060`.
   - Mezi ně lze vkládat samostatné laboratorní a interaktivní applety (např. `041-Karnaughovy-mapy` mezi Booleovu algebru a hradla).
4. **Ikony:** VÝHRADNĚ jednobarevné vektorové inline SVG s `stroke="currentColor"` nebo `fill="currentColor"`. Přísný zákaz barevných emoji emotikonů v kódu i dokumentaci.
5. **Technologie & Offline provoz:** 100% offline, Vanilla HTML5 + CSS3 + JS, žádné externí knihovny ani CDN závislosti, UTF-8 bez BOM.
6. **Design:** Moderní tmavý motiv s možností přepnutí na světlý (`sps_presentation_theme`), plynulé animace, glassmorphism, podpora matematického LaTeX enginu (`$...$`).
7. **Didaktická struktura tématu:** Prezentace pokrývají celá odborná témata SPŠ, která se vyučují i několik vyučovacích hodin a mohou obsahovat desítky snímků. Každé téma obsahuje teoretický výklad, praktické aplikace, diagramy a končí strukturovaným shrnutím a opakovacími otázkami pro upevnění látky. V materiálech neuvádět žádné propojení na maturity ani označení „Maturitní okruh“ (maturity zatím nejsou definovány).
8. **Cílová skupina (žáci SPŠ 15–19 let):** Všechny materiály, katalogy i prezentace jsou určeny přímo pro žáky střední průmyslové školy ve věku 15 až 19 let. Obsah i rozhraní musí být čisté, srozumitelné, vizuálně poutavé a bez jakýchkoli interních autorských či vývojářských meta-informací (např. popisy adresářové struktury, konvencí tříciferného číslování, interní dokumentace frameworku), které na webu pro studenta nemají místo.
9. **Lokální dedikované skripty a styly tématu:** Skripty (např. simulátory, laboratorní kalkulátory, interaktivní canvasy) a styly specifické pro dané konkrétní téma se ukládají v samostatných souborech přímo v lokální složce dané prezentace (např. `style.css`, `graph-playground.js`). Ve společné kořenové složce `/assets/` se nacházejí výhradně jádrové a znovupoužitelné prvky (CSS, JS, SVG komponenty), které sdílí více různých prezentací napříč repozitářem.

