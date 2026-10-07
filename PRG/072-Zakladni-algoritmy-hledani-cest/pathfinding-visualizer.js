/**
 * ==========================================================================
 * Téma 072: Základní algoritmy hledání cest – Interaktivní simulátor
 * Algoritmy: BFS (Fronta), DFS (Zásobník), Dijkstra, Bellman-Ford
 * Standard: 100% Offline, Pure Vanilla JS, Vektorové SVG, Žádná barevná emoji
 * ==========================================================================
 */

(function () {
  'use strict';

  // Definice modelového grafu (6 uzlů a orientované vážené hrany)
  const GRAPH = {
    nodes: [
      { id: 'A', x: 60, y: 110 },
      { id: 'B', x: 190, y: 45 },
      { id: 'C', x: 190, y: 175 },
      { id: 'D', x: 330, y: 45 },
      { id: 'E', x: 330, y: 175 },
      { id: 'F', x: 460, y: 110 }
    ],
    edges: [
      { from: 'A', to: 'B', weight: 4 },
      { from: 'A', to: 'C', weight: 2 },
      { from: 'C', to: 'B', weight: 1 },
      { from: 'B', to: 'D', weight: 5 },
      { from: 'B', to: 'E', weight: 2 },
      { from: 'C', to: 'E', weight: 5 },
      { from: 'E', to: 'D', weight: 1 },
      { from: 'D', to: 'F', weight: 2 },
      { from: 'E', to: 'F', weight: 6 }
    ]
  };

  // Seznam sousedů pro rychlé vyhledávání
  const ADJ = {};
  GRAPH.nodes.forEach(n => { ADJ[n.id] = []; });
  GRAPH.edges.forEach(e => {
    ADJ[e.from].push({ to: e.to, weight: e.weight });
  });

  // Globální stav simulátoru
  let currentAlgo = 'dijkstra';
  let startNode = 'A';
  let targetNode = 'F';
  let steps = [];
  let currentStepIdx = 0;
  let isPlaying = false;
  let playTimer = null;
  let playSpeedMs = 1200;

  // DOM prvky
  let svgRoot = null;
  let stepBadge = null;
  let stepDesc = null;
  let structContainer = null;
  let structTitle = null;
  let playBtn = null;
  let prevBtn = null;
  let nextBtn = null;
  let resetBtn = null;

  /**
   * Generování kroků pro BFS (Fronta - FIFO)
   */
  function generateBfsSteps(start, target) {
    const recorded = [];
    const queue = [start];
    const inQueue = new Set([start]);
    const visited = new Set();
    const parent = {};
    const nodeStates = {};
    const edgeStates = {};

    GRAPH.nodes.forEach(n => { nodeStates[n.id] = 'idle'; });
    GRAPH.edges.forEach(e => { edgeStates[`${e.from}->${e.to}`] = 'idle'; });

    nodeStates[start] = 'queue';
    parent[start] = '-';

    recorded.push({
      title: 'Inicializace BFS',
      desc: `Začínáme v uzlu <strong>${start}</strong>. Vkládáme jej jako výchozí bod do fronty <em>K navštívení</em>. Seznam <em>Navštívené uzly</em> je zatím prázdný. Cíl je uzel <strong>${target}</strong>.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      structType: 'bfs_storage',
      toVisit: [...queue],
      visited: Array.from(visited),
      parentData: { ...parent }
    });

    let targetFound = false;

    while (queue.length > 0) {
      const u = queue.shift();
      inQueue.delete(u);
      visited.add(u);
      nodeStates[u] = 'current';

      recorded.push({
        title: `Vyjmutí uzlu ${u} z fronty`,
        desc: `Z čela fronty (FIFO) odebíráme uzel <strong>${u}</strong> a přesouváme jej do seznamu <em>Navštívené uzly</em>. Nyní prozkoumáme všechny jeho odchozí sousedy.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        structType: 'bfs_storage',
        toVisit: [...queue],
        visited: Array.from(visited),
        parentData: { ...parent },
        activeNode: u
      });

      if (u === target) {
        targetFound = true;
        nodeStates[u] = 'visited';
        break;
      }

      for (const neighbor of ADJ[u]) {
        const v = neighbor.to;
        const edgeKey = `${u}->${v}`;

        if (visited.has(v)) {
          edgeStates[edgeKey] = 'failed';
          recorded.push({
            title: `Přeskočení hrany ${u} → ${v} (již navštíveno)`,
            desc: `Hrana <strong>${u} &rarr; ${v}</strong> vede k uzlu <strong>${v}</strong>, který již byl dříve navštíven a zpracován (je v <em>Navštívené uzly</em>). Hranu přeskakujeme, abychom netvořili cykly.`,
            nodeStates: { ...nodeStates },
            edgeStates: { ...edgeStates },
            structType: 'bfs_storage',
            toVisit: [...queue],
            visited: Array.from(visited),
            parentData: { ...parent },
            activeNode: u,
            rejectedNode: v
          });
        } else if (inQueue.has(v)) {
          edgeStates[edgeKey] = 'failed';
          recorded.push({
            title: `Přeskočení hrany ${u} → ${v} (již ve frontě)`,
            desc: `Hrana <strong>${u} &rarr; ${v}</strong> vede k uzlu <strong>${v}</strong>, který již čeká ve frontě <em>K navštívení</em>. Má již nalezenou cestu o stejné či menší hloubce, hranu přeskakujeme.`,
            nodeStates: { ...nodeStates },
            edgeStates: { ...edgeStates },
            structType: 'bfs_storage',
            toVisit: [...queue],
            visited: Array.from(visited),
            parentData: { ...parent },
            activeNode: u,
            rejectedNode: v
          });
        } else {
          inQueue.add(v);
          parent[v] = u;
          queue.push(v);
          nodeStates[v] = 'queue';
          edgeStates[edgeKey] = 'exploring';

          recorded.push({
            title: `Nalezen nový soused: hrana ${u} → ${v}`,
            desc: `Hrana <strong>${u} &rarr; ${v}</strong> vede k dosud nenavštívenému uzlu <strong>${v}</strong>. Ukládáme předchůdce <em>parent[${v}] = ${u}</em> a uzel zařazujeme <strong>JEN do fronty K navštívení</strong> (do navštívených přejde až při svém vyjmutí z fronty).`,
            nodeStates: { ...nodeStates },
            edgeStates: { ...edgeStates },
            structType: 'bfs_storage',
            toVisit: [...queue],
            visited: Array.from(visited),
            parentData: { ...parent },
            activeNode: u,
            updatedNode: v
          });
        }
        edgeStates[edgeKey] = 'idle';
      }

      nodeStates[u] = 'visited';
    }

    if (targetFound) {
      // Rekonstrukce cesty
      const pathNodes = [];
      let curr = target;
      while (curr && curr !== '-') {
        pathNodes.unshift(curr);
        curr = parent[curr];
      }

      pathNodes.forEach(n => { nodeStates[n] = 'path'; });
      for (let i = 0; i < pathNodes.length - 1; i++) {
        edgeStates[`${pathNodes[i]}->${pathNodes[i+1]}`] = 'path';
      }

      recorded.push({
        title: 'Cíl úspěšně nalezen!',
        desc: `BFS nalezl nejkratší cestu (minimální počet hran) z <strong>${start}</strong> do <strong>${target}</strong>: <strong>${pathNodes.join(' → ')}</strong> (${pathNodes.length - 1} hran).`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        structType: 'bfs_storage',
        toVisit: [...queue],
        visited: Array.from(visited),
        parentData: { ...parent }
      });
    } else {
      recorded.push({
        title: 'Cesta neexistuje',
        desc: `Fronta je prázdná a uzel <strong>${target}</strong> nebyl dosažen. Cesta v grafu neexistuje.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        structType: 'bfs_storage',
        toVisit: [],
        visited: Array.from(visited),
        parentData: { ...parent }
      });
    }

    return recorded;
  }

  /**
   * Generování kroků pro DFS (Zásobník - LIFO)
   */
  function generateDfsSteps(start, target) {
    const recorded = [];
    const stack = [start];
    const inStack = new Set([start]);
    const visited = new Set();
    const parent = {};
    const nodeStates = {};
    const edgeStates = {};

    GRAPH.nodes.forEach(n => { nodeStates[n.id] = 'idle'; });
    GRAPH.edges.forEach(e => { edgeStates[`${e.from}->${e.to}`] = 'idle'; });

    nodeStates[start] = 'queue';
    parent[start] = '-';

    recorded.push({
      title: 'Inicializace DFS',
      desc: `Začínáme v uzlu <strong>${start}</strong>. Vkládáme jej na vrchol zásobníku <em>K navštívení</em> (LIFO). Množina <em>Navštívené uzly</em> je zatím prázdná.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      structType: 'dfs_storage',
      toVisit: [...stack],
      visited: Array.from(visited),
      parentData: { ...parent }
    });

    let targetFound = false;

    while (stack.length > 0) {
      const u = stack.pop();
      inStack.delete(u);

      if (visited.has(u)) {
        continue;
      }

      visited.add(u);
      nodeStates[u] = 'current';

      recorded.push({
        title: `Vyjmutí uzlu ${u} ze zásobníku`,
        desc: `Z vrcholu zásobníku (LIFO) odebíráme uzel <strong>${u}</strong> a přesouváme jej do množiny <em>Navštívené uzly</em>. Nyní zkoumáme jeho sousedy a noříme se do hloubky.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        structType: 'dfs_storage',
        toVisit: [...stack],
        visited: Array.from(visited),
        parentData: { ...parent },
        activeNode: u
      });

      if (u === target) {
        targetFound = true;
        nodeStates[u] = 'visited';
        break;
      }

      // Projdeme sousedy
      for (const neighbor of ADJ[u]) {
        const v = neighbor.to;
        const edgeKey = `${u}->${v}`;

        if (visited.has(v)) {
          edgeStates[edgeKey] = 'failed';
          recorded.push({
            title: `Přeskočení hrany ${u} → ${v} (již navštíveno)`,
            desc: `Hrana <strong>${u} &rarr; ${v}</strong> míří k uzlu <strong>${v}</strong>, který již je v množině <em>Navštívené uzly</em>. Pro zabránění cyklu tuto hranu ignorujeme.`,
            nodeStates: { ...nodeStates },
            edgeStates: { ...edgeStates },
            structType: 'dfs_storage',
            toVisit: [...stack],
            visited: Array.from(visited),
            parentData: { ...parent },
            activeNode: u,
            rejectedNode: v
          });
        } else if (inStack.has(v)) {
          edgeStates[edgeKey] = 'failed';
          recorded.push({
            title: `Přeskočení hrany ${u} → ${v} (již v zásobníku)`,
            desc: `Hrana <strong>${u} &rarr; ${v}</strong> míří k uzlu <strong>${v}</strong>, který již čeká na zásobníku <em>K navštívení</em>. Hranu přeskakujeme, abychom nevkládali uzel duplicitně.`,
            nodeStates: { ...nodeStates },
            edgeStates: { ...edgeStates },
            structType: 'dfs_storage',
            toVisit: [...stack],
            visited: Array.from(visited),
            parentData: { ...parent },
            activeNode: u,
            rejectedNode: v
          });
        } else {
          inStack.add(v);
          parent[v] = u;
          stack.push(v);
          nodeStates[v] = 'queue';
          edgeStates[edgeKey] = 'exploring';

          recorded.push({
            title: `Přidání ${v} na vrchol zásobníku k navštívení`,
            desc: `Hrana <strong>${u} &rarr; ${v}</strong> vede k dosud nenavštívenému uzlu <strong>${v}</strong>. Ukládáme předchůdce <em>parent[${v}] = ${u}</em> a uzel přidáváme <strong>JEN na vrchol zásobníku K navštívení</strong> (do navštívených přejde až při svém vyjmutí).`,
            nodeStates: { ...nodeStates },
            edgeStates: { ...edgeStates },
            structType: 'dfs_storage',
            toVisit: [...stack],
            visited: Array.from(visited),
            parentData: { ...parent },
            activeNode: u,
            updatedNode: v
          });
        }
        edgeStates[edgeKey] = 'idle';
      }

      nodeStates[u] = 'visited';
    }

    if (targetFound) {
      const pathNodes = [];
      let curr = target;
      while (curr && curr !== '-') {
        pathNodes.unshift(curr);
        curr = parent[curr];
      }

      pathNodes.forEach(n => { nodeStates[n] = 'path'; });
      for (let i = 0; i < pathNodes.length - 1; i++) {
        edgeStates[`${pathNodes[i]}->${pathNodes[i+1]}`] = 'path';
      }

      recorded.push({
        title: 'Cíl nalezen (DFS)',
        desc: `DFS našel cestu do hloubky z <strong>${start}</strong> do <strong>${target}</strong>: <strong>${pathNodes.join(' → ')}</strong> (${pathNodes.length - 1} hran). Pozor: DFS nezaručuje nejkratší cestu!`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        structType: 'dfs_storage',
        toVisit: [...stack],
        visited: Array.from(visited),
        parentData: { ...parent }
      });
    } else {
      recorded.push({
        title: 'Cesta neexistuje',
        desc: `Zásobník je prázdný a uzel <strong>${target}</strong> nebyl dosažen.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        structType: 'dfs_storage',
        toVisit: [],
        visited: Array.from(visited),
        parentData: { ...parent }
      });
    }

    return recorded;
  }

  /**
   * Generování kroků pro Dijkstrův algoritmus
   */
  function generateDijkstraSteps(start, target) {
    const recorded = [];
    const dist = {};
    const parent = {};
    const visited = new Set();
    const nodeStates = {};
    const edgeStates = {};

    GRAPH.nodes.forEach(n => {
      dist[n.id] = Infinity;
      parent[n.id] = null;
      nodeStates[n.id] = 'idle';
    });
    GRAPH.edges.forEach(e => { edgeStates[`${e.from}->${e.to}`] = 'idle'; });

    dist[start] = 0;
    parent[start] = '-';
    nodeStates[start] = 'queue';

    recorded.push({
      title: 'Inicializace Dijkstry',
      desc: `Nastavujeme <em>dist[${start}] = 0</em> (uzel ve stavu <em>K navštívení</em>), pro ostatní uzly <em>dist[v] = &infin;</em> (<em>Nedosažen</em>). Množina uzavřených (navštívených) uzlů je zatím prázdná.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      structType: 'distances',
      structData: { ...dist },
      parentData: { ...parent },
      visitedData: Array.from(visited),
      activeNode: start
    });

    while (true) {
      // Najdi uzel s minimální vzdáleností mezi nenavštívenými
      let u = null;
      let minDist = Infinity;
      for (const node of GRAPH.nodes) {
        if (!visited.has(node.id) && dist[node.id] < minDist) {
          minDist = dist[node.id];
          u = node.id;
        }
      }

      if (u === null || dist[u] === Infinity) {
        break; // Všechny dosažitelné uzly prozkoumány
      }

      nodeStates[u] = 'current';

      recorded.push({
        title: `Výběr minima: uzel ${u} (cena ${dist[u]})`,
        desc: `Z prioritní fronty vybíráme nenavštívený uzel s nejmenší známou vzdáleností: <strong>${u} (dist = ${dist[u]})</strong>. Uzel se uzavírá (přechází do <em>Navštíven</em>). Nyní prověříme relaxaci všech jeho odchozích hran.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        structType: 'distances',
        structData: { ...dist },
        parentData: { ...parent },
        visitedData: Array.from(visited),
        activeNode: u
      });

      visited.add(u);

      if (u === target) {
        nodeStates[u] = 'visited';
        break;
      }

      // Relaxace hran vycházejících z u
      for (const edge of ADJ[u]) {
        const v = edge.to;
        const w = edge.weight;
        const edgeKey = `${u}->${v}`;
        const newDist = dist[u] + w;

        if (newDist < dist[v]) {
          edgeStates[edgeKey] = 'exploring';
          const oldDistStr = dist[v] === Infinity ? '∞' : dist[v];
          const oldParentStr = parent[v] || '–';
          dist[v] = newDist;
          parent[v] = u;
          nodeStates[v] = nodeStates[v] === 'visited' ? 'visited' : 'queue';

          recorded.push({
            title: `Úspěšná relaxace hrany ${u} → ${v}`,
            desc: `Nalezena levnější trasa do uzlu <strong>${v}</strong>! Dosavadní vzdálenost ${oldDistStr} (přes ${oldParentStr}) zlevněna: <em>${dist[u]} + ${w} = <strong>${newDist}</strong></em>. Nový předchůdce nastaven na <strong>parent[${v}] = ${u}</strong>. Uzel ${v} je zařazen do <em>K navštívení</em>.`,
            nodeStates: { ...nodeStates },
            edgeStates: { ...edgeStates },
            structType: 'distances',
            structData: { ...dist },
            parentData: { ...parent },
            visitedData: Array.from(visited),
            activeNode: u,
            updatedNode: v
          });
        } else {
          edgeStates[edgeKey] = 'failed';

          let reason = '';
          if (visited.has(v)) {
            reason = `Uzel <strong>${v}</strong> je již navštíven a uzavřen s definitivní minimální cenou <em>dist[${v}] = ${dist[v]}</em>. Hranu přeskakujeme.`;
          } else {
            reason = `Cesta přes ${u} by stála <em>dist[${u}] + ${w} = ${dist[u]} + ${w} = <strong>${newDist}</strong></em>, což <strong>není kratší</strong> než stávající <em>dist[${v}] = <strong>${dist[v]}</strong></em> (přes <em>parent = ${parent[v] || 'start'}</em>). Nový kratší spoj se nenašel, hodnoty <em>dist</em> ani <em>parent</em> se nemění.`;
          }

          recorded.push({
            title: `Relaxace hrany ${u} → ${v} neproběhla`,
            desc: `Testujeme hranu <strong>${u} &rarr; ${v}</strong> (váha ${w}). ${reason}`,
            nodeStates: { ...nodeStates },
            edgeStates: { ...edgeStates },
            structType: 'distances',
            structData: { ...dist },
            parentData: { ...parent },
            visitedData: Array.from(visited),
            activeNode: u,
            rejectedNode: v
          });
        }
        edgeStates[edgeKey] = 'idle';
      }

      nodeStates[u] = 'visited';
    }

    // Rekonstrukce nejkratší cesty
    if (dist[target] !== Infinity) {
      const pathNodes = [];
      let curr = target;
      while (curr && curr !== '-') {
        pathNodes.unshift(curr);
        curr = parent[curr];
      }

      pathNodes.forEach(n => { nodeStates[n] = 'path'; });
      for (let i = 0; i < pathNodes.length - 1; i++) {
        edgeStates[`${pathNodes[i]}->${pathNodes[i+1]}`] = 'path';
      }

      recorded.push({
        title: 'Nalezena optimální nejkratší cesta!',
        desc: `Dijkstrův algoritmus nalezl nejlevnější trasu z <strong>${start}</strong> do <strong>${target}</strong>: <strong>${pathNodes.join(' → ')}</strong> s celkovou cenou <strong>${dist[target]}</strong>.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        structType: 'distances',
        structData: { ...dist },
        parentData: { ...parent },
        visitedData: Array.from(visited),
        activeNode: target
      });
    }

    return recorded;
  }

  /**
   * Generování kroků pro Bellman-Fordův algoritmus
   */
  function generateBellmanFordSteps(start, target) {
    const recorded = [];
    const dist = {};
    const parent = {};
    const nodeStates = {};
    const edgeStates = {};
    const numNodes = GRAPH.nodes.length;

    GRAPH.nodes.forEach(n => {
      dist[n.id] = Infinity;
      parent[n.id] = null;
      nodeStates[n.id] = 'idle';
    });
    GRAPH.edges.forEach(e => { edgeStates[`${e.from}->${e.to}`] = 'idle'; });

    dist[start] = 0;
    parent[start] = '-';
    nodeStates[start] = 'queue';

    recorded.push({
      title: 'Inicializace Bellman-Ford',
      desc: `Nastavujeme <em>dist[${start}] = 0</em>, ostatní uzly na &infin;. Předchůdci <em>parent[v]</em> jsou zatím nevyplněni. Bellman-Ford provede celkem až <strong>|V| &minus; 1 = ${numNodes - 1} kol</strong> relaxace všech ${GRAPH.edges.length} hran.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      structType: 'distances',
      structData: { ...dist },
      parentData: { ...parent }
    });

    // (|V| - 1) kol
    for (let round = 1; round <= numNodes - 1; round++) {
      let anyRelaxed = false;

      recorded.push({
        title: `Kolo ${round} z ${numNodes - 1}: Začátek průchodu`,
        desc: `Spouštíme průchod kola <strong>${round}</strong>. Budeme postupně testovat relaxaci pro všech <strong>${GRAPH.edges.length} hran</strong> v grafu.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        structType: 'distances',
        structData: { ...dist },
        parentData: { ...parent }
      });

      for (const edge of GRAPH.edges) {
        const u = edge.from;
        const v = edge.to;
        const w = edge.weight;
        const edgeKey = `${u}->${v}`;

        if (dist[u] === Infinity) {
          edgeStates[edgeKey] = 'failed';
          recorded.push({
            title: `Kolo ${round}: Hrana ${u} → ${v} (uzel ${u} nedosažen)`,
            desc: `Hrana <strong>${u} &rarr; ${v}</strong> (váha ${w}): Počáteční uzel <strong>${u}</strong> má dosud hodnotu <em>dist[${u}] = &infin;</em>. Z nedosaženého vrcholu nelze hranu relaxovat (&infin; + ${w} = &infin;). Nový kratší spoj se nenašel.`,
            nodeStates: { ...nodeStates },
            edgeStates: { ...edgeStates },
            structType: 'distances',
            structData: { ...dist },
            parentData: { ...parent },
            activeNode: u,
            rejectedNode: v
          });
          edgeStates[edgeKey] = 'idle';
        } else {
          const newDist = dist[u] + w;
          if (newDist < dist[v]) {
            edgeStates[edgeKey] = 'exploring';
            const oldVal = dist[v] === Infinity ? '∞' : dist[v];
            const oldParent = parent[v] ? parent[v] : '–';
            dist[v] = newDist;
            parent[v] = u;
            nodeStates[v] = 'queue';
            anyRelaxed = true;

            recorded.push({
              title: `Kolo ${round}: Úspěšná relaxace hrany ${u} → ${v}`,
              desc: `Hrana <strong>${u} &rarr; ${v}</strong> (váha ${w}) zlevnila uzel <strong>${v}</strong>! Původní vzdálenost ${oldVal} (přes ${oldParent}) zkrácena na <em>${dist[u]} + ${w} = <strong>${dist[v]}</strong></em>. Nastaven předchůdce <em>parent[${v}] = ${u}</em>.`,
              nodeStates: { ...nodeStates },
              edgeStates: { ...edgeStates },
              structType: 'distances',
              structData: { ...dist },
              parentData: { ...parent },
              activeNode: u,
              updatedNode: v
            });
            edgeStates[edgeKey] = 'idle';
          } else {
            edgeStates[edgeKey] = 'failed';
            recorded.push({
              title: `Kolo ${round}: Relaxace hrany ${u} → ${v} neproběhla`,
              desc: `Testujeme hranu <strong>${u} &rarr; ${v}</strong> (váha ${w}). Cesta přes ${u} by měla cenu <em>${dist[u]} + ${w} = <strong>${newDist}</strong></em>, což <strong>není méně</strong> než dosavadní <em>dist[${v}] = <strong>${dist[v]}</strong></em> (přes <em>parent = ${parent[v] || 'start'}</em>). Nový kratší spoj se nenašel, hodnoty <em>dist</em> ani <em>parent</em> se nemění.`,
              nodeStates: { ...nodeStates },
              edgeStates: { ...edgeStates },
              structType: 'distances',
              structData: { ...dist },
              parentData: { ...parent },
              activeNode: u,
              rejectedNode: v
            });
            edgeStates[edgeKey] = 'idle';
          }
        }
      }

      if (!anyRelaxed) {
        recorded.push({
          title: `Předčasné ukončení (Konvergence v kole ${round})`,
          desc: `V kole ${round} se již žádná vzdálenost nezlepšila (žádná hrana nebyla zlevněna). Algoritmus dosáhl konečného optima a nemusí provádět zbylá kola.`,
          nodeStates: { ...nodeStates },
          edgeStates: { ...edgeStates },
          structType: 'distances',
          structData: { ...dist },
          parentData: { ...parent }
        });
        break;
      }
    }

    // Rekonstrukce cesty
    if (dist[target] !== Infinity) {
      const pathNodes = [];
      let curr = target;
      while (curr && curr !== '-') {
        pathNodes.unshift(curr);
        curr = parent[curr];
      }

      pathNodes.forEach(n => { nodeStates[n] = 'path'; });
      for (let i = 0; i < pathNodes.length - 1; i++) {
        edgeStates[`${pathNodes[i]}->${pathNodes[i+1]}`] = 'path';
      }

      recorded.push({
        title: 'Hotovo: Nejkratší cesta potvrzena',
        desc: `Bellman-Ford potvrdil optimální trasu z <strong>${start}</strong> do <strong>${target}</strong>: <strong>${pathNodes.join(' → ')}</strong> s celkovou cenou <strong>${dist[target]}</strong> bez záporných cyklů.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        structType: 'distances',
        structData: { ...dist },
        parentData: { ...parent }
      });
    }

    return recorded;
  }

  /**
   * Inicializace SVG plátna s grafem
   */
  function buildSvgGraph() {
    if (!svgRoot) return;
    svgRoot.innerHTML = '';

    // Vytvoření defs pro šipky
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="simArrowIdle" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#64748b" />
      </marker>
      <marker id="simArrowActive" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#fbbf24" />
      </marker>
      <marker id="simArrowFailed" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#fb7185" />
      </marker>
      <marker id="simArrowPath" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#34d399" />
      </marker>
    `;
    svgRoot.appendChild(defs);

    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgesGroup.setAttribute('id', 'simEdgesGroup');
    svgRoot.appendChild(edgesGroup);

    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodesGroup.setAttribute('id', 'simNodesGroup');
    svgRoot.appendChild(nodesGroup);

    // Vykreslení hran
    GRAPH.edges.forEach(edge => {
      const u = GRAPH.nodes.find(n => n.id === edge.from);
      const v = GRAPH.nodes.find(n => n.id === edge.to);

      const edgeKey = `${edge.from}->${edge.to}`;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'sim-edge edge-idle');
      g.setAttribute('id', `edge-${edgeKey}`);

      // Mírně prohnout u hrany C->B nebo E->D pro eleganci
      let d = `M ${u.x} ${u.y} L ${v.x} ${v.y}`;
      let midX = (u.x + v.x) / 2;
      let midY = (u.y + v.y) / 2;

      if (edge.from === 'C' && edge.to === 'B') {
        d = `M ${u.x} ${u.y} Q ${u.x + 20} ${midY} ${v.x} ${v.y}`;
        midX += 16;
      } else if (edge.from === 'E' && edge.to === 'D') {
        d = `M ${u.x} ${u.y} Q ${u.x + 20} ${midY} ${v.x} ${v.y}`;
        midX += 16;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('marker-end', 'url(#simArrowIdle)');
      g.appendChild(path);

      // Štítek váhy
      const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      labelG.setAttribute('class', 'sim-edge-label');

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', midX - 9);
      rect.setAttribute('y', midY - 8);
      rect.setAttribute('width', 18);
      rect.setAttribute('height', 16);
      rect.setAttribute('rx', 3);
      rect.setAttribute('fill', '#0f172a');
      rect.setAttribute('stroke', 'rgba(255,255,255,0.15)');
      rect.setAttribute('stroke-width', '1');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', midX);
      text.setAttribute('y', midY + 4);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', '700');
      text.setAttribute('fill', '#e2e8f0');
      text.textContent = edge.weight;

      labelG.appendChild(rect);
      labelG.appendChild(text);
      g.appendChild(labelG);

      edgesGroup.appendChild(g);
    });

    // Vykreslení uzlů
    GRAPH.nodes.forEach(node => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'sim-node state-idle');
      g.setAttribute('id', `node-${node.id}`);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node.x);
      circle.setAttribute('cy', node.y);
      circle.setAttribute('r', 18);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', node.x);
      label.setAttribute('y', node.y + 5);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '13');
      label.setAttribute('fill', '#ffffff');
      label.textContent = node.id;

      // Dist badge pod uzlem (pro Dijkstru / Bellman-Forda a předchůdce)
      const distBadge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      distBadge.setAttribute('class', 'node-dist-badge');
      distBadge.setAttribute('id', `badge-dist-${node.id}`);
      distBadge.setAttribute('x', node.x);
      distBadge.setAttribute('y', node.y + 34);
      distBadge.setAttribute('text-anchor', 'middle');
      distBadge.textContent = '';

      g.appendChild(circle);
      g.appendChild(label);
      g.appendChild(distBadge);

      nodesGroup.appendChild(g);
    });
  }

  /**
   * Zobrazení aktuálního kroku simulátoru
   */
  function renderStep(idx) {
    if (!steps || steps.length === 0) return;
    if (idx < 0) idx = 0;
    if (idx >= steps.length) idx = steps.length - 1;
    currentStepIdx = idx;

    const step = steps[idx];

    // 1. Textový log
    if (stepBadge) {
      stepBadge.textContent = `${idx + 1} / ${steps.length} • ${step.title}`;
    }
    if (stepDesc) {
      stepDesc.innerHTML = step.desc;
    }

    // 2. Aktualizace stavů uzlů v SVG
    GRAPH.nodes.forEach(n => {
      const nodeEl = document.getElementById(`node-${n.id}`);
      if (nodeEl) {
        const state = step.nodeStates[n.id] || 'idle';
        nodeEl.setAttribute('class', `sim-node state-${state}`);
      }

      // Vzdálenost a předchůdce pod uzlem
      const badge = document.getElementById(`badge-dist-${n.id}`);
      if (badge) {
        badge.classList.remove('badge-updated', 'badge-rejected', 'badge-parent');
        if (step.structType === 'distances' && step.structData) {
          const val = step.structData[n.id];
          const p = step.parentData ? step.parentData[n.id] : null;
          let labelText = '';
          if (val === Infinity) {
            labelText = 'd=∞';
          } else {
            labelText = (p && p !== '-') ? `d=${val} (p=${p})` : `d=${val}`;
          }
          badge.textContent = labelText;
          badge.style.display = 'block';

          if (step.updatedNode === n.id) {
            badge.classList.add('badge-updated');
          } else if (step.rejectedNode === n.id) {
            badge.classList.add('badge-rejected');
          }
        } else if ((step.structType === 'bfs_storage' || step.structType === 'dfs_storage') && step.parentData) {
          const p = step.parentData[n.id];
          if (p && p !== '-') {
            badge.textContent = `p=${p}`;
            badge.classList.add('badge-parent');
            badge.style.display = 'block';
          } else {
            badge.style.display = 'none';
          }
        } else {
          badge.style.display = 'none';
        }
      }
    });

    // 3. Aktualizace stavů hran v SVG
    GRAPH.edges.forEach(e => {
      const edgeKey = `${e.from}->${e.to}`;
      const edgeEl = document.getElementById(`edge-${edgeKey}`);
      if (edgeEl) {
        const state = step.edgeStates[edgeKey] || 'idle';
        edgeEl.setAttribute('class', `sim-edge edge-${state}`);

        const path = edgeEl.querySelector('path');
        if (path) {
          if (state === 'exploring') {
            path.setAttribute('marker-end', 'url(#simArrowActive)');
          } else if (state === 'failed') {
            path.setAttribute('marker-end', 'url(#simArrowFailed)');
          } else if (state === 'path') {
            path.setAttribute('marker-end', 'url(#simArrowPath)');
          } else {
            path.setAttribute('marker-end', 'url(#simArrowIdle)');
          }
        }
      }
    });

    // 4. Aktualizace panelu datové struktury
    renderDataStructurePanel(step);

    // 5. Tlačítka
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === steps.length - 1;
  }

  /**
   * Vykreslení spodní datové struktury (Fronta / Zásobník / Vzdálenosti + předchůdci)
   */
  function renderDataStructurePanel(step) {
    if (!structContainer) return;

    if (step.structType === 'bfs_storage') {
      if (structTitle) structTitle.textContent = 'Stav úložišť BFS (Fronta k navštívení + množina visited)';
      const toVisit = step.toVisit || [];
      const visited = step.visited || [];

      let toVisitHtml = '';
      if (toVisit.length === 0) {
        toVisitHtml = '<span class="empty-state-label">&empty; Fronta je prázdná</span>';
      } else {
        toVisitHtml = '<div class="struct-elements-tape"><span class="tape-pointer">HEAD &rarr;</span>';
        toVisit.forEach((item, i) => {
          toVisitHtml += `<span class="struct-item ${i === 0 ? 'head' : ''}">${item}</span>`;
        });
        toVisitHtml += '<span class="tape-pointer">&larr; TAIL</span></div>';
      }

      let visitedHtml = '';
      if (visited.length === 0) {
        visitedHtml = '<span class="empty-state-label">&empty; Množina je prázdná</span>';
      } else {
        visitedHtml = '<div class="struct-elements-tape">';
        visited.forEach(item => {
          visitedHtml += `<span class="visited-chip">${item}</span>`;
        });
        visitedHtml += '</div>';
      }

      structContainer.innerHTML = `
        <div class="storage-dual-grid">
          <div class="storage-col">
            <div class="storage-col-header">
              <span class="storage-pill cyan">K navštívení (Fronta FIFO)</span>
              <span class="storage-count">${toVisit.length}</span>
            </div>
            ${toVisitHtml}
          </div>
          <div class="storage-col">
            <div class="storage-col-header">
              <span class="storage-pill purple">Navštívené uzly (visited set)</span>
              <span class="storage-count">${visited.length}</span>
            </div>
            ${visitedHtml}
          </div>
        </div>
      `;
    } else if (step.structType === 'dfs_storage') {
      if (structTitle) structTitle.textContent = 'Stav úložišť DFS (Zásobník k navštívení + množina visited)';
      const toVisit = step.toVisit || [];
      const visited = step.visited || [];

      let toVisitHtml = '';
      if (toVisit.length === 0) {
        toVisitHtml = '<span class="empty-state-label">&empty; Zásobník je prázdný</span>';
      } else {
        toVisitHtml = '<div class="struct-elements-tape">';
        toVisit.forEach((item, i) => {
          const isTop = i === toVisit.length - 1;
          toVisitHtml += `<span class="struct-item ${isTop ? 'head' : ''}">${item}${isTop ? ' (TOP)' : ''}</span>`;
        });
        toVisitHtml += '</div>';
      }

      let visitedHtml = '';
      if (visited.length === 0) {
        visitedHtml = '<span class="empty-state-label">&empty; Množina je prázdná</span>';
      } else {
        visitedHtml = '<div class="struct-elements-tape">';
        visited.forEach(item => {
          visitedHtml += `<span class="visited-chip">${item}</span>`;
        });
        visitedHtml += '</div>';
      }

      structContainer.innerHTML = `
        <div class="storage-dual-grid">
          <div class="storage-col">
            <div class="storage-col-header">
              <span class="storage-pill cyan">K navštívení (Zásobník LIFO)</span>
              <span class="storage-count">${toVisit.length}</span>
            </div>
            ${toVisitHtml}
          </div>
          <div class="storage-col">
            <div class="storage-col-header">
              <span class="storage-pill purple">Navštívené uzly (visited set)</span>
              <span class="storage-count">${visited.length}</span>
            </div>
            ${visitedHtml}
          </div>
        </div>
      `;
    } else if (step.structType === 'distances') {
      if (structTitle) {
        structTitle.textContent = step.visitedData 
          ? 'Tabulka uzlů: Vzdálenost dist[v], předchůdce parent[v] & stav uzlu'
          : 'Tabulka uzlů: Vzdálenost dist[v], předchůdce parent[v] & dosažitelnost';
      }
      const d = step.structData || {};
      const p = step.parentData || {};
      const vis = new Set(step.visitedData || []);

      let html = '<div class="dist-table-wrapper"><table class="dist-table"><thead><tr>';
      html += '<th class="table-corner">Uzel (v)</th>';
      GRAPH.nodes.forEach(n => { html += `<th>${n.id}</th>`; });
      html += '</tr></thead><tbody>';

      // Řádek 1: Vzdálenost dist[v]
      html += '<tr><td class="table-row-header">dist[v]</td>';
      GRAPH.nodes.forEach(n => {
        const val = d[n.id];
        const valStr = val === Infinity ? '&infin;' : val;
        let cellClass = '';
        if (step.updatedNode === n.id) cellClass = 'dist-updated';
        else if (step.rejectedNode === n.id) cellClass = 'dist-rejected';
        html += `<td class="${cellClass}">${valStr}</td>`;
      });
      html += '</tr>';

      // Řádek 2: Předchůdce parent[v]
      html += '<tr><td class="table-row-header">parent[v]</td>';
      GRAPH.nodes.forEach(n => {
        const parentVal = p[n.id] ? p[n.id] : '&ndash;';
        let cellClass = '';
        if (step.updatedNode === n.id) cellClass = 'dist-updated';
        else if (step.rejectedNode === n.id) cellClass = 'dist-rejected';
        html += `<td class="${cellClass}">${parentVal}</td>`;
      });
      html += '</tr>';

      // Řádek 3: Stav uzlu (Navštíven / K navštívení / Nedosažen)
      html += '<tr><td class="table-row-header">Stav</td>';
      GRAPH.nodes.forEach(n => {
        let badgeHtml = '';
        if (step.visitedData) {
          if (vis.has(n.id)) {
            badgeHtml = '<span class="dist-status visited">Navštíven</span>';
          } else if (d[n.id] < Infinity) {
            badgeHtml = '<span class="dist-status to-visit">K navštívení</span>';
          } else {
            badgeHtml = '<span class="dist-status unreached">Nedosažen</span>';
          }
        } else {
          if (d[n.id] < Infinity) {
            badgeHtml = '<span class="dist-status to-visit">Dosažen</span>';
          } else {
            badgeHtml = '<span class="dist-status unreached">Nedosažen</span>';
          }
        }
        html += `<td>${badgeHtml}</td>`;
      });
      html += '</tr>';

      html += '</tbody></table></div>';

      structContainer.innerHTML = html;
    }
  }

  /**
   * Spuštění vybraného algoritmu a přepočet kroků
   */
  function recomputeSteps() {
    pause();
    if (currentAlgo === 'bfs') {
      steps = generateBfsSteps(startNode, targetNode);
    } else if (currentAlgo === 'dfs') {
      steps = generateDfsSteps(startNode, targetNode);
    } else if (currentAlgo === 'dijkstra') {
      steps = generateDijkstraSteps(startNode, targetNode);
    } else if (currentAlgo === 'bellman_ford') {
      steps = generateBellmanFordSteps(startNode, targetNode);
    }
    renderStep(0);
  }

  /**
   * Přehrávání
   */
  function play() {
    if (isPlaying) return;
    if (currentStepIdx >= steps.length - 1) {
      currentStepIdx = 0;
    }
    isPlaying = true;
    updatePlayButton();
    playTimer = setInterval(() => {
      if (currentStepIdx < steps.length - 1) {
        renderStep(currentStepIdx + 1);
      } else {
        pause();
      }
    }, playSpeedMs);
  }

  function pause() {
    if (!isPlaying) return;
    isPlaying = false;
    clearInterval(playTimer);
    playTimer = null;
    updatePlayButton();
  }

  function togglePlay() {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }

  function updatePlayButton() {
    if (!playBtn) return;
    if (isPlaying) {
      playBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        Pozastavit
      `;
    } else {
      playBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        Spustit
      `;
    }
  }

  /**
   * Inicializace posluchačů a komponent
   */
  function initVisualizer() {
    svgRoot = document.getElementById('simGraphSvg');
    stepBadge = document.getElementById('simStepBadge');
    stepDesc = document.getElementById('simStepDesc');
    structContainer = document.getElementById('simStructContainer');
    structTitle = document.getElementById('simStructTitle');
    playBtn = document.getElementById('simPlayBtn');
    prevBtn = document.getElementById('simPrevBtn');
    nextBtn = document.getElementById('simNextBtn');
    resetBtn = document.getElementById('simResetBtn');

    if (!svgRoot) return;

    buildSvgGraph();

    // Přepínače algoritmů
    document.querySelectorAll('.algo-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.algo-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentAlgo = btn.getAttribute('data-algo');
        recomputeSteps();
      });
    });

    // Výběr startu a cíle
    const startSelect = document.getElementById('simStartSelect');
    if (startSelect) {
      startSelect.addEventListener('change', (e) => {
        startNode = e.target.value;
        recomputeSteps();
      });
    }

    const targetSelect = document.getElementById('simTargetSelect');
    if (targetSelect) {
      targetSelect.addEventListener('change', (e) => {
        targetNode = e.target.value;
        recomputeSteps();
      });
    }

    // Tlačítka kroků
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        pause();
        renderStep(currentStepIdx + 1);
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        pause();
        renderStep(currentStepIdx - 1);
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        pause();
        renderStep(0);
      });
    }

    // Rychlost
    const speedSelect = document.getElementById('simSpeedSelect');
    if (speedSelect) {
      speedSelect.addEventListener('change', (e) => {
        playSpeedMs = parseInt(e.target.value, 10);
        if (isPlaying) {
          pause();
          play();
        }
      });
    }

    // Počáteční výpočet
    recomputeSteps();
  }

  // Spuštění po načtení DOMu
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisualizer);
  } else {
    initVisualizer();
  }

})();
