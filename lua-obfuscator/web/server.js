const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const obfuscator = require('../core/obfuscator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/obfuscate', (req, res) => {
    try {
        const { code, executor, level } = req.body;
        const obfuscated = obfuscator.obfuscate(code, executor, level);
        res.json({ success: true, obfuscated });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
