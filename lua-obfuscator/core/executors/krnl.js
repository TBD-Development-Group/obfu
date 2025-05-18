module.exports = {
    transform: function(ast) {
        // KRNL-specific transformations
        if (ast.body && ast.body.length > 0) {
            const check = {
                type: 'IfStatement',
                clauses: [{
                    type: 'ElseifClause',
                    condition: {
                        type: 'BinaryExpression',
                        operator: '~=',
                        left: {
                            type: 'CallExpression',
                            base: { type: 'Identifier', name: 'getrenv' },
                            arguments: []
                        },
                        right: {
                            type: 'Identifier',
                            name: '_G'
                        }
                    },
                    body: {
                        type: 'BlockStatement',
                        body: [{
                            type: 'ReturnStatement',
                            arguments: []
                        }]
                    }
                }]
            };
            
            ast.body.unshift(check);
        }
    },
    
    postProcess: function(code) {
        // Add KRNL-specific patterns
        return `-- KRNL Protected\n${code}`;
    }
};
