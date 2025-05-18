const crypto = require('crypto');

function generateRandomName() {
    return '_' + crypto.randomBytes(4).toString('hex');
}

function transform(ast) {
    const variableMap = new Map();
    
    function traverse(node) {
        if (!node) return;
        
        // Handle variable declarations
        if (node.type === 'LocalStatement' || node.type === 'GlobalStatement') {
            for (const variable of node.variables) {
                if (variable.type === 'Identifier') {
                    const newName = generateRandomName();
                    variableMap.set(variable.name, newName);
                    variable.name = newName;
                }
            }
        }
        
        // Handle variable references
        if (node.type === 'Identifier' && variableMap.has(node.name)) {
            node.name = variableMap.get(node.name);
        }
        
        // Traverse child nodes
        for (const key in node) {
            if (node[key] && typeof node[key] === 'object') {
                if (Array.isArray(node[key])) {
                    for (const child of node[key]) {
                        traverse(child);
                    }
                } else {
                    traverse(node[key]);
                }
            }
        }
    }
    
    traverse(ast);
    
    // Add proxy table at the beginning
    if (ast.body && ast.body.length > 0) {
        const proxyTable = {
            type: 'LocalStatement',
            variables: [{ type: 'Identifier', name: '_G' }],
            init: [{
                type: 'TableConstructorExpression',
                fields: []
            }]
        };
        
        ast.body.unshift(proxyTable);
    }
}

module.exports = { transform };
