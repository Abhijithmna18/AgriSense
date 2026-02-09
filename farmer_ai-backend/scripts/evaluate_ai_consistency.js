/**
 * AI Engine Consistency Evaluation Suite
 * 
 * Usage: node scripts/evaluate_ai_consistency.js
 * 
 * This script runs the Crop Cycle Profitability & Risk Engine (Ollama)
 * multiple times with the same input to measure:
 * 1. JSON Validity
 * 2. Schema Compliance
 * 3. Deterministic Consistency (Variance)
 * 4. Latency
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:5002/api/decision-support/analyze';
const ITERATIONS = 5; // How many times to run the same prompt
const ARGS_TOKEN = process.argv[2]; // Get token from command line if provided
const MOCK_TOKEN = ARGS_TOKEN || 'test_token_placeholder';

// Test Case 1: Standard Wheat Crop (Rabi Season)
const TEST_CASE_WHEAT = {
    farmDetails: {
        location: "Punjab, India",
        soil: "Loamy",
        irrigation: "Tube Well",
        area_acres: 5
    },
    cropDetails: {
        crop_id: "Wheat-HD3086",
        season: "Rabi"
    },
    historicalYield: {
        avg_yield_per_acre: "20 quintals",
        last_year_yield: "18 quintals"
    },
    marketPrice: {
        current: 2275,
        unit: "quintal"
    },
    weatherIndicators: {
        forecast: "Normal winter rains expected",
        risk: "Low"
    },
    constraints: {
        budget: 50000,
        risk_tolerance: "Medium"
    }
};

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    bold: "\x1b[1m"
};

async function getAuthToken() {
    // Helper to login and get token
    const testUser = {
        email: 'ai_tester_' + Date.now() + '@test.com', // Unique email each run to avoid conflict if cleanup fails
        password: 'Password123!',
        firstName: 'AI',
        lastName: 'Tester',
        phone: '9999999999'
    };

    try {
        // 1. Try to Register first (simpler than checking if exists)
        try {
            await axios.post('http://localhost:5002/api/auth/register', testUser);
            // If register success, we might need to verify email or just login if verification is loose.
            // Assuming strict verification, we'd be stuck. 
            // BUT, usually local dev allows login or we can use a known seed user.

            // Let's try to login immediately. If verify is required, this might fail.
            // If so, we need a "bypass" or a pre-verified user.
        } catch (regError) {
            // Ignore if user already exists
            if (regError.response && regError.response.status !== 400) {
                console.warn("Registration warning:", regError.message);
            }
        }

        // 2. Login
        const login = await axios.post('http://localhost:5002/api/auth/login', {
            email: testUser.email,
            password: testUser.password
        });
        return login.data.token;

    } catch (e) {
        console.warn(colors.yellow + "Warning: Auto-login failed. Trying hardcoded fallback..." + colors.reset);
        console.warn("Reason:", e.response?.data?.message || e.message);

        // Fallback: Try a known user if the dynamic one failed (e.g. if email verification blocks it)
        try {
            // Try a user that might have been manually created
            const known = await axios.post('http://localhost:5002/api/auth/login', {
                email: 'farmer@test.com',
                password: 'password123'
            });
            return known.data.token;
        } catch (e2) {
            return MOCK_TOKEN;
        }
    }
}

async function runEvaluation() {
    console.log(colors.bold + "\n🌱 Crop Cycle Engine Evaluation Suite v1.0" + colors.reset);
    console.log("Target Endpoint:", API_URL);
    console.log("Iterations:", ITERATIONS);

    // 1. Get Token
    const token = await getAuthToken();
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const results = [];
    let successes = 0;
    let failures = 0;

    console.log(colors.blue + "\n[Phase 1] Execution Phase" + colors.reset);

    for (let i = 1; i <= ITERATIONS; i++) {
        process.stdout.write(`Run ${i}/${ITERATIONS}: `);
        const startTime = Date.now();

        try {
            const response = await axios.post(API_URL, TEST_CASE_WHEAT, { headers });
            const duration = Date.now() - startTime;

            if (response.data.success) {
                console.log(colors.green + `SUCCESS (${duration}ms)` + colors.reset);
                results.push({
                    iteration: i,
                    duration,
                    data: response.data.data
                });
                successes++;
            } else {
                console.log(colors.red + `FAILED (API Error)` + colors.reset);
                failures++;
            }
        } catch (error) {
            const duration = Date.now() - startTime;
            console.log(colors.red + `ERROR (${duration}ms): ${error.message}` + colors.reset);
            if (error.response) {
                console.log("Response data:", error.response.data);
            }
            failures++;
        }
    }

    // 2. Analysis Phase
    console.log(colors.blue + "\n[Phase 2] Analysis Phase" + colors.reset);

    if (results.length === 0) {
        console.log(colors.red + "No successful results to analyze." + colors.reset);
        return;
    }

    // A. Schema Check
    const sample = results[0].data;
    const requiredKeys = ['summary', 'yield_estimation', 'cost_estimation', 'revenue_projection', 'profitability', 'risk_analysis', 'recommendations'];
    const missingKeys = requiredKeys.filter(k => !sample[k]);

    if (missingKeys.length === 0) {
        console.log(colors.green + "✔ Schema Validation Passed (All root keys present)" + colors.reset);
    } else {
        console.log(colors.red + "✘ Schema Validation Failed. Missing keys: " + missingKeys.join(', ') + colors.reset);
    }

    // B. Consistency Check (Variance)
    // We'll check 'estimated_profit' variance
    const profits = results.map(r => r.data.profitability?.expected_profit || 0);
    const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
    const variance = profits.map(p => Math.pow(p - avgProfit, 2)).reduce((a, b) => a + b, 0) / profits.length;
    const stdDev = Math.sqrt(variance);

    console.log("\nconsistency Metrics (Profitability):");
    console.log(`Values: [${profits.join(', ')}]`);
    console.log(`Average: ${avgProfit.toFixed(2)}`);
    console.log(`Std Dev: ${stdDev.toFixed(2)}`);

    if (stdDev === 0) {
        console.log(colors.green + "✔ PERFECT DETERMINISM (Zero Variance)" + colors.reset);
    } else if (stdDev < (avgProfit * 0.05)) {
        console.log(colors.green + "✔ High Consistency (<5% deviation)" + colors.reset);
    } else {
        console.log(colors.yellow + "⚠ High Variance (Review deterministic prompts)" + colors.reset);
    }

    // C. Risk Score Check
    const risks = results.map(r => r.data.risk_analysis?.overall_risk_score || 0);
    console.log("Risk Scores:", risks.join(', '));

    // Summary
    console.log(colors.bold + "\n📋 Final Report" + colors.reset);
    console.log(`Total Runs: ${ITERATIONS}`);
    console.log(`Success Rate: ${((successes / ITERATIONS) * 100).toFixed(1)}%`);
    console.log(`Avg Latency: ${(results.reduce((a, b) => a + b.duration, 0) / results.length).toFixed(0)}ms`);

}

runEvaluation();
