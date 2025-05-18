const crypto = require('crypto');

function encryptString(str) {
    const key = crypto.randomBytes(8).toString('hex');
    let encrypted = '';
    for (let i = 0; i < str.length; i++) {
        encrypted += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return {
        encrypted: Buffer.from(encrypted).toString('base64'),
        key: key
    };
}

function encrypt(ast) {
    function traverse(node) {
        if (!node) return;
        
        if (node.type === 'StringLiteral') {
            const { encrypted, key } = encryptString(node.value);
            node._encrypted = encrypted;
            node._decryptionKey = key;
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
    
    // Add decryption function
    if (ast.body && ast.body.length > 0) {
        const decryptFunc = {
            type: 'LocalStatement',
            variables: [{ type: 'Identifier', name: '_decrypt' }],
            init: [{
                type: 'FunctionExpression',
                parameters: [
                    { type: 'Identifier', name: 'str' },
                    { type: 'Identifier', name: 'key' }
                ],
                body: {
                    type: 'BlockStatement',
                    body: [
                        {
                            type: 'LocalStatement',
                            variables: [{ type: 'Identifier', name: 'result' }],
                            init: [{
                                type: 'CallExpression',
                                base: { type: 'Identifier', name: 'string' },
                                arguments: [{
                                    type: 'StringLiteral',
                                    value: ''
                                }]
                            }]
                        },
                        {
                            type: 'ForNumericStatement',
                            variable: { type: 'Identifier', name: 'i' },
                            start: { type: 'NumericLiteral', value: 1 },
                            end: {
                                type: 'CallExpression',
                                base: { type: 'Identifier', name: 'string' },
                                arguments: [
                                    { type: 'Identifier', name: 'str' }
                                ]
                            },
                            step: { type: 'NumericLiteral', value: 1 },
                            body: {
                                type: 'BlockStatement',
                                body: [
                                    {
                                        type: 'AssignmentStatement',
                                        variables: [{ type: 'Identifier', name: 'result' }],
                                        init: [{
                                            type: 'BinaryExpression',
                                            operator: '..',
                                            left: { type: 'Identifier', name: 'result' },
                                            right: {
                                                type: 'CallExpression',
                                                base: { type: 'Identifier', name: 'string' },
                                                arguments: [
                                                    {
                                                        type: 'BinaryExpression',
                                                        operator: '~',
                                                        left: {
                                                            type: 'CallExpression',
                                                            base: { type: 'Identifier', name: 'string' },
                                                            arguments: [
                                                                { type: 'Identifier', name: 'str' },
                                                                { type: 'Identifier', name: 'i' }
                                                            ]
                                                        },
                                                        right: {
                                                            type: 'CallExpression',
                                                            base: { type: 'Identifier', name: 'string' },
                                                            arguments: [
                                                                { type: 'Identifier', name: 'key' },
                                                                {
                                                                    type: 'BinaryExpression',
                                                                    operator: '%',
                                                                    left: { type: 'Identifier', name: 'i' },
                                                                    right: {
                                                                        type: 'CallExpression',
                                                                        base: { type: 'Identifier', name: 'string' },
                                                                        arguments: [
                                                                            { type: 'Identifier', name: 'key' }
                                                                        ]
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }]
                                    }
                                ]
                            }
                        },
                        {
                            type: 'ReturnStatement',
                            arguments: [{ type: 'Identifier', name: 'result' }]
                        }
                    ]
                }
            }]
        };
        
        ast.body.unshift(decryptFunc);
    }
}

module.exports = { encrypt };
