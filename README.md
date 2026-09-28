# Výukové materiály SPŠ – IT

Komplexní otevřená webová platforma interaktivních výukových materiálů, prezentací a laboratorních appletů pro **Střední průmyslovou školu (SPŠ)**. Projekt je navržen pro technické obory se zaměřením na automatizaci, robotiku, číslicovou techniku a informatiku.

Materiály tvoří ucelená odborná témata (často pokrývající více vyučovacích hodin i desítky snímků), jsou plně optimalizovány pro **100% offline provoz** bez nutnosti serveru i pro živý provoz na **GitHub Pages** a obsahují přehledná shrnutí s opakovacími otázkami.

[https://bubilem.github.io/sps-vyukove-materialy/](https://bubilem.github.io/sps-vyukove-materialy/)

---

## Přehled předmětů a modulů

| Předmět | Název a zaměření | Témata a obsah v repozitáři | Počet témat | Stav a výchozí akcent |
| :--- | :--- | :--- | :--- | :--- |
| **KYME** | **Kybernetika a mechatronika**<br>Mechatronické systémy, zpětná vazba, průmyslová robotika, Booleova algebra, kombinační a sekvenční logika. | `010` Základní pojmy<br>`020` Robotika<br>`030` Užití mechatroniky<br>`040` Booleova algebra<br><strong>`041` Karnaughovy mapy (Trenažér)</strong><br>`042` Výroková logika<br>`050` Logická hradla<br>`060` Sekvenční obvody | **8 témat a trenažérů** | **Aktivní**<br>Azurová (`#06b6d4`) / Fialová (`#a855f7`) |
| **WEB** | **Webové technologie**<br>Architektura webu, sémantický HTML5, ucelený 10tématický blok moderního CSS3, digitální přístupnost (a11y), responzivní design a optimalizace. | `010` Úvod do webových technologií<br>`011` Webová komunikace a pipeline<br>`020` Základy jazyka HTML<br>`021` Moderní HTML5 a sémantika<br>`022` Pokročilé HTML a formuláře<br>`030` Úvod do CSS a Box model<br>`031` CSS selektory a pseudotřídy<br>`032` Základní vlastnosti CSS<br>`033` Pozicování a Flexbox<br>`034` CSS Grid a 2D rozvržení<br>`035` Responzivní web a Media queries<br>`036` Moderní CSS: Proměnné a funkce<br>`037` Webová přístupnost (a11y) v CSS<br>`038` CSS Preprocesory a Frameworky<br>`039` CSS Animace a Transformace | **15 témat a trenažérů** | **Aktivní**<br>Oranžová (`#f97316`) |
| **POS** | **Počítačové sítě**<br>Modely ISO/OSI a TCP/IP, kurikulum Cisco CCNA (CCNA:ITN, CCNA:SRWE), IP adresace, VLANy, směrování a kalkulátor podsítí. | `010` Úvod do počítačových sítí<br>`020` Fyzická vrstva<br><strong>`042` Subnetting a VLSM (Kalkulátor)</strong> | **3 témata a trenažér** | **Aktivní**<br>Modrá (`#3b82f6`) |
| **PRG** | **Programování**<br>Algoritmizace, časová a paměťová složitost (Big-O), datové struktury a teorie grafů s implementacemi v Pythonu. | `070` Teorie grafů<br>`071` Reprezentace grafů v paměti | **2 témata** | **Aktivní**<br>Fialová (`#a855f7`) |
| **PHR** | **Počítačové hry**<br>Herní průmysl a historie, multidisciplinární vývoj her, herní platformy a hardwarové i softwarové nároky. | `010` Úvod do počítačových her<br>`020` Časová osa a milníky videoher<br>`030` Herní platformy a hardware | **3 témata** | **Aktivní**<br>Růžová (`#ec4899`) |
| **DBS** | **Databáze**<br>Konceptuální modelování (ER diagramy), relační databáze, normalizace (1NF–3NF), dotazovací jazyk SQL a transakce. | V přípravě | — | V přípravě &bull; Zelená (`#10b981`) |

---

## Architektura repozitáře a 4-úrovňová navigace

Projekt využívá čtyřúrovňovou strukturu navrženou specificky pro potřeby střední průmyslové školy:

```text
Úroveň 0: Hlavní rozcestník  →  index.html (kořen projektu)
          ↓ Celá dlaždice předmětu (<a class="subject-card">) je odkaz
Úroveň 1: Stránka předmětu   →  WEB/index.html, KYME/index.html, POS/index.html ...
          • Drobečková navigace: Rozcestník SPŠ / Webové technologie (WEB)
          • Společný skript: assets/js/dashboard-core.js
          ↓ Celá dlaždice tématu (.lesson-card) je klikatelná
Úroveň 2: Téma (prezentace)  →  WEB/033-Pozicovani-a-Flexbox/index.html
          • V záhlaví: Rozcestník SPŠ / WEB / 033 Pozicování a Flexbox / Snímek N
          • Spodní lišta: Předchozí téma, katalog, další téma, TOC, motiv, fullscreen, nápověda
          • Společný skript: assets/js/presentation-core.js
          ↓ šipky / mezerník / TOC
Úroveň 3: Snímek             →  #slide-N (dynamicky provázáno do drobečků)
```

### Stromová struktura složek:
```text
sps_vyukove_materialy/
├── index.html                                        # Hlavní centrální rozcestník všech předmětů SPŠ
├── AGENTS.md                                         # Pokyny pro AI vývoj a standardy
├── README.md                                         # Tato dokumentace
│
├── assets/                                           # Globální sdílené jádro pro všechny předměty
│   ├── css/
│   │   ├── presentation-core.css                     # Jádro prezentací (layout, drobečky, tlačítka, motivy)
│   │   ├── dashboard-core.css                        # Jádro katalogů a rozcestníků témat
│   │   └── syntax/                                   # Modulární zvýrazňování syntaxe kódu
│   └── js/
│       ├── presentation-core.js                      # Globální engine (drobečky, klávesy, swipe, fullscreen, copy)
│       └── dashboard-core.js                         # Globální engine katalogu (vyhledávání, klikatelnost, motiv)
│
├── WEB/                                              # Předmět Webové technologie (15 témat)
│   ├── index.html                                    # Katalog témat předmětu WEB
│   ├── 010-Uvod-do-webovych-technologii/index.html   # Téma 010: Úvod do webových technologií a DNS
│   ├── 011-Webova-komunikace/index.html              # Téma 011: Webová komunikace a vykreslovací pipeline
│   ├── 020-HTML/index.html                           # Téma 020: Základy jazyka HTML
│   ├── 021-HTML5/index.html                          # Téma 021: Moderní HTML5 a sémantika
│   ├── 022-Pokrocile-HTML/index.html                 # Téma 022: Pokročilé HTML a multimédia
│   ├── 030-Uvod-do-CSS/index.html                    # Téma 030: Úvod do CSS a Box model
│   ├── 031-CSS-selektory/index.html                  # Téma 031: CSS selektory a pseudotřídy
│   ├── 032-Zakladni-vlastnosti/index.html            # Téma 032: Základní vlastnosti CSS
│   ├── 033-Pozicovani-a-Flexbox/index.html           # Téma 033: Pozicování a Flexbox
│   ├── 034-CSS-Grid/index.html                       # Téma 034: CSS Grid a 2D rozvržení
│   ├── 035-Responzivni-web/index.html                # Téma 035: Responzivní web a Media queries
│   ├── 036-Moderni-CSS/index.html                    # Téma 036: Moderní CSS: Proměnné, Nesting a funkce
│   ├── 037-Pristupnost-CSS/index.html                # Téma 037: Webová přístupnost (a11y) v CSS
│   ├── 038-CSS-Preprocesory-a-Frameworky/index.html  # Téma 038: CSS Preprocesory, Architektura a Frameworky
│   └── 039-CSS-Animace-a-Transformace/index.html     # Téma 039: CSS Animace a Transformace
│
├── KYME/                                             # Předmět Kybernetika a mechatronika (8 témat)
│   ├── index.html                                    # Katalog témat předmětu KYME
│   ├── 010-Zakladni-pojmy/index.html                 # Téma 010: Základní pojmy mechatroniky
│   ├── 020-Robotika/index.html                       # Téma 020: Průmyslová robotika a manipulátory
│   ├── 030-Uziti-mechatroniky/index.html             # Téma 030: Užití mechatronických systémů
│   ├── 040-Booleova-algebra/index.html               # Téma 040: Booleova algebra a logické funkce
│   ├── 041-Karnaughovy-mapy/index.html               # Applet 041: Interaktivní trenažér minimalizace K-map
│   ├── 042-Vyrokova-logika/index.html                # Téma 042: Výroková logika a logické myšlení
│   ├── 050-Hradla/index.html                         # Téma 050: Logická hradla a kombinační logika
│   └── 060-Obvody/index.html                         # Téma 060: Sekvenční a logické obvody
│
├── POS/                                              # Předmět Počítačové sítě (3 témata)
├── PRG/                                              # Předmět Programování (2 témata)
├── PHR/                                              # Předmět Počítačové hry (3 témata)
│
└── docs/                                             # Technické standardy a metodika
    └── presentation-framework-guide.md               # Standard tvorby prezentací SPŠ
```

---

## Tříciferné číslování témat a vkládání appletů

Číslování témat je navrženo **tříciferně s krokem po 10** (`010`, `020`, `030`, `040`, `050`, `060`). 

Tento princip umožňuje vkládat samostatné laboratorní a interaktivní applety přímo mezi teoretická témata:
- **Příklad:** Mezi téma `040 Booleova algebra` a téma `050 Logická hradla` je vložen interaktivní trenažér **`041 Karnaughovy mapy`**, kde si žáci mohou interaktivně klikat na buňky Grayova kódu a sledovat dynamickou minimalizaci logických funkcí v reálném čase.

---

## Klíčové technologické vlastnosti

1. **100% Offline & Pure Vanilla Web:**
   Všechny soubory jsou vzájemně propojeny pomocí relativních cest. Materiály fungují z lokálního disku (protokol `file://`), z flashdisku v odborných učebnách i živě z GitHub Pages bez nutnosti serveru.
2. **Přísný zákaz barevných emotikonů (No Emoji Policy):**
   Všechny ikony jsou výhradně jednobarevné vektorové inline SVG se `stroke="currentColor"`.
3. **Plné klávesové ovládání a dotyková gesta:**
   Posun šipkami a mezerníkem, přechod mezi tématy (`Ctrl + Šipky` / `Shift + P/N`), režim celé obrazovky (<kbd>F</kbd>), interaktivní osnova (<kbd>M</kbd>/<kbd>O</kbd>), přepínání motivu (<kbd>T</kbd>) a nápověda (<kbd>?</kbd>).
4. **Nativní matematický a logický engine:**
   Automatické offline sázení LaTeX logických a matematických vzorců ($Y = A \cdot B + \bar{C}$, indexy, zlomky) bez externích CDN knihoven.
5. **Tmavý a světlý motiv (Dark / Light Mode):**
   Výchozím režimem je moderní technologický tmavý motiv s ambientními barevnými přechody, uložený v `localStorage` pod klíčem `sps_presentation_theme`.

---

## Lokální spuštění

1. **Přímo z disku (doporučeno pro offline výuku):**
   Stačí poklepat na [`index.html`](index.html) v kořeni projektu v libovolném moderním webovém prohlížeči (Chrome, Firefox, Safari, Edge).
2. **Pomocí lokálního HTTP serveru:**
   - **Python 3:** `python -m http.server 8000`
   - **Node.js (npx):** `npx serve .`
   Následně otevřete v prohlížeči adresu `http://localhost:8000`.

