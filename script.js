// Use Judge0 API for compilation
const API_URL = 'https://api.judge0.com/submissions';
const API_KEY = ''; // Optional: get from judge0.com

async function compileAndVisualize() {
    const cppCode = document.getElementById('cppCode').value;
    const outputDiv = document.getElementById('output');
    const visualizationDiv = document.getElementById('visualization');
    
    outputDiv.innerHTML = '<div class="loading">🔄 Compiling...</div>';
    visualizationDiv.innerHTML = '<div class="loading">🔄 Preparing visualization...</div>';

    try {
        // Enhanced code with debugging output
        const enhancedCode = enhanceCodeWithDebugging(cppCode);
        
        // Submit to compiler API
        const response = await fetch(`${API_URL}?base64_encoded=false&wait=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source_code: enhancedCode,
                language_id: 54, // C++ language ID
                compiler_options: '-g', // Enable debugging
                stdin: '',
                redirect_stderr_to_stdout: true
            })
        });

        const data = await response.json();
        
        if (data.stdout) {
            outputDiv.textContent = data.stdout;
            const nodes = parseOutput(data.stdout);
            visualizeLinkedList(nodes);
        } else if (data.stderr) {
            outputDiv.innerHTML = `<div class="error">❌ Compilation Error:\n${data.stderr}</div>`;
        } else {
            outputDiv.innerHTML = '<div class="error">❌ No output received</div>';
        }
        
    } catch (error) {
        outputDiv.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
        visualizationDiv.innerHTML = '<div class="error">Visualization failed</div>';
    }
}

function enhanceCodeWithDebugging(originalCode) {
    // Add debug output to the code
    return `
#include <iostream>
#include <sstream>

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

void debug_point(Node* head, const std::string& label = "") {
    Node* current = head;
    int count = 0;
    std::cout << "=== DEBUG OUTPUT ===\\n";
    while (current != nullptr) {
        std::cout << "NODE_" << count << ": data=" << current->data 
                  << " next=" << current->next << "\\n";
        current = current->next;
        count++;
    }
    std::cout << "TOTAL_NODES: " << count << "\\n";
    if (!label.empty()) {
        std::cout << "LABEL: " << label << "\\n";
    }
    std::cout << "===================\\n";
}

${originalCode.replace('void debug_point(Node* head)', 'void debug_point(Node* head, const std::string& label = "")')}
`;
}

function parseOutput(output) {
    const nodes = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
        if (line.startsWith('NODE_')) {
            const parts = line.split(':');
            if (parts.length > 1) {
                const info = parts[1].trim();
                const dataMatch = info.match(/data=(\d+)/);
                const nextMatch = info.match(/next=(0x[0-9a-f]+|0x0|nullptr)/);
                
                if (dataMatch && nextMatch) {
                    nodes.push({
                        data: dataMatch[1],
                        next: nextMatch[1],
                        index: nodes.length
                    });
                }
            }
        }
    }
    
    return nodes;
}

function visualizeLinkedList(nodes) {
    const visualizationDiv = document.getElementById('visualization');
    
    if (nodes.length === 0) {
        visualizationDiv.innerHTML = `
            <div class="error">❌ No linked list nodes found.</div>
            <p>Make sure your code:</p>
            <ul>
                <li>Includes Node struct with data and next</li>
                <li>Calls debug_point(head) where you want to visualize</li>
                <li>Creates a linked list properly</li>
            </ul>
        `;
        return;
    }
    
    let html = `
        <h3>📊 Linked List Visualization (${nodes.length} nodes)</h3>
        <div class="linked-list">
            <div class="node">
                <div class="label">HEAD</div>
                <div class="arrow">→</div>
            </div>
    `;
    
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
    
    html += `
            <div class="arrow">→</div>
            <div class="null-box">NULL</div>
        </div>
        
        <div class="node-details">
            <h4>Node Details:</h4>
            <ul>
    `;
    
    nodes.forEach((node, index) => {
        const isLast = index === nodes.length - 1;
        html += `<li>Node ${index}: data = ${node.data}, next = ${isLast ? 'NULL' : '→ Node ' + (index + 1)}</li>`;
    });
    
    html += `
            </ul>
        </div>
    `;
    
    visualizationDiv.innerHTML = html;
}

// Example usage with a simple linked list
const exampleCode = `
void debug_point(Node* head) {
    // Visualization hook
}

int main() {
    Node* head = new Node(10);
    head->next = new Node(20);
    head->next->next = new Node(30);
    head->next->next->next = new Node(40);
    
    debug_point(head);
    
    return 0;
}
`;

document.getElementById('cppCode').value = exampleCode;
