/**
 * Téma 071: Reprezentace grafu v programování
 * Interaktivní simulátor: Matice sousednosti, SVG graf a Python kód
 */

(function () {
  'use strict';

  const N = 4;
  // Výchozí modelový graf
  // 0 -> 1 (5), 0 -> 2 (3), 1 -> 2 (2), 2 -> 3 (7), 3 -> 0 (1)
  const defaultMatrix = [
    [0, 5, 3, 0],
    [0, 0, 2, 0],
    [0, 0, 0, 7],
    [1, 0, 0, 0]
  ];

  let matrix = JSON.parse(JSON.stringify(defaultMatrix));

  // Souřadnice 4 uzlů v SVG (šířka 360, výška 220)
  // Uspořádání do diamantového/obdélníkového schématu pro maximální přehlednost:
  // Uzel 0: vlevo nahoře (65, 55)
  // Uzel 1: vpravo nahoře (295, 55)
  // Uzel 2: vpravo dole (295, 165)
  // Uzel 3: vlevo dole (65, 165)
  const nodePositions = [
    { x: 70, y: 60, label: '0' },
    { x: 290, y: 60, label: '1' },
    { x: 290, y: 160, label: '2' },
    { x: 70, y: 160, label: '3' }
  ];

  function init() {
    renderMatrixTable();
    renderSvgGraph();
    renderPythonCode();
    setupEventListeners();
    logConsole("Inicializován graf: 4 uzly (0, 1, 2, 3).\nKliknutím na buňku matice můžete změnit nebo přidat hranu!");
  }

  // Vykreslení interaktivní matice 4x4
  function renderMatrixTable() {
    const container = document.getElementById('playgroundMatrixContainer');
    if (!container) return;

    let html = '<table class="matrix-editor-table"><thead><tr><th>u \\ v</th>';
    for (let c = 0; c < N; c++) {
      html += `<th>${c}</th>`;
    }
    html += '</tr></thead><tbody>';

    for (let r = 0; r < N; r++) {
      html += `<tr><th>${r}</th>`;
      for (let c = 0; c < N; c++) {
        const val = matrix[r][c];
        const hasEdge = val > 0;
        const cls = hasEdge ? 'matrix-cell-btn has-edge' : 'matrix-cell-btn';
        html += `<td>
          <button type="button" class="${cls}" data-row="${r}" data-col="${c}" title="Hrana ${r} -> ${c} (Váha: ${val})">
            ${val}
          </button>
        </td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;

    // Kliknutí na buňku
    container.querySelectorAll('.matrix-cell-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const r = parseInt(this.getAttribute('data-row'), 10);
        const c = parseInt(this.getAttribute('data-col'), 10);
        toggleOrCycleEdge(r, c);
      });
    });
  }

  // Změna hrany: 0 -> 1 -> 3 -> 5 -> 7 -> 0
  function toggleOrCycleEdge(u, v) {
    const current = matrix[u][v];
    let nextVal = 0;
    if (current === 0) nextVal = 1;
    else if (current === 1) nextVal = 3;
    else if (current === 3) nextVal = 5;
    else if (current === 5) nextVal = 7;
    else nextVal = 0;

    matrix[u][v] = nextVal;
    renderMatrixTable();
    renderSvgGraph();
    renderPythonCode();

    if (nextVal > 0) {
      logConsole(`g.add_edge(${u}, ${v}, weight=${nextVal}) -> Hrana ${u} -> ${v} nastavena.`);
    } else {
      logConsole(`g.remove_edge(${u}, ${v}) -> Hrana ${u} -> ${v} smazána (hodnota 0).`);
    }
  }

  // Vykreslení SVG grafu
  function renderSvgGraph() {
    const svg = document.getElementById('playgroundSvg');
    if (!svg) return;

    let svgHtml = '';

    // Šipky (marker-end) pro orientované hrany
    svgHtml += `
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8"></path>
        </marker>
        <marker id="arrow-emerald" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#10b981"></path>
        </marker>
      </defs>
    `;

    // Vykreslení hran
    for (let u = 0; u < N; u++) {
      for (let v = 0; v < N; v++) {
        const w = matrix[u][v];
        if (w > 0) {
          svgHtml += renderEdgeSvg(u, v, w);
        }
      }
    }

    // Vykreslení uzlů
    for (let i = 0; i < N; i++) {
      const pos = nodePositions[i];
      svgHtml += `
        <g class="node-group" data-node="${i}">
          <circle cx="${pos.x}" cy="${pos.y}" r="18" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" class="node-circle"></circle>
          <text x="${pos.x}" y="${pos.y + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#ffffff" pointer-events="none">${pos.label}</text>
        </g>
      `;
    }

    svg.innerHTML = svgHtml;
  }

  function renderEdgeSvg(u, v, weight) {
    const p1 = nodePositions[u];
    const p2 = nodePositions[v];

    // Smyčka (u -> u)
    if (u === v) {
      const loopX = p1.x + (u === 1 || u === 2 ? 18 : -18);
      const loopY = p1.y - 22;
      return `
        <path d="M ${p1.x} ${p1.y - 14} C ${loopX} ${loopY - 20}, ${loopX + 15} ${loopY}, ${p1.x + 10} ${p1.y - 12}" 
              fill="none" stroke="#10b981" stroke-width="2" marker-end="url(#arrow-emerald)"></path>
        <rect x="${loopX - 8}" y="${loopY - 14}" width="16" height="13" rx="3" fill="#020617" stroke="#10b981" stroke-width="1"></rect>
        <text x="${loopX}" y="${loopY - 4}" text-anchor="middle" font-size="9" font-weight="800" fill="#34d399">${weight}</text>
      `;
    }

    // Pokud existuje protisměrná hrana (v -> u), prohneme cestu (quadratic curve), aby se nepřekrývaly
    const hasReverse = matrix[v][u] > 0;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let pathD = '';
    let textX = (p1.x + p2.x) / 2;
    let textY = (p1.y + p2.y) / 2;

    if (hasReverse) {
      // Posun kontrolního bodu kolmo
      const nx = -dy / dist;
      const ny = dx / dist;
      const offset = 22;
      const cx = (p1.x + p2.x) / 2 + nx * offset;
      const cy = (p1.y + p2.y) / 2 + ny * offset;
      pathD = `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`;
      textX = cx;
      textY = cy;
    } else {
      // Rovná čára
      pathD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
      // Jemné odsazení textu od čáry
      const nx = -dy / dist;
      const ny = dx / dist;
      textX += nx * 10;
      textY += ny * 10;
    }

    return `
      <path d="${pathD}" fill="none" stroke="#38bdf8" stroke-width="2.2" marker-end="url(#arrow)" class="edge-path"></path>
      <rect x="${textX - 10}" y="${textY - 8}" width="20" height="15" rx="3" fill="#090d16" stroke="#38bdf8" stroke-width="1.2"></rect>
      <text x="${textX}" y="${textY + 3.5}" text-anchor="middle" font-size="10" font-weight="800" fill="#f8fafc" class="edge-weight-badge">${weight}</text>
    `;
  }

  // Zobrazení živého kódu Pythonu
  function renderPythonCode() {
    const codeEl = document.getElementById('playgroundPythonPreview');
    if (!codeEl) return;

    let edgesCode = '';
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (matrix[r][c] > 0) {
          edgesCode += `g.<span class="py-fn">add_edge</span>(${r}, ${c}, weight=<span class="py-num">${matrix[r][c]}</span>)\n`;
        }
      }
    }

    if (!edgesCode) {
      edgesCode = `<span class="py-cmt"># Žádné aktivní hrany (graf je prázdný)</span>\n`;
    }

    codeEl.innerHTML = `g = <span class="py-fn">Graph</span>(<span class="py-num">4</span>)\n${edgesCode}\ng.<span class="py-fn">print_matrix</span>()`;
  }

  // Logovací okno
  function logConsole(msg) {
    const logBox = document.getElementById('playgroundConsoleLog');
    if (!logBox) return;
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.style.marginBottom = '6px';
    entry.innerHTML = `<span style="color:#64748b;">[${time}]</span> ${msg.replace(/\n/g, '<br>')}`;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
  }

  function setupEventListeners() {
    // Tlačítko Reset
    const btnReset = document.getElementById('btnPgReset');
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        matrix = [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ];
        renderMatrixTable();
        renderSvgGraph();
        renderPythonCode();
        logConsole("g.reset() -> Graf byl kompletně vyčištěn (všechny hrany = 0).");
      });
    }

    // Tlačítko Výchozí model
    const btnDefault = document.getElementById('btnPgDefault');
    if (btnDefault) {
      btnDefault.addEventListener('click', function () {
        matrix = JSON.parse(JSON.stringify(defaultMatrix));
        renderMatrixTable();
        renderSvgGraph();
        renderPythonCode();
        logConsole("Obnoven výchozí modelový graf: 0->1(5), 0->2(3), 1->2(2), 2->3(7), 3->0(1).");
      });
    }

    // Tlačítko Test sousedů
    const btnNeighbors = document.getElementById('btnPgNeighbors');
    if (btnNeighbors) {
      btnNeighbors.addEventListener('click', function () {
        const u = 0;
        const neighbors = [];
        for (let v = 0; v < N; v++) {
          if (matrix[u][v] > 0) {
            neighbors.push(`${v} (váha ${matrix[u][v]})`);
          }
        }
        const outDeg = neighbors.length;
        logConsole(`g.get_neighbors(0) -> [${neighbors.join(', ')}]\ng.out_degree(0) = ${outDeg}`);
      });
    }

    // Tlačítko Formátovaný výpis
    const btnPrint = document.getElementById('btnPgPrint');
    if (btnPrint) {
      btnPrint.addEventListener('click', function () {
        let txt = "g.print_matrix():\n    0  1  2  3\n  +------------\n";
        for (let r = 0; r < N; r++) {
          txt += `${r} | ${matrix[r].map(x => String(x).padStart(2, ' ')).join(' ')}\n`;
        }
        logConsole(txt.trim());
      });
    }
  }

  // Spuštění po načtení DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
