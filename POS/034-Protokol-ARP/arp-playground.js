/**
 * Interaktivní engine pro Téma 034: Protokol ARP
 * SPŠ Výukové materiály • Předmět POS
 */

document.addEventListener('DOMContentLoaded', () => {
  initArpSimulator();
  initArpPduInspector();
});

/* ==========================================================================
   1. Interaktivní simulátor ARP dialogu
   ========================================================================== */
function initArpSimulator() {
  const btnLocal = document.getElementById('btnArpLocal');
  const btnGateway = document.getElementById('btnArpGateway');
  const btnAttack = document.getElementById('btnArpAttack');
  const btnFlush = document.getElementById('btnArpFlush');
  const logEl = document.getElementById('arpSimLog');
  const cacheTbody = document.getElementById('arpCacheTbody');

  const nodePc1 = document.getElementById('nodePc1');
  const nodePc2 = document.getElementById('nodePc2');
  const nodePc3 = document.getElementById('nodePc3');
  const nodeRouter = document.getElementById('nodeRouter');

  if (!btnLocal || !cacheTbody) return;

  let pc1Cache = {}; // ip -> { mac, type: 'dynamic' }

  function log(msg) {
    if (logEl) logEl.innerHTML = msg;
  }

  function clearHighlights() {
    [nodePc1, nodePc2, nodePc3, nodeRouter].forEach(n => {
      if (n) n.className = 'arp-node-card';
    });
  }

  function renderCache() {
    cacheTbody.innerHTML = '';
    const entries = Object.entries(pc1Cache);
    if (entries.length === 0) {
      cacheTbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #64748b; padding: 0.75rem;">ARP Cache je prázdná (Žádný záznam v RAM)</td></tr>';
      return;
    }

    entries.forEach(([ip, data]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: #38bdf8;">${ip}</td>
        <td style="font-family: ui-monospace, monospace; color: ${data.spoofed ? '#f43f5e; font-weight: bold;' : '#10b981;'}">${data.mac}</td>
        <td style="color: ${data.spoofed ? '#fb7185;' : '#cbd5e1;'}">${data.type.toUpperCase()} ${data.spoofed ? '(OTRÁVENO!)' : ''}</td>
      `;
      cacheTbody.appendChild(tr);
    });
  }

  // Scénář 1: Komunikace v lokální síti LAN (PC 1 -> PC 2)
  btnLocal.addEventListener('click', () => {
    clearHighlights();
    nodePc1.classList.add('highlight-src');

    log('<strong>1. Kontrola v PC 1:</strong> Uživatel chce poslat data na 192.168.1.20. ARP Cache záznam nemá &rarr; sestavuje se <strong>ARP Request</strong>.');

    setTimeout(() => {
      // Broadcast na všechny
      nodePc2.classList.add('highlight-bcast');
      nodePc3.classList.add('highlight-bcast');
      nodeRouter.classList.add('highlight-bcast');

      log('<strong>2. ARP Request (L2 Broadcast FF:FF:FF:FF:FF:FF):</strong> „Kdo má IP 192.168.1.20? Odpovězte 192.168.1.10!“. Router i PC 3 dotaz zahazují.');

      setTimeout(() => {
        clearHighlights();
        nodePc1.classList.add('highlight-src');
        nodePc2.classList.add('highlight-dst');

        // Odpověď Unicast
        pc1Cache['192.168.1.20'] = { mac: '00:11:22:33:44:02', type: 'dynamic', spoofed: false };
        renderCache();

        log('<strong>3. ARP Reply (L2 Unicast):</strong> PC 2 odpovídá: „IP 192.168.1.20 mám já a moje MAC je <code>00:11:22:33:44:02</code>“. PC 1 úspěšně uložilo záznam do ARP Cache!');
      }, 1200);
    }, 800);
  });

  // Scénář 2: Komunikace mimo LAN na Internet (např. 8.8.8.8)
  btnGateway.addEventListener('click', () => {
    clearHighlights();
    nodePc1.classList.add('highlight-src');

    log('<strong>1. Vyhodnocení masky podsítě:</strong> Cíl 8.8.8.8 NENÍ v lokální síti 192.168.1.0/24! PC 1 proto <strong>NIKDY nehledá MAC adresu 8.8.8.8</strong>, ale hledá MAC adresu výchozí brány <strong>Default Gateway (192.168.1.1)</strong>!');

    setTimeout(() => {
      nodeRouter.classList.add('highlight-dst');
      pc1Cache['192.168.1.1'] = { mac: '00:11:22:33:44:FE', type: 'dynamic', spoofed: false };
      renderCache();

      log('<strong>2. ARP dialog s bránou:</strong> Směrovač odpoví svou MAC adresou <code>00:11:22:33:44:FE</code>. PC 1 nyní může zabalit IP paket pro 8.8.8.8 do ethernetového rámce určeného pro Router.');
    }, 1000);
  });

  // Scénář 3: Útok ARP Spoofing / Poisoning
  btnAttack.addEventListener('click', () => {
    clearHighlights();
    nodePc3.classList.add('highlight-attacker');
    nodePc1.classList.add('highlight-src');

    pc1Cache['192.168.1.1'] = { mac: '00:11:22:33:44:03', type: 'dynamic', spoofed: true };
    renderCache();

    log('<strong style="color: #f43f5e;">KYBERNETICKÝ ÚTOK (ARP POISONING):</strong> Útočník PC 3 vyslal falešnou nevyžádanou odpověď: „Brána 192.168.1.1 má moji MAC adresu <code>00:11:22:33:44:03</code>!“. PC 1 mu uvěřilo a přepsalo ARP Cache. Útočník nyní odposlouchává veškerý internetový provoz (Man-in-the-Middle)!');
  });

  // Reset
  btnFlush.addEventListener('click', () => {
    clearHighlights();
    pc1Cache = {};
    renderCache();
    log('Příkaz <code>arp -d *</code>: ARP Cache byla kompletně vyprázdněna.');
  });

  renderCache();
}

/* ==========================================================================
   2. Interaktivní ARP PDU Inspector
   ========================================================================== */
function initArpPduInspector() {
  const cells = document.querySelectorAll('.arp-pdu-cell');
  const titleEl = document.getElementById('arpPduTitle');
  const descEl = document.getElementById('arpPduDesc');

  if (!cells.length || !titleEl) return;

  const data = {
    hwtype: {
      title: 'Hardware Type (2 bajty)',
      desc: 'Určuje typ protokolu na linkové vrstvě L2. Pro běžný drátový Ethernet i Wi-Fi má toto pole vždy hodnotu 1.'
    },
    protype: {
      title: 'Protocol Type (2 bajty)',
      desc: 'Určuje typ protokolu vyšší vrstvy, pro který se adresa překládá. Pro protokol IPv4 má hodnotu 0x0800.'
    },
    hwsize: {
      title: 'Hardware Address Length (1 bajt)',
      desc: 'Délka fyzické MAC adresy v bajtech. Pro Ethernet má hodnotu 6 (48 bitů).'
    },
    prosize: {
      title: 'Protocol Address Length (1 bajt)',
      desc: 'Délka logické síťové adresy v bajtech. Pro IPv4 má hodnotu 4 (32 bitů).'
    },
    opcode: {
      title: 'Opcode / Kód operace (2 bajty)',
      desc: 'Určuje typ ARP zprávy: Hodnota 1 = ARP Request (Dotaz na adresu), Hodnota 2 = ARP Reply (Odpověď s adresou).'
    },
    sendermac: {
      title: 'Sender Hardware Address (6 bajtů)',
      desc: 'Fyzická MAC adresa zařízení, které tuto ARP zprávu odesílá (např. 00:11:22:33:44:01).'
    },
    senderip: {
      title: 'Sender Protocol Address (4 bajty)',
      desc: 'Logická IPv4 adresa odesílatele ARP zprávy (např. 192.168.1.10).'
    },
    targetmac: {
      title: 'Target Hardware Address (6 bajtů)',
      desc: 'V ARP Requestu je tato hodnota neznámá (vyplněna nulami 00:00:00:00:00:00). V ARP Reply obsahuje MAC adresu tazatele.'
    },
    targetip: {
      title: 'Target Protocol Address (4 bajty)',
      desc: 'Hledaná IPv4 adresa (např. 192.168.1.20) – zařízení s touto IP adresou musí na zprávu zareagovat a odpovědět.'
    }
  };

  cells.forEach(c => {
    c.addEventListener('click', () => {
      cells.forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      const k = c.dataset.field;
      if (data[k]) {
        titleEl.textContent = data[k].title;
        descEl.textContent = data[k].desc;
      }
    });
  });
}
