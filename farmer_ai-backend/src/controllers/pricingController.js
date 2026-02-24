const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const llmService = require('../utils/llmService');

exports.suggestPrice = async (req, res) => {
    try {
        const { category, productType, unit } = req.body;

        if (!category || !productType || !unit) {
            return res.status(400).json({ message: 'Missing required fields: category, productType, unit' });
        }

        // Correct path to the ml directory depending on where the server.js is running from.
        // Usually server is run from the root of backend.
        const scriptPath = path.join(__dirname, '../../ml/predict_price.py');

        // Intelligently find the local virtual environment Python executable, or fallback to global Python
        let pythonExecutable = 'python';
        const venvWinPath = path.join(__dirname, '../../../.venv/Scripts/python.exe');
        const venvUnixPath = path.join(__dirname, '../../../.venv/bin/python');

        if (fs.existsSync(venvWinPath)) {
            pythonExecutable = venvWinPath;
        } else if (fs.existsSync(venvUnixPath)) {
            pythonExecutable = venvUnixPath;
        }

        const pythonProcess = spawn(pythonExecutable, [
            scriptPath,
            category,
            productType,
            unit
        ]);

        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0 && !resultData) {
                console.error(`Python script error (${code}):`, errorData);
                return res.status(500).json({ message: 'Failed to generate price suggestion.', error: errorData });
            }

            try {
                // Parse the JSON output from the python script, ignoring any other print outputs
                // which might occur before or after the {} braces (e.g. warnings)
                const jsonMatch = resultData.match(/\{.*\}/s);
                if (!jsonMatch) {
                    throw new Error('No JSON object found in output');
                }
                const result = JSON.parse(jsonMatch[0]);
                if (result.error) {
                    return res.status(500).json({ message: result.error });
                }
                res.json(result);
            } catch (parseError) {
                console.error('Failed to parse Python script output:', resultData);
                res.status(500).json({ message: 'Invalid response from pricing model.', details: resultData });
            }
        });

    } catch (error) {
        console.error('Price suggestion error:', error);
        res.status(500).json({ message: 'Server error generating price suggestion.' });
    }
};

exports.generateDescription = async (req, res) => {
    try {
        const { productType, keywords } = req.body;

        if (!productType) {
            return res.status(400).json({ message: 'Missing product type for generation.' });
        }

        const systemPrompt = `You are an expert agricultural marketing copywriter in India. \
Write a compelling, SEO-friendly, and highly persuasive product description for an agricultural product being sold on a digital marketplace by a local vendor to Indian farmers. \
Make it professional but accessible. Highlight benefits like yield, quality, and reliability. \
Respond ONLY with the generated description text, no conversational filler or markdown formatting. Keep it to 2-3 short paragraphs maximum.`;

        const userPrompt = `Product Type: ${productType}\nAdditional Keywords/Details: ${keywords || 'None provided'}`;

        const description = await llmService.generateText(systemPrompt, userPrompt);

        res.json({ description: description.trim() });
    } catch (error) {
        console.error('Description generation error:', error);
        res.status(500).json({ message: 'Server error generating product description.' });
    }
};
