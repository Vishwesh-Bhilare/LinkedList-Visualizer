const RAPIDAPI_KEY = '373fb61f6fmsh3597c1cb250ac60p1076f0jsn2019b5dda2f9';
const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions';

async function compileAndVisualize() {
    const cppCode = document.getElementById('cppCode').value;
    const outputDiv = document.getElementById('output');
    const visualizationDiv = document.getElementById('visualization');
    
    outputDiv.innerHTML = '<div class="loading">🔄 Compiling your code...</div>';
    visualizationDiv.innerHTML = '<div class="loading">🔄 Preparing visualization...</div>';

    try {
        // Enhance code with debugging output
        const enhancedCode = enhanceCodeWithDebugging(cppCode);
        
        // Submit to Judge0 API via RapidAPI
        const submission = await submitToJudge0(enhancedCode);
        
        // Get the result
        const result = await getSubmissionResult(submission.token);
        
        if (result.stdout) {
            outputDiv.innerHTML = `<div class="success">✅ Compilation Successful!</div>
                                  <pre>${result.stdout}</pre>`;
            const nodes = parseOutput(result.stdout);
            visualizeLinkedList(nodes);
        } else if (result.stderr) {
            outputDiv.innerHTML = `<div class="error">❌ Compilation Error:</div>
                                  <pre>${result.stderr}</pre>`;
            visualizationDiv.innerHTML = '<div class="error">Visualization failed due to compilation errors</div>';
        } else if (result.compile_output) {
            outputDiv.innerHTML = `<div class="error">❌ Compilation Error:</div>
                                  <pre>${result.compile_output}</pre>`;
            visualizationDiv.innerHTML = '<div class="error">Visualization failed due to compilation errors</div>';
        } else {
            outputDiv.innerHTML = '<div class="error">❌ No output received from compiler</div>';
            visualizationDiv.innerHTML = '<div class="error">Visualization failed</div>';
        }
        
    } catch (error) {
        outputDiv.innerHTML = `<div class="error">❌ API Error: ${error.message}</div>`;
        visualizationDiv.innerHTML = '<div class="error">Visualization failed</div>';
        console.error('API Error:', error);
    }
}

async function submitToJudge0(code) {
    const response = await fetch(JUDGE0_URL, {
        method: 'POST',
        headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            source_code: code,
            language_id: 54, // C++ language ID
            compiler_options: '-g -O0', // Enable debugging, disable optimizations
            stdin: '',
            redirect_stderr_to_stdout: true
        })
    });
    
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
}

async function getSubmissionResult(token) {
    // Wait a bit for compilation to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await fetch(`${JUDGE0_URL}/${token}`, {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to get result: ${response.status}`);
    }
    
    return await response.json();
}

function enhanceCodeWithDebugging(originalCode) {
    return `#include <iostream>
#include <cstdio>

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

void debug_point(Node* head) {
    Node* current = head;
    int count = 0;
    
    // Output format that our parser understands
    printf("=== DEBUG OUTPUT ===\\n");
    while (current != nullptr) {
        printf("NODE_%d: data=%d next=%p\\n", count, current->data, current->next);
        current = current->next;
        count++;
    }
    printf("TOTAL_NODES: %d\\n", count);
    printf("===================\\n");
}

${originalCode}
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
            <div class="error">❌ No linked list nodes found in output.</div>
            <p>Make sure your code:</p>
            <ul>
                <li>Includes the <code>debug_point(Node* head)</code> function call</li>
                <li>Creates a linked list with the Node structure</li>
                <li>Has proper memory allocation</li>
            </ul>
            <p>Check the compilation output above for any errors.</p>
        `;
        return;
    }
    
    let html = `
        <div class="success">✅ Found ${nodes.length} nodes in the linked list!</div>
        <h3>📊 Linked List Visualization</h3>
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

// Pre-fill with example code
const exampleCode = `#include <iostream>

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

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
}`;

document.getElementById('cppCode').value = exampleCode;
