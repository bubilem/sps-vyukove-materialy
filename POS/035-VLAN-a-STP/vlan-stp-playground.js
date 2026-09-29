/**
 * Interaktivní engine pro Téma 035: VLAN, Trunking a STP
 * SPŠ Výukové materiály • Předmět POS
 */

document.addEventListener('DOMContentLoaded', () => {
  initVlanTagInspector();
  initStpTopologySimulator();
});

/* ==========================================================================
   1. Interaktivní 802.1Q Tag Inspector
   ========================================================================== */
function initVlanTagInspector() {
  const vidInput = document.getElementById('tagVidInput');
  const pcpSelect = document.getElementById('tagPcpSelect');
  const deiCheck = document.getElementById('tagDeiCheck');

  const pcpValEl = document.getElementById('tagPcpVal');
  const deiValEl = document.getElementById('tagDeiVal');
  const vidValEl = document.getElementById('tagVidVal');
  const hexPreviewEl = document.getElementById('tagHexPreview');

  if (!vidInput || !pcpSelect) return;

  function updateTag() {
    let vid = parseInt(vidInput.value, 10);
    if (isNaN(vid) || vid < 1) vid = 1;
    if (vid > 4094) vid = 4094;

    const pcp = parseInt(pcpSelect.value, 10);
    const dei = deiCheck && deiCheck.checked ? 1 : 0;

    // Zobrazení hodnot
    pcpValEl.textContent = `${pcp} (bin: ${pcp.toString(2).padStart(3, '0')})`;
    if (deiValEl) deiValEl.textContent = `${dei}`;
    vidValEl.textContent = `${vid} (bin: ${vid.toString(2).padStart(12, '0')})`;

    // Složení TCI (Tag Control Information) 16 bitů: PCP (3b) + DEI (1b) + VID (12b)
    const tci = (pcp << 13) | (dei << 12) | vid;
    const tciHex = tci.toString(16).toUpperCase().padStart(4, '0');

    if (hexPreviewEl) {
      hexPreviewEl.textContent = `0x8100 ${tciHex.slice(0, 2)} ${tciHex.slice(2, 4)}`;
    }
  }

  vidInput.addEventListener('input', updateTag);
  pcpSelect.addEventListener('change', updateTag);
  if (deiCheck) deiCheck.addEventListener('change', updateTag);

  updateTag();
}

/* ==========================================================================
   2. Interaktivní simulátor STP topologie (Trojúhelník 3 switchů)
   ========================================================================== */
function initStpTopologySimulator() {
  const canvas = document.getElementById('stpCanvas');
  const btnToggleLink = document.getElementById('btnStpToggleLink');
  const btnResetStp = document.getElementById('btnStpReset');
  const logEl = document.getElementById('stpLog');

  if (!canvas || !btnToggleLink) return;

  const ctx = canvas.getContext('2d');
  let linkFailed = false;

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight || 260;
    drawTopology();
  }

  window.addEventListener('resize', resizeCanvas);

  function log(msg) {
    if (logEl) logEl.innerHTML = msg;
  }

  function drawTopology() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Pozice tří switchů
    const sw1 = { x: w * 0.5, y: 55, name: 'SW 1 (ROOT BRIDGE)', prio: 4096, isRoot: true };
    const sw2 = { x: w * 0.22, y: h - 55, name: 'SW 2', prio: 32768, isRoot: false };
    const sw3 = { x: w * 0.78, y: h - 55, name: 'SW 3', prio: 32768, isRoot: false };

    // Vykreslení spojů (Trunk linek)
    // 1. Linka SW1 <-> SW2
    if (!linkFailed) {
      drawLink(sw1.x, sw1.y, sw2.x, sw2.y, '#10b981', 'FORWARDING (Root Port)');
    } else {
      drawLink(sw1.x, sw1.y, sw2.x, sw2.y, '#f43f5e', 'VÝPADEK LINKY!', true);
    }

    // 2. Linka SW1 <-> SW3
    drawLink(sw1.x, sw1.y, sw3.x, sw3.y, '#10b981', 'FORWARDING (Root Port)');

    // 3. Linka SW2 <-> SW3 (Záložní trasa)
    if (!linkFailed) {
      // Normální stav: zablokováno STP pro zamezení smyčce
      drawLink(sw2.x, sw2.y, sw3.x, sw3.y, '#f59e0b', 'BLOCKED (Alternate Port)', false, true);
    } else {
      // Havarijní stav: STP odblokovalo záložní trasu!
      drawLink(sw2.x, sw2.y, sw3.x, sw3.y, '#10b981', 'ODBLOKOVÁNO! (Forwarding)');
    }

    // Vykreslení uzlů switchů
    drawSwitchNode(sw1);
    drawSwitchNode(sw2);
    drawSwitchNode(sw3);
  }

  function drawLink(x1, y1, x2, y2, color, label, isBroken = false, isBlocked = false) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    if (isBroken || isBlocked) {
      ctx.setLineDash([8, 6]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Středový štítek
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(midX - 70, midY - 11, 140, 22, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, midX, midY + 4);
  }

  function drawSwitchNode(sw) {
    ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
    ctx.strokeStyle = sw.isRoot ? '#eab308' : '#475569';
    ctx.lineWidth = sw.isRoot ? 3 : 2;

    ctx.beginPath();
    ctx.roundRect(sw.x - 70, sw.y - 24, 140, 48, 8);
    ctx.fill();
    ctx.stroke();

    if (sw.isRoot) {
      // Zlatá korunka pro Root Bridge
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ ROOT BRIDGE ★', sw.x, sw.y - 10);
    }

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sw.name, sw.x, sw.y + (sw.isRoot ? 6 : 0));

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px ui-monospace, monospace';
    ctx.fillText(`Prio: ${sw.prio}`, sw.x, sw.y + (sw.isRoot ? 17 : 14));
  }

  btnToggleLink.addEventListener('click', () => {
    linkFailed = !linkFailed;
    if (linkFailed) {
      btnToggleLink.textContent = 'Obnovit hlavní linku SW1 <-> SW2';
      btnToggleLink.classList.add('btn-collide');
      log('<strong style="color: #f43f5e;">VÝPADEK HLAVNÍ TRASY (SW1 &harr; SW2):</strong> STP detekovalo ztrátu BPDU rámců. Záložní port na SW3 byl <strong>okamžitě odblokován (Forwarding)</strong>. Provoz pokračuje bez přerušení po záložní trase SW2 &rarr; SW3 &rarr; SW1!');
    } else {
      btnToggleLink.textContent = 'Přerušit linku SW1 <-> SW2 (Simulovat havárii)';
      btnToggleLink.classList.remove('btn-collide');
      log('<strong>Linka obnovena:</strong> STP opět zablokovalo port na SW3, aby nevznikla nekonečná broadcastová smyčka.');
    }
    drawTopology();
  });

  if (btnResetStp) {
    btnResetStp.addEventListener('click', () => {
      linkFailed = false;
      btnToggleLink.textContent = 'Přerušit linku SW1 <-> SW2 (Simulovat havárii)';
      btnToggleLink.classList.remove('btn-collide');
      log('Topologie v normálním stavu: SW 1 je Root Bridge, záložní port na lince SW2 &harr; SW3 je blokován.');
      drawTopology();
    });
  }

  resizeCanvas();
}
