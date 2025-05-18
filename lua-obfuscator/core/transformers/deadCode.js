const crypto = require('crypto');

function generateRandomExpression() {
    const types = ['numeric', 'string', 'boolean', 'nil', 'table'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    switch (type) {
        case 'numeric':
            return {
                type: 'NumericLiteral',
                value: Math.floor(Math.random() * 1000)
            };
        case 'string':
            return {
                type: 'StringLiteral',
                value: crypto.randomBytes(4).toString('hex')
            };
        case 'boolean':
            return {
                type: 'BooleanLiteral',
                value: Math.random() > 0.5
            };
        case 'nil':
            return {
                type: 'NilLiteral'
            };
        case 'table':
            return {
                type: 'TableConstructorExpression',
                fields: []
            };
    }
}

function inject(ast) {
    function traverse(node) {
        if (!node) return;
        
        // Inject dead code in block statements
        if (node.type === 'BlockStatement' && node.body && node.body.length > 0) {
            // Add random dead code at the beginning
            const deadCode = {
                type: 'IfStatement',
                clauses: [{
                    type: 'IfClause',
                    condition: {
                        type: 'BooleanLiteral',
                        value: false
                    },
                    body: {
                        type: 'BlockStatement',
                        body: [
                            {
                                type: 'CallStatement',
                                expression: {
                                    type: 'CallExpression',
                                    base: { type: 'Identifier', name: 'print' },
                                    arguments: [generateRandomExpression()]
                                }
                            }
                        ]
                    }
                }]
            };
            
            node.body.unshift(deadCode);
            
            // Add random dead code at the end
            node.body.push({
                type: 'LocalStatement',
                variables: [{ 
                    type: 'Identifier', 
                    name: '_' + crypto.randomBytes(3).toString('hex') 
                }],
                init: [generateRandomExpression()]
            });
        }
        
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
}

module.exports = { inject };
