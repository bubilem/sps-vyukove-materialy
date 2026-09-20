# Standard a metodika tvorby výukových prezentací SPŠ

Tento dokument slouží jako závazný technický a didaktický standard pro vytváření interaktivních webových prezentací a materiálů v projektu **Výukové materiály SPŠ** (`sps_vyukove_materialy`). Standard je určen pro předmět KYME (Kybernetika a mechatronika) a navazující technické obory středních průmyslových škol.

---

## 1. Architektura a organizace složek (DRY Model)

Framework využívá dvouvrstvou architekturu oddělující společné jádro v `/assets/` od jednotlivých předmětů a témat:

### Stromová struktura repozitáře pro SPŠ:
```text
sps_vyukove_materialy/
├── index.html                                        # Hlavní centrální rozcestník všech předmětů SPŠ
├── AGENTS.md                                         # Pravidla a standardy pro AI asistenty
├── README.md                                         # Hlavní dokumentace repozitáře
│
├── assets/                                           # Globální sdílené jádro pro všechny předměty
│   ├── css/
│   │   ├── presentation-core.css                     # Jádro prezentací (drobečky, layout, modály, pravdivostní tabulky)
│   │   ├── dashboard-core.css                        # Jádro katalogů a rozcestníků témat
│   │   └── syntax/                                   # Modulární zvýrazňování syntaxe kódu
│   └── js/
│       ├── presentation-core.js                      # Globální engine (dynamické drobečky, klávesy, swipe, fullscreen, TOC)
│       └── dashboard-core.js                         # Globální engine katalogu (vyhledávání, klikatelnost karet, motiv)
│
├── KYME/                                             # Předmět Kybernetika a mechatronika
│   ├── index.html                                    # Katalog témat předmětu KYME
│   ├── 010-Zakladni-pojmy/
│   │   └── index.html                                # Prezentace tématu 010
│   ├── 020-Robotika/
│   │   └── index.html                                # Prezentace tématu 020
│   ├── 030-Uziti-mechatroniky/
│   │   └── index.html                                # Prezentace tématu 030
│   ├── 040-Booleova-algebra/
│   │   └── index.html                                # Prezentace tématu 040
│   ├── 041-Karnaughovy-mapy/
│   │   └── index.html                                # Vložená interaktivní aplikace (Trenažér K-map)
│   ├── 050-Hradla/
│   │   └── index.html                                # Prezentace tématu 050
│   └── 060-Obvody/
│       └── index.html                                # Prezentace tématu 060
│
└── docs/                                             # Standardy, metodika a zkušební osnovy
    └── presentation-framework-guide.md               # Tento technický a designový standard
```

---

## 2. Navigační hierarchie webu (4 úrovně)

```text
Úroveň 0: Hlavní rozcestník  →  index.html (kořen projektu)
          ↓ Celá dlaždice předmětu (<a class="subject-card">) je odkaz
Úroveň 1: Stránka předmětu   →  KYME/index.html | ...
          • Drobečková navigace (.breadcrumb-nav): Rozcestník SPŠ / Název předmětu
          • Společný skript: assets/js/dashboard-core.js
          ↓ Celá dlaždice tématu (.lesson-card) je klikatelná
Úroveň 2: Téma (prezentace)  →  KYME/XXX-Nazev/index.html
          • V záhlaví .presentation-header: Drobečková navigace s dynamickým indikátorem
            Rozcestník SPŠ / Předmět / XXX Název tématu / Snímek N
          • Spodní lišta .controls-bar: Přechod mezi tématy, katalog, TOC, motiv, fullscreen, nápověda
          • Společný skript: assets/js/presentation-core.js
          ↓ šipky / mezerník / TOC
Úroveň 3: Snímek             →  #slide-N (řízeno JS enginem, URL hash, swipe, klávesnice)
```

---

## 3. Tříciferné číslování témat a vkládání appletů

1. **Krokování po 10 (`010`, `020`, `030`, `040`, `050`, `060`):**
   Zajišťuje přehlednou posloupnost výuky odpovídající sylabu předmětu.
2. **Vložené interaktivní ukázky a applety (`041`):**
   Mezi teoretická témata lze vkládat specializované laboratorní trenažéry a interaktivní vizualizace bez nutnosti měnit číslování ostatních kapitol.
3. **Pojmenování:**
   Složka: `XXX-Nazev-tematu/` (např. `040-Booleova-algebra/`), hlavní soubor vždy `index.html`.

---

## 4. Přísné pravidlo pro ikony: VÝHRADNĚ VEKTOROVÉ SVG

> **DŮLEŽITÉ: ZÁKAZ BAREVNÝCH EMOJI**
> V prezentacích, katalozích i dokumentaci je přísně zakázáno používat barevné grafické emotikony. Veškeré ikony musí být čisté **inline SVG** se `stroke="currentColor"`.

---

## 5. Didaktická struktura tématu (SPŠ)
 
Každá prezentace reprezentuje ucelené odborné téma SPŠ, které se může vyučovat i několik vyučovacích hodin a může obsahovat desítky snímků:
1. **Titulní slide:** Název, kód tématu a odznaky výukového modulu SPŠ.
2. **Motivace a teoretický fundament:** Klíčové pojmy, fyzikální a technické principy.
3. **Jádro výkladu a schémata:** Pravdivostní tabulky, schématické značky, vzorce, bloková schémata.
4. **Interaktivní ukázky a aplikace:** Provázání s laboratorními trenažéry (např. applet 041 Karnaughovy mapy), reálné obvody a technologie v průmyslu.
5. **Závěrečné shrnutí a opakovací checklist:** Klíčové opakovací otázky a příklady pro upevnění látky.
