/**
 * Téma 070: Teorie grafů – Interaktivní grafové pískoviště a simulátor algoritmů
 * Předmět: PRG (Programování) • SPŠ
 * 
 * Funkce:
 * - HTML5 Canvas kreslení grafů (uzly, hrany, váhy)
 * - Nástroje: Výběr/přesun, Přidání uzlu, Přidání hrany, Mazání
 * - Presety: Dopravní/síťová topologie, Strom, Úplný graf K5
 * - Algoritmy s animací krok za krokem: BFS, DFS, Dijkstra, Kruskal MST
 * - 100% offline Vanilla JS, bez externích závislostí
 */

(function () {
  'use strict';

  let canvas, ctx;
  let nodes = [];
  let edges = [];
  let currentTool = 'select'; // 'select', 'add-node', 'add-edge', 'delete'
  let selectedNode = null;
  let edgeStartNode = null;
  let isDragging = false;
  let dragNode = null;
  let isAlgoRunning = false;
  let algoInterval = null;

  const NODE_RADIUS = 22;
  const COLORS = {
    defaultNode: '#1e293b',
    defaultBorder: '#a855f7',
    text: '#ffffff',
    selectedNode: '#ec4899',
    visitedNode: '#10b981',
    activeNode: '#06b6d4',
    pathNode: '#f59e0b',
    defaultEdge: 'rgba(255, 255, 255, 0.28)',
    activeEdge: '#06b6d4',
    pathEdge: '#f59e0b',
    mstEdge: '#10b981'
  };

  document.addEventListener('DOMContentLoaded', () => {
    initGraphPlayground();
  });

  function initGraphPlayground() {
    canvas = document.getElementById('graphCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Resize canvas
    window.addEventListener('resize', resizePlaygroundCanvas);
    window.addEventListener('hashchange', () => {
      setTimeout(resizePlaygroundCanvas, 100);
    });

    // Tool buttons
    const toolBtns = document.querySelectorAll('.tool-btn[data-tool]');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.getAttribute('data-tool');
        logMessage(`Nástroj aktivován: <strong>${btn.textContent.trim()}</strong>`);
        resetGraphVisuals();
      });
    });

    // Algorithm & Preset buttons
    const btnRunBFS = document.getElementById('btnRunBFS');
    const btnRunDFS = document.getElementById('btnRunDFS');
    const btnRunDijkstra = document.getElementById('btnRunDijkstra');
    const btnRunMST = document.getElementById('btnRunMST');
    const btnResetGraph = document.getElementById('btnResetGraph');
    const btnPreset = document.getElementById('btnPreset');

    if (btnRunBFS) btnRunBFS.addEventListener('click', () => runAlgorithm('bfs'));
    if (btnRunDFS) btnRunDFS.addEventListener('click', () => runAlgorithm('dfs'));
    if (btnRunDijkstra) btnRunDijkstra.addEventListener('click', () => runAlgorithm('dijkstra'));
    if (btnRunMST) btnRunMST.addEventListener('click', () => runAlgorithm('mst'));
    if (btnResetGraph) btnResetGraph.addEventListener('click', resetGraphVisuals);
    if (btnPreset) btnPreset.addEventListener('click', loadNextPreset);

    // Canvas Mouse Events
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);

    // Touch support for canvas
    canvas.addEventListener('touchstart', handleCanvasTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleCanvasTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleCanvasTouchEnd);

    // Initial load
    setTimeout(() => {
      resizePlaygroundCanvas();
      loadPresetNetwork();
    }, 100);
  }

  function resizePlaygroundCanvas() {
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const newW = Math.round(rect.width);
    const newH = Math.round(rect.height);
    if (newW > 0 && newH > 0 && (canvas.width !== newW || canvas.height !== newH)) {
      canvas.width = newW;
      canvas.height = newH;
      drawGraph();
    }
  }

  function logMessage(html) {
    const logEl = document.getElementById('algoLog');
    if (!logEl) return;
    const p = document.createElement('p');
    p.innerHTML = `> ${html}`;
    logEl.appendChild(p);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function clearLog() {
    const logEl = document.getElementById('algoLog');
    if (logEl) logEl.innerHTML = '';
  }

  // Presety
  let currentPresetIndex = 0;
  function loadNextPreset() {
    currentPresetIndex = (currentPresetIndex + 1) % 3;
    if (currentPresetIndex === 0) loadPresetNetwork();
    else if (currentPresetIndex === 1) loadPresetTree();
    else loadPresetComplete();
  }

  function loadPresetNetwork() {
    stopAlgorithm();
    clearLog();
    logMessage('Načtena ukázková <strong>Dopravní / Síťová topologie</strong>.');

    const w = canvas && canvas.width > 100 ? canvas.width : 600;
    const h = canvas && canvas.height > 100 ? canvas.height : 450;

    nodes = [
      { id: 'A', x: w * 0.15, y: h * 0.5, label: 'A', state: 'default', dist: 0 },
      { id: 'B', x: w * 0.35, y: h * 0.22, label: 'B', state: 'default', dist: Infinity },
      { id: 'C', x: w * 0.38, y: h * 0.78, label: 'C', state: 'default', dist: Infinity },
      { id: 'D', x: w * 0.65, y: h * 0.28, label: 'D', state: 'default', dist: Infinity },
      { id: 'E', x: w * 0.62, y: h * 0.72, label: 'E', state: 'default', dist: Infinity },
      { id: 'F', x: w * 0.88, y: h * 0.5, label: 'F', state: 'default', dist: Infinity }
    ];

    edges = [
      { u: 'A', v: 'B', weight: 4, state: 'default' },
      { u: 'A', v: 'C', weight: 2, state: 'default' },
      { u: 'B', v: 'C', weight: 1, state: 'default' },
      { u: 'B', v: 'D', weight: 5, state: 'default' },
      { u: 'C', v: 'E', weight: 8, state: 'default' },
      { u: 'C', v: 'D', weight: 10, state: 'default' },
      { u: 'D', v: 'E', weight: 2, state: 'default' },
      { u: 'D', v: 'F', weight: 6, state: 'default' },
      { u: 'E', v: 'F', weight: 3, state: 'default' }
    ];

    drawGraph();
  }

  function loadPresetTree() {
    stopAlgorithm();
    clearLog();
    logMessage('Načten ukázkový <strong>Strom (Acyklický souvislý graf)</strong>.');

    const w = canvas && canvas.width > 100 ? canvas.width : 600;
    const h = canvas && canvas.height > 100 ? canvas.height : 450;

    nodes = [
      { id: 'R', x: w * 0.5, y: h * 0.18, label: 'R', state: 'default', dist: 0 },
      { id: 'A', x: w * 0.28, y: h * 0.45, label: 'A', state: 'default', dist: Infinity },
      { id: 'B', x: w * 0.72, y: h * 0.45, label: 'B', state: 'default', dist: Infinity },
      { id: 'C', x: w * 0.16, y: h * 0.78, label: 'C', state: 'default', dist: Infinity },
      { id: 'D', x: w * 0.4, y: h * 0.78, label: 'D', state: 'default', dist: Infinity },
      { id: 'E', x: w * 0.62, y: h * 0.78, label: 'E', state: 'default', dist: Infinity },
      { id: 'F', x: w * 0.84, y: h * 0.78, label: 'F', state: 'default', dist: Infinity }
    ];

    edges = [
      { u: 'R', v: 'A', weight: 3, state: 'default' },
      { u: 'R', v: 'B', weight: 4, state: 'default' },
      { u: 'A', v: 'C', weight: 2, state: 'default' },
      { u: 'A', v: 'D', weight: 5, state: 'default' },
      { u: 'B', v: 'E', weight: 1, state: 'default' },
      { u: 'B', v: 'F', weight: 7, state: 'default' }
    ];

    drawGraph();
  }

  function loadPresetComplete() {
    stopAlgorithm();
    clearLog();
    logMessage('Načten <strong>Úplný graf K5</strong> (každý uzel spojen se všemi ostatními).');

    const w = canvas && canvas.width > 100 ? canvas.width : 600;
    const h = canvas && canvas.height > 100 ? canvas.height : 450;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const r = Math.min(w, h) * 0.35;

    nodes = [];
    edges = [];
    const names = ['1', '2', '3', '4', '5'];

    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      nodes.push({
        id: names[i],
        label: names[i],
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        state: 'default',
        dist: Infinity
      });
    }

    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        edges.push({
          u: names[i],
          v: names[j],
          weight: Math.floor(Math.random() * 8) + 2,
          state: 'default'
        });
      }
    }

    drawGraph();
  }

  function resetGraphVisuals() {
    stopAlgorithm();
    nodes.forEach(n => {
      n.state = 'default';
      n.dist = Infinity;
    });
    edges.forEach(e => {
      e.state = 'default';
    });
    drawGraph();
    logMessage('Vizuální stavy uzlů a hran vyresetovány.');
  }

  function stopAlgorithm() {
    if (algoInterval) {
      clearInterval(algoInterval);
      algoInterval = null;
    }
    isAlgoRunning = false;
  }

  function findNodeAt(x, y) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dist = Math.hypot(n.x - x, n.y - y);
      if (dist <= NODE_RADIUS + 6) {
        return n;
      }
    }
    return null;
  }

  function handleCanvasMouseDown(e) {
    if (isAlgoRunning) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    processPointerDown(x, y);
  }

  function handleCanvasMouseMove(e) {
    if (isDragging && dragNode) {
      const rect = canvas.getBoundingClientRect();
      dragNode.x = Math.max(NODE_RADIUS, Math.min(canvas.width - NODE_RADIUS, e.clientX - rect.left));
      dragNode.y = Math.max(NODE_RADIUS, Math.min(canvas.height - NODE_RADIUS, e.clientY - rect.top));
      drawGraph();
    }
  }

  function handleCanvasMouseUp() {
    isDragging = false;
    dragNode = null;
  }

  function handleCanvasTouchStart(e) {
    if (isAlgoRunning) return;
    if (e.touches.length === 1) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      processPointerDown(x, y);
    }
  }

  function handleCanvasTouchMove(e) {
    if (isDragging && dragNode && e.touches.length === 1) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      dragNode.x = Math.max(NODE_RADIUS, Math.min(canvas.width - NODE_RADIUS, e.touches[0].clientX - rect.left));
      dragNode.y = Math.max(NODE_RADIUS, Math.min(canvas.height - NODE_RADIUS, e.touches[0].clientY - rect.top));
      drawGraph();
    }
  }

  function handleCanvasTouchEnd() {
    isDragging = false;
    dragNode = null;
  }

  function processPointerDown(x, y) {
    const clickedNode = findNodeAt(x, y);

    if (currentTool === 'select') {
      if (clickedNode) {
        isDragging = true;
        dragNode = clickedNode;
        selectedNode = clickedNode;
      } else {
        selectedNode = null;
      }
    } else if (currentTool === 'add-node') {
      if (!clickedNode) {
        const nextChar = String.fromCharCode(65 + (nodes.length % 26)) + (nodes.length >= 26 ? Math.floor(nodes.length / 26) : '');
        const newNode = {
          id: nextChar,
          label: nextChar,
          x: Math.max(NODE_RADIUS, Math.min(canvas.width - NODE_RADIUS, x)),
          y: Math.max(NODE_RADIUS, Math.min(canvas.height - NODE_RADIUS, y)),
          state: 'default',
          dist: Infinity
        };
        nodes.push(newNode);
        logMessage(`Vytvořen uzel <strong>${nextChar}</strong>.`);
      }
    } else if (currentTool === 'add-edge') {
      if (clickedNode) {
        if (!edgeStartNode) {
          edgeStartNode = clickedNode;
          clickedNode.state = 'active';
          logMessage(`Začátek hrany z uzlu <strong>${clickedNode.label}</strong>. Klikněte na cílový uzel.`);
        } else if (edgeStartNode !== clickedNode) {
          const exists = edges.some(ed => 
            (ed.u === edgeStartNode.id && ed.v === clickedNode.id) ||
            (ed.u === clickedNode.id && ed.v === edgeStartNode.id)
          );
          if (!exists) {
            const weight = Math.floor(Math.random() * 9) + 1;
            edges.push({
              u: edgeStartNode.id,
              v: clickedNode.id,
              weight,
              state: 'default'
            });
            logMessage(`Vytvořena hrana <strong>${edgeStartNode.label} — ${clickedNode.label}</strong> (váha: ${weight}).`);
          }
          edgeStartNode.state = 'default';
          edgeStartNode = null;
        }
      } else {
        if (edgeStartNode) {
          edgeStartNode.state = 'default';
          edgeStartNode = null;
        }
      }
    } else if (currentTool === 'delete') {
      if (clickedNode) {
        nodes = nodes.filter(n => n.id !== clickedNode.id);
        edges = edges.filter(ed => ed.u !== clickedNode.id && ed.v !== clickedNode.id);
        logMessage(`Smazán uzel <strong>${clickedNode.label}</strong> a jeho incidentní hrany.`);
      }
    }

    drawGraph();
  }

  // Vykreslování
  function drawGraph() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Kreslení hran
    edges.forEach(edge => {
      const uNode = nodes.find(n => n.id === edge.u);
      const vNode = nodes.find(n => n.id === edge.v);
      if (!uNode || !vNode) return;

      ctx.beginPath();
      ctx.moveTo(uNode.x, uNode.y);
      ctx.lineTo(vNode.x, vNode.y);

      if (edge.state === 'path') {
        ctx.strokeStyle = COLORS.pathEdge;
        ctx.lineWidth = 4;
      } else if (edge.state === 'mst') {
        ctx.strokeStyle = COLORS.mstEdge;
        ctx.lineWidth = 4;
      } else if (edge.state === 'active') {
        ctx.strokeStyle = COLORS.activeEdge;
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = COLORS.defaultEdge;
        ctx.lineWidth = 2;
      }
      ctx.stroke();

      // Váha hrany
      const midX = (uNode.x + vNode.x) / 2;
      const midY = (uNode.y + vNode.y) / 2;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(midX - 10, midY - 10, 20, 20);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(midX - 10, midY - 10, 20, 20);

      ctx.font = '10px monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(edge.weight, midX, midY);
    });

    // Kreslení uzlů
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);

      let fillColor = COLORS.defaultNode;
      let borderColor = COLORS.defaultBorder;

      if (node.state === 'active') {
        fillColor = COLORS.activeNode;
        borderColor = '#ffffff';
      } else if (node.state === 'visited') {
        fillColor = COLORS.visitedNode;
        borderColor = '#34d399';
      } else if (node.state === 'path') {
        fillColor = COLORS.pathNode;
        borderColor = '#fde047';
      } else if (node === selectedNode) {
        fillColor = '#3b0764';
        borderColor = COLORS.selectedNode;
      }

      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = borderColor;
      ctx.stroke();

      // Popisek uzlu
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = COLORS.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      // Zobrazení vzdálenosti (dijkstra)
      if (node.dist !== undefined && node.dist !== Infinity && node.state !== 'default') {
        ctx.font = '10px monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`d=${node.dist}`, node.x, node.y + NODE_RADIUS + 12);
      }
    });
  }

  // Algoritmy
  function runAlgorithm(type) {
    if (nodes.length === 0) {
      logMessage('<span style="color:#ef4444">Graf je prázdný! Přidejte uzly nebo zvolte preset.</span>');
      return;
    }

    stopAlgorithm();
    resetGraphVisuals();
    clearLog();
    isAlgoRunning = true;

    const startNode = nodes[0];
    logMessage(`Spouštím algoritmus <strong>${type.toUpperCase()}</strong> ze startovního uzlu <strong>${startNode.label}</strong>.`);

    if (type === 'bfs') executeBFS(startNode);
    else if (type === 'dfs') executeDFS(startNode);
    else if (type === 'dijkstra') executeDijkstra(startNode, nodes[nodes.length - 1]);
    else if (type === 'mst') executeKruskalMST();
  }

  // 1. BFS
  function executeBFS(startNode) {
    const queue = [startNode];
    const visited = new Set([startNode.id]);
    const steps = [];

    steps.push({ type: 'activate', node: startNode, msg: `Vložení startovního uzlu <strong>${startNode.label}</strong> do FIFO fronty.` });

    while (queue.length > 0) {
      const curr = queue.shift();
      steps.push({ type: 'visit', node: curr, msg: `Odebrání uzlu <strong>${curr.label}</strong> z fronty – prozkoumávání sousedů.` });

      const neighbors = [];
      edges.forEach(e => {
        if (e.u === curr.id && !visited.has(e.v)) {
          const n = nodes.find(x => x.id === e.v);
          if (n) neighbors.push({ node: n, edge: e });
        } else if (e.v === curr.id && !visited.has(e.u)) {
          const n = nodes.find(x => x.id === e.u);
          if (n) neighbors.push({ node: n, edge: e });
        }
      });

      neighbors.forEach(({ node, edge }) => {
        visited.add(node.id);
        queue.push(node);
        steps.push({
          type: 'edge-step',
          edge,
          node,
          msg: `Objeven nový soused <strong>${node.label}</strong> přes hranu.`
        });
      });
    }

    steps.push({ type: 'finish', msg: 'BFS dokončeno! Prozkoumána celá komponenta grafu.' });
    playSteps(steps);
  }

  // 2. DFS
  function executeDFS(startNode) {
    const visited = new Set();
    const steps = [];

    function dfs(curr) {
      visited.add(curr.id);
      steps.push({ type: 'visit', node: curr, msg: `Vstup do uzlu <strong>${curr.label}</strong> (zanoření DFS do hloubky).` });

      const nbs = [];
      edges.forEach(e => {
        if (e.u === curr.id && !visited.has(e.v)) {
          nbs.push({ node: nodes.find(x => x.id === e.v), edge: e });
        } else if (e.v === curr.id && !visited.has(e.u)) {
          nbs.push({ node: nodes.find(x => x.id === e.u), edge: e });
        }
      });

      nbs.forEach(({ node, edge }) => {
        if (!visited.has(node.id)) {
          steps.push({ type: 'edge-step', edge, node, msg: `Postup po hraně do dosud nenavštíveného uzlu <strong>${node.label}</strong>.` });
          dfs(node);
          steps.push({ type: 'backtrack', node: curr, msg: `Backtracking (návrat) zpět do uzlu <strong>${curr.label}</strong>.` });
        }
      });
    }

    dfs(startNode);
    steps.push({ type: 'finish', msg: 'DFS dokončeno! Prozkoumán strom do hloubky.' });
    playSteps(steps);
  }

  // 3. Dijkstra
  function executeDijkstra(startNode, targetNode) {
    const dist = {};
    const prev = {};
    const unvisited = new Set();
    const steps = [];

    nodes.forEach(n => {
      dist[n.id] = Infinity;
      prev[n.id] = null;
      unvisited.add(n.id);
    });
    dist[startNode.id] = 0;

    steps.push({
      type: 'dijkstra-init',
      msg: `Inicializace: dist(${startNode.label}) = 0, ostatní uzly dist = ∞.`
    });

    while (unvisited.size > 0) {
      let minNodeId = null;
      let minDist = Infinity;
      unvisited.forEach(id => {
        if (dist[id] < minDist) {
          minDist = dist[id];
          minNodeId = id;
        }
      });

      if (minNodeId === null || minDist === Infinity) break;
      unvisited.delete(minNodeId);

      const curr = nodes.find(n => n.id === minNodeId);
      steps.push({
        type: 'dijkstra-curr',
        node: curr,
        dist: dist[minNodeId],
        msg: `Uzel <strong>${curr.label}</strong> s nejmenší známou vzdáleností (${dist[minNodeId]}) je trvale uzavřen.`
      });

      if (curr.id === targetNode.id) {
        steps.push({ type: 'info', msg: `Dosažen cílový uzel <strong>${targetNode.label}</strong>!` });
        break;
      }

      edges.forEach(e => {
        let neighborId = null;
        if (e.u === curr.id && unvisited.has(e.v)) neighborId = e.v;
        else if (e.v === curr.id && unvisited.has(e.u)) neighborId = e.u;

        if (neighborId) {
          const alt = dist[curr.id] + e.weight;
          const neighbor = nodes.find(n => n.id === neighborId);
          if (alt < dist[neighborId]) {
            dist[neighborId] = alt;
            prev[neighborId] = curr.id;
            steps.push({
              type: 'dijkstra-relax',
              curr,
              neighbor,
              edge: e,
              newDist: alt,
              msg: `Relaxace hrany ${curr.label}—${neighbor.label}: nalezena kratší cesta do <strong>${neighbor.label}</strong> = ${alt}.`
            });
          }
        }
      });
    }

    const pathNodes = [];
    const pathEdges = [];
    let currId = targetNode.id;
    if (prev[currId] !== null || currId === startNode.id) {
      while (currId !== null) {
        pathNodes.unshift(currId);
        const parentId = prev[currId];
        if (parentId) {
          const edge = edges.find(ed => (ed.u === parentId && ed.v === currId) || (ed.v === parentId && ed.u === currId));
          if (edge) pathEdges.unshift(edge);
        }
        currId = parentId;
      }
    }

    steps.push({
      type: 'dijkstra-path',
      pathNodes,
      pathEdges,
      totalDist: dist[targetNode.id],
      msg: `Nejkratší cesta nalezena: <strong>${pathNodes.join(' → ')}</strong> (celková délka = ${dist[targetNode.id]}).`
    });

    playSteps(steps);
  }

  // 4. Kruskal MST
  function executeKruskalMST() {
    const steps = [];
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

    const parent = {};
    nodes.forEach(n => parent[n.id] = n.id);
    function find(i) {
      if (parent[i] === i) return i;
      return parent[i] = find(parent[i]);
    }
    function union(i, j) {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent[rootI] = rootJ;
        return true;
      }
      return false;
    }

    steps.push({
      type: 'info',
      msg: 'Kruskal: hrany seřazeny vzestupně podle vah. Postupně přidáváme hrany netvořící cyklus.'
    });

    let totalWeight = 0;
    sortedEdges.forEach(e => {
      const rootU = find(e.u);
      const rootV = find(e.v);
      if (rootU !== rootV) {
        union(rootU, rootV);
        totalWeight += e.weight;
        steps.push({
          type: 'mst-edge',
          edge: e,
          msg: `Hrana <strong>${e.u}—${e.v}</strong> (váha ${e.weight}) přidána do kostry (netvoří cyklus).`
        });
      } else {
        steps.push({
          type: 'info',
          msg: `Hrana ${e.u}—${e.v} (váha ${e.weight}) zahozena – tvořila by cyklus!`
        });
      }
    });

    steps.push({
      type: 'finish',
      msg: `Minimální kostra (MST) hotova! Celková cena kostry = <strong>${totalWeight}</strong>.`
    });

    playSteps(steps);
  }

  // Animace kroků
  function playSteps(steps) {
    let idx = 0;
    algoInterval = setInterval(() => {
      if (idx >= steps.length) {
        stopAlgorithm();
        return;
      }

      const step = steps[idx];
      if (step.msg) logMessage(step.msg);

      if (step.type === 'activate' || step.type === 'visit') {
        step.node.state = 'visited';
      } else if (step.type === 'edge-step') {
        step.edge.state = 'active';
        step.node.state = 'visited';
      } else if (step.type === 'backtrack') {
        step.node.state = 'visited';
      } else if (step.type === 'dijkstra-curr') {
        step.node.state = 'active';
        step.node.dist = step.dist;
      } else if (step.type === 'dijkstra-relax') {
        step.edge.state = 'active';
        step.neighbor.state = 'visited';
        step.neighbor.dist = step.newDist;
      } else if (step.type === 'dijkstra-path') {
        step.pathNodes.forEach(id => {
          const n = nodes.find(x => x.id === id);
          if (n) n.state = 'path';
        });
        step.pathEdges.forEach(ed => {
          ed.state = 'path';
        });
      } else if (step.type === 'mst-edge') {
        step.edge.state = 'mst';
        const u = nodes.find(x => x.id === step.edge.u);
        const v = nodes.find(x => x.id === step.edge.v);
        if (u) u.state = 'visited';
        if (v) v.state = 'visited';
      }

      drawGraph();
      idx++;
    }, 700);
  }

})();
