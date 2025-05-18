const luaparse = require('luaparse');
const escodegen = require('escodegen');
const controlFlow = require('./transformers/controlFlow');
const stringEncryption = require('./transformers/stringEncryption');
const variableProxy = require('./transformers/variableProxy');
const deadCode = require('./transformers/deadCode');
const executors = require('./executors');

function obfuscate(code, executor, level) {
    // Parse the Lua code into AST
    let ast;
    try {
        ast = luaparse.parse(code);
    } catch (error) {
        throw new Error(`Failed to parse Lua: ${error.message}`);
    }

    // Apply basic transformations (all levels)
    variableProxy.transform(ast);
    controlFlow.flatten(ast);
    
    // Medium level adds string encryption
    if (level === 'medium' || level === 'high' || level === 'extreme') {
        stringEncryption.encrypt(ast);
    }
    
    // High level adds dead code
    if (level === 'high' || level === 'extreme') {
        deadCode.inject(ast);
    }
    
    // Extreme level adds executor-specific transformations
    if (level === 'extreme' && executors[executor]) {
        executors[executor].transform(ast);
    }
    
    // Generate obfuscated code
    let obfuscatedCode = escodegen.generate(ast);
    
    // Apply executor-specific post-processing
    if (executors[executor]) {
        obfuscatedCode = executors[executor].postProcess(obfuscatedCode);
    }
    
    return obfuscatedCode;
}

module.exports = { obfuscate };
