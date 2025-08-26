document.getElementById("visualizeBtn").addEventListener("click", () => {
  const code = document.getElementById("codeInput").value;
  const viz = document.getElementById("visualization");
  viz.innerHTML = "";

  // Very simple parser: extract numbers passed to `new Node(x)`
  const regex = /new\s+Node\s*\(\s*(\d+)\s*\)/g;
  let match;
  const values = [];

  while ((match = regex.exec(code)) !== null) {
    values.push(match[1]);
  }

  if (values.length === 0) {
    viz.innerHTML = "<p>No nodes detected. Try code with <code>new Node(x)</code>.</p>";
    return;
  }

  values.forEach((val, i) => {
    const node = document.createElement("div");
    node.className = "node";

    const box = document.createElement("div");
    box.className = "box";
    box.textContent = val;

    node.appendChild(box);

    if (i < values.length - 1) {
      const arrow = document.createElement("div");
      arrow.className = "arrow";
      arrow.textContent = "→";
      node.appendChild(arrow);
    }

    viz.appendChild(node);
  });
});
