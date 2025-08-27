function parseGDBOutput(text) {
    const nodes = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
        // Look for patterns like: data=10 next=0x...
        if (line.includes('data=') && line.includes('next=')) {
            const dataMatch = line.match(/data=(\d+)/);
            const nextMatch = line.match(/next=(0x[0-9a-f]+|0x0|nullptr)/);
            
            if (dataMatch && nextMatch) {
                nodes.push({
                    data: dataMatch[1],
                    next: nextMatch[1]
                });
            }
        }
        
        // Alternative pattern: NODE_0: data=10 next=0x...
        else if (line.includes('NODE_')) {
            const parts = line.split(':');
            if (parts.length > 1) {
                const info = parts[1].trim();
                const data = info.match(/data=(\d+)/)?.[1];
                const next = info.match(/next=(0x[0-9a-f]+|0x0|nullptr)/)?.[1];
                
                if (data && next) {
                    nodes.push({ data, next });
                }
            }
        }
    }
    
    return nodes;
}

function createVisualization(nodes) {
    if (nodes.length === 0) {
        return '<p>No linked list nodes found. Please check your GDB output format.</p>';
    }
    
    let html = '<div class="linked-list">';
    html += '<div class="node"><div class="label">HEAD</div></div>';
    html += '<div class="arrow">→</div>';
    
    nodes.forEach((node, index) => {
        html += `
            <div class="node">
                <div class="data-box">${node.data}</div>
                <div class="node-info">Node ${index}</div>
            </div>
        `;
        
        if (index < nodes.length - 1) {
            html += '<div class="arrow">→</div>';
        }
    });
    
    html += '<div class="arrow">→</div>';
    html += '<div class="null-box">NULL</div>';
    html += '</div>';
    
    // Add node details
    html += '<div class="node-details"><h3>Node Details:</h3><ul>';
    nodes.forEach((node, index) => {
        const isLast = index === nodes.length - 1;
        html += `<li>Node ${index}: data = ${node.data}, next = ${isLast ? 'NULL' : '→ Node ' + (index + 1)}</li>`;
    });
    html += '</ul></div>';
    
    return html;
}

function visualize() {
    const gdbOutput = document.getElementById('gdbInput').value;
    const nodes = parseGDBOutput(gdbOutput);
    const visualizationHTML = createVisualization(nodes);
    
    document.getElementById('visualization').innerHTML = visualizationHTML;
}

// Example GDB output for testing
const exampleGDBOutput = `NODE_0: data=10 next=0x55a1b2a6aeb0
NODE_1: data=20 next=0x55a1b2a6aec0
NODE_2: data=30 next=0x55a1b2a6aed0
NODE_3: data=40 next=0x55a1b2a6aee0
NODE_4: data=50 next=0x0`;

// Pre-fill with example
document.getElementById('gdbInput').value = exampleGDBOutput;
