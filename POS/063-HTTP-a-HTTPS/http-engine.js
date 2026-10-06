/**
 * ==========================================================================
 * Téma 063: Protokoly HTTP a HTTPS - Interaktivní engine simulátorů
 * SPŠ Výukové materiály • Předmět POS
 * 100% Offline & Pure Vanilla JavaScript
 * ==========================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. DATA A SIMULÁTOR VERZÍ HTTP (Snímek 8)
     ========================================================================== */
  const HTTP_VERSIONS_DATA = {
    'http10': {
      title: 'HTTP/1.0 (1996) &ndash; Samostatná TCP spojení pro každý soubor',
      badge: 'Základní web',
      badgeColor: '#60a5fa',
      desc: 'Pro každý stahovaný objekt (HTML, CSS, JS, obrázek) se muselo navázat zcela <strong>nové TCP spojení</strong> (3-way handshake). Po stažení souboru se spojení ihned uzavřelo (FIN). Načtení 4 souborů znamenalo 4 samostatné handshaky a obrovskou latenci.',
      metrics: {
        transport: 'TCP (Port 80)',
        conns: '4 samostatná spojení',
        latency: '8 RTT (Extrémní režie)',
        hol: 'Bez Keep-Alive (Sekvenční)',
        format: 'Čistý ASCII text'
      },
      lanes: [
        { name: 'index.html', blocks: [{ type: 'tcp', text: 'SYN/ACK' }, { type: 'html', text: 'GET index.html' }], status: 'TCP FIN' },
        { name: 'style.css',  blocks: [{ type: 'tcp', text: 'SYN/ACK' }, { type: 'css',  text: 'GET style.css' }],  status: 'TCP FIN' },
        { name: 'app.js',     blocks: [{ type: 'tcp', text: 'SYN/ACK' }, { type: 'js',   text: 'GET app.js' }],     status: 'TCP FIN' },
        { name: 'photo.jpg',  blocks: [{ type: 'tcp', text: 'SYN/ACK' }, { type: 'img',  text: 'GET photo.jpg' }],  status: 'TCP FIN' }
      ],
      didacticTip: 'Nevýhoda HTTP/1.0: Obrovská zátěž na síťové směrovače a servery kvůli neustálému otevírání a zavírání TCP socketů pro každou malou ikonku na webu.'
    },

    'http11': {
      title: 'HTTP/1.1 (1997) &ndash; Perzistentní TCP spojení (Keep-Alive) & HoL Blokování',
      badge: 'Standard 20 let',
      badgeColor: '#38bdf8',
      desc: 'Zavedeno trvalé spojení (<strong>Connection: keep-alive</strong>). Více požadavků teče v jednom TCP spojení. <strong>Zásadní problém: Head-of-Line (HoL) blokování!</strong> Dotazy se musí vyřizovat přísně popořadě. Pokud server zdrží výpočet jednoho souboru, všechny ostatní za ním čekají ve frontě.',
      metrics: {
        transport: 'TCP (Port 80/443)',
        conns: '1 TCP (až 6 paralelních)',
        latency: '5 RTT (Čekání ve frontě)',
        hol: 'Trpí HoL na úrovni HTTP',
        format: 'Textové hlavičky'
      },
      lanes: [
        { name: 'index.html', blocks: [{ type: 'tcp', text: '1x TCP Handshake' }, { type: 'html', text: 'GET & index.html' }], status: '200 OK' },
        { name: 'style.css',  blocks: [{ type: 'tcp', text: 'Keep-Alive' }, { type: 'css', text: 'GET & style.css' }], status: '200 OK' },
        { name: 'app.js',     blocks: [{ type: 'tcp', text: 'Čeká ve frontě...' }, { type: 'js', text: 'GET & app.js' }], status: '200 OK' },
        { name: 'photo.jpg',  blocks: [{ type: 'tcp', text: 'Blokováno velkým souborem' }, { type: 'img', text: 'GET photo.jpg' }], status: '200 OK' }
      ],
      didacticTip: 'Prohlížeče obcházely HoL blokování v HTTP/1.1 tím, že otevíraly až 6 paralelních TCP spojení na stejnou doménu. To však vyčerpávalo systémové prostředky serverů.'
    },

    'http2': {
      title: 'HTTP/2 (2015) &ndash; Binární rámce a plný Multiplexing',
      badge: 'Binární revoluce',
      badgeColor: '#34d399',
      desc: 'Vše probíhá v <strong>jediném TCP spojení</strong>. Požadavky a odpovědi jsou rozsekány do malých binárních rámců s číslem proudu (Streams). Data pro HTML, CSS, JS i obrázky proudí na drátě současně promíchaná bez blokování. Zavedena komprese hlaviček HPACK.',
      metrics: {
        transport: 'TCP + TLS (Port 443)',
        conns: '1 jediné TCP spojení',
        latency: '2-3 RTT (Vysoká rychlost)',
        hol: 'Vyřešeno v HTTP (Trvá v TCP)',
        format: 'Binární rámce (Streams)'
      },
      lanes: [
        { name: 'index.html', blocks: [{ type: 'tcp', text: '1x Handshake' }, { type: 'html', text: 'Stream 1: Rámce HTML' }], status: 'Stream 1' },
        { name: 'style.css',  blocks: [{ type: 'tcp', text: 'Multiplexing' }, { type: 'css',  text: 'Stream 3: Rámce CSS' }],  status: 'Stream 3' },
        { name: 'app.js',     blocks: [{ type: 'tcp', text: 'Multiplexing' }, { type: 'js',   text: 'Stream 5: Rámce JS' }],   status: 'Stream 5' },
        { name: 'photo.jpg',  blocks: [{ type: 'tcp', text: 'Multiplexing' }, { type: 'img',  text: 'Stream 7: Rámce IMG' }],  status: 'Stream 7' }
      ],
      didacticTip: 'Limitace HTTP/2: Pokud se na síti ztratí jediný TCP paket, jádro operačního systému pozastaví celý TCP proud, dokud nedorazí náhradní paket. Tím se nechtěně zpomalí všechny streamy uvnitř (TCP-level HoL blocking).'
    },

    'http3': {
      title: 'HTTP/3 (2022) &ndash; QUIC protokol nad UDP & Konec HoL blokování',
      badge: 'Moderní budoucnost',
      badgeColor: '#c084fc',
      desc: 'Nahrazuje TCP moderním protokolem <strong>QUIC běžícím nad UDP</strong> na portu 443. Jednotlivé datové proudy jsou na transportní vrstvě zcela nezávislé. <strong>Ztráta paketu u obrázku nezastaví přenos HTML ani stylů!</strong> Integrované TLS 1.3 umožňuje 0-RTT/1-RTT navázání spojení.',
      metrics: {
        transport: 'UDP QUIC (Port 443)',
        conns: '1 QUIC relace (Connection ID)',
        latency: '1 RTT (Bleskový start)',
        hol: 'Zcela eliminováno i na L4',
        format: 'Binární QUIC rámce'
      },
      lanes: [
        { name: 'index.html', blocks: [{ type: 'html', text: '1-RTT QUIC' }, { type: 'html', text: 'Stream 0: Okamžitý přenos' }], status: 'Hotovo' },
        { name: 'style.css',  blocks: [{ type: 'css',  text: 'Nezávislý proud' }, { type: 'css',  text: 'Stream 4: Běží naplno' }], status: 'Hotovo' },
        { name: 'app.js',     blocks: [{ type: 'js',   text: 'Nezávislý proud' }, { type: 'js',   text: 'Stream 8: Běží naplno' }], status: 'Hotovo' },
        { name: 'photo.jpg',  blocks: [{ type: 'loss', text: 'Ztráta paketu!' }, { type: 'img',  text: 'Obnova Stream 12 neblokuje ostatní!' }], status: 'Obnoveno' }
      ],
      didacticTip: 'Výhoda Connection ID v QUIC: Když student přejde s mobilem z Wi-Fi na mobilní 5G síť, změní se mu IP adresa. TCP spojení by spadlo, ale QUIC relace pokračuje bez přerušení!'
    }
  };

  function initHttpVersionsSimulator() {
    const tabs = document.querySelectorAll('.ver-tab-btn');
    const titleEl = document.getElementById('verSimTitle');
    const badgeEl = document.getElementById('verSimBadge');
    const descEl = document.getElementById('verSimDesc');
    const lanesWrap = document.getElementById('verLanesWrap');
    const tipEl = document.getElementById('verSimTip');

    // Metriky
    const mTransport = document.getElementById('mTransport');
    const mConns = document.getElementById('mConns');
    const mLatency = document.getElementById('mLatency');
    const mHol = document.getElementById('mHol');

    if (!tabs.length || !lanesWrap) return;

    function renderVersion(verKey) {
      const data = HTTP_VERSIONS_DATA[verKey];
      if (!data) return;

      if (titleEl) titleEl.innerHTML = data.title;
      if (badgeEl) {
        badgeEl.textContent = data.badge;
        badgeEl.style.borderColor = data.badgeColor;
        badgeEl.style.color = data.badgeColor;
      }
      if (descEl) descEl.innerHTML = data.desc;
      if (tipEl) tipEl.innerHTML = `<strong>SPŠ Point:</strong> ${data.didacticTip}`;

      if (mTransport) mTransport.textContent = data.metrics.transport;
      if (mConns) mConns.textContent = data.metrics.conns;
      if (mLatency) mLatency.textContent = data.metrics.latency;
      if (mHol) mHol.textContent = data.metrics.hol;

      lanesWrap.innerHTML = data.lanes.map(lane => `
        <div class="ver-file-lane">
          <div class="ver-file-label">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            ${lane.name}
          </div>
          <div class="ver-lane-track">
            ${lane.blocks.map(b => `<div class="ver-block ${b.type}">${b.text}</div>`).join('')}
          </div>
          <div class="ver-file-status">${lane.status}</div>
        </div>
      `).join('');
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderVersion(tab.dataset.ver);
      });
    });

    // Výchozí verze HTTP/2
    renderVersion('http2');
  }

  /* ==========================================================================
     2. SIMULÁTOR KOMUNIKACE KLIENT-SERVER S HLAVIČKAMI A COOKIES (Snímek 9)
     ========================================================================== */
  const CLIENT_SERVER_SCENARIOS = [
    {
      id: 'get-index',
      name: '1. Načtení webu (GET /index.html & 200 OK)',
      badge: 'Běžný dotaz',
      clientUrl: 'http://sps.cz/index.html',
      isSecure: false,
      serverPort: '80 (HTTP)',
      steps: [
        {
          title: 'Krok 1: Navázání spolehlivého TCP spojení (3-way Handshake)',
          sender: 'client',
          receiver: 'server',
          packetText: 'TCP SYN ➔ SYN-ACK ➔ ACK',
          packetDir: 'ltr',
          encryptedWire: false,
          wireSniffer: '[Port 80 TCP] Flag: SYN -> Flag: SYN,ACK -> Flag: ACK. Spojení na portu 80 navázáno.',
          wireNote: 'Před odesláním jakéhokoliv HTTP dotazu musí operační systém navázat spolehlivé TCP spojení trojcestným potřesením rukou (3-way Handshake).',
          headersRaw: `TCP Handshake (L4 Transportní vrstva):\n  Source Port: 52140\n  Destination Port: 80 (HTTP)\n  Flags: [SYN], [ACK]\n  Status: ESTABLISHED\n  RTT: ~15 ms`,
          clientCookieState: '(Zatím žádné Cookies pro sps.cz)',
          didacticText: '<strong>Transportní vrstva:</strong> Klient a server si vyměnili počáteční sekvenční čísla. Kanál je připraven pro přenos aplikačních dat protokolu HTTP.'
        },
        {
          title: 'Krok 2: Odeslání HTTP požadavku (Request: GET /index.html)',
          sender: 'client',
          receiver: 'server',
          packetText: 'HTTP GET /index.html',
          packetDir: 'ltr',
          encryptedWire: false,
          wireSniffer: '<span style="color:#60a5fa;">GET /index.html HTTP/1.1</span> [Host: sps.cz, User-Agent: Mozilla/5.0]',
          wireNote: 'Nešifrovaný text! Kdokoliv na lince (Wi-Fi, router) vidí požadovanou URL i hlavičky prohlížeče.',
          headersRaw: `<span class="hl-method">GET /index.html HTTP/1.1</span>\n<span class="hl-header-key">Host:</span> <span class="hl-header-val">sps.cz</span>\n<span class="hl-header-key">User-Agent:</span> <span class="hl-header-val">Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0</span>\n<span class="hl-header-key">Accept:</span> <span class="hl-header-val">text/html,application/xhtml+xml,application/xml;q=0.9</span>\n<span class="hl-header-key">Accept-Language:</span> <span class="hl-header-val">cs-CZ,cs;q=0.9,en;q=0.8</span>\n<span class="hl-header-key">Connection:</span> <span class="hl-header-val">keep-alive</span>`,
          clientCookieState: '(Zatím žádné Cookies pro sps.cz)',
          didacticText: '<strong>Anatomie požadavku:</strong> Metoda <code>GET</code> žádá o stažení souboru. Hlavička <code>Host</code> je v HTTP/1.1 povinná (umožňuje provozovat tisíce domén na jediné IP adrese serveru).'
        },
        {
          title: 'Krok 3: Zpracování dotazu webovým serverem',
          sender: 'server',
          receiver: 'server',
          packetText: 'Server hledá /var/www/html/index.html',
          packetDir: 'none',
          encryptedWire: false,
          wireSniffer: '[Web Server Nginx] Soubor index.html nalezen (1420 bajtů). Generuji HTTP 200 OK.',
          wireNote: 'Server ověřil existenci souboru a přístupová práva. Sestavuje HTTP odpověď.',
          headersRaw: `Interní stav serveru:\n  Server: nginx/1.24.0 (Ubuntu)\n  Dokument: /var/www/html/index.html\n  Stavový kód: 200 OK\n  MIME Type: text/html\n  Čas zpracování: 1.2 ms`,
          clientCookieState: '(Zatím žádné Cookies pro sps.cz)',
          didacticText: '<strong>Odbavení na serveru:</strong> Server přečetl soubor z disku, změřil jeho délku (Content-Length: 1420) a připravil tělo zprávy s HTML kódem.'
        },
        {
          title: 'Krok 4: Odpověď serveru (Response: 200 OK) a předání HTML',
          sender: 'server',
          receiver: 'client',
          packetText: 'HTTP 200 OK (1420 B)',
          packetDir: 'rtl',
          encryptedWire: false,
          wireSniffer: '<span style="color:#34d399;">HTTP/1.1 200 OK</span> [Content-Type: text/html; charset=UTF-8, Server: nginx]',
          wireNote: 'Přenášený HTML kód i hlavičky jsou na síti v otevřeném nešifrovaném tvaru.',
          headersRaw: `<span class="hl-status">HTTP/1.1 200 OK</span>\n<span class="hl-header-key">Date:</span> <span class="hl-header-val">Wed, 07 Oct 2026 01:25:00 GMT</span>\n<span class="hl-header-key">Server:</span> <span class="hl-header-val">nginx/1.24.0 (Ubuntu)</span>\n<span class="hl-header-key">Content-Type:</span> <span class="hl-header-val">text/html; charset=UTF-8</span>\n<span class="hl-header-key">Content-Length:</span> <span class="hl-header-val">1420</span>\n<span class="hl-header-key">Connection:</span> <span class="hl-header-val">keep-alive</span>\n\n<span class="hl-body">&lt;!DOCTYPE html&gt;\n&lt;html lang="cs"&gt;\n&lt;head&gt;&lt;title&gt;SPŠ Informační portál&lt;/title&gt;&lt;/head&gt;\n&lt;body&gt;\n  &lt;h1&gt;Vítejte ve školní síti SPŠ&lt;/h1&gt;\n  &lt;p&gt;Úspěšně načteno protokolem HTTP/1.1&lt;/p&gt;\n&lt;/body&gt;\n&lt;/html&gt;</span>`,
          clientCookieState: '(Zatím žádné Cookies pro sps.cz)',
          didacticText: '<strong>Předání obsahu:</strong> Klientský prohlížeč přijal HTML data a začíná je parsovat do DOM stromu. Spojení zůstává aktivní pro stahování dalších stylů a skriptů.'
        }
      ]
    },

    {
      id: 'post-login',
      name: '2. Přihlášení uživatele & nastavení Cookie (POST /api/login)',
      badge: 'Autentizace',
      clientUrl: 'http://sps.cz/login',
      isSecure: false,
      serverPort: '80 (HTTP)',
      steps: [
        {
          title: 'Krok 1: Odeslání formuláře s heslem metodou POST',
          sender: 'client',
          receiver: 'server',
          packetText: 'POST /api/login [HESLO V TEXTU!]',
          packetDir: 'ltr',
          encryptedWire: false,
          wireSniffer: '<span style="color:#ef4444; font-weight:700;">KRITICKÉ: {"user":"novak_jan","pass":"TajneHeslo123"}</span>',
          wireNote: 'Kritická bezpečnostní chyba! V nešifrovaném HTTP letí heslo vzduchem v otevřeném JSONu. Kdokoliv na Wi-Fi ho může odposlechnout!',
          headersRaw: `<span class="hl-method">POST /api/login HTTP/1.1</span>\n<span class="hl-header-key">Host:</span> <span class="hl-header-val">sps.cz</span>\n<span class="hl-header-key">Content-Type:</span> <span class="hl-header-val">application/json</span>\n<span class="hl-header-key">Content-Length:</span> <span class="hl-header-val">52</span>\n<span class="hl-header-key">Origin:</span> <span class="hl-header-val">http://sps.cz</span>\n\n<span class="hl-body" style="color:#f87171;">{\n  "username": "novak_jan",\n  "password": "TajneHeslo123"\n}</span>`,
          clientCookieState: '(Zatím bez přihlašovací Cookie)',
          didacticText: '<strong>Metoda POST:</strong> Narozdíl od metody GET, která parametry vkládá do URL, metoda POST přenáší data v těle požadavku (Payload). U HTTP je však toto tělo zcela nechráněné!'
        },
        {
          title: 'Krok 2: Server ověří heslo a vygeneruje bezpečné Session ID',
          sender: 'server',
          receiver: 'server',
          packetText: 'Ověření hash hesla & generování tokenu',
          packetDir: 'none',
          encryptedWire: false,
          wireSniffer: '[Backend Python/PHP] Hash hesla odpovídá. Generuji Session ID: sps_sec_88492fa0.',
          wireNote: 'Server úspěšně autentizoval uživatele a vytvořil relaci v mezipaměti Redis.',
          headersRaw: `Autentizační subsystém:\n  Uživatel: novak_jan (ID: 10482)\n  Ověření: ÚSPĚŠNÉ (Argon2id hash shoda)\n  Vystavené Session ID: sps_sec_88492fa0\n  Platnost: 3600 sekund (1 hodina)`,
          clientCookieState: '(Zatím bez přihlašovací Cookie)',
          didacticText: '<strong>Řešení bezstavovosti:</strong> Aby uživatel nemusel zadávat heslo při každém kliknutí, server pro něj vytvoří unikátní náhodný klíč (Session ID).'
        },
        {
          title: 'Krok 3: Server vrací 200 OK s klíčovou hlavičkou Set-Cookie',
          sender: 'server',
          receiver: 'client',
          packetText: 'HTTP 200 OK + Set-Cookie',
          packetDir: 'rtl',
          encryptedWire: false,
          wireSniffer: '<span style="color:#34d399;">200 OK</span> | <span class="hl-cookie">Set-Cookie: session_id=sps_sec_88492fa0; HttpOnly; Secure</span>',
          wireNote: 'Server dává prohlížeči přísný příkaz uložit cookie a chránit ji příznaky HttpOnly a Secure.',
          headersRaw: `<span class="hl-status">HTTP/1.1 200 OK</span>\n<span class="hl-header-key">Content-Type:</span> <span class="hl-header-val">application/json; charset=utf-8</span>\n<span class="hl-cookie">Set-Cookie:</span> <span class="hl-header-val">session_id=sps_sec_88492fa0; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600</span>\n<span class="hl-header-key">Cache-Control:</span> <span class="hl-header-val">no-store, private</span>\n\n<span class="hl-body">{\n  "status": "success",\n  "user": "Jan Novák",\n  "role": "student"\n}</span>`,
          clientCookieState: 'Ukládám Cookie: session_id=sps_sec_88492fa0',
          didacticText: '<strong>Příznaky v Set-Cookie:</strong><br>&bull; <code>HttpOnly</code>: Zakazuje JavaScriptu přístup k cookie (ochrana proti XSS krádeži).<br>&bull; <code>SameSite=Strict</code>: Brání odeslání cookie z cizích webů (ochrana proti CSRF podvržení).'
        },
        {
          title: 'Krok 4: Prohlížeč uložil cookie do svého úložiště (Cookie Jar)',
          sender: 'client',
          receiver: 'client',
          packetText: 'Cookie bezpečně uložena v prohlížeči',
          packetDir: 'none',
          encryptedWire: false,
          wireSniffer: '[Prohlížeč Klienta] Relace uložena. Uživatel je nyní přihlášen jako Jan Novák.',
          wireNote: 'Prohlížeč si pamatuje Session ID a automaticky ho připojí ke každému dalšímu požadavku.',
          headersRaw: `Lokální úložiště prohlížeče (Cookie Jar):\n  Doména: sps.cz\n  Název: session_id\n  Hodnota: sps_sec_88492fa0\n  Zabezpečení: HttpOnly=ANO, Secure=ANO, SameSite=Strict\n  Expirace: Za 60 minut`,
          clientCookieState: 'session_id=sps_sec_88492fa0 (HttpOnly, Secure)',
          didacticText: '<strong>Výsledek:</strong> Uživatel je přihlášen. V následujícím požadavku uvidíte, jak se tato cookie automaticky přiloží.'
        }
      ]
    },

    {
      id: 'get-profile-cookie',
      name: '3. Následný dotaz s ověřenou Cookie (GET /student/profil)',
      badge: 'Stavová relace',
      clientUrl: 'http://sps.cz/student/profil',
      isSecure: false,
      serverPort: '80 (HTTP)',
      steps: [
        {
          title: 'Krok 1: Klient otevírá profil & Prohlížeč automaticky přikládá Cookie',
          sender: 'client',
          receiver: 'server',
          packetText: 'GET /student/profil + Cookie',
          packetDir: 'ltr',
          encryptedWire: false,
          wireSniffer: '<span style="color:#60a5fa;">GET /student/profil</span> [Cookie: session_id=sps_sec_88492fa0]',
          wireNote: 'Prohlížeč bez ptaní přibalil uloženou cookie do hlavičky požadavku!',
          headersRaw: `<span class="hl-method">GET /student/profil HTTP/1.1</span>\n<span class="hl-header-key">Host:</span> <span class="hl-header-val">sps.cz</span>\n<span class="hl-cookie">Cookie:</span> <span class="hl-header-val">session_id=sps_sec_88492fa0</span>\n<span class="hl-header-key">Accept:</span> <span class="hl-header-val">application/json</span>\n<span class="hl-header-key">User-Agent:</span> <span class="hl-header-val">Mozilla/5.0...</span>`,
          clientCookieState: 'session_id=sps_sec_88492fa0',
          didacticText: '<strong>Automatická hlavička Cookie:</strong> Kdykoli prohlížeč posílá dotaz na doménu sps.cz, automaticky prohledá svůj Cookie Jar a vloží odpovídající hlavičku <code>Cookie</code>.'
        },
        {
          title: 'Krok 2: Server přečte Session ID a identifikuje studenta',
          sender: 'server',
          receiver: 'server',
          packetText: 'Server ověřuje session_id v paměti',
          packetDir: 'none',
          encryptedWire: false,
          wireSniffer: '[Backend Auth] Token sps_sec_88492fa0 odpovídá: Jan Novák, Třída 3.B.',
          wireNote: 'Server ví přesně, o kterého žáka jde, aniž by se musel ptát na jméno a heslo!',
          headersRaw: `Vyhodnocení relace serverem:\n  Nalezená Cookie: session_id=sps_sec_88492fa0\n  Ověřeno v Redis: PLATNÉ (Zbývá 58 min)\n  Přiřazený účet: Jan Novák (Třída: 3.B, Obor: Kybernetika)`,
          clientCookieState: 'session_id=sps_sec_88492fa0',
          didacticText: '<strong>Stavovost nad bezstavovým protokolem:</strong> HTTP protokol zůstává sám o sobě bezstavový, ale aplikační vrstva pomocí Session ID vytvořila iluzi trvalého přihlášení.'
        },
        {
          title: 'Krok 3: Server vrací chráněná osobní data studenta (200 OK)',
          sender: 'server',
          receiver: 'client',
          packetText: 'HTTP 200 OK (Osobní profil)',
          packetDir: 'rtl',
          encryptedWire: false,
          wireSniffer: '<span style="color:#34d399;">200 OK</span> [JSON Profil studenta Jana Nováka]',
          wireNote: 'Student obdržel své známky a rozvrh.',
          headersRaw: `<span class="hl-status">HTTP/1.1 200 OK</span>\n<span class="hl-header-key">Content-Type:</span> <span class="hl-header-val">application/json; charset=utf-8</span>\n\n<span class="hl-body">{\n  "jmeno": "Jan Novák",\n  "trida": "3.B",\n  "obor": "Informační technologie a kybernetika",\n  "prumer_znamek": 1.35,\n  "role": "student"\n}</span>`,
          clientCookieState: 'session_id=sps_sec_88492fa0',
          didacticText: '<strong>Závěr:</strong> Celý cyklus funguje naprosto hladce. Kdyby útočník na nešifrované síti odposlechl toto Session ID, mohl by se za žáka vydávat (Session Hijacking).'
        }
      ]
    },

    {
      id: 'https-tls13',
      name: '4. Zabezpečené HTTPS & TLS 1.3 Handshake (Port 443)',
      badge: 'Šifrované TLS',
      clientUrl: 'https://sps.cz/tajne-udaje',
      isSecure: true,
      serverPort: '443 (HTTPS)',
      steps: [
        {
          title: 'Krok 1: TCP Handshake na portu 443',
          sender: 'client',
          receiver: 'server',
          packetText: 'TCP SYN ➔ SYN-ACK na portu 443',
          packetDir: 'ltr',
          encryptedWire: false,
          wireSniffer: '[Port 443 TCP] Navázání spolehlivého TCP spojení pro HTTPS.',
          wireNote: 'Před kryptografickým TLS vyjednáváním se nejprve naváže TCP transportní kanál.',
          headersRaw: `TCP Spojení:\n  Port: 443 (HTTPS výchozí)\n  Flags: [SYN] -> [SYN,ACK] -> [ACK]\n  Status: ESTABLISHED`,
          clientCookieState: 'session_id=sps_sec_88492fa0',
          didacticText: '<strong>HTTPS = HTTP nad TLS:</strong> Vše začíná standardním TCP spojením, ale tentokrát na vyhrazeném portu 443.'
        },
        {
          title: 'Krok 2: TLS ClientHello & Odeslání veřejného klíče (Key Share)',
          sender: 'client',
          receiver: 'server',
          packetText: 'TLS 1.3: ClientHello + KeyShare',
          packetDir: 'ltr',
          encryptedWire: false,
          wireSniffer: 'TLSv1.3 Client Hello [Šifry: TLS_AES_256_GCM_SHA384, Veřejný klíč ECDHE]',
          wireNote: 'Klient oznamuje serveru seznam šifer a rovnou přikládá svůj asymetrický klíč.',
          headersRaw: `TLS 1.3 Handshake (Client Hello):\n  Verze: TLS 1.3 (0x0304)\n  Podporované šifry: TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256\n  Server Name Indication (SNI): sps.cz\n  Key Share (ECDHE): x25519 klientský veřejný klíč`,
          clientCookieState: 'session_id=sps_sec_88492fa0',
          didacticText: '<strong>TLS 1.3 1-RTT rychlost:</strong> V moderním TLS 1.3 posílá klient svůj veřejný klíč rovnou v prvním paketu, čímž ušetří celé jedno zdržení sítě (RTT).'
        },
        {
          title: 'Krok 3: TLS ServerHello + X.509 Certifikát certifikační autority (CA)',
          sender: 'server',
          receiver: 'client',
          packetText: 'TLS ServerHello + X.509 Certifikát',
          packetDir: 'rtl',
          encryptedWire: false,
          wireSniffer: 'TLSv1.3 Server Hello [Výběr: AES-256-GCM] + X.509 Certifikát Let\'s Encrypt',
          wireNote: 'Server vybral nejbezpečnější šifru a předkládá digitální certifikát podepsaný CA.',
          headersRaw: `TLS 1.3 Server Odpověď:\n  Vybraná šifra: TLS_AES_256_GCM_SHA384\n  Digitální certifikát: CN=sps.cz, Vystavitel: Let's Encrypt Authority X3\n  Status certifikátu: PLATNÝ (Kryptografický podpis sedí)\n  Key Share (ECDHE): x25519 serverový veřejný klíč`,
          clientCookieState: 'session_id=sps_sec_88492fa0',
          didacticText: '<strong>Ověření identity webu:</strong> Prohlížeč zkontroluje podpis certifikátu vůči svému seznamu kořenových certifikačních autorit. Tím je vyloučeno, že server podvrhuje útočník.'
        },
        {
          title: 'Krok 4: Odvození symetrického klíče & Zelený zámeček v prohlížeči',
          sender: 'client',
          receiver: 'client',
          packetText: 'Výpočet symetrického klíče AES-256',
          packetDir: 'none',
          encryptedWire: true,
          wireSniffer: '[TLS Vrstva] Společné tajemství vypočteno (ECDHE). Od této chvíle je linka ŠIFROVANÁ!',
          wireNote: 'Zámeček v prohlížeči zzelenal! Šifrovací tunel AES-256-GCM je aktivní.',
          headersRaw: `Kryptografický stav spojení:\n  Symetrická šifra: AES-256-GCM (Symetrická, hardwarově akcelerovaná)\n  Integrita dat: HMAC SHA-384\n  Ochrana proti odposlechu: 100% aktivní\n  Forward Secrecy: ANO (Zpětně neprolomitelné)`,
          clientCookieState: 'session_id=sps_sec_88492fa0 (Chráněno v tunelu)',
          didacticText: '<strong>Kombinace asymetrické a symetrické šifry:</strong> Asymetrická kryptografie posloužila pouze k bezpečné výměně klíčů. Samotná data se šifrují bleskově rychlou symetrickou šifrou AES.'
        },
        {
          title: 'Krok 5: Bezpečný přenos dat & Co vidí odposlech na síti',
          sender: 'client',
          receiver: 'server',
          packetText: 'AES-256 Šifrovaná aplikační data',
          packetDir: 'ltr',
          encryptedWire: true,
          wireSniffer: '<span style="color:#34d399; font-weight:700;">[CIPHERTEXT] b4 1a e9 72 c3 f8 02 da 99 e4 51 0b 33 8f a1 cd...</span>',
          wireNote: 'Útočník na lince vidí POUZE nečitelnou změť náhodných bajtů! Hesla, cookies i URL jsou v bezpečí.',
          headersRaw: `<span class="hl-status">Dešifrovaný obsah uvnitř prohlížeče:</span>\n<span class="hl-method">GET /tajne-udaje HTTP/2</span>\n<span class="hl-header-key">Host:</span> <span class="hl-header-val">sps.cz</span>\n<span class="hl-cookie">Cookie:</span> <span class="hl-header-val">session_id=sps_sec_88492fa0</span>\n<span class="hl-header-key">Authorization:</span> <span class="hl-header-val">Bearer token_super_tajny_778899</span>\n\n<span class="hl-body">{\n  "vysledek": "Přísně tajná data úspěšně přenesena v bezpečí TLS tunelu"\n}</span>`,
          clientCookieState: 'session_id=sps_sec_88492fa0 (Zašifrováno)',
          didacticText: '<strong>Rozdíl oproti HTTP:</strong> Všechny hlavičky, cookies i tělo jsou zašifrovány. Útočník se nedozví ani přesnou URL stránky, kterou si student prohlíží!'
        }
      ]
    },

    {
      id: 'redirect-hsts',
      name: '5. Automatické přesměrování z HTTP na HTTPS (301 & HSTS)',
      badge: 'Přesměrování',
      clientUrl: 'http://skola.cz &rarr; https://skola.cz',
      isSecure: true,
      serverPort: '80 &rarr; 443',
      steps: [
        {
          title: 'Krok 1: Uživatel zadal pouze skola.cz & Prohlížeč zkusil port 80',
          sender: 'client',
          receiver: 'server',
          packetText: 'GET / HTTP/1.1 (Port 80)',
          packetDir: 'ltr',
          encryptedWire: false,
          wireSniffer: 'GET / HTTP/1.1 [Host: skola.cz na portu 80]',
          wireNote: 'Prohlížeč se z historických důvodů nejprve pokusil o nešifrované HTTP.',
          headersRaw: `<span class="hl-method">GET / HTTP/1.1</span>\n<span class="hl-header-key">Host:</span> <span class="hl-header-val">skola.cz</span>\n<span class="hl-header-key">User-Agent:</span> <span class="hl-header-val">Mozilla/5.0...</span>\n<span class="hl-header-key">Connection:</span> <span class="hl-header-val">close</span>`,
          clientCookieState: '(Žádné Cookies)',
          didacticText: '<strong>Výchozí chování prohlížeče:</strong> Pokud uživatel nezadá prefix https://, starší prohlížeče se pokusí otevřít nešifrovaný port 80.'
        },
        {
          title: 'Krok 2: Server odmítá nešifrovaný přístup (301 Moved Permanently)',
          sender: 'server',
          receiver: 'client',
          packetText: 'HTTP 301 Moved Permanently',
          packetDir: 'rtl',
          encryptedWire: false,
          wireSniffer: '<span style="color:#60a5fa;">301 Moved Permanently</span> &rarr; Location: https://skola.cz/',
          wireNote: 'Server vrací kód 301, cílové HTTPS URL a hlavičku HSTS pro budoucí návštěvy.',
          headersRaw: `<span class="hl-status">HTTP/1.1 301 Moved Permanently</span>\n<span class="hl-header-key">Location:</span> <span class="hl-header-val" style="color:#34d399; font-weight:700;">https://skola.cz/</span>\n<span class="hl-header-key">Strict-Transport-Security:</span> <span class="hl-header-val">max-age=31536000; includeSubDomains; preload</span>\n<span class="hl-header-key">Content-Length:</span> <span class="hl-header-val">0</span>\n<span class="hl-header-key">Connection:</span> <span class="hl-header-val">close</span>`,
          clientCookieState: '(Žádné Cookies)',
          didacticText: '<strong>Hlavička HSTS (HTTP Strict Transport Security):</strong> Příkaz <code>max-age=31536000</code> nařizuje prohlížeči, aby si na 1 celý rok zapamatoval, že na tento web NESMÍ nikdy vstoupit přes nezabezpečené HTTP!'
        },
        {
          title: 'Krok 3: Prohlížeč okamžitě přepíná na zabezpečené HTTPS (Port 443)',
          sender: 'client',
          receiver: 'server',
          packetText: 'Přechod na https://skola.cz (Port 443)',
          packetDir: 'ltr',
          encryptedWire: true,
          wireSniffer: '[Klient] Zahájení zabezpečeného TLS spojení na portu 443. Zámeček uzamčen.',
          wireNote: 'Prohlížeč automaticky navázal šifrované spojení na portu 443 bez jakéhokoliv klikání uživatele.',
          headersRaw: `<span class="hl-status">Zabezpečené spojení HTTPS (Port 443):</span>\nURL: https://skola.cz/\nProtokol: HTTP/2 nad TLS 1.3\nHSTS: Aktivní (Příští návštěva půjde rovnou na HTTPS bez návštěvy portu 80)`,
          clientCookieState: '(Zabezpečeno na https://skola.cz)',
          didacticText: '<strong>Výsledek:</strong> Web je bezpečně přesměrován. HSTS eliminuje zranitelnost typu SSL Stripping (kdy útočník na síti podvrhne nešifrovanou verzi webu).'
        }
      ]
    }
  ];

  function initClientServerSimulator() {
    const scenarioBtns = document.querySelectorAll('.cs-scenario-btn');
    const stepIndicators = document.getElementById('csStepIndicators');
    const btnPrev = document.getElementById('btnCsPrev');
    const btnNext = document.getElementById('btnCsNext');
    const btnPlay = document.getElementById('btnCsPlay');
    const btnReset = document.getElementById('btnCsReset');
    const stepCounter = document.getElementById('csStepCounter');

    // Scéna elementy
    const nodeClient = document.getElementById('csNodeClient');
    const nodeServer = document.getElementById('csNodeServer');
    const browserBar = document.getElementById('csBrowserBar');
    const cookieVault = document.getElementById('csCookieVault');
    const serverPortBadge = document.getElementById('csServerPortBadge');
    const wireLine = document.getElementById('csWireLine');
    const packetFlyer = document.getElementById('csPacketFlyer');
    const snifferData = document.getElementById('csSnifferData');
    const snifferNote = document.getElementById('csSnifferNote');

    // Inspekční panely
    const headersBox = document.getElementById('csHeadersBox');
    const didacticBox = document.getElementById('csDidacticBox');

    if (!scenarioBtns.length || !headersBox) return;

    let currentScenarioIdx = 0;
    let currentStepIdx = 0;
    let autoPlayTimer = null;

    function renderScenarioTabs() {
      scenarioBtns.forEach((btn, idx) => {
        btn.classList.toggle('active', idx === currentScenarioIdx);
      });
    }

    function renderStepIndicators(totalSteps) {
      if (!stepIndicators) return;
      stepIndicators.innerHTML = '';
      for (let i = 0; i < totalSteps; i++) {
        const dot = document.createElement('div');
        dot.className = `cs-step-dot ${i === currentStepIdx ? 'active' : ''} ${i < currentStepIdx ? 'done' : ''}`;
        dot.textContent = i + 1;
        dot.title = `Přejít na krok ${i + 1}`;
        dot.addEventListener('click', () => {
          stopAutoPlay();
          currentStepIdx = i;
          renderCurrentStep();
        });
        stepIndicators.appendChild(dot);
      }
    }

    function renderCurrentStep() {
      const scenario = CLIENT_SERVER_SCENARIOS[currentScenarioIdx];
      if (!scenario) return;

      const totalSteps = scenario.steps.length;
      if (currentStepIdx >= totalSteps) currentStepIdx = totalSteps - 1;
      if (currentStepIdx < 0) currentStepIdx = 0;

      const step = scenario.steps[currentStepIdx];

      // Indikátory a tlačítka
      if (stepCounter) stepCounter.textContent = `Krok ${currentStepIdx + 1} z ${totalSteps}`;
      renderStepIndicators(totalSteps);

      if (btnPrev) btnPrev.disabled = currentStepIdx === 0;
      if (btnNext) btnNext.disabled = currentStepIdx === totalSteps - 1;

      // Browser URL a stav
      if (browserBar) {
        const lockIcon = scenario.isSecure
          ? `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#34d399" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
          : `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#f87171" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        browserBar.innerHTML = `${lockIcon} <span style="color: ${scenario.isSecure ? '#34d399' : '#cbd5e1'};">${scenario.clientUrl}</span>`;
      }

      // Klientské cookies
      if (cookieVault) {
        cookieVault.innerHTML = `
          <div class="cs-cookie-vault-title">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 1 0-10-10"></path></svg>
            Klientský Cookie Jar:
          </div>
          <div class="cs-cookie-item">${step.clientCookieState}</div>
        `;
      }

      // Server port badge
      if (serverPortBadge) {
        serverPortBadge.textContent = scenario.serverPort;
        serverPortBadge.style.background = scenario.isSecure ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)';
        serverPortBadge.style.color = scenario.isSecure ? '#34d399' : '#60a5fa';
      }

      // Zvýraznění uzlů (kdo odesílá, kdo přijímá)
      if (nodeClient && nodeServer) {
        nodeClient.classList.remove('active-sender', 'active-receiver');
        nodeServer.classList.remove('active-sender', 'active-receiver');

        if (step.sender === 'client') nodeClient.classList.add('active-sender');
        if (step.receiver === 'client') nodeClient.classList.add('active-receiver');
        if (step.sender === 'server') nodeServer.classList.add('active-sender');
        if (step.receiver === 'server') nodeServer.classList.add('active-receiver');
      }

      // Drát a šifrování
      if (wireLine) {
        wireLine.classList.toggle('encrypted', step.encryptedWire);
      }

      // Zobrazení zprávy / paketu na síťové lince
      if (packetFlyer) {
        packetFlyer.style.display = 'inline-flex';
        let dirPrefix = '';
        if (step.packetDir === 'ltr') {
          dirPrefix = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
        } else if (step.packetDir === 'rtl') {
          dirPrefix = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
        } else {
          dirPrefix = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';
        }

        packetFlyer.className = `cs-packet-flyer ${step.packetDir}`;
        packetFlyer.innerHTML = `${dirPrefix}<span>${step.packetText}</span>`;
      }

      // Sniffer zobrazení
      if (snifferData) snifferData.innerHTML = step.wireSniffer;
      if (snifferNote) snifferNote.innerHTML = step.wireNote;

      // Zobrazení hlaviček a těla
      if (headersBox) headersBox.innerHTML = step.headersRaw;

      // Didaktický panel
      if (didacticBox) {
        didacticBox.innerHTML = `
          <div style="font-size: 0.9rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.35rem;">
            ${step.title}
          </div>
          <div>${step.didacticText}</div>
          <div class="cs-tip-callout" style="margin-top: 0.5rem;">
            <strong>Didaktický postřeh SPŠ:</strong> ${step.wireNote}
          </div>
        `;
      }
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
        if (btnPlay) {
          btnPlay.innerHTML = `
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Přehrát</span>
          `;
        }
      }
    }

    function toggleAutoPlay() {
      if (autoPlayTimer) {
        stopAutoPlay();
      } else {
        if (btnPlay) {
          btnPlay.innerHTML = `
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            <span>Pozastavit</span>
          `;
        }
        autoPlayTimer = setInterval(() => {
          const scenario = CLIENT_SERVER_SCENARIOS[currentScenarioIdx];
          if (currentStepIdx < scenario.steps.length - 1) {
            currentStepIdx++;
            renderCurrentStep();
          } else {
            stopAutoPlay();
          }
        }, 2200);
      }
    }

    // Event listenery
    scenarioBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        stopAutoPlay();
        currentScenarioIdx = idx;
        currentStepIdx = 0;
        renderScenarioTabs();
        renderCurrentStep();
      });
    });

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        stopAutoPlay();
        if (currentStepIdx > 0) {
          currentStepIdx--;
          renderCurrentStep();
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        stopAutoPlay();
        const scenario = CLIENT_SERVER_SCENARIOS[currentScenarioIdx];
        if (currentStepIdx < scenario.steps.length - 1) {
          currentStepIdx++;
          renderCurrentStep();
        }
      });
    }

    if (btnPlay) btnPlay.addEventListener('click', toggleAutoPlay);

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        stopAutoPlay();
        currentStepIdx = 0;
        renderCurrentStep();
      });
    }

    renderScenarioTabs();
    renderCurrentStep();
  }

  /* ==========================================================================
     3. INSPEKTOR STAVOVÝCH KÓDŮ (Snímek 10)
     ========================================================================== */
  const STATUS_CODES_DATA = {
    '200': { cat: '2xx Úspěch', name: '200 OK', desc: 'Standardní odpověď pro úspěšné HTTP požadavky. Tělo odpovědi obsahuje požadovaná data.' },
    '201': { cat: '2xx Úspěch', name: '201 Created', desc: 'Požadavek byl úspěšně zpracován a na serveru byl vytvořen nový prostředek (např. po POST požadavku).' },
    '204': { cat: '2xx Úspěch', name: '204 No Content', desc: 'Server požadavek úspěšně zpracoval, ale nevrací žádné tělo zprávy (např. po smazání DELETE).' },
    '301': { cat: '3xx Přesměrování', name: '301 Moved Permanently', desc: 'Trvalé přesměrování. Cílové URL se natrvalo změnilo. Prohlížeče si novou adresu ukládají do cache.' },
    '302': { cat: '3xx Přesměrování', name: '302 Found (Dočasné)', desc: 'Dočasné přesměrování. Požadovaný prostředek se dočasně nachází na jiné adrese.' },
    '304': { cat: '3xx Přesměrování', name: '304 Not Modified', desc: 'Prostředek se od poslední návštěvy nezměnil. Prohlížeč má použít verzi ze své lokální mezipaměti.' },
    '400': { cat: '4xx Klientská chyba', name: '400 Bad Request', desc: 'Server nemohl požadavku porozumět kvůli chybné syntaxi, poškozenému formátu nebo neplatnému JSON.' },
    '401': { cat: '4xx Klientská chyba', name: '401 Unauthorized', desc: 'Pro přístup je vyžadováno ověření identity (uživatel není přihlášen).' },
    '403': { cat: '4xx Klientská chyba', name: '403 Forbidden', desc: 'Přístup zakázán. Server identitu zná, ale uživatel nemá k danému souboru potřebná oprávnění.' },
    '404': { cat: '4xx Klientská chyba', name: '404 Not Found', desc: 'Požadovaný soubor nebo stránka na serveru neexistuje (nejznámější chyba webu).' },
    '429': { cat: '4xx Klientská chyba', name: '429 Too Many Requests', desc: 'Klient překročil povolený limit počtu dotazů za časovou jednotku (Rate Limiting).' },
    '500': { cat: '5xx Serverová chyba', name: '500 Internal Server Error', desc: 'Vnitřní chyba serveru. Běhový kód webové aplikace (PHP, Python, Java) zhavaroval s výjimkou.' },
    '502': { cat: '5xx Serverová chyba', name: '502 Bad Gateway', desc: 'Špatná brána. Proxy server (např. Nginx) obdržel neplatnou odpověď od aplikačního backendu.' },
    '503': { cat: '5xx Serverová chyba', name: '503 Service Unavailable', desc: 'Služba dočasně nedostupná. Server je přetížen požadavky nebo probíhá technická údržba.' }
  };

  function initStatusCodeExplorer() {
    const buttons = document.querySelectorAll('.status-btn');
    const titleEl = document.getElementById('statusCodeTitle');
    const catEl = document.getElementById('statusCodeCat');
    const descEl = document.getElementById('statusCodeDesc');

    if (buttons.length === 0 || !titleEl) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const code = btn.dataset.code;
        const data = STATUS_CODES_DATA[code];
        if (data) {
          titleEl.textContent = data.name;
          catEl.textContent = data.cat;
          descEl.textContent = data.desc;
        }
      });
    });
  }

  // Inicializace po načtení
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHttpVersionsSimulator();
      initClientServerSimulator();
      initStatusCodeExplorer();
    });
  } else {
    initHttpVersionsSimulator();
    initClientServerSimulator();
    initStatusCodeExplorer();
  }
})();
