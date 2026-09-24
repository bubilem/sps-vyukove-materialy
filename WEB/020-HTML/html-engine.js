/**
 * ==========================================================================
 * SPŠ Webové technologie - Téma 020: Základy jazyka HTML
 * Interaktivní engine:
 * 1. Anatomie HTML elementu a tagů (interaktivní rozbor)
 * 2. DOM Tree Inspector (převod HTML kódu na uzly stromu)
 * 3. Kontrolní otázky s odkrývací nápovědou
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================================================================
     1. ANATOMIE HTML ELEMENTU
     ======================================================================== */
  const anatomyParts = document.querySelectorAll('.anatomy-part');
  const infoTitle = document.getElementById('anatomyInfoTitle');
  const infoDesc = document.getElementById('anatomyInfoDesc');

  const anatomyData = {
    'open-tag': {
      title: 'Počáteční značka (Opening Tag)',
      desc: 'Otevírá HTML element. Začíná ostrou závorkou < a končí >. Obsahuje název značky (zde <code>a</code> pro hypertextový odkaz) a volitelné atributy oddělené mezerou.'
    },
    'attr-href': {
      title: 'Atribut cílové adresy (href)',
      desc: 'Atribut <code>href</code> (Hypertext Reference) definuje cíl odkazu – URL adresu (např. <code>https://skolavdf.cz</code>), relativní cestu k souboru nebo kotevní odkaz (#sekce).'
    },
    'attr-target': {
      title: 'Atribut chování otevření (target)',
      desc: 'Hodnota <code>_blank</code> přikazuje prohlížeči otevřít odkaz v novém okně nebo záložce. U externích odkazů s _blank se vždy doporučuje doplnit <code>rel="noopener noreferrer"</code> kvůli bezpečnosti a výkonu.'
    },
    'content': {
      title: 'Obsah elementu (Content)',
      desc: 'Text nebo vnořené elementy uzavřené mezi počáteční a koncovou značkou. Zde jde o klikatelný textový popisek odkazu, který uživatel přímo vidí a čte.'
    },
    'close-tag': {
      title: 'Koncová značka (Closing Tag)',
      desc: 'Ukončuje rozsah platnosti párového elementu. Vyznačuje se lomítkem <code>&lt;/název&gt;</code> bez atributů. Zajišťuje správné zanoření a uzavření ve stromu DOM.'
    }
  };

  anatomyParts.forEach(part => {
    part.addEventListener('click', () => {
      anatomyParts.forEach(p => p.classList.remove('active'));
      part.classList.add('active');

      const key = part.dataset.part;
      if (anatomyData[key] && infoTitle && infoDesc) {
        infoTitle.innerHTML = anatomyData[key].title;
        infoDesc.innerHTML = anatomyData[key].desc;
      }
    });
  });

  /* ========================================================================
     2. INTERAKTIVNÍ DOM INSPECTOR
     ======================================================================== */
  const treeNodes = document.querySelectorAll('.tree-node');
  const domLines = document.querySelectorAll('.dom-line-highlight');
  const domNodeTitle = document.getElementById('domNodeTitle');
  const domNodeDesc = document.getElementById('domNodeDesc');
  const domNodeProps = document.getElementById('domNodeProps');

  const domData = {
    'doc': {
      title: '#document',
      type: 'DOCUMENT_NODE (Node.DOCUMENT_NODE = 9)',
      desc: 'Kořenový bod celého DOM stromu. Reprezentuje samotnou načtenou webovou stránku a slouží jako vstupní brána pro JavaScriptové vyhledávání (document.getElementById, document.querySelector).',
      props: 'Rodič: null | Potomci: &lt;!DOCTYPE&gt;, &lt;html&gt;'
    },
    'html': {
      title: '&lt;html lang="cs"&gt;',
      type: 'ELEMENT_NODE (HTMLHtmlElement)',
      desc: 'Kořenový element dokumentu (root element). Obaluje veškerý obsah stránky. Definuje jazyk dokumentu přes atribut lang="cs", což je zásadní pro syntetizátory řeči i vyhledávače.',
      props: 'Rodič: #document | Potomci: &lt;head&gt;, &lt;body&gt;'
    },
    'head': {
      title: '&lt;head&gt;',
      type: 'ELEMENT_NODE (HTMLHeadElement)',
      desc: 'Kontejner pro metadata stránky. Obsah hlavičky se přímo nevykresluje do okna prohlížeče, ale předává kritické informace parseru (kódování UTF-8, titulek okna, viewport pro mobily, linky na CSS).',
      props: 'Rodič: &lt;html&gt; | Potomci: &lt;title&gt;, &lt;meta&gt;'
    },
    'title': {
      title: '&lt;title&gt;',
      type: 'ELEMENT_NODE (HTMLTitleElement)',
      desc: 'Definuje název záložky v prohlížeči, text pro historii a hlavní nadpis výsledků vyhledávání Google/Seznam.',
      props: 'Rodič: &lt;head&gt; | Potomci: TextNode ("Můj první web")'
    },
    'body': {
      title: '&lt;body&gt;',
      type: 'ELEMENT_NODE (HTMLBodyElement)',
      desc: 'Tělo dokumentu. Reprezentuje veškerý viditelný obsah stránky (nadpisy, odstavce, tabulky, obrázky, formuláře).',
      props: 'Rodič: &lt;html&gt; | Potomci: &lt;h1&gt;, &lt;p&gt;'
    },
    'h1': {
      title: '&lt;h1&gt;',
      type: 'ELEMENT_NODE (HTMLHeadingElement)',
      desc: 'Hlavní nadpis první úrovně. Reprezentuje nejvyšší sémantický titul stránky. Na každé stránce by měl být právě jeden hlavní h1 nadpis.',
      props: 'Rodič: &lt;body&gt; | Potomci: TextNode ("Vítejte na SPŠ")'
    },
    'p': {
      title: '&lt;p class="perex"&gt;',
      type: 'ELEMENT_NODE (HTMLParagraphElement)',
      desc: 'Běžný odstavec souvislého textu s třídou "perex" pro stylopis CSS. Nese sémantický význam odstavce.',
      props: 'Rodič: &lt;body&gt; | Třída: "perex" | Potomci: TextNode'
    }
  };

  function selectNode(key) {
    if (!domData[key]) return;

    treeNodes.forEach(node => {
      node.classList.toggle('active', node.dataset.domKey === key);
    });

    domLines.forEach(line => {
      line.classList.toggle('active', line.dataset.domKey === key);
    });

    if (domNodeTitle && domNodeDesc && domNodeProps) {
      domNodeTitle.textContent = domData[key].title + ' — ' + domData[key].type;
      domNodeDesc.textContent = domData[key].desc;
      domNodeProps.innerHTML = domData[key].props;
    }
  }

  treeNodes.forEach(node => {
    node.addEventListener('click', () => {
      selectNode(node.dataset.domKey);
    });
  });

  domLines.forEach(line => {
    line.addEventListener('click', () => {
      selectNode(line.dataset.domKey);
    });
  });

  /* ========================================================================
     3. KONTROLNÍ OTÁZKY S NÁPOVĚDOU
     ======================================================================== */
  const qBtns = document.querySelectorAll('.question-answer-btn');
  qBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.question-card');
      if (!card) return;
      const hint = card.querySelector('.question-hint');
      if (!hint) return;

      const isVisible = hint.classList.toggle('visible');
      btn.innerHTML = isVisible
        ? `<svg class="icon" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg> Skrýt odpověď`
        : `<svg class="icon" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg> Zobrazit odpověď`;
    });
  });

});
