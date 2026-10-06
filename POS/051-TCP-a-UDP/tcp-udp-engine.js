/**
 * ==========================================================================
 * Téma 051: Protokoly TCP a UDP - Interaktivní engine
 * SPŠ Výukové materiály • Předmět POS
 * 100% Offline & Pure Vanilla JavaScript
 * ==========================================================================
 */

(function () {
  'use strict';

  // 1. Detaily polí TCP hlavičky
  const TCP_FIELDS = {
    srcPort: { name: 'Zdrojový port (Source Port)', bits: '16 bitů (0–15)', desc: 'Číslo portu odesílatele segmentu. U klienta jde obvykle o náhodný dynamický/efemérní port (např. 51234), u serveru o standardní port služby.' },
    dstPort: { name: 'Cílový port (Destination Port)', bits: '16 bitů (16–31)', desc: 'Číslo portu cílového procesu. Určuje, které aplikaci na cílovém zařízení data náleží (např. 80 pro HTTP, 443 pro HTTPS).' },
    seq: { name: 'Pořadové číslo (Sequence Number)', bits: '32 bitů', desc: 'Pořadové číslo prvního bajtu dat v tomto segmentu v rámci celého datového toku. Při navazování spojení (SYN) nese počáteční náhodné číslo ISN.' },
    ack: { name: 'Číslo potvrzení (Acknowledgment Number)', bits: '32 bitů', desc: 'Platné pouze při nastaveném příznaku ACK. Udává pořadové číslo dalšího očekávaného bajtu od protistrany (kumulativní potvrzení).' },
    offset: { name: 'Délka záhlaví (Data Offset / Header Length)', bits: '4 bity', desc: 'Určuje velikost TCP hlavičky v násobcích 32bitových slov (4 bajty). Minimální hodnota je 5 (20 bajtů bez voleb), maximální 15 (60 bajtů).' },
    res: { name: 'Rezervováno', bits: '3 bity', desc: 'Rezervováno pro budoucí standardy. Musí být nastaveno na nuly.' },
    flags: { name: 'Řídicí příznaky (Control Flags)', bits: '9 bitů', desc: 'Jednobitové řídicí přepínače: URG, ACK, PSH, RST, SYN, FIN, ECE, CWR, NS. Řídí navázání, potvrzování, ukončení i resetování TCP spojení.' },
    window: { name: 'Velikost okna (Window Size)', bits: '16 bitů', desc: 'Kapacita přijímací vyrovnávací paměti (bufferu) příjemce v bajtech. Odesílatel nesmí poslat více neackovaných dat, než kolik činí toto okno (Flow Control).' },
    checksum: { name: 'Kontrolní součet (Checksum)', bits: '16 bitů', desc: 'Povinný kontrolní součet chránící TCP hlavičku, uživatelská data i tzv. pseudo-hlavičku (zdrojová a cílová IP adresa z L3).' },
    urgPtr: { name: 'Ukazatel naléhavosti (Urgent Pointer)', bits: '16 bitů', desc: 'Platný pouze při nastaveném příznaku URG. Ukazuje na offset posledního bajtu prioritních urgentních dat v segmentu.' },
    options: { name: 'Volby a výplň (Options & Padding)', bits: '0 až 320 bitů (0–40 bajtů)', desc: 'Volitelná pole rozšiřující TCP: vyjednání MSS (Maximum Segment Size), Window Scale (škálování okna až na gigabajty), Selective ACK (SACK), časová razítka (Timestamps).' }
  };

  // 2. Detaily polí UDP hlavičky
  const UDP_FIELDS = {
    srcPort: { name: 'Zdrojový port (Source Port)', bits: '16 bitů', desc: 'Port odesílající aplikace. Volitelný u jednosměrných zpráv (pokud se neočekává odpověď, může být 0).' },
    dstPort: { name: 'Cílový port (Destination Port)', bits: '16 bitů', desc: 'Port cílové aplikace (např. 53 pro DNS server, 67 pro DHCP server). Povinné pole pro směrování do procesu.' },
    len: { name: 'Délka datagramu (Length)', bits: '16 bitů', desc: 'Celková délka UDP datagramu v bajtech (hlavička 8 B + uživatelská data). Minimální hodnota je 8 bajtů (prázdný datagram).' },
    chk: { name: 'Kontrolní součet (Checksum)', bits: '16 bitů', desc: 'Ochrana integrity UDP hlavičky a dat. U IPv4 je volitelný (lze nastavit na 0), u moderního protokolu IPv6 je již striktně povinný.' }
  };

  // Inicializace TCP inspektoru
  function initHeaderInspectors() {
    const tcpCells = document.querySelectorAll('.header-cell[data-tcp-field]');
    const tcpName = document.getElementById('tcpFieldName');
    const tcpBits = document.getElementById('tcpFieldBits');
    const tcpDesc = document.getElementById('tcpFieldDesc');

    if (tcpCells.length > 0 && tcpName) {
      tcpCells.forEach(cell => {
        cell.addEventListener('click', () => {
          tcpCells.forEach(c => c.classList.remove('active'));
          cell.classList.add('active');
          const key = cell.dataset.tcpField;
          const info = TCP_FIELDS[key];
          if (info) {
            tcpName.textContent = info.name;
            tcpBits.textContent = info.bits;
            tcpDesc.textContent = info.desc;
          }
        });
      });
    }

    const udpCells = document.querySelectorAll('.udp-cell[data-udp-field]');
    const udpName = document.getElementById('udpFieldName');
    const udpBits = document.getElementById('udpFieldBits');
    const udpDesc = document.getElementById('udpFieldDesc');

    if (udpCells.length > 0 && udpName) {
      udpCells.forEach(cell => {
        cell.addEventListener('click', () => {
          udpCells.forEach(c => c.classList.remove('active'));
          cell.classList.add('active');
          const key = cell.dataset.udpField;
          const info = UDP_FIELDS[key];
          if (info) {
            udpName.textContent = info.name;
            udpBits.textContent = info.bits;
            udpDesc.textContent = info.desc;
          }
        });
      });
    }
  }

  // 3. Interaktivní simulátor komunikace TCP
  function initTcpSimulator() {
    const clientStateEl = document.getElementById('simClientState');
    const serverStateEl = document.getElementById('simServerState');
    const channelEl = document.getElementById('simChannel');
    const bubbleEl = document.getElementById('simBubble');
    const logWrapEl = document.getElementById('simLogWrap');
    const statusNoteEl = document.getElementById('simStatusNote');

    // Tlačítka scénářů
    const btnHandshake = document.getElementById('simBtnHandshake');
    const btnData = document.getElementById('simBtnData');
    const btnReorder = document.getElementById('simBtnReorder');
    const btnLoss = document.getElementById('simBtnLoss');
    const btnClose = document.getElementById('simBtnClose');
    const btnReset = document.getElementById('simBtnReset');

    if (!clientStateEl || !serverStateEl || !channelEl) return;

    // Interní proměnné stavu
    let clientState = 'CLOSED';
    let serverState = 'LISTEN';
    let clientSeq = 1000;
    let serverSeq = 5000;
    let isBusy = false;

    function updateStates(cState, sState) {
      clientState = cState;
      serverState = sState;

      clientStateEl.textContent = clientState;
      serverStateEl.textContent = serverState;

      // Reset tříd
      clientStateEl.className = 'host-state';
      serverStateEl.className = 'host-state';

      if (clientState === 'LISTEN') clientStateEl.classList.add('state-listen');
      if (clientState === 'SYN_SENT') clientStateEl.classList.add('state-syn');
      if (clientState === 'ESTABLISHED') clientStateEl.classList.add('state-estab');
      if (clientState.includes('FIN') || clientState === 'TIME_WAIT') clientStateEl.classList.add('state-fin');
      if (clientState === 'CLOSED') clientStateEl.classList.add('state-closed');

      if (serverState === 'LISTEN') serverStateEl.classList.add('state-listen');
      if (serverState === 'SYN_RCVD') serverStateEl.classList.add('state-syn');
      if (serverState === 'ESTABLISHED') serverStateEl.classList.add('state-estab');
      if (serverState.includes('CLOSE') || serverState === 'LAST_ACK') serverStateEl.classList.add('state-fin');
      if (serverState === 'CLOSED') serverStateEl.classList.add('state-closed');
    }

    function addLog(dir, flags, seq, ack, len, note) {
      if (!logWrapEl) return;
      const now = new Date();
      const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}`;

      const entry = document.createElement('div');
      entry.className = 'sim-log-entry';

      const dirClass = dir === 'C -> S' ? 'c2s' : 's2c';
      entry.innerHTML = `
        <span class="log-time">${timeStr}</span>
        <span class="log-dir ${dirClass}">${dir}</span>
        <span class="log-flags">[${flags}]</span>
        <span>Seq=${seq}</span>
        <span>Ack=${ack}</span>
        <span>Len=${len}</span>
        <span style="color: var(--text-primary); margin-left: auto;">${note}</span>
      `;
      logWrapEl.prepend(entry);
    }

    // Animace odeslání paketu v kanálu
    function animatePacket(dir, text, isDrop = false) {
      return new Promise(resolve => {
        if (!bubbleEl) return resolve();

        bubbleEl.className = 'sim-packet-bubble ' + (dir === 'c2s' ? 'dir-right' : 'dir-left');
        bubbleEl.textContent = text;
        bubbleEl.style.opacity = '1';

        const startX = dir === 'c2s' ? '20px' : 'calc(100% - 160px)';
        const endX = isDrop ? '50%' : (dir === 'c2s' ? 'calc(100% - 160px)' : '20px');

        bubbleEl.style.left = startX;

        requestAnimationFrame(() => {
          setTimeout(() => {
            bubbleEl.style.left = endX;

            if (isDrop) {
              setTimeout(() => {
                bubbleEl.classList.add('dropped');
                bubbleEl.textContent = 'DROPPED! (ZTRACEN)';
                setTimeout(() => {
                  bubbleEl.style.opacity = '0';
                  resolve();
                }, 700);
              }, 450);
            } else {
              setTimeout(() => {
                bubbleEl.style.opacity = '0';
                resolve();
              }, 800);
            }
          }, 30);
        });
      });
    }

    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 1. SCÉNÁŘ: Three-Way Handshake
    async function runHandshake() {
      if (isBusy) return;
      isBusy = true;
      statusNoteEl.textContent = 'Navazuji spojení Three-Way Handshake...';
      updateStates('CLOSED', 'LISTEN');
      await delay(400);

      // Krok 1: Klient posílá SYN
      updateStates('SYN_SENT', 'LISTEN');
      clientSeq = 1000;
      addLog('C -> S', 'SYN', clientSeq, 0, 0, 'Požadavek na spojení (ISN_C=1000)');
      await animatePacket('c2s', `SYN (Seq=${clientSeq})`);

      // Krok 2: Server odpovídá SYN + ACK
      updateStates('SYN_SENT', 'SYN_RCVD');
      serverSeq = 5000;
      const ackToClient = clientSeq + 1;
      addLog('S -> C', 'SYN, ACK', serverSeq, ackToClient, 0, 'Potvrzení + server ISN_S=5000');
      await animatePacket('s2c', `SYN, ACK (Seq=${serverSeq}, Ack=${ackToClient})`);

      // Krok 3: Klient posílá ACK
      clientSeq = ackToClient;
      const ackToServer = serverSeq + 1;
      updateStates('ESTABLISHED', 'SYN_RCVD');
      addLog('C -> S', 'ACK', clientSeq, ackToServer, 0, 'Klient potvrzuje SYN serveru');
      await animatePacket('c2s', `ACK (Seq=${clientSeq}, Ack=${ackToServer})`);

      updateStates('ESTABLISHED', 'ESTABLISHED');
      serverSeq = ackToServer;
      statusNoteEl.innerHTML = '<strong style="color:#34d399;">Spojení navázáno (ESTABLISHED)!</strong> Obě strany jsou synchronizovány a připraveny přenášet data.';
      isBusy = false;
    }

    // 2. SCÉNÁŘ: Přenos dat a potvrzování (Sliding Window & ACK)
    async function runDataTransfer() {
      if (isBusy) return;
      if (clientState !== 'ESTABLISHED') {
        statusNoteEl.innerHTML = '<span style="color:#fbbf24;">Nejprve musíte navázat spojení (tlačítko 1. Three-Way Handshake).</span>';
        return;
      }
      isBusy = true;
      statusNoteEl.textContent = 'Přenáším data s kumulativním potvrzováním (Sliding Window)...';

      // Segment 1 (1460 B)
      const seg1Seq = clientSeq;
      addLog('C -> S', 'ACK, PSH', seg1Seq, serverSeq, 1460, 'Datový segment #1 (1 460 B)');
      await animatePacket('c2s', `DATA #1 (Seq=${seg1Seq}, Len=1460)`);

      // Segment 2 (1460 B)
      const seg2Seq = seg1Seq + 1460;
      addLog('C -> S', 'ACK, PSH', seg2Seq, serverSeq, 1460, 'Datový segment #2 (1 460 B)');
      await animatePacket('c2s', `DATA #2 (Seq=${seg2Seq}, Len=1460)`);

      // Server posílá kumulativní ACK pro oba segmenty
      clientSeq = seg2Seq + 1460;
      addLog('S -> C', 'ACK', serverSeq, clientSeq, 0, `Kumulativní potvrzení: přijato 2 920 B, čekám bajt ${clientSeq}`);
      await animatePacket('s2c', `ACK (Ack=${clientSeq}, Win=64240)`);

      statusNoteEl.innerHTML = `<strong style="color:#60a5fa;">Data úspěšně přenesena!</strong> Server potvrdil oba segmenty jedním kumulativním ACK=${clientSeq}.`;
      isBusy = false;
    }

    // 3. SCÉNÁŘ: Přeházení paketů (Reordering & Assembly)
    async function runReorder() {
      if (isBusy) return;
      if (clientState !== 'ESTABLISHED') {
        statusNoteEl.innerHTML = '<span style="color:#fbbf24;">Nejprve musíte navázat spojení (tlačítko 1. Three-Way Handshake).</span>';
        return;
      }
      isBusy = true;
      statusNoteEl.textContent = 'Simulace: Síť doručí segmenty v přeházeném pořadí (#1 -> #3 -> #2)...';

      const s1 = clientSeq;
      const s2 = s1 + 1000;
      const s3 = s2 + 1000;

      // Paket 1 dorazí v pořádku
      addLog('C -> S', 'ACK', s1, serverSeq, 1000, 'Segment #1 dorazil v pořádku');
      await animatePacket('c2s', `SEG #1 (Seq=${s1})`);

      // Paket 3 dorazí DŘÍVE než Paket 2!
      addLog('C -> S', 'ACK', s3, serverSeq, 1000, 'Segment #3 dorazil dříve než #2 (Zpoždění trasy!)');
      await animatePacket('c2s', `SEG #3 (Seq=${s3})`);

      // Server zjistil mezeru v Seq Numbers: pošle duplicitní ACK na konec paketu 1
      addLog('S -> C', 'ACK (DUP)', serverSeq, s2, 0, `Server detekoval díru! Bufferuje #3 a žádá znovu Ack=${s2}`);
      await animatePacket('s2c', `ACK (Ack=${s2}) - Čekám na chybějící #2!`);

      // Konečně dorazí opožděný Segment 2
      addLog('C -> S', 'ACK', s2, serverSeq, 1000, 'Opožděný Segment #2 dorazil');
      await animatePacket('c2s', `SEG #2 (Seq=${s2})`);

      // Server poskládá vše dohromady a potvrdí celý blok až po konec paketu 3!
      clientSeq = s3 + 1000;
      addLog('S -> C', 'ACK', serverSeq, clientSeq, 0, `TCP buffer seřadil všechny bajty! Potvrzeno až do ${clientSeq}`);
      await animatePacket('s2c', `ACK (Ack=${clientSeq}) - Vše seřazeno!`);

      statusNoteEl.innerHTML = '<strong style="color:#c084fc;">Úspěch!</strong> Přijímač uložil přeházený paket do vyrovnávací paměti a po příchodu chybějícího segmentu data korektně seřadil podle Sequence Number.';
      isBusy = false;
    }

    // 4. SCÉNÁŘ: Ztráta paketu a retransmise (Loss & Retransmit)
    async function runLoss() {
      if (isBusy) return;
      if (clientState !== 'ESTABLISHED') {
        statusNoteEl.innerHTML = '<span style="color:#fbbf24;">Nejprve musíte navázat spojení (tlačítko 1. Three-Way Handshake).</span>';
        return;
      }
      isBusy = true;
      statusNoteEl.textContent = 'Simulace: Ztráta paketu na lince a následná oprava retransmisí...';

      const sLoss = clientSeq;
      // Paket se ztratí v kanálu
      addLog('C -> S', 'ACK', sLoss, serverSeq, 1460, 'Segment odeslán, ale linka jej zahodila!');
      await animatePacket('c2s', `SEG (Seq=${sLoss})`, true); // isDrop = true

      // Timeout vypršel (RTO) nebo Fast Retransmit
      await delay(500);
      addLog('C -> Klient', 'TIMEOUT', 0, 0, 0, 'Vypršel časovač Retransmission Timeout (RTO)!');
      statusNoteEl.textContent = 'Časovač RTO vypršel! Odesílatel automaticky provádí retransmisi ztraceného segmentu...';
      await delay(500);

      // Retransmise
      addLog('C -> S', 'RETRANS', sLoss, serverSeq, 1460, 'Opakované odeslání (Retransmission)');
      await animatePacket('c2s', `RETRANSMIT (Seq=${sLoss})`);

      // Server nyní přijímá a potvrzuje
      clientSeq = sLoss + 1460;
      addLog('S -> C', 'ACK', serverSeq, clientSeq, 0, 'Server úspěšně přijal retransmitovaný segment');
      await animatePacket('s2c', `ACK (Ack=${clientSeq})`);

      statusNoteEl.innerHTML = '<strong style="color:#10b981;">Ztráta úspěšně vyřešena!</strong> TCP detekovalo výpadek a bez zásahu aplikace paket znovu doručilo.';
      isBusy = false;
    }

    // 5. SCÉNÁŘ: Ukončení komunikace (Four-Way Handshake & TIME_WAIT)
    async function runClose() {
      if (isBusy) return;
      if (clientState !== 'ESTABLISHED') {
        statusNoteEl.innerHTML = '<span style="color:#fbbf24;">Spojení není aktivní. Nejprve navážte handshake.</span>';
        return;
      }
      isBusy = true;
      statusNoteEl.textContent = 'Korektní ukončení komunikace (Four-Way Termination)...';

      // Krok 1: Klient posílá FIN
      updateStates('FIN_WAIT_1', 'ESTABLISHED');
      addLog('C -> S', 'FIN, ACK', clientSeq, serverSeq, 0, 'Klient žádá o ukončení přenosu (FIN)');
      await animatePacket('c2s', `FIN, ACK (Seq=${clientSeq})`);

      // Krok 2: Server odpovídá ACK
      clientSeq++;
      updateStates('FIN_WAIT_2', 'CLOSE_WAIT');
      addLog('S -> C', 'ACK', serverSeq, clientSeq, 0, 'Server potvrzuje FIN klienta (přechod do CLOSE_WAIT)');
      await animatePacket('s2c', `ACK (Ack=${clientSeq})`);

      // Krok 3: Server posílá vlastní FIN
      await delay(400);
      updateStates('FIN_WAIT_2', 'LAST_ACK');
      addLog('S -> C', 'FIN, ACK', serverSeq, clientSeq, 0, 'Server doposlal zbylá data a posílá svůj FIN');
      await animatePacket('s2c', `FIN, ACK (Seq=${serverSeq})`);

      // Krok 4: Klient odpovídá ACK a vstupuje do TIME_WAIT
      serverSeq++;
      updateStates('TIME_WAIT', 'CLOSED');
      addLog('C -> S', 'ACK', clientSeq, serverSeq, 0, 'Klient potvrzuje FIN serveru & vstupuje do TIME_WAIT (2 MSL)');
      await animatePacket('c2s', `ACK (Ack=${serverSeq})`);

      statusNoteEl.innerHTML = '<strong style="color:#c084fc;">Spojení korektně ukončeno!</strong> Klient zůstává ve stavu <code>TIME_WAIT</code> (2&times;MSL), aby ochránil budoucí spojení před zbloudilými pakety.';
      await delay(1200);
      updateStates('CLOSED', 'CLOSED');
      isBusy = false;
    }

    // 6. SCÉNÁŘ: Reset (RST)
    async function runReset() {
      if (isBusy) return;
      isBusy = true;
      statusNoteEl.textContent = 'Násilný Reset spojení (příznak RST)...';

      addLog('C -> S', 'RST', clientSeq, 0, 0, 'Násilné okamžité zrušení spojení příznakem RST');
      await animatePacket('c2s', `RST (Reset)`);

      updateStates('CLOSED', 'CLOSED');
      statusNoteEl.innerHTML = '<strong style="color:#ef4444;">Spojení okamžitě zrušeno (RST)!</strong> Žádné čekání ani potvrzování ACK, obě strany ihned uvolnily paměť.';
      isBusy = false;
    }

    // Navázání tlačítek
    if (btnHandshake) btnHandshake.addEventListener('click', runHandshake);
    if (btnData) btnData.addEventListener('click', runDataTransfer);
    if (btnReorder) btnReorder.addEventListener('click', runReorder);
    if (btnLoss) btnLoss.addEventListener('click', runLoss);
    if (btnClose) btnClose.addEventListener('click', runClose);
    if (btnReset) btnReset.addEventListener('click', runReset);

    // Výchozí stav
    updateStates('CLOSED', 'LISTEN');
  }

  // Spuštění po načtení DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHeaderInspectors();
      initTcpSimulator();
    });
  } else {
    initHeaderInspectors();
    initTcpSimulator();
  }

})();
