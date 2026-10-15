/**
 * ==========================================================================
 * Interaktivní simulátor: Životní cyklus objektu a operační paměť (SPŠ PRG)
 * 4 okna: Hlavní kód, Třída Box, Halda (Objekty), Zásobník (Proměnné)
 * 100% Offline Vanilla JS
 * ==========================================================================
 */

(function () {
  'use strict';

  // Definice scénářů a jednotlivých kroků simulace
  const SCENARIOS = {
    lifecycle: {
      name: "1. Tvorba instancí, metody a statický atribut",
      mainCodeLines: [
        { num: 1, text: '<span class="token-cmt">// 1. Spuštění programu: Načtení třídy Box</span>' },
        { num: 2, text: '<span class="token-kw">let</span> <span class="token-var">box1</span> = <span class="token-kw">new</span> <span class="token-fn">Box</span>(<span class="token-str">"red"</span>, <span class="token-str">"M"</span>);' },
        { num: 3, text: '<span class="token-kw">let</span> <span class="token-var">box2</span> = <span class="token-kw">new</span> <span class="token-fn">Box</span>(<span class="token-fn">Box</span>.defaultColor, <span class="token-str">"S"</span>);' },
        { num: 4, text: '<span class="token-var">box1</span>.<span class="token-fn">repaint</span>(<span class="token-str">"emerald"</span>);' },
        { num: 5, text: '<span class="token-var">box1</span>.<span class="token-fn">toggleLid</span>();' },
        { num: 6, text: '<span class="token-fn">Box</span>.defaultColor = <span class="token-str">"purple"</span>; <span class="token-cmt">// Změna šablony</span>' },
        { num: 7, text: '<span class="token-kw">let</span> <span class="token-var">box3</span> = <span class="token-kw">new</span> <span class="token-fn">Box</span>(<span class="token-kw">null</span>, <span class="token-str">"L"</span>);' },
        { num: 8, text: '<span class="token-cmt">// Hotovo: 3 nezávislé krabice na haldě</span>' }
      ],
      classCodeLines: [
        { num: 1, text: '<span class="token-kw">class</span> <span class="token-fn">Box</span> {' },
        { num: 2, text: '  <span class="token-mod">static</span> defaultColor = <span class="token-str">"sky"</span>;' },
        { num: 3, text: '  color;' },
        { num: 4, text: '  size;' },
        { num: 5, text: '  isOpen = <span class="token-kw">false</span>;' },
        { num: 6, text: '' },
        { num: 7, text: '  <span class="token-fn">constructor</span>(color, size) {' },
        { num: 8, text: '    <span class="token-self">this</span>.color = color || <span class="token-fn">Box</span>.defaultColor;' },
        { num: 9, text: '    <span class="token-self">this</span>.size = size || <span class="token-str">"M"</span>;' },
        { num: 10, text: '  }' },
        { num: 11, text: '' },
        { num: 12, text: '  <span class="token-fn">repaint</span>(newColor) {' },
        { num: 13, text: '    <span class="token-self">this</span>.color = newColor;' },
        { num: 14, text: '  }' },
        { num: 15, text: '' },
        { num: 16, text: '  <span class="token-fn">toggleLid</span>() {' },
        { num: 17, text: '    <span class="token-self">this</span>.isOpen = !<span class="token-self">this</span>.isOpen;' },
        { num: 18, text: '  }' },
        { num: 19, text: '}' }
      ],
      steps: [
        {
          mainActive: 1,
          classActive: 2,
          callStack: 'main() (Globální kontext)',
          staticColor: 'sky',
          heap: [],
          stack: [],
          title: 'Inicializace třídy Box v paměti',
          desc: 'Program startuje. JS engine načetl třídu Box. Statický atribut <code>defaultColor = "sky"</code> se uložil do paměťového prostoru samotné třídy ještě dřív, než vznikl jakýkoli objekt!'
        },
        {
          mainActive: 2,
          classActive: 7,
          callStack: 'Box.constructor("red", "M") | this = #0x101',
          staticColor: 'sky',
          heap: [
            { id: '0x101', varName: 'alokace...', color: 'gray', size: 'M', isOpen: false, isNew: true, label: 'Nová instance' }
          ],
          stack: [
            { name: 'this', type: 'Ukazatel', val: '#0x101 (nové místo v RAM)', isRef: true, temp: true }
          ],
          title: 'Klíčové slovo new & skok do konstruktoru',
          desc: 'Operátor <code>new Box("red", "M")</code> vyhradil na haldě (Heap) nový blok paměti s adresou <strong>#0x101</strong>. Řízení skáče do konstruktoru a parametr <code>this</code> ukazuje na tuto novou prázdnou schránku.'
        },
        {
          mainActive: 2,
          classActive: 8,
          callStack: 'Box.constructor("red", "M") | this = #0x101',
          staticColor: 'sky',
          heap: [
            { id: '0x101', varName: 'alokace...', color: 'red', size: 'M', isOpen: false, pulse: true }
          ],
          stack: [
            { name: 'this', type: 'Ukazatel', val: '#0x101', isRef: true, temp: true },
            { name: 'color', type: 'Argument', val: '"red"', temp: true }
          ],
          title: 'Nastavení atributu this.color = "red"',
          desc: 'Konstruktor přiřazuje hodnotu argumentu <code>"red"</code> do vnitřního atributu instance <code>this.color</code>. Naše krabice v paměti získává červenou barvu.'
        },
        {
          mainActive: 2,
          classActive: 9,
          callStack: 'Box.constructor("red", "M") | this = #0x101',
          staticColor: 'sky',
          heap: [
            { id: '0x101', varName: 'alokace...', color: 'red', size: 'M', isOpen: false, pulse: true }
          ],
          stack: [
            { name: 'this', type: 'Ukazatel', val: '#0x101', isRef: true, temp: true },
            { name: 'size', type: 'Argument', val: '"M"', temp: true }
          ],
          title: 'Nastavení rozměru this.size = "M"',
          desc: 'Konstruktor nastavuje velikost <code>this.size = "M"</code> a výchozí stav víka <code>isOpen = false</code>. Inicializace vnitřního stavu instance je kompletní.'
        },
        {
          mainActive: 2,
          classActive: null,
          callStack: 'main() (Návrat z konstruktoru)',
          staticColor: 'sky',
          heap: [
            { id: '0x101', varName: 'box1', color: 'red', size: 'M', isOpen: false }
          ],
          stack: [
            { name: 'box1', type: 'Reference (odkaz)', val: '#0x101', isRef: true }
          ],
          title: 'Přiřazení reference do proměnné box1',
          desc: 'Konstruktor vrátil adresu vytvořené instance. Proměnná <code>box1</code> neobsahuje celou krabici, ale pouze <strong>odkaz (paměťovou adresu #0x101)</strong> na haldu!'
        },
        {
          mainActive: 3,
          classActive: 8,
          callStack: 'Box.constructor("sky", "S") | this = #0x202',
          staticColor: 'sky',
          heap: [
            { id: '0x101', varName: 'box1', color: 'red', size: 'M', isOpen: false },
            { id: '0x202', varName: 'box2', color: 'sky', size: 'S', isOpen: false, isNew: true }
          ],
          stack: [
            { name: 'box1', type: 'Reference', val: '#0x101', isRef: true },
            { name: 'box2', type: 'Reference', val: '#0x202', isRef: true }
          ],
          title: 'Vytvoření druhé instance box2 (čerpá ze static defaultColor)',
          desc: 'Vzniká druhá nezávislá instance na nové adrese <strong>#0x202</strong>. Jako barvu jsme předali statický atribut <code>Box.defaultColor</code>, krabice je tedy světle modrá ("sky") a má velikost "S".'
        },
        {
          mainActive: 4,
          classActive: 13,
          callStack: 'box1.repaint("emerald") | this = #0x101',
          staticColor: 'sky',
          heap: [
            { id: '0x101', varName: 'box1', color: 'emerald', size: 'M', isOpen: false, pulse: true },
            { id: '0x202', varName: 'box2', color: 'sky', size: 'S', isOpen: false }
          ],
          stack: [
            { name: 'box1', type: 'Reference', val: '#0x101', isRef: true },
            { name: 'box2', type: 'Reference', val: '#0x202', isRef: true }
          ],
          title: 'Volání metody box1.repaint("emerald")',
          desc: 'Voláme metodu <code>repaint</code> na instanci <code>box1</code>. Uvnitř metody ukazuje <code>this</code> na <strong>#0x101</strong>. Přebarví se POUZE krabice 1! Krabice 2 zůstává modrá &ndash; důkaz nezávislosti instancí.'
        },
        {
          mainActive: 5,
          classActive: 17,
          callStack: 'box1.toggleLid() | this = #0x101',
          staticColor: 'sky',
          heap: [
            { id: '0x101', varName: 'box1', color: 'emerald', size: 'M', isOpen: true, pulse: true },
            { id: '0x202', varName: 'box2', color: 'sky', size: 'S', isOpen: false }
          ],
          stack: [
            { name: 'box1', type: 'Reference', val: '#0x101', isRef: true },
            { name: 'box2', type: 'Reference', val: '#0x202', isRef: true }
          ],
          title: 'Volání metody box1.toggleLid() &ndash; Otevření víka',
          desc: 'Metoda <code>toggleLid()</code> invertovala stav <code>this.isOpen</code> z false na <strong>true</strong>. Krabice 1 má otevřené víko, krabice 2 má víko stále pevně zavřené.'
        },
        {
          mainActive: 6,
          classActive: 2,
          callStack: 'main() (Změna statické proměnné)',
          staticColor: 'purple',
          heap: [
            { id: '0x101', varName: 'box1', color: 'emerald', size: 'M', isOpen: true },
            { id: '0x202', varName: 'box2', color: 'sky', size: 'S', isOpen: false }
          ],
          stack: [
            { name: 'box1', type: 'Reference', val: '#0x101', isRef: true },
            { name: 'box2', type: 'Reference', val: '#0x202', isRef: true },
            { name: 'Box.defaultColor', type: 'Statický stav', val: '"purple"', isStatic: true }
          ],
          title: 'Změna statického atributu Box.defaultColor = "purple"',
          desc: 'Pozor: Měníme atribut přímo na šabloně <code>Box</code>! Již existující krabice se vůbec nezměnily. Statické vlastnosti totiž patří celé třídě, nikoli jedné konkrétní krabici.'
        },
        {
          mainActive: 7,
          classActive: 8,
          callStack: 'Box.constructor(null, "L") | this = #0x303',
          staticColor: 'purple',
          heap: [
            { id: '0x101', varName: 'box1', color: 'emerald', size: 'M', isOpen: true },
            { id: '0x202', varName: 'box2', color: 'sky', size: 'S', isOpen: false },
            { id: '0x303', varName: 'box3', color: 'purple', size: 'L', isOpen: false, isNew: true }
          ],
          stack: [
            { name: 'box1', type: 'Reference', val: '#0x101', isRef: true },
            { name: 'box2', type: 'Reference', val: '#0x202', isRef: true },
            { name: 'box3', type: 'Reference', val: '#0x303', isRef: true },
            { name: 'Box.defaultColor', type: 'Statický stav', val: '"purple"', isStatic: true }
          ],
          title: 'Vytvoření box3 &ndash; převzetí nové výchozí barvy',
          desc: 'Nová krabice <code>box3</code> nedostala barvu, proto konstruktor automaticky použil aktuální statickou barvu <code>"purple"</code>. Na haldě máme 3 objekty, každý s unikátní adresou!'
        }
      ]
    },

    references: {
      name: "2. Zákeřnost referencí (box2 = box1)",
      mainCodeLines: [
        { num: 1, text: '<span class="token-kw">let</span> <span class="token-var">boxA</span> = <span class="token-kw">new</span> <span class="token-fn">Box</span>(<span class="token-str">"red"</span>, <span class="token-str">"M"</span>);' },
        { num: 2, text: '<span class="token-kw">let</span> <span class="token-var">boxB</span> = <span class="token-var">boxA</span>; <span class="token-cmt">// Kopíruje se odkaz, NE krabice!</span>' },
        { num: 3, text: '<span class="token-var">boxB</span>.<span class="token-fn">repaint</span>(<span class="token-str">"amber"</span>);' },
        { num: 4, text: '<span class="token-cmt">// Co je nyní v boxA.color? Také "amber"!</span>' },
        { num: 5, text: '<span class="token-kw">let</span> <span class="token-var">boxC</span> = <span class="token-kw">new</span> <span class="token-fn">Box</span>(<span class="token-str">"amber"</span>, <span class="token-str">"M"</span>); <span class="token-cmt">// Nové new</span>' },
        { num: 6, text: '<span class="token-var">boxA</span> === <span class="token-var">boxB</span>; <span class="token-cmt">// true (stejná adresa #0x101)</span>' },
        { num: 7, text: '<span class="token-var">boxA</span> === <span class="token-var">boxC</span>; <span class="token-cmt">// false (různé adresy v paměti!)</span>' }
      ],
      classCodeLines: [
        { num: 1, text: '<span class="token-kw">class</span> <span class="token-fn">Box</span> {' },
        { num: 2, text: '  color; size;' },
        { num: 3, text: '  <span class="token-fn">constructor</span>(color, size) {' },
        { num: 4, text: '    <span class="token-self">this</span>.color = color;' },
        { num: 5, text: '    <span class="token-self">this</span>.size = size;' },
        { num: 6, text: '  }' },
        { num: 7, text: '  <span class="token-fn">repaint</span>(newColor) {' },
        { num: 8, text: '    <span class="token-self">this</span>.color = newColor;' },
        { num: 9, text: '  }' },
        { num: 10, text: '}' }
      ],
      steps: [
        {
          mainActive: 1,
          classActive: 4,
          callStack: 'new Box("red", "M") | this = #0x101',
          staticColor: 'sky',
          heap: [
            { id: '0x101', varName: 'boxA', color: 'red', size: 'M', isOpen: false, isNew: true }
          ],
          stack: [
            { name: 'boxA', type: 'Reference', val: '#0x101', isRef: true }
          ],
          title: 'Vytvoření první krabice boxA na adrese #0x101',
          desc: 'Na haldě vznikla červená krabice velikosti M na adrese <strong>#0x101</strong>. Proměnná <code>boxA</code> drží tento paměťový odkaz.'
        },
        {
          mainActive: 2,
          classActive: null,
          callStack: 'main() (Kopírování ukazatele)',
          staticColor: 'sky',
          heap: [
            { id: '0x101', varName: 'boxA, boxB (sdíleno!)', color: 'red', size: 'M', isOpen: false, pulse: true }
          ],
          stack: [
            { name: 'boxA', type: 'Reference', val: '#0x101', isRef: true },
            { name: 'boxB', type: 'Reference', val: '#0x101 (shodné!)', isRef: true, shared: true }
          ],
          title: 'Přiřazení let boxB = boxA &ndash; Žádná nová krabice!',
          desc: 'Zásadní moment! Příkaz <code>boxB = boxA</code> <strong>nevytvořil novou krabici</strong>, pouze zkopíroval adresu. Obě proměnné <code>boxA</code> i <code>boxB</code> nyní ukazují na úplně stejný objekt #0x101.'
        },
        {
          mainActive: 3,
          classActive: 8,
          callStack: 'boxB.repaint("amber") | this = #0x101',
          staticColor: 'sky',
          heap: [
            { id: '0x101', varName: 'boxA, boxB', color: 'amber', size: 'M', isOpen: false, pulse: true }
          ],
          stack: [
            { name: 'boxA', type: 'Reference', val: '#0x101', isRef: true },
            { name: 'boxB', type: 'Reference', val: '#0x101', isRef: true, shared: true }
          ],
          title: 'Volání boxB.repaint("amber") přebarví i boxA!',
          desc: 'Zavolali jsme přebarvení na <code>boxB</code>, ale protože na haldě existuje pouze jediný objekt #0x101, změnila se barva i pro <code>boxA</code>! Žáci zde na vlastní oči vidí princip předávání odkazem.'
        },
        {
          mainActive: 5,
          classActive: 4,
          callStack: 'new Box("amber", "M") | this = #0x202',
          staticColor: 'sky',
          heap: [
            { id: '0x101', varName: 'boxA, boxB', color: 'amber', size: 'M', isOpen: false },
            { id: '0x202', varName: 'boxC (nové tělo)', color: 'amber', size: 'M', isOpen: false, isNew: true }
          ],
          stack: [
            { name: 'boxA', type: 'Reference', val: '#0x101', isRef: true },
            { name: 'boxB', type: 'Reference', val: '#0x101', isRef: true },
            { name: 'boxC', type: 'Reference', val: '#0x202 (jiná adresa)', isRef: true }
          ],
          title: 'Vytvoření nového objektu boxC pomocí new',
          desc: 'Zde jsme použili <code>new Box(...)</code>. Teprve nyní vzniká nová krabice na adrese <strong>#0x202</strong>. Má sice stejnou barvu i velikost jako boxA, ale je to fyzicky jiný objekt v RAM!'
        },
        {
          mainActive: 6,
          classActive: null,
          callStack: 'boxA === boxB  =>  #0x101 === #0x101  =>  true',
          staticColor: 'sky',
          heap: [
            { id: '0x101', varName: 'boxA, boxB', color: 'amber', size: 'M', isOpen: false, pulse: true },
            { id: '0x202', varName: 'boxC', color: 'amber', size: 'M', isOpen: false }
          ],
          stack: [
            { name: 'boxA === boxB', type: 'Porovnání', val: 'true (identická adresa #0x101)', isResult: true }
          ],
          title: 'Porovnání referencí: boxA === boxB je TRUE',
          desc: 'Operátor <code>===</code> u objektů neporovnává obsah, ale paměťové adresy. Protože obě proměnné ukazují na #0x101, výsledek je <strong>true</strong>.'
        },
        {
          mainActive: 7,
          classActive: null,
          callStack: 'boxA === boxC  =>  #0x101 === #0x202  =>  false',
          staticColor: 'sky',
          heap: [
            { id: '0x101', varName: 'boxA, boxB', color: 'amber', size: 'M', isOpen: false },
            { id: '0x202', varName: 'boxC', color: 'amber', size: 'M', isOpen: false, pulse: true }
          ],
          stack: [
            { name: 'boxA === boxC', type: 'Porovnání', val: 'false (různé adresy #0x101 !== #0x202)', isResult: true }
          ],
          title: 'Porovnání referencí: boxA === boxC je FALSE!',
          desc: 'I když mají <code>boxA</code> i <code>boxC</code> navenek úplně stejnou barvu "amber" a velikost "M", <code>boxA === boxC</code> vrací <strong>false</strong>, protože leží na dvou různých adresách haldy.'
        }
      ]
    }
  };

  // State simulátoru
  let currentScenarioKey = 'lifecycle';
  let currentStepIndex = 0;
  let autoplayTimer = null;

  // DOM elementy
  let mainCodeLinesEl, classCodeLinesEl, heapContainerEl, stackVariablesEl, callStackBadgeEl;
  let staticColorBadgeEl, simStepDescEl, simStepTitleEl, simStepCounterEl;
  let btnPrev, btnNext, btnReset, btnPlay, scenarioSelectEl;

  function initSimulator() {
    mainCodeLinesEl = document.getElementById('simMainCodeLines');
    classCodeLinesEl = document.getElementById('simClassCodeLines');
    heapContainerEl = document.getElementById('simHeapContainer');
    stackVariablesEl = document.getElementById('simStackVariables');
    callStackBadgeEl = document.getElementById('simCallStackBadge');
    staticColorBadgeEl = document.getElementById('simStaticColorBadge');
    simStepTitleEl = document.getElementById('simStepTitle');
    simStepDescEl = document.getElementById('simStepDesc');
    simStepCounterEl = document.getElementById('simStepCounter');

    btnPrev = document.getElementById('simBtnPrev');
    btnNext = document.getElementById('simBtnNext');
    btnReset = document.getElementById('simBtnReset');
    btnPlay = document.getElementById('simBtnPlay');
    scenarioSelectEl = document.getElementById('simScenarioSelect');

    if (!mainCodeLinesEl || !classCodeLinesEl) {
      return; // Elementy ještě nejsou v DOM
    }

    // Event listenery
    if (scenarioSelectEl) {
      scenarioSelectEl.addEventListener('change', function (e) {
        setScenario(e.target.value);
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', function () {
        pauseAutoplay();
        prevStep();
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', function () {
        pauseAutoplay();
        nextStep();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        pauseAutoplay();
        resetSimulator();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', function () {
        toggleAutoplay();
      });
    }

    renderScenarioInitial();
  }

  function setScenario(key) {
    if (!SCENARIOS[key]) return;
    pauseAutoplay();
    currentScenarioKey = key;
    currentStepIndex = 0;
    renderScenarioInitial();
  }

  function renderScenarioInitial() {
    const sc = SCENARIOS[currentScenarioKey];

    // Vykreslení kódu main.js
    mainCodeLinesEl.innerHTML = sc.mainCodeLines.map(function (line) {
      return `<div class="sim-code-line" data-line="${line.num}">
        <span class="sim-line-num">${line.num}</span>
        <span class="sim-line-content">${line.text}</span>
      </div>`;
    }).join('');

    // Vykreslení kódu Box.js
    classCodeLinesEl.innerHTML = sc.classCodeLines.map(function (line) {
      return `<div class="sim-code-line" data-line="${line.num}">
        <span class="sim-line-num">${line.num}</span>
        <span class="sim-line-content">${line.text}</span>
      </div>`;
    }).join('');

    renderStep(currentStepIndex);
  }

  function renderStep(index) {
    const sc = SCENARIOS[currentScenarioKey];
    const step = sc.steps[index];
    if (!step) return;

    // 1. Zvýraznění aktivních řádků kódu
    const mainLines = mainCodeLinesEl.querySelectorAll('.sim-code-line');
    mainLines.forEach(function (el) {
      const lineNum = parseInt(el.getAttribute('data-line'), 10);
      if (lineNum === step.mainActive) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    const classLines = classCodeLinesEl.querySelectorAll('.sim-code-line');
    classLines.forEach(function (el) {
      const lineNum = parseInt(el.getAttribute('data-line'), 10);
      if (lineNum === step.classActive) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // 2. Call Stack odznak
    if (callStackBadgeEl) {
      callStackBadgeEl.textContent = step.callStack;
    }

    // 3. Statický atribut šablony
    if (staticColorBadgeEl) {
      const colorMap = {
        sky: { name: 'sky', hex: '#38bdf8' },
        purple: { name: 'purple', hex: '#c084fc' },
        amber: { name: 'amber', hex: '#fbbf24' }
      };
      const col = colorMap[step.staticColor] || { name: step.staticColor, hex: '#38bdf8' };
      staticColorBadgeEl.innerHTML = `
        <span class="sim-swatch" style="background: ${col.hex};"></span>
        <code>Box.defaultColor = "${col.name}"</code>
      `;
    }

    // 4. Vykreslení objektů na haldě (Heap)
    renderHeap(step.heap);

    // 5. Vykreslení proměnných v paměti (Stack)
    renderStack(step.stack);

    // 6. Textové vysvětlení a počítadlo
    if (simStepTitleEl) simStepTitleEl.innerHTML = step.title;
    if (simStepDescEl) simStepDescEl.innerHTML = step.desc;
    if (simStepCounterEl) simStepCounterEl.textContent = `${index + 1} / ${sc.steps.length}`;

    // 7. Aktualizace tlačítek
    if (btnPrev) btnPrev.disabled = (index === 0);
    if (btnNext) btnNext.disabled = (index === sc.steps.length - 1);
  }

  // Barvy krabic pro vizualizér
  const COLOR_PALETTES = {
    red: { fill: '#ef4444', top: '#f87171', side: '#dc2626', text: '#ffffff', glow: 'rgba(239, 68, 68, 0.4)' },
    sky: { fill: '#0ea5e9', top: '#38bdf8', side: '#0284c7', text: '#ffffff', glow: 'rgba(56, 189, 248, 0.4)' },
    emerald: { fill: '#10b981', top: '#34d399', side: '#059669', text: '#ffffff', glow: 'rgba(16, 185, 129, 0.4)' },
    purple: { fill: '#a855f7', top: '#c084fc', side: '#7c3aed', text: '#ffffff', glow: 'rgba(168, 85, 247, 0.4)' },
    amber: { fill: '#f59e0b', top: '#fbbf24', side: '#d97706', text: '#ffffff', glow: 'rgba(245, 158, 11, 0.4)' },
    gray: { fill: '#64748b', top: '#94a3b8', side: '#475569', text: '#ffffff', glow: 'rgba(100, 116, 139, 0.3)' }
  };

  // Měřítka rozměrů
  const SIZE_SCALES = {
    S: { scale: 0.78, label: 'S (Kompaktní)' },
    M: { scale: 1.0, label: 'M (Standard)' },
    L: { scale: 1.2, label: 'L (Velká)' }
  };

  function renderHeap(heapItems) {
    if (!heapContainerEl) return;

    if (!heapItems || heapItems.length === 0) {
      heapContainerEl.innerHTML = `
        <div class="sim-heap-empty">
          <svg class="icon" viewBox="0 0 24 24" style="width: 32px; height: 32px; color: var(--text-muted); opacity: 0.5;">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
          <span>Halda je prázdná. Dosud nebyl vytvořen žádný objekt.</span>
        </div>
      `;
      return;
    }

    const itemsHtml = heapItems.map(function (item) {
      const pal = COLOR_PALETTES[item.color] || COLOR_PALETTES.gray;
      const sizeConf = SIZE_SCALES[item.size] || SIZE_SCALES.M;
      const pulseClass = item.pulse ? 'sim-box-pulse' : '';
      const isNewClass = item.isNew ? 'sim-box-new' : '';

      // Generování 3D izometrické krabice přes SVG
      const lidTransform = item.isOpen ? 'transform="translate(0, -18) rotate(-18 70 30)"' : '';
      const lidStatusText = item.isOpen ? 'Víko: OTEVŘENO' : 'Víko: zavřeno';
      const lidBadgeColor = item.isOpen ? '#fbbf24' : '#94a3b8';

      return `
        <div class="sim-heap-box-card ${pulseClass} ${isNewClass}" style="--box-glow: ${pal.glow};">
          <div class="sim-box-header">
            <span class="sim-box-badge-addr">#${item.id}</span>
            <span class="sim-box-badge-var">${item.varName}</span>
          </div>

          <div class="sim-box-svg-wrapper" style="transform: scale(${sizeConf.scale});">
            <svg viewBox="0 0 140 120" class="sim-box-svg">
              <!-- Stín pod krabicí -->
              <ellipse cx="70" cy="106" rx="52" ry="12" fill="rgba(0,0,0,0.35)"></ellipse>

              <!-- Přední levá stěna -->
              <path d="M 20 55 L 70 82 L 70 105 L 20 78 Z" fill="${pal.fill}"></path>

              <!-- Přední pravá stěna -->
              <path d="M 70 82 L 120 55 L 120 78 L 70 105 Z" fill="${pal.side}"></path>

              <!-- Horní plocha / víko -->
              <g ${lidTransform} style="transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <path d="M 70 28 L 120 55 L 70 82 L 20 55 Z" fill="${pal.top}" stroke="rgba(255,255,255,0.25)" stroke-width="1"></path>
                <!-- Páska / štítek na víku -->
                <path d="M 62 33 L 78 42 L 78 77 L 62 68 Z" fill="rgba(0,0,0,0.18)"></path>
              </g>

              <!-- Text adresy na stěně krabice -->
              <text x="45" y="86" font-size="9" font-weight="700" fill="rgba(255,255,255,0.85)" font-family="monospace">#${item.id}</text>
            </svg>
          </div>

          <div class="sim-box-props">
            <div class="sim-box-prop">
              <span class="sim-prop-key">color:</span>
              <span class="sim-prop-val" style="color: ${pal.top}; font-weight: 700;">"${item.color}"</span>
            </div>
            <div class="sim-box-prop">
              <span class="sim-prop-key">size:</span>
              <span class="sim-prop-val">"${item.size}" (${sizeConf.label})</span>
            </div>
            <div class="sim-box-prop">
              <span class="sim-prop-key">isOpen:</span>
              <span class="sim-prop-val" style="color: ${lidBadgeColor}; font-weight: 600;">${item.isOpen} (${lidStatusText})</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    heapContainerEl.innerHTML = itemsHtml;
  }

  function renderStack(stackItems) {
    if (!stackVariablesEl) return;

    if (!stackItems || stackItems.length === 0) {
      stackVariablesEl.innerHTML = `
        <div class="sim-stack-empty">Zásobník proměnných je prázdný.</div>
      `;
      return;
    }

    const html = stackItems.map(function (item) {
      const isRefClass = item.isRef ? 'sim-item-ref' : '';
      const isStaticClass = item.isStatic ? 'sim-item-static' : '';
      const isSharedClass = item.shared ? 'sim-item-shared' : '';
      const isTempClass = item.temp ? 'sim-item-temp' : '';

      return `
        <div class="sim-stack-row ${isRefClass} ${isStaticClass} ${isSharedClass} ${isTempClass}">
          <div class="sim-stack-col-name">
            <code>${item.name}</code>
          </div>
          <div class="sim-stack-col-type">
            <span class="sim-type-badge">${item.type}</span>
          </div>
          <div class="sim-stack-col-val">
            <code>${item.val}</code>
            ${item.isRef ? '<span class="sim-ref-arrow" title="Ukazuje na adresu na haldě">&rarr; HALDA</span>' : ''}
          </div>
        </div>
      `;
    }).join('');

    stackVariablesEl.innerHTML = html;
  }

  function nextStep() {
    const sc = SCENARIOS[currentScenarioKey];
    if (currentStepIndex < sc.steps.length - 1) {
      currentStepIndex++;
      renderStep(currentStepIndex);
    } else {
      pauseAutoplay();
    }
  }

  function prevStep() {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      renderStep(currentStepIndex);
    }
  }

  function resetSimulator() {
    currentStepIndex = 0;
    renderStep(currentStepIndex);
  }

  function toggleAutoplay() {
    if (autoplayTimer) {
      pauseAutoplay();
    } else {
      startAutoplay();
    }
  }

  function startAutoplay() {
    if (btnPlay) {
      btnPlay.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        <span>Pozastavit</span>
      `;
      btnPlay.classList.add('playing');
    }

    autoplayTimer = setInterval(function () {
      const sc = SCENARIOS[currentScenarioKey];
      if (currentStepIndex < sc.steps.length - 1) {
        nextStep();
      } else {
        pauseAutoplay();
      }
    }, 2800);
  }

  function pauseAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
    if (btnPlay) {
      btnPlay.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        <span>Přehrát</span>
      `;
      btnPlay.classList.remove('playing');
    }
  }

  // Inicializace po načtení stránky
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimulator);
  } else {
    initSimulator();
  }
})();
