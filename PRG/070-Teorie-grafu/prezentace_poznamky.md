# Poznámky pro přednášejícího: Teorie grafů
**Komplexní průvodce prezentací s výkladovým komentářem pro každý snímek**

Tento dokument slouží jako detailní výukový a přednáškový doprovod pro prezentaci **Téma 070: Teorie grafů: Datové struktury, algoritmy a reprezentace v AI** v předmětu Programování (PRG) na SPŠ. Obsahuje didaktické cíle, výkladové body, historické souvislosti, matematické formalizace a otázky k upevnění látky pro studenty.

---

## Snímek 1: Titulní snímek – Úvod do teorie grafů

### Didaktický cíl
Motivovat žáky a představit teorii grafů nikoli jako izolovanou teoretickou matematiku, nýbrž jako univerzální jazyk a klíčovou datovou strukturu pro modelování propojeného světa, moderního softwaru a systémů umělé inteligence.

### Mluvený komentář / Průvodní slovo
> „Dobrý den. Vítejte u tématu Teorie grafů. Kdykoliv dnes otevřete mapovou navigaci pro vyhledání nejrychlejší trasy, kdykoliv sociální síť doporučuje nové přátele, kdykoliv vyhledávač indexuje vztahy mezi miliardami stránek nebo když moderní umělá inteligence analyzuje molekulární vazby nových léků, v pozadí pracují stejné grafové principy. V této prezentaci si projdeme cestu od historické hádanky v Královci přes formální matematické definice, způsoby uložení grafů v paměti počítače a architektury grafových neuronových sítí (GNN) až po stěžejní algoritmy, které si na závěr vyzkoušíme v interaktivním simulátoru.“

---

## Snímek 2: Zrod teorie grafů – Sedm mostů města Královce (1736)

### Didaktický cíl
Vysvětlit podstatu **abstrakce** v informatice. Ukázat, že vyřešení zdánlivě geografického problému stálo na opuštění nepodstatných detailů reality (tvar ostrovů, délka mostů) a soustředění se výhradně na topologii vazeb.

### Výkladové body pro přednášku
1. **Zadání historického rébusu:**
   - Město Královec (Königsberg, dnes Kaliningrad) leželo na řece Pregole a zahrnovalo dva ostrovy (Kneiphof a Lomse) a dva pevninské břehy. Jednotlivé části spojovalo celkem 7 mostů.
   - Otázka: Lze naplánovat procházku tak, abychom přešli každý ze 7 mostů právě jednou a vrátili se do výchozího bodu?
2. **Eulerův vhled (Leonhard Euler, 1736):**
   - Hádanku nelze efektivně řešit zkoušením všech kombinací cest.
   - Vzdálenosti ani úhly nejsou podstatné – důležitá je pouze **topologie propojení**.
   - Pevniny Euler nahradil **uzly (vrcholy)** a mosty nahradil **hranami**.
3. **Podmínka průchodu a Eulerovský tah:**
   - Kdykoliv do pevniny vejdeme po jednom mostě, musíme z ní po jiném mostě odejít.
   - Každý průchozí uzel proto musí mít **sudý počet připojených hran (sudý stupeň)**.
   - V Královci měly uzly stupně: 3, 3, 3 a 5. Všechny 4 uzly byly liché.
   - **Závěr:** Úloha nemá řešení!
4. **Zákonitost:**
   - Uzavřený eulerovský tah existuje právě tehdy, když je graf souvislý a všechny jeho uzly mají sudý stupeň.
   - Otevřený eulerovský tah (start a cíl v různých uzlech) existuje, pokud má graf právě dva uzly lichého stupně.
5. **Vizuální opora na snímku:**
   - Prezentace obsahuje schematické porovnání: na levém nákresu ukažte studentům 4 pevniny (Sever, Jih, Kneiphof, Lomse) a 7 očíslovaných mostů přes řeku Pregolu.
   - Na pravém schématu vysvětlete Eulerův krok abstrakce – pevniny se smrští do uzlů A, B, C, D a mosty do 7 multihran, kde u každého uzlu přímo svítí jeho lichý stupeň deg.

---

## Snímek 3: Základní definice: Uzly, hrany a stupně

### Didaktický cíl
Zvládnout přesnou matematickou definici grafu jako uspořádané dvojice množin a pochopit význam stupně uzlu a principu podání rukou.

### Výkladové body
1. **Formální zápis:**
   - $G = (V, E)$
   - $V$ (Vertices): konečná neprázdná množina uzlů (vrcholů).
   - $E$ (Edges): množina dvouprvkových podmnožin $V$ reprezentující hrany.
2. **Stupeň uzlu ($\deg(v)$):**
   - Počet incidentních hran vstupujících do uzlu či vycházejících z něj.
3. **Princip podání rukou (Handshaking Lemma):**
   - $\sum_{v \in V} \deg(v) = 2 |E|$
   - Každá hrana má dva konce, takže při součtu stupňů započítáme každou hranu přesně dvakrát.
   - Důsledek: Součet stupňů všech uzlů v grafu je vždy sudý. V každém grafu je počet vrcholů s lichým stupněm sudé číslo.
4. **Smyčky a multigrafy:**
   - Smyčka (hrana vedoucí z uzlu do něj samého) přispívá ke stupni hodnotou 2.
   - Jednoduchý graf neobsahuje smyčky ani násobné hrany.

---

## Snímek 4: Základní typy a rozdělení grafů

### Didaktický cíl
Klasifikovat grafy dle charakteru relací v aplikační doméně (orientace, ohodnocení, partitnost, úplnost).

### Výkladové body
1. **Orientovaný graf (Digraf):**
   - Hrany tvoří uspořádané dvojice $(u, v)$ – definovaný směr (šipka).
   - Rozlišujeme vstupní stupeň $\deg^-(v)$ a výstupní stupeň $\deg^+(v)$.
   - Příklady: jednosměrné ulice, hypertextové odkazy na webu, sledování uživatelů na síti X.
2. **Ohodnocený (vážený) graf:**
   - Funkce ohodnocení $w: E \to \mathbb{R}$.
   - Význam váhy: vzdálenost v kilometrech, doba průjezdu v minutách, finanční cena letenky, kapacita linky.
3. **Bipartitní graf:**
   - Množinu uzlů lze rozdělit na dvě disjunktní podmnožiny $V_1$ a $V_2$ tak, že žádná hrana nespojuje uzly uvnitř stejné skupiny.
   - Věta: Graf je bipartitní právě tehdy, neobsahuje-li cykly liché délky.
   - Využití: doporučovací systémy (uživatelé vs. hodnocené položky), párování úloh a procesorů.
4. **Úplný graf ($K_n$):**
   - Každý uzel je spojen hranou se všemi ostatními uzly.
   - Počet hran: $|E| = \frac{n(n - 1)}{2} = \binom{n}{2}$.

---

## Snímek 5: Klíčové vlastnosti a třídy grafů

### Didaktický cíl
Seznámit studenty s klíčovými strukturálními vlastnostmi: souvislostí, stromy, rovinností a barvením grafů.

### Výkladové body
1. **Souvislost grafu:**
   - Existence cesty mezi libovolnou dvojicí uzlů. Rozklad na komponenty souvislosti.
   - U orientovaných grafů rozlišujeme slabou a silnou souvislost.
2. **Stromy a lesy:**
   - Strom je souvislý acyklický graf.
   - Základní vztah mezi počtem hran a uzlů: $|E| = |V| - 1$.
   - Mezi libovolnými dvěma uzly stromu existuje právě jedna cesta.
   - Příklady: DOM strom v HTML, binární vyhledávací stromy, rozhodovací stromy v ML.
3. **Planární (rovinné) grafy:**
   - Grafy, které lze nakreslit do roviny bez vzájemného křížení hran.
   - Eulerova formule: $V - E + F = 2$ (kde $F$ značí počet stěn včetně vnější).
   - Kuratowského věta: Graf je planární právě tehdy, neobsahuje-li podgraf homeomorfní s $K_5$ ani $K_{3,3}$.
   - Aplikace: návrh jednovrstvých plošných spojů (PCB) bez nutnosti prokovených přechodů.
4. **Barvení grafů a chromatičnost:**
   - Chromatické číslo $\chi(G)$: minimální počet barev pro obarvení uzlů bez stejnobarevných sousedů.
   - Věta o čtyřech barvách (Appel & Haken, 1976): Každý planární graf lze obarvit maximálně 4 barvami.
   - Využití: alokace registrů v procesoru při kompilaci (LLVM), rozvrhování zkoušek bez kolizí.

---

## Snímek 6: Reprezentace grafů v paměti & v AI

### Didaktický cíl
Ukázat přechod mezi abstraktním grafem a jeho fyzickou reprezentací v operační paměti počítače (časová a paměťová složitost) a moderní využití v AI.

### Výkladové body
1. **Matice sousednosti (Adjacency Matrix):**
   - 2D pole velikosti $|V| \times |V|$.
   - Dotaz na existenci hrany: $O(1)$.
   - Paměťová složitost: $O(|V|^2)$ – nevhodné pro obrovské řídké sítě.
   - Vhodné pro husté grafy a algebraické maticové operace.
2. **Seznam sousedů (Adjacency List):**
   - Pole nebo hešovací tabulka dynamických polí/seznamů.
   - Paměťová složitost: $O(|V| + |E|)$ – optimální pro řídké sítě (silnice, web).
3. **Objektový model (OOP):**
   - Třídy `Node` a `Edge`, vhodné pro doménové modelování v aplikačním kódu.
4. **Grafy v moderní umělé inteligenci:**
   - **Knowledge Graphs (Znalostní grafy):** Sémantické trojice (Subjekt, Predikát, Objekt). Klíčové pro Graph-RAG (Retrieval-Augmented Generation) a eliminaci halucinací jazykových modelů.
   - **Graph Neural Networks (GNN):** Neuronové sítě zpracovávající nepravidelné grafy mechanismem *Message Passing* (agregace vektorů příznaků ze sousedních uzlů). Využití: predikce skládání proteinů (AlphaFold), detekce podvodů v bankovnictví.

---

## Snímek 7: Klíčové grafové problémy & Algoritmy

### Didaktický cíl
Porovnat fundamentální grafové algoritmy z hlediska jejich fungování, použitých datových struktur a výpočetní složitosti.

### Výkladové body
1. **Prohledávání stavového prostoru:**
   - **BFS (Breadth-First Search):** Prohledávání do šířky s frontou FIFO. Garantuje nalezení nejkratší cesty v neohodnoceném grafu. Složitost $O(|V| + |E|)$.
   - **DFS (Depth-First Search):** Prohledávání do hloubky se zásobníkem LIFO či rekurzí. Detekce cyklů, topologické uspořádání, backtracking. Složitost $O(|V| + |E|)$.
2. **Hledání nejkratších cest:**
   - **Dijkstrův algoritmus:** Hladový algoritmus s prioritní frontou (min-heap) pro nezáporné váhy hran. Složitost $O((|V| + |E|) \log |V|)$.
   - **Bellman-Ford:** Podporuje záporné váhy hran a odhaluje záporné cykly. Složitost $O(|V| \cdot |E|)$.
   - **A* algoritmus:** Heuristické rozšíření Dijkstry ($f(n) = g(n) + h(n)$), klíčové pro herní AI a autonomní robotiku.
3. **Minimální kostra grafu (MST):**
   - **Kruskalův algoritmus:** Řadí hrany vzestupně a přidává je pomocí struktury Union-Find bez vytváření cyklů.
   - **Jarníkův / Primův algoritmus:** Postupné rozšiřování stromu o nejlevnější hranu vedoucí k nepropojenému uzlu. Přínos českého matematika Vojtěcha Jarníka (1930).
4. **Eulerovský tah vs. Hamiltonovská kružnice / TSP:**
   - Eulerovský tah (hrany): $O(|E|)$, snadno ověřitelný přes sudost stupňů.
   - Hamiltonovská kružnice (uzly): NP-úplný problém.
   - Problém obchodního cestujícího (TSP): hledání nejlevnější Hamiltonovské kružnice, řešeno aproximacemi a genetickými algoritmy.

---

## Snímek 8: Teorie grafů v praxi reálného světa

### Didaktický cíl
Ilustrovat na konkrétních příkladech, že grafové algoritmy tvoří základní infrastrukturu dnešní digitální civilizace.

### Výkladové body k diskusi
- **Doprava a GPS:** Google Maps / Waze používají grafové zkratky a kontrakční hierarchie pro bleskový výpočet tras.
- **Web a vyhledávání:** Algoritmus PageRank počítá relevanci webové stránky simulací náhodného surfaře v grafu hypertextových odkazů.
- **Síťové směrování:** Protokol OSPF uvnitř autonomních systémů používá Dijkstrův algoritmus (Shortest Path First) pro každý přenesený paket.
- **Bioinformatika a chemie:** Modelování chemických molekul, predikce vlastností sloučenin pomocí GNN.
- **Kompilátory a softwarové buildy:** Reprezentace závislostí modulů jako orientovaný acyklický graf (DAG) pro paralelní překlad.
- **Distribuční a logistické sítě:** Optimalizace toků pomocí Ford-Fulkersonova algoritmu (Max-Flow Min-Cut).

---

## Snímek 9: Interaktivní grafové pískoviště (Playground)

### Didaktický cíl
Umožnit žákům praktické experimentování s grafem na interaktivním plátně: manipulaci s uzly, tvorbu hran a sledování běhu algoritmů krok za krokem.

### Metodika vedení interaktivní ukázky
1. **Představení plátna:**
   - Zvolte nástroj *Výběr / Přesun* a tažením myší či prstem upravte pozice uzlů pro lepší přehlednost.
2. **Krokování Dijkstrova algoritmu:**
   - Spusťte Dijkstru a sledujte log v postranním panelu: postupné uzavírání uzlů s nejmenší známou vzdáleností, relaxaci hran a finální zvýraznění optimální trasy.
3. **Porovnání BFS vs. DFS:**
   - Demonstrujte vlnovité šíření po vrstvách u BFS oproti hlubokému zanoření do jedné větve u DFS.
4. **Tvorba vlastní topologie:**
   - Využijte nástroje *Přidat uzel* a *Přidat hranu* a nechte studenty vytvořit vlastní graf a otestovat, zda na něm Kruskalův algoritmus správně nalezne minimální kostru.

---

## Snímek 10: Klíčová shrnutí & Závěrečný checklist

### Didaktický cíl
Syntetizovat hlavní poznatky tématu a ověřit porozumění látce prostřednictvím kontrolních otázek.

### Kontrolní otázky pro upevnění látky
1. **Otázka 1:** Proč v úloze sedmi mostů města Královce nebylo možné projít všechny mosty právě jednou?
   - *Odpověď:* Protože všechny 4 pevninské části města měly lichý stupeň incidentních mostů (3, 3, 3, 5). Uzavřený eulerovský tah vyžaduje, aby všechny uzly měly sudý stupeň.
2. **Otázka 2:** Kdy je výhodnější použít pro uložení grafu matici sousednosti a kdy seznam sousedů?
   - *Odpověď:* Matice sousednosti je výhodná pro husté grafy ($|E| \approx |V|^2$) a maticové operace. Seznam sousedů je optimální pro řídké grafy ($|E| \ll |V|^2$), protože šetří paměť ($O(|V|+|E|)$ oproti $O(|V|^2)$).
3. **Otázka 3:** Jaký je zásadní rozdíl mezi Eulerovským tahem a Hamiltonovskou kružnicí z hlediska výpočetní složitosti?
   - *Odpověď:* Eulerovský tah (projít všechny hrany) je polynomiálně řešitelný v čase $O(|E|)$. Hamiltonovská kružnice (projít všechny vrcholy) je NP-úplný problém bez známého polynomiálního řešení.
4. **Otázka 4:** Kolik hran má strom s $n$ vrcholy a co se stane, pokud do něj přidáme jednu novou hranu?
   - *Odpověď:* Strom s $n$ vrcholy má vždy přesně $n - 1$ hran. Přidáním libovolné nové hrany mezi existující uzly vznikne přesně jeden cyklus.
