/**
 * ==========================================================================
 * SPŠ Webové technologie - Téma 010: Úvod do webových technologií
 * Interaktivní vizualizéry:
 * 1. Architektura Klient-Server a vícevrstvé modely
 * 2. DNS Resolving krok za krokem
 * 3. Simulátor digitální přístupnosti (a11y) a zrakových vad
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================================================================
     1. ARCHITEKTURA KLIENT - SERVER & VRSTVY WEBU
     ======================================================================== */
  const archNodes = document.querySelectorAll('.arch-node');
  const archDetailTitle = document.getElementById('archDetailTitle');
  const archDetailText = document.getElementById('archDetailText');
  const archTechBadges = document.getElementById('archTechBadges');

  const archData = {
    client: {
      title: 'Klient (Webový prohlížeč / Mobilní aplikace)',
      text: 'Zařízení a software koncového uživatele (Chrome, Firefox, Safari, Edge). Odesílá HTTP/HTTPS požadavky a interpretuje přijatý HTML kód, kaskádové styly CSS a spouští JavaScript v izolovaném sandboxu. Klient se stará o vykreslení UI a bezprostřední interakci s uživatelem.',
      tech: ['Google Chrome', 'Mozilla Firefox', 'WebKit / Safari', 'V8 JavaScript Engine', 'Blink / Gecko', 'DOM API']
    },
    cdn: {
      title: 'CDN (Content Delivery Network) & Edge Cache',
      text: 'Geograficky distribuovaná síť serverů (tzv. Edge nodes). Ukládá statické soubory (obrázky, CSS, JS balíčky, fonty) co nejblíže uživateli. Snižuje latenci z 80 ms na méně než 10 ms, absorbuje masivní provoz a chrání originální server před přetížením a DDoS útoky.',
      tech: ['Cloudflare', 'AWS CloudFront', 'Fastly', 'Anycast Routing', 'Edge Caching', 'DDoS Protection']
    },
    proxy: {
      title: 'Reverzní Proxy & Balancér zátěže (Load Balancer)',
      text: 'Vstupní brána do infrastruktury provozovatele webu. Přijímá příchozí požadavky, provádí SSL/TLS terminaci (dešifrování HTTPS provozu), rozděluje zátěž (Load Balancing) mezi více backendových serverů metodou Round-Robin či Least Connections a filtruje nebezpečné požadavky (WAF).',
      tech: ['Nginx', 'HAProxy', 'Traefik', 'Envoy', 'SSL/TLS Termination', 'Rate Limiting']
    },
    backend: {
      title: 'Aplikační Webový Server (Backend)',
      text: 'Mozek webové aplikace běžící na straně serveru. Zpracovává obchodní logiku, ověřuje přihlášení uživatele (autentizaci a autorizaci), provádí výpočty, komunikuje s databází a generuje dynamický obsah (HTML šablony nebo JSON API pro frontend).',
      tech: ['Node.js / Express', 'Python / Django / FastAPI', 'PHP 8 / Laravel', 'C# / .NET Core', 'Java / Spring', 'Go / Rust']
    },
    database: {
      title: 'Databázový systém & Persistentní úložiště',
      text: 'Kritická vrstva pro bezpečné a strukturované ukládání dat aplikace (uživatelé, objednávky, články, transakce). Dělí se na relační SQL databáze garantující ACID transakce a nerelační NoSQL systémy s vysokou propustností či rychlé paměťové cache (Redis).',
      tech: ['PostgreSQL', 'MySQL / MariaDB', 'Redis (In-Memory Cache)', 'MongoDB', 'ACID Transakce', 'Disková pole NVMe']
    }
  };

  archNodes.forEach(node => {
    node.addEventListener('click', () => {
      archNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const key = node.dataset.node;
      const data = archData[key];
      if (!data) return;

      archDetailTitle.textContent = data.title;
      archDetailText.textContent = data.text;

      archTechBadges.innerHTML = '';
      data.tech.forEach(t => {
        const badge = document.createElement('span');
        badge.className = 'tech-badge';
        badge.textContent = t;
        archTechBadges.appendChild(badge);
      });
    });
  });

  /* ========================================================================
     2. DNS RESOLVING SIMULÁTOR
     ======================================================================== */
  const dnsInput = document.getElementById('dnsDomainInput');
  const dnsStepBtn = document.getElementById('dnsStepBtn');
  const dnsAutoBtn = document.getElementById('dnsAutoBtn');
  const dnsResetBtn = document.getElementById('dnsResetBtn');
  const dnsStepCards = document.querySelectorAll('.dns-step-card');
  const dnsLogText = document.getElementById('dnsLogText');

  let currentDnsStep = 0;
  let dnsInterval = null;

  const dnsStepsInfo = [
    {
      step: 1,
      target: 'Browser & OS Cache',
      log: (domain) => `[Krok 1] Prohlížeč kontroluje interní mezipaměť (chrome://net-internals/#dns) a lokální soubor hosts v OS. Pro '${domain}' záznam nenalezen (Cache Miss).`
    },
    {
      step: 2,
      target: 'Rekurzivní DNS Resolver (ISP / 8.8.8.8)',
      log: (domain) => `[Krok 2] Klient odesílá UDP dotaz na port 53 rekurzivnímu resolveru (např. 1.1.1.1 Cloudflare nebo 8.8.8.8 Google). Resolver nemá záznam v TTL mezipaměti, zahajuje stromovou iteraci.`
    },
    {
      step: 3,
      target: 'Kořenový jmenný server (Root Server .)',
      log: () => `[Krok 3] Resolver kontaktuje jeden ze 13 celosvětových kořenových klastrů (a.root-servers.net až m.root-servers.net). Kořen nezná celou doménu, ale vrací odkaz na TLD servery pro zónu '.cz'.`
    },
    {
      step: 4,
      target: 'TLD Jmenný server (.cz / CZ.NIC)',
      log: (domain) => `[Krok 4] Resolver se ptá TLD serveru CZ.NIC pro národní doménu .cz. Server vrací NS záznamy autoritativních jmenných serverů pověřených správou domény '${domain}'.`
    },
    {
      step: 5,
      target: 'Autoritativní Nameserver (Správce domény)',
      log: (domain) => `[Krok 5 - ÚSPĚCH] Autoritativní server domény '${domain}' vrací odpověď typu A: 81.2.195.118. Resolver ukládá záznam do cache na 3600 s a vrací IP prohlížeči!`
    }
  ];

  function updateDnsUI() {
    const domain = dnsInput.value.trim() || 'skolavdf.cz';
    dnsStepCards.forEach((card, index) => {
      card.classList.remove('active', 'completed');
      if (index < currentDnsStep) {
        card.classList.add('completed');
      } else if (index === currentDnsStep) {
        card.classList.add('active');
      }
    });

    if (currentDnsStep === 0) {
      dnsLogText.innerHTML = `Zadejte doménu a klikněte na <strong>Krokovat překlad</strong> nebo <strong>Spustit animaci</strong>.`;
    } else if (currentDnsStep <= dnsStepsInfo.length) {
      const info = dnsStepsInfo[currentDnsStep - 1];
      if (currentDnsStep === dnsStepsInfo.length) {
        dnsLogText.innerHTML = `<span class="dns-log-success">${info.log(domain)}</span>`;
      } else {
        dnsLogText.innerHTML = `<span class="dns-log-highlight">${info.log(domain)}</span>`;
      }
    }
  }

  if (dnsStepBtn) {
    dnsStepBtn.addEventListener('click', () => {
      clearInterval(dnsInterval);
      if (currentDnsStep < dnsStepsInfo.length) {
        currentDnsStep++;
      } else {
        currentDnsStep = 1;
      }
      updateDnsUI();
    });
  }

  if (dnsAutoBtn) {
    dnsAutoBtn.addEventListener('click', () => {
      clearInterval(dnsInterval);
      currentDnsStep = 0;
      updateDnsUI();
      dnsInterval = setInterval(() => {
        if (currentDnsStep < dnsStepsInfo.length) {
          currentDnsStep++;
          updateDnsUI();
        } else {
          clearInterval(dnsInterval);
        }
      }, 1200);
    });
  }

  if (dnsResetBtn) {
    dnsResetBtn.addEventListener('click', () => {
      clearInterval(dnsInterval);
      currentDnsStep = 0;
      updateDnsUI();
    });
  }

  /* ========================================================================
     3. A11Y & KONTRASTNÍ SIMULÁTOR
     ======================================================================== */
  const a11yBoxes = document.querySelectorAll('.a11y-box');
  const modeButtons = document.querySelectorAll('.mode-btn');

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      a11yBoxes.forEach(box => {
        box.classList.remove('filter-protanopia', 'filter-blur');
        if (mode === 'protanopia') {
          box.classList.add('filter-protanopia');
        } else if (mode === 'blur') {
          box.classList.add('filter-blur');
        }
      });
    });
  });

  // Tlačítko správného demo prvku
  const realBtn = document.getElementById('demoRealBtn');
  if (realBtn) {
    realBtn.addEventListener('click', () => {
      alert('Správné tlačítko zachytilo kliknutí nebo stisk klávesy Enter/Mezerník (nativní přístupnost <button>)!');
    });
  }

  /* ========================================================================
     4. INTERAKTIVNÍ KONTROLNÍ OTÁZKY S NÁPOVĚDOU
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
