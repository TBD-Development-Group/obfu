function flatten(ast) {
    // This is a simplified version - real implementation would be more complex
    function isSuitableForFlattening(node) {
        return node.type === 'IfStatement' || 
               node.type === 'WhileStatement' || 
               node.type === 'ForNumericStatement' ||
               node.type === 'ForGenericStatement';
    }
    
    function traverse(node) {
        if (!node) return;
        
        if (isSuitableForFlattening(node)) {
            // Convert to switch-based control flow
            node._flattened = true;
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

module.exports = { flatten };
