/**
 * ==========================================================================
 * SPŠ Webové technologie - Téma 011: Webová komunikace a vykreslovací pipeline
 * Interaktivní vizualizéry:
 * 1. HTTP Inspector & Status Code Explorer
 * 2. Critical Rendering Path (CRP) Interaktivní krokovač
 * 3. Script Timeline (Normal vs. Async vs. Defer)
 * 4. DevTools Network Waterfall & HTTP/1.1 vs. HTTP/2
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================================================================
     1. HTTP INSPECTOR & STATUS CODE EXPLORER
     ======================================================================== */
  const statusPills = document.querySelectorAll('.status-pill');
  const reqLineEl = document.getElementById('httpReqLine');
  const reqHeadersEl = document.getElementById('httpReqHeaders');
  const resLineEl = document.getElementById('httpResLine');
  const resHeadersEl = document.getElementById('httpResHeaders');
  const resBodyEl = document.getElementById('httpResBody');
  const explanationEl = document.getElementById('httpExplanation');

  const httpData = {
    '200': {
      pillColor: '#10b981',
      reqLine: 'GET /index.html HTTP/1.1',
      reqHeaders: 'Host: skolavdf.cz\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\nAccept: text/html,application/xhtml+xml\nAccept-Encoding: gzip, deflate, br\nConnection: keep-alive',
      resLine: 'HTTP/1.1 200 OK',
      resHeaders: 'Date: Wed, 24 Sep 2026 15:30:00 GMT\nServer: nginx/1.24.0\nContent-Type: text/html; charset=UTF-8\nContent-Length: 4218\nContent-Encoding: br\nCache-Control: public, max-age=3600\nETag: "6511a2b-107a"',
      resBody: '<!DOCTYPE html>\n<html lang="cs">\n<head><title>VOŠ a SPŠ Varnsdorf</title></head>\n<body><h1>Vítejte na skolavdf.cz</h1></body>\n</html>',
      expl: '<strong>200 OK (Standardní úspěch):</strong> Server požadavek úspěšně přijal a v těle odpovědi vrací kompletní HTML kód. Hlavička <code>Content-Encoding: br</code> značí moderní Brotli kompresi, <code>Cache-Control</code> ukládá stránku do mezipaměti prohlížeče na 1 hodinu.'
    },
    '301': {
      pillColor: '#38bdf8',
      reqLine: 'GET /stary-katalog HTTP/1.1',
      reqHeaders: 'Host: skolavdf.cz\nUser-Agent: Mozilla/5.0\nAccept: text/html',
      resLine: 'HTTP/1.1 301 Moved Permanently',
      resHeaders: 'Date: Wed, 24 Sep 2026 15:30:00 GMT\nServer: nginx/1.24.0\nLocation: https://skolavdf.cz/novy-katalog/\nContent-Length: 0\nConnection: keep-alive',
      resBody: '<!-- Tělo zprávy je prázdné -->',
      expl: '<strong>301 Moved Permanently (Trvalé přesměrování):</strong> Požadovaný zdroj byl trvale přesunut na novou adresu uvedenou v hlavičce <code>Location</code>. Prohlížeč i vyhledávač Google si změnu uloží do trvalé mezipaměti a okamžitě automaticky načtou novou URL.'
    },
    '304': {
      pillColor: '#a855f7',
      reqLine: 'GET /styles.css HTTP/1.1',
      reqHeaders: 'Host: skolavdf.cz\nIf-None-Match: "6511a2b-107a"\nIf-Modified-Since: Tue, 23 Sep 2026 12:00:00 GMT',
      resLine: 'HTTP/1.1 304 Not Modified',
      resHeaders: 'Date: Wed, 24 Sep 2026 15:30:00 GMT\nServer: nginx/1.24.0\nETag: "6511a2b-107a"\nCache-Control: public, max-age=86400',
      resBody: '<!-- ŽÁDNÁ DATA SE NEPŘENÁŠÍ (0 bajtů těla) -->',
      expl: '<strong>304 Not Modified (Podmíněný dotaz & Cache):</strong> Prohlížeč se zeptal, zda se soubor od minula změnil (<code>If-None-Match</code>). Server zjistil shodný ETag a poslal pouze 304 bez jakéhokoli těla. Prohlížeč bleskově použije svou lokální diskovou mezipaměť (šetří data i čas).'
    },
    '404': {
      pillColor: '#f43f5e',
      reqLine: 'GET /tajny-rozvrh.pdf HTTP/1.1',
      reqHeaders: 'Host: skolavdf.cz\nUser-Agent: Mozilla/5.0\nAccept: application/pdf',
      resLine: 'HTTP/1.1 404 Not Found',
      resHeaders: 'Date: Wed, 24 Sep 2026 15:30:00 GMT\nServer: nginx/1.24.0\nContent-Type: text/html; charset=UTF-8\nContent-Length: 480',
      resBody: '<html><body><h1>404 Nenalezeno</h1><p>Stránka na serveru neexistuje.</p></body></html>',
      expl: '<strong>404 Not Found (Chyba klienta):</strong> Server spojení přijal, ale na zadané URL cestě se žádný soubor ani routa nenachází. Častá příčina: překlep v odkazu, smazaný článek nebo neexistující soubor.'
    },
    '500': {
      pillColor: '#ef4444',
      reqLine: 'POST /api/login HTTP/1.1',
      reqHeaders: 'Host: skolavdf.cz\nContent-Type: application/json\nContent-Length: 42',
      resLine: 'HTTP/1.1 500 Internal Server Error',
      resHeaders: 'Date: Wed, 24 Sep 2026 15:30:00 GMT\nServer: nginx/1.24.0\nContent-Type: application/json',
      resBody: '{"error": "DatabaseConnectionException", "message": "Failed to connect to PostgreSQL"}',
      expl: '<strong>500 Internal Server Error (Kritická chyba serveru):</strong> Webový server (např. Nginx) funguje, ale backendový aplikační kód (Node.js, PHP, Python) narazil na neošetřenou výjimku (např. spadlá databáze, syntaktická chyba v kódu).'
    },
    '503': {
      pillColor: '#ea580c',
      reqLine: 'GET /index.html HTTP/1.1',
      reqHeaders: 'Host: skolavdf.cz\nUser-Agent: Mozilla/5.0',
      resLine: 'HTTP/1.1 503 Service Unavailable',
      resHeaders: 'Date: Wed, 24 Sep 2026 15:30:00 GMT\nServer: nginx/1.24.0\nRetry-After: 120\nContent-Type: text/html',
      resBody: '<html><body><h1>503 Služba dočasně nedostupná</h1><p>Probíhá plánovaná údržba.</p></body></html>',
      expl: '<strong>503 Service Unavailable (Přetížení nebo údržba):</strong> Server je dočasně neschopen požadavek obsloužit z důvodu plánované odstávky nebo masivního přetížení (např. DDoS útok). Hlavička <code>Retry-After: 120</code> říká klientovi, aby to zkusil za 2 minuty.'
    }
  };

  statusPills.forEach(pill => {
    pill.addEventListener('click', () => {
      statusPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const code = pill.dataset.code;
      const data = httpData[code];
      if (!data) return;

      reqLineEl.textContent = data.reqLine;
      reqHeadersEl.textContent = data.reqHeaders;
      resLineEl.textContent = data.resLine;
      resHeadersEl.textContent = data.resHeaders;
      resBodyEl.textContent = data.resBody;
      explanationEl.innerHTML = data.expl;
    });
  });

  /* ========================================================================
     2. CRITICAL RENDERING PATH (CRP) VISUALIZER
     ======================================================================== */
  const crpButtons = document.querySelectorAll('.crp-stage-btn');
  const crpCanvasView = document.getElementById('crpCanvasView');
  const crpStageTitle = document.getElementById('crpStageTitle');
  const crpStageDesc = document.getElementById('crpStageDesc');
  const crpStagePoints = document.getElementById('crpStagePoints');

  const crpStages = [
    {
      title: '1. Surové bajty & Tokenizace',
      desc: 'Síťová vrstva doručí prohlížeči stream surových bajtů přes HTTP odpověď. HTML parser převádí tyto bajty podle kódování (UTF-8) na znaky a následně na lexikální tokeny.',
      points: [
        'Konverze bajtů (např. 0x3C 0x68 0x31...) na znaky <code>&lt;h1&gt;</code>.',
        'Tokenizátor rozpoznává počáteční a koncové značky a jejich atributy.',
        'Streamované zpracování: parser začíná pracovat ještě před stažením celého HTML!'
      ],
      render: `
        <div style="font-family: var(--font-mono); font-size: 0.8rem; color: #38bdf8; text-align: center; line-height: 1.8;">
          <div style="color: #94a3b8; margin-bottom: 0.5rem;">[HTTP STREAM: 4218 B]</div>
          <div>3C 21 44 4F 43 54 59 50 45 20 68 74 6D 6C 3E</div>
          <div>3C 68 74 6D 6C 3E 3C 68 65 61 64 3E ...</div>
          <div style="margin-top: 0.5rem; color: #fb923c; font-weight: 700;">
            &darr; Tokenizer &rarr; &lt;html&gt;, &lt;head&gt;, &lt;body&gt;, &lt;h1&gt;
          </div>
        </div>
      `
    },
    {
      title: '2. Konstrukce DOM (Document Object Model)',
      desc: 'Z tokenů se vytváří stromová hierarchie uzlů (Node Tree). DOM reprezentuje kompletní sémantickou strukturu a vztahy rodič–potomek.',
      points: [
        'Hierarchický strom v operační paměti prohlížeče.',
        'Objektové rozhraní (API) přístupné pro JavaScript přes <code>document</code>.',
        'Inkrementální stavba: postupně doplňována při čtení HTML toku.'
      ],
      render: `
        <div style="font-family: var(--font-mono); font-size: 0.78rem; color: #e2e8f0;">
          <div style="color: #38bdf8; font-weight: 700;">Document</div>
          <div style="margin-left: 1.2rem;">&lfloor; html</div>
          <div style="margin-left: 2.4rem;">&lfloor; head &rarr; [title, link]</div>
          <div style="margin-left: 2.4rem;">&lfloor; body</div>
          <div style="margin-left: 3.6rem;">&lfloor; h1: "Vítejte na SPŠ"</div>
          <div style="margin-left: 3.6rem;">&lfloor; p: "Studium kybernetiky..."</div>
        </div>
      `
    },
    {
      title: '3. Konstrukce CSSOM (CSS Object Model)',
      desc: 'Jakmile parser narazí na externí CSS (<code>&lt;link rel="stylesheet"&gt;</code>) nebo značku <code>&lt;style&gt;</code>, parsuje pravidla a vytváří strom kaskádových stylů CSSOM.',
      points: [
        '<strong>CSS je render-blocking:</strong> Prohlížeč nezobrazí nic, dokud není CSSOM kompletní!',
        'Výpočet kaskády: specificita selektorů, dědičnost (např. <code>color</code> z body) a media queries.',
        'Zabraňuje nepříjemnému blikání nestylovaného obsahu (FOUC – Flash of Unstyled Content).'
      ],
      render: `
        <div style="font-family: var(--font-mono); font-size: 0.78rem; color: #a855f7;">
          <div style="font-weight: 700;">CSSOM Tree</div>
          <div style="margin-left: 1.2rem;">&lfloor; body { font-family: sans-serif; color: #f3f4f6; }</div>
          <div style="margin-left: 2.4rem;">&lfloor; h1 { font-size: 2rem; color: #f97316; }</div>
          <div style="margin-left: 2.4rem;">&lfloor; p { line-height: 1.6; }</div>
          <div style="margin-left: 2.4rem; color: #ef4444;">&lfloor; .hidden-modal { display: none; }</div>
        </div>
      `
    },
    {
      title: '4. Tvorba Render Tree (Strom vykreslování)',
      desc: 'Spojením DOMu a CSSOMu vzniká Render Tree. Obsahuje výhradně ty uzly, které budou na obrazovce skutečně viditelné.',
      points: [
        'Vynechává neviditelné elementy: <code>&lt;head&gt;</code>, <code>&lt;script&gt;</code>, <code>&lt;meta&gt;</code>.',
        'Ignoruje elementy s pravidlem <code>display: none</code> (nejsou v Render Tree!).',
        'Pozor: Elementy s <code>visibility: hidden</code> nebo <code>opacity: 0</code> v Render Tree ZŮSTÁVAJÍ (zabírají místo).'
      ],
      render: `
        <div style="font-family: var(--font-mono); font-size: 0.8rem; color: #4ade80;">
          <div style="font-weight: 700; color: #fb923c;">Render Tree (Pouze viditelné prvky)</div>
          <div style="margin-left: 1.2rem;">&lfloor; RenderObject: body</div>
          <div style="margin-left: 2.4rem;">&lfloor; RenderObject: h1 (barva: oranžová, vel: 32px)</div>
          <div style="margin-left: 2.4rem;">&lfloor; RenderObject: p (barva: šedá, řádkování: 1.6)</div>
          <div style="margin-left: 2.4rem; color: #64748b; text-decoration: line-through;">
            &times; .hidden-modal vyřazen z Render Tree!
          </div>
        </div>
      `
    },
    {
      title: '5. Layout (Reflow) – Výpočet geometrie',
      desc: 'Prohlížeč prochází Render Tree od kořene a počítá přesnou geometrii každého objektu: souřadnice X, Y na stránce, šířku a výšku v pixelech s ohledem na velikost viewportu zařízení.',
      points: [
        'Přepočítává relativní jednotky (%, rem, vw, vh, flex-grow) na absolutní fyzické pixely.',
        'Závisí na rozlišení okna (tzv. Viewport – mobil vs. 4K monitor).',
        'Změna rozměru prvku vyvolá drahý přepočet: <strong>Reflow</strong> celého podstromu!'
      ],
      render: `
        <div style="width: 100%; border: 1px dashed #38bdf8; padding: 0.75rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem;">
          <div style="color: #38bdf8; font-weight: 700; margin-bottom: 0.4rem;">Viewport: 1920 &times; 1080 px</div>
          <div style="background: rgba(249, 115, 22, 0.2); border: 1px solid #f97316; padding: 0.4rem; margin-bottom: 0.4rem;">
            [h1] x: 360px, y: 120px, w: 1200px, h: 48px
          </div>
          <div style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; padding: 0.4rem;">
            [p]  x: 360px, y: 180px, w: 1200px, h: 64px
          </div>
        </div>
      `
    },
    {
      title: '6. Paint & GPU Composite – Vykreslení pixelů',
      desc: 'Finální fáze: Rasterizace přeměňuje geometrické boxy na skutečné barevné pixely na obrazovce. GPU (grafická karta) následně skládá jednotlivé vrstvy dohromady.',
      points: [
        '<strong>Paint (Repaint):</strong> Vyplnění barev pozadí, vykreslení textu, stínů a rámečků.',
        '<strong>Compositing:</strong> Rozdělení stránky do vrstev na GPU. Změny <code>transform</code> a <code>opacity</code> neprovádí Layout ani Paint, ale jsou počítány přímo grafickou kartou (plynulých 60/120 FPS!).'
      ],
      render: `
        <div style="width: 100%; height: 100px; background: linear-gradient(135deg, rgba(249,115,22,0.3) 0%, rgba(56,189,248,0.3) 100%); border: 1px solid #10b981; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="color: #4ade80; font-weight: 700; font-size: 0.95rem;">FINÁLNÍ PIXELY V OBRAZOVÉM BUFFERU</div>
          <div style="color: #e2e8f0; font-size: 0.78rem; font-family: var(--font-mono); margin-top: 0.25rem;">GPU Framebuffer odeslán na monitor (60 FPS)</div>
        </div>
      `
    }
  ];

  crpButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      crpButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const stage = crpStages[idx];
      if (!stage) return;

      crpStageTitle.textContent = stage.title;
      crpStageDesc.textContent = stage.desc;
      crpCanvasView.innerHTML = stage.render;

      crpStagePoints.innerHTML = '';
      stage.points.forEach(pt => {
        const li = document.createElement('li');
        li.innerHTML = pt;
        crpStagePoints.appendChild(li);
      });
    });
  });

  /* ========================================================================
     3. SCRIPT COMPARATOR & TIMELINE (NORMAL vs ASYNC vs DEFER)
     ======================================================================== */
  const scriptTabBtns = document.querySelectorAll('.script-tab-btn');
  const scriptCards = {
    normal: document.getElementById('tabContentNormal'),
    async: document.getElementById('tabContentAsync'),
    defer: document.getElementById('tabContentDefer'),
    timeline: document.getElementById('tabContentTimeline')
  };

  scriptTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scriptTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tabKey = btn.dataset.tab;
      Object.keys(scriptCards).forEach(key => {
        if (scriptCards[key]) {
          scriptCards[key].classList.toggle('active', key === tabKey);
        }
      });
    });
  });

  const runScriptSimBtn = document.getElementById('runScriptSimBtn');
  const simProgressLine = document.getElementById('simProgressLine');

  if (runScriptSimBtn && simProgressLine) {
    let animActive = false;
    runScriptSimBtn.addEventListener('click', () => {
      if (animActive) return;
      animActive = true;
      runScriptSimBtn.disabled = true;

      simProgressLine.style.transition = 'none';
      simProgressLine.style.left = '0%';

      setTimeout(() => {
        simProgressLine.style.transition = 'left 4s linear';
        simProgressLine.style.left = '100%';

        setTimeout(() => {
          animActive = false;
          runScriptSimBtn.disabled = false;
        }, 4100);
      }, 50);
    });
  }

  /* ========================================================================
     4. DEVTOOLS WATERFALL SIMULATOR
     ======================================================================== */
  const wfProtoH1 = document.getElementById('wfProtoH1');
  const wfProtoH2 = document.getElementById('wfProtoH2');
  const wfNetFast = document.getElementById('wfNetFast');
  const wfNetSlow = document.getElementById('wfNetSlow');
  const wfTooltipInfo = document.getElementById('wfTooltipInfo');

  let currentProto = 'h2'; // 'h1' or 'h2'
  let currentSpeed = 'fast'; // 'fast' or 'slow'

  const resources = [
    { name: 'index.html', type: 'document', size: '4.2 KB', h1Fast: { wait: 0, ttfb: 15, dl: 10 }, h1Slow: { wait: 0, ttfb: 40, dl: 35 }, h2Fast: { wait: 0, ttfb: 15, dl: 10 }, h2Slow: { wait: 0, ttfb: 40, dl: 35 } },
    { name: 'styles.css', type: 'stylesheet', size: '18.4 KB', h1Fast: { wait: 25, ttfb: 15, dl: 15 }, h1Slow: { wait: 75, ttfb: 40, dl: 45 }, h2Fast: { wait: 25, ttfb: 10, dl: 15 }, h2Slow: { wait: 75, ttfb: 30, dl: 45 } },
    { name: 'bundle.js', type: 'script', size: '42.1 KB', h1Fast: { wait: 25, ttfb: 15, dl: 25 }, h1Slow: { wait: 75, ttfb: 40, dl: 60 }, h2Fast: { wait: 25, ttfb: 10, dl: 20 }, h2Slow: { wait: 75, ttfb: 30, dl: 50 } },
    { name: 'hero.webp', type: 'image', size: '120.8 KB', h1Fast: { wait: 55, ttfb: 20, dl: 35 }, h1Slow: { wait: 160, ttfb: 50, dl: 80 }, h2Fast: { wait: 25, ttfb: 12, dl: 35 }, h2Slow: { wait: 75, ttfb: 35, dl: 80 } },
    { name: 'font.woff2', type: 'font', size: '28.5 KB', h1Fast: { wait: 55, ttfb: 18, dl: 15 }, h1Slow: { wait: 160, ttfb: 45, dl: 40 }, h2Fast: { wait: 25, ttfb: 10, dl: 15 }, h2Slow: { wait: 75, ttfb: 30, dl: 40 } }
  ];

  function renderWaterfall() {
    const tbody = document.getElementById('waterfallTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const key = (currentProto === 'h1' ? 'h1' : 'h2') + (currentSpeed === 'fast' ? 'Fast' : 'Slow');

    resources.forEach(res => {
      const timing = res[key];
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td style="font-weight: 600; color: #f8fafc;">${res.name}</td>
        <td style="color: #94a3b8;">${res.type}</td>
        <td style="color: #94a3b8;">${res.size}</td>
        <td>
          <div class="wf-bar-wrapper">
            <div class="wf-seg-wait" style="width: ${timing.wait}%;"></div>
            <div class="wf-seg-ttfb" style="width: ${timing.ttfb}%;"></div>
            <div class="wf-seg-download" style="width: ${timing.dl}%;"></div>
          </div>
        </td>
      `;

      tr.addEventListener('mouseenter', () => {
        wfTooltipInfo.innerHTML = `
          <span>Zdroj: <strong>${res.name}</strong> (${res.size})</span>
          <span style="color: #94a3b8;">&bull; Čekání ve frontě: <strong>${timing.wait * 10} ms</strong></span>
          <span style="color: #38bdf8;">&bull; TTFB (latence): <strong>${timing.ttfb * 10} ms</strong></span>
          <span style="color: #4ade80;">&bull; Stahování dat: <strong>${timing.dl * 10} ms</strong></span>
        `;
      });

      tbody.appendChild(tr);
    });
  }

  if (wfProtoH1 && wfProtoH2) {
    wfProtoH1.addEventListener('click', () => {
      currentProto = 'h1';
      wfProtoH1.classList.add('active');
      wfProtoH2.classList.remove('active');
      renderWaterfall();
    });

    wfProtoH2.addEventListener('click', () => {
      currentProto = 'h2';
      wfProtoH2.classList.add('active');
      wfProtoH1.classList.remove('active');
      renderWaterfall();
    });
  }

  if (wfNetFast && wfNetSlow) {
    wfNetFast.addEventListener('click', () => {
      currentSpeed = 'fast';
      wfNetFast.classList.add('active');
      wfNetSlow.classList.remove('active');
      renderWaterfall();
    });

    wfNetSlow.addEventListener('click', () => {
      currentSpeed = 'slow';
      wfNetSlow.classList.add('active');
      wfNetFast.classList.remove('active');
      renderWaterfall();
    });
  }

  renderWaterfall();

  /* ========================================================================
     5. INTERAKTIVNÍ KONTROLNÍ OTÁZKY S NÁPOVĚDOU
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
