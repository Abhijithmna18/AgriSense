```javascript
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

function checkRest() {
    console.log("Querying Gemini Models API...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                fs.writeFileSync('models_list.txt', "Error: " + JSON.stringify(json.error));
                return;
            }
            const models = json.models
                .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name);

            fs.writeFileSync('models_list.txt', models.join('\n'));
            console.log("Written to models_list.txt");
        } catch (e) {
            fs.writeFileSync('models_list.txt', "Parse Error: " + e.message + " Raw: " + data);
        }
    });
}).on('error', (err) => {
    fs.writeFileSync('models_list.txt', "Net Error: " + err.message);
});
}

checkRest();
```
