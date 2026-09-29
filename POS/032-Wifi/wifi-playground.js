/**
 * Interaktivní engine pro Téma 032: Wi-Fi a bezdrátové sítě (IEEE 802.11)
 * SPŠ Výukové materiály • Předmět POS
 */

document.addEventListener('DOMContentLoaded', () => {
  initSpectrumAnalyzer();
  initCsmacaSimulator();
  initWifiFrameInspector();
});

/* ==========================================================================
   1. Interaktivní spektrální analyzátor kanálů 2.4 GHz
   ========================================================================== */
function initSpectrumAnalyzer() {
  const canvas = document.getElementById('spectrumCanvas');
  const toggleBtns = document.querySelectorAll('.wifi-net-btn');
  const alertEl = document.getElementById('spectrumAlert');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight || 220;
    drawSpectrum();
  }

  window.addEventListener('resize', resizeCanvas);

  // Definice sítí
  const networks = {
    net1: { name: 'Domácí Wi-Fi (CH 1)', ch: 1, freq: 2412, color: '#3b82f6', active: true, width: 22 },
    net6: { name: 'Kancelář (CH 6)', ch: 6, freq: 2437, color: '#10b981', active: true, width: 22 },
    net11: { name: 'Sklad (CH 11)', ch: 11, freq: 2462, color: '#6366f1', active: true, width: 22 },
    net3: { name: 'Soused na CH 3 (Kolizní)', ch: 3, freq: 2422, color: '#f43f5e', active: false, width: 22 }
  };

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.net;
      if (networks[id]) {
        networks[id].active = !networks[id].active;
        btn.classList.toggle('active', networks[id].active && id !== 'net3');
        btn.classList.toggle('active-bad', networks[id].active && id === 'net3');
        drawSpectrum();
      }
    });
  });

  function drawSpectrum() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const fMin = 2400;
    const fMax = 2485;
    const fRange = fMax - fMin;

    function getX(f) {
      return ((f - fMin) / fRange) * (w - 80) + 40;
    }

    // Osa frekvence
    const baseLineY = h - 40;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, baseLineY);
    ctx.lineTo(w - 40, baseLineY);
    ctx.stroke();

    // Vykreslení kanálů 1 až 13
    ctx.fillStyle = '#64748b';
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'center';

    for (let c = 1; c <= 13; c++) {
      const f = 2412 + (c - 1) * 5;
      const x = getX(f);

      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, baseLineY);
      ctx.stroke();

      ctx.fillText(`CH ${c}`, x, baseLineY + 16);
      if (c === 1 || c === 6 || c === 11) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`${f} MHz`, x, baseLineY + 28);
        ctx.fillStyle = '#64748b';
      }
    }

    // Křivky aktivních Wi-Fi sítí (zvonová modulace OFDM / DSSS)
    let hasInterference = false;

    Object.values(networks).forEach(net => {
      if (!net.active) return;

      const centerX = getX(net.freq);
      const halfWidthPx = (net.width / 2 / fRange) * (w - 80);

      ctx.fillStyle = net.color + '26'; // 15% opacity
      ctx.strokeStyle = net.color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(centerX - halfWidthPx, baseLineY);
      // Bell curve
      ctx.bezierCurveTo(
        centerX - halfWidthPx * 0.5, 40,
        centerX + halfWidthPx * 0.5, 40,
        centerX + halfWidthPx, baseLineY
      );
      ctx.fill();
      ctx.stroke();

      // Popisek
      ctx.fillStyle = net.color;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText(net.name, centerX, 32);
    });

    // Kontrola kolize souseda na kanálu 3
    if (networks.net3.active && (networks.net1.active || networks.net6.active)) {
      hasInterference = true;
    }

    if (alertEl) {
      if (hasInterference) {
        alertEl.style.display = 'block';
        alertEl.innerHTML = `
          <strong style="color: #f43f5e;">KRITICKÉ RUŠENÍ (Adjacent-Channel Interference):</strong> 
          Soused na <strong>kanálu 3</strong> se zčásti překrývá s kanálem 1 i s kanálem 6! Dochází k poškozování rámců v éteru, častým retransmisím a dramatickému propadu rychlosti obou sítí.
        `;
      } else {
        alertEl.style.display = 'block';
        alertEl.innerHTML = `
          <strong style="color: #10b981;">OPTIMÁLNÍ ROZVRŽENÍ KANÁLŮ (OK):</strong> 
          Kanály <strong>1, 6 a 11</strong> se v pásmu 2.4 GHz při šířce 20 MHz navzájem vůbec nepřekrývají. Sítě mohou vysílat plnou rychlostí bez vzájemného rušení.
        `;
      }
    }
  }

  resizeCanvas();
}

/* ==========================================================================
   2. Interaktivní CSMA/CA a RTS/CTS Dialog
   ========================================================================== */
function initCsmacaSimulator() {
  const steps = document.querySelectorAll('.handshake-step');
  const btnNext = document.getElementById('btnNextCaStep');
  const btnReset = document.getElementById('btnResetCa');
  const statusEl = document.getElementById('caStatusText');

  if (!steps.length || !btnNext) return;

  let currentStep = 0;

  const messages = [
    '1. Stanice A čeká na volný éter po dobu DIFS + náhodný Backoff timer (Carrier Sense: ticho).',
    '2. Stanice A odešle rámec <strong>RTS (Request to Send)</strong> k AP. Udává čas potřebný pro data.',
    '3. Přístupový bod (AP) odpoví rámcem <strong>CTS (Clear to Send)</strong>. Všechny ostatní stanice slyší CTS a nastaví časovač NAV (utichnou).',
    '4. Stanice A má zaručeně čisté médium a odesílá svůj <strong>Datový rámec (DATA)</strong> bez rizika kolize.',
    '5. AP úspěšně přijalo data, ověřilo FCS a odesílá stanici A potvrzení <strong>ACK</strong> po době SIFS.'
  ];

  function updateUi() {
    steps.forEach((s, idx) => {
      s.classList.remove('current', 'passed');
      if (idx === currentStep) s.classList.add('current');
      else if (idx < currentStep) s.classList.add('passed');
    });

    if (statusEl) {
      statusEl.innerHTML = messages[currentStep];
    }
  }

  btnNext.addEventListener('click', () => {
    currentStep = (currentStep + 1) % steps.length;
    updateUi();
  });

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      currentStep = 0;
      updateUi();
    });
  }

  updateUi();
}

/* ==========================================================================
   3. Interaktivní 802.11 Frame (4 Adresy) Inspector
   ========================================================================== */
function initWifiFrameInspector() {
  const blocks = document.querySelectorAll('.frame-block, .wifi-frame-block');
  const titleEl = document.getElementById('wifiFrameTitle');
  const descEl = document.getElementById('wifiFrameDesc');
  const rawEl = document.getElementById('wifiFrameRaw');

  if (!blocks.length || !titleEl) return;

  const info = {
    fc: {
      title: 'Frame Control (2 bajty / 16 bitů)',
      desc: 'Klíčové řídicí pole každého Wi-Fi rámce. Definuje verzi protokolu, základní typ (Management, Control, Data), subtyp (Beacon, Probe, RTS, CTS, ACK) a směrové příznaky To DS / From DS určující význam jednotlivých adres.',
      raw: 'Struktura: Version(2b) | Type(2b) | Subtype(4b) | ToDS(1b) | FromDS(1b) | Retry(1b) | PwrMgmt(1b) | Protected(1b)'
    },
    dur: {
      title: 'Duration / ID (2 bajty / 16 bitů)',
      desc: 'Rezervace bezdrátového média pro dokončení celé transakce. Obsahuje čas v mikrosekundách, na který mají ostatní stanice v dosahu ztichnout (nastavují podle něj čítač NAV – Network Allocation Vector).',
      raw: 'Příklad: Duration = 320 µs (NAV timer chrání celý přenos dat i potvrzení ACK)'
    },
    addr1: {
      title: 'Address 1: Receiver Address – RA (6 bajtů)',
      desc: 'Fyzická MAC adresa bezprostředního příjemce rádiového signálu v éteru (kdo má stanovené rádio na příjem – typicky Access Point při odesílání ze stanice, nebo stanice při příjmu).',
      raw: 'Příklad: MAC přístupového bodu B8:27:EB:11:22:33 (nebo notebooku při downlinku)'
    },
    addr2: {
      title: 'Address 2: Transmitter Address – TA (6 bajtů)',
      desc: 'Fyzická MAC adresa vysílajícího rádia, které signál právě teď fyzicky vyslalo do vzduchu. Na tuto adresu se po době SIFS odesílá bezprostřední potvrzovací rámec ACK.',
      raw: 'Příklad: MAC odesílajícího notebooku AC:DE:48:AA:BB:CC'
    },
    addr3: {
      title: 'Address 3: Filtering / Destination MAC (6 bajtů)',
      desc: 'Adresa konečného příjemce v pevné drátové síti LAN (při uplink vysílání do sítě), nebo původního odesílatele (při downlinku z AP). Slouží switchi k přeposlání paketu.',
      raw: 'Příklad: MAC výchozí brány (Default Gateway routeru) nebo cílového serveru v LAN'
    },
    seq: {
      title: 'Sequence Control (2 bajty / 16 bitů)',
      desc: 'Číslování sekvence rámců pro správné seřazení a odhalení duplikátů. Skládá se ze 4bitového čísla fragmentu a 12bitového pořadového čísla rámce (0 až 4095).',
      raw: 'Fragment Number (4 bity) + Sequence Number (12 bitů: rozsah 0 – 4095)'
    },
    addr4: {
      title: 'Address 4: WDS Bridge Address (6 bajtů)',
      desc: 'Tato adresa se vyskytuje výhradně v bezdrátových mostech mezi dvěma AP (Wireless Distribution System – WDS bridge). Umožňuje přenést jak původního odesílatele, tak cílového příjemce přes bezdrátový spoj.',
      raw: 'Podmínka: Aktivní pouze při To DS = 1 AND From DS = 1 (AP-to-AP mesh/bridge)'
    },
    payload: {
      title: 'Data Payload / Frame Body (Až 2304 bajtů)',
      desc: 'Vlastní užitečný náklad přenášející síťový paket L3 (IPv4/IPv6 paket). Ve Wi-Fi může mít až 2304 bajtů (oproti 1500 B u standardního Ethernetu). Může obsahovat kryptografické záhlaví CCMP (WPA2) nebo GCMP (WPA3).',
      raw: 'Zapouzdřený IP paket (MTU až 2304 B) + volitelná šifrovací hlavička WPA2/WPA3'
    },
    fcs: {
      title: 'FCS – Frame Check Sequence (4 bajty / 32 bitů)',
      desc: 'Matematický kontrolní součet CRC-32 umístěný v zápatí rámce. V éteru je chybovost nesrovnatelně vyšší než na metalickém kabelu – pokud kontrolní součet nesouhlasí, rámec je zahozen a ACK se nevyšle.',
      raw: 'Algoritmus: CRC-32 (Stejný polynomiální vzorec jako v drátovém Ethernetu)'
    }
  };

  blocks.forEach(b => {
    b.addEventListener('click', () => {
      blocks.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const k = b.dataset.field;
      if (info[k]) {
        titleEl.textContent = info[k].title;
        descEl.textContent = info[k].desc;
        if (rawEl) {
          rawEl.textContent = info[k].raw;
        }
      }
    });
  });
}
