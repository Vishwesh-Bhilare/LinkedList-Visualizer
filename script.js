function visualizeCode() {
  const code = document.getElementById("codeInput").value;
  const output = document.getElementById("visualizer");
  output.innerHTML = "";

  // Regex for node creation & linking
  const nodeRegex = /(\w+)\s*=\s*new\s+Node\s*\(\s*(\d+)\s*\)/g;
  const linkRegex = /(\w+)->next\s*=\s*(\w+);/g;
  const nullRegex = /(\w+)->next\s*=\s*nullptr\s*;/g;

  let nodes = {};   // store nodes { varName: {value, next} }
  let edges = [];   // store connections [from, to]

  // Step 1: Create nodes
  let match;
  while ((match = nodeRegex.exec(code)) !== null) {
    let varName = match[1];
    let value = match[2];
    nodes[varName] = { value, next: null };
  }

  // Step 2: Handle links
  while ((match = linkRegex.exec(code)) !== null) {
    let from = match[1];
    let to = match[2];
    if (nodes[from] && nodes[to]) {
      nodes[from].next = to;
      edges.push([from, to]);
    }
  }

  // Step 3: Handle nullptr assignments
  while ((match = nullRegex.exec(code)) !== null) {
    let from = match[1];
    if (nodes[from]) {
      nodes[from].next = "NULL";
      edges.push([from, "NULL"]);
    }
  }

  // Step 4: Render linked list
  renderList(nodes, edges, output);
}

function renderList(nodes, edges, container) {
  const drawn = new Set();

  edges.forEach(([from, to]) => {
    if (!drawn.has(from)) {
      const nodeDiv = createNodeDiv(nodes[from].value);
      container.appendChild(nodeDiv);
      drawn.add(from);
    }

    // Draw arrow
    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = "→";
    container.appendChild(arrow);

    if (to === "NULL") {
      const nullDiv = createNodeDiv("NULL", true);
      container.appendChild(nullDiv);
    } else {
      if (!drawn.has(to)) {
        const nodeDiv = createNodeDiv(nodes[to].value);
        container.appendChild(nodeDiv);
        drawn.add(to);
      }
    }
  });
}

function createNodeDiv(value, isNull = false) {
  const div = document.createElement("div");
  div.className = isNull ? "null-node" : "node";
  div.textContent = value;
  return div;
}
