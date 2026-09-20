# Výukové materiály SPŠ – Kybernetika, Mechatronika a IT

Komplexní otevřená webová platforma interaktivních výukových materiálů, prezentací a laboratorních appletů pro **Střední průmyslovou školu (SPŠ)**. Projekt je navržen pro technické obory se zaměřením na automatizaci, robotiku, číslicovou techniku a informatiku.

Materiály tvoří ucelená odborná témata (často pokrývající více vyučovacích hodin i desítky snímků), jsou plně optimalizovány pro **100% offline provoz** bez nutnosti serveru i pro živý provoz na **GitHub Pages** a obsahují přehledná shrnutí s opakovacími otázkami.

---

## Přehled předmětů a modulů

| Předmět | Název a zaměření | Témata a obsah v repozitáři | Počet témat | Stav a výchozí akcent |
| :--- | :--- | :--- | :--- | :--- |
| **KYME** | **Kybernetika a mechatronika**<br>Mechatronické systémy, zpětná vazba, průmyslová robotika, Booleova algebra, kombinační a sekvenční logika. | `010` Základní pojmy<br>`020` Robotika<br>`030` Užití mechatroniky<br>`040` Booleova algebra<br><strong>`041` Karnaughovy mapy (Trenažér)</strong><br>`042` Výroková logika<br>`050` Logická hradla<br>`060` Sekvenční obvody | **7 témat + applet** | **Aktivní**<br>Azurová (`#06b6d4`) / Fialová (`#a855f7`) |
| **POS** | **Počítačové sítě**<br>Modely ISO/OSI a TCP/IP, kurikulum Cisco CCNA (CCNA:INT, CCNA:SRWE), IP adresace, VLANy, směrování. | V přípravě | — | V přípravě &bull; Modrá (`#3b82f6`) |
| **WEB** | **Webové technologie**<br>Internetové technologie, sémantický HTML5, pokročilé CSS3, moderní JavaScript, SEO a digitální přístupnost (a11y). | V přípravě | — | V přípravě &bull; Oranžová (`#f97316`) |
| **PRG** | **Programování**<br>Algoritmizace, časová složitost, objektově orientované programování (OOP) a návrhové vzory (Design Patterns). | V přípravě | — | V přípravě &bull; Fialová (`#a855f7`) |
| **DBS** | **Databáze**<br>Konceptuální modelování (ER diagramy), relační databáze, normalizace (1NF–3NF), dotazovací jazyk SQL a transakce. | V přípravě | — | V přípravě &bull; Zelená (`#10b981`) |
| **GAM** | **Počítačové hry**<br>Multidisciplinární vývoj her, moderní herní enginy (Unity, Unreal, Godot), herní smyčka a nároky na hardware/software. | V přípravě | — | V přípravě &bull; Růžová (`#ec4899`) |

---

## Architektura repozitáře a 4-úrovňová navigace

Projekt využívá čtyřúrovňovou strukturu navrženou specificky pro potřeby střední průmyslové školy:

```text
Úroveň 0: Hlavní rozcestník  →  index.html (kořen projektu)
          ↓ Celá dlaždice předmětu (<a class="subject-card">) je odkaz
Úroveň 1: Stránka předmětu   →  KYME/index.html
          • Drobečková navigace: Rozcestník SPŠ / Kybernetika a mechatronika (KYME)
          • Společný skript: assets/js/dashboard-core.js
          ↓ Celá dlaždice tématu (.lesson-card) je klikatelná
Úroveň 2: Téma (prezentace)  →  KYME/XXX-Nazev/index.html
          • V záhlaví: Rozcestník SPŠ / KYME / XXX Téma / Snímek N
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
│   │   ├── presentation-core.css                     # Jádro prezentací (layout, drobečky, pravdivostní tabulky)
│   │   ├── dashboard-core.css                        # Jádro katalogů a rozcestníků témat
│   │   └── syntax/                                   # Modulární zvýrazňování syntaxe kódu
│   └── js/
│       ├── presentation-core.js                      # Globální engine (dynamické drobečky, klávesy, swipe, fullscreen)
│       └── dashboard-core.js                         # Globální engine katalogu (vyhledávání, klikatelnost karet, motiv)
│
├── KYME/                                             # Předmět Kybernetika a mechatronika
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

---

## Nasazení na GitHub Pages

Repozitář je připraven pro okamžité automatické publikování přes GitHub Pages:
- V nastavení repozitáře (**Settings &rarr; Pages**):
  - **Source:** `Deploy from a branch`
  - **Branch:** `main` &bull; `/ (root)`
- Díky čistě relativním cestám web bezchybně funguje v kořenovém i podsložkovém repozitáři GitHub Pages.
