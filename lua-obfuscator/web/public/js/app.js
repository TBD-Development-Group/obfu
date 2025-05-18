document.addEventListener('DOMContentLoaded', () => {
    const inputEditor = CodeMirror.fromTextArea(document.getElementById('input'), {
        mode: 'lua',
        theme: 'dracula',
        lineNumbers: true
    });
    
    const outputEditor = CodeMirror.fromTextArea(document.getElementById('output'), {
        mode: 'lua',
        theme: 'dracula',
        lineNumbers: true,
        readOnly: true
    });
    
    document.getElementById('obfuscate').addEventListener('click', async () => {
        const code = inputEditor.getValue();
        const executor = document.getElementById('executor').value;
        const level = document.getElementById('level').value;
        
        if (!code.trim()) {
            alert('Please enter some Lua code');
            return;
        }
        
        try {
            const response = await fetch('/obfuscate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code, executor, level })
            });
            
            const result = await response.json();
            
            if (result.success) {
                outputEditor.setValue(result.obfuscated);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Failed to obfuscate: ' + error.message);
        }
    });
    
    document.getElementById('copy').addEventListener('click', () => {
        const output = outputEditor.getValue();
        if (output) {
            navigator.clipboard.writeText(output);
            alert('Copied to clipboard!');
        }
    });
    
    document.getElementById('download').addEventListener('click', () => {
        const output = outputEditor.getValue();
        if (output) {
            const blob = new Blob([output], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'obfuscated.lua';
            a.click();
            URL.revokeObjectURL(url);
        }
    });
});
