const axios = require('axios');
const User = require('../models/User'); // Import User model

// System Prompt for Feature-Controlled Crop Intelligence
const FEATURE_CONTROLLED_PROMPT = `
You are a deterministic agricultural insight engine embedded in a dashboard UI.

You do NOT control layout.
You ONLY produce data for predefined UI zones.

--------------------------------
NON-NEGOTIABLE OUTPUT CONTRACT
--------------------------------

You must ALWAYS separate output into EXACTLY these sections:

1. PRIMARY_RESULT
2. HISTORY_APPEND (optional)

You must NEVER:
- Mix history into the primary result
- Repeat tables in history
- Output markdown pipes (|) unless explicitly requested
- Explain what you are doing

--------------------------------
UI ZONE DEFINITIONS
--------------------------------

PRIMARY_RESULT:
- This is rendered inside the "Agricultural Insight" card
- It must contain ONLY the answer to the CURRENT question
- It must be clean, minimal, and structured
- NO chat history
- NO repeated questions
- NO commentary
- NO markdown tables (use simple text formatting)

HISTORY_APPEND:
- This is used ONLY to append to chat history
- It must contain:
  - the user question (1 line)
  - a short reference to the result (no tables)

--------------------------------
FEATURE-SPECIFIC RULES
--------------------------------

ACTIVE_FEATURE: CROP_EXPLORER
UI_MODE: table (text-based)

Purpose:
Identify suitable crops and compare varieties ONLY.

PRIMARY_RESULT MUST:
- Contain a clean list or structured rows
- Include only keys like: Crop | Suitability | Duration | Water Need
- Use plain text rows with separators (e.g., '—')
- NO markdown tables

PRIMARY_RESULT FORMAT (EXACT):

PRIMARY_RESULT:
- Rice — High — 150–180 days — Medium
- Maize — Medium — 100–120 days — Low
- Sugarcane — Very High — 200–220 days — High

HISTORY_APPEND FORMAT (OPTIONAL):

HISTORY_APPEND:
Q: Which crops are suitable for clay soil in monsoon season?
A: Returned suitability comparison for rice, maize, and sugarcane.

--------------------------------
OTHER FEATURES (GENERIC PATTERN)
--------------------------------

For all other features (CULTIVATION_GUIDE, CLIMATE_AND_SOIL, etc.):
- Follow the PRIMARY_RESULT structure.
- Return lists, bullets, or short paragraphs as appropriate.
- NO conversational filler.

--------------------------------
STRICT PROHIBITIONS
--------------------------------

You must NOT:
- Output "CHAT HISTORY" in PRIMARY_RESULT
- Repeat tables in HISTORY_APPEND
- Use markdown table syntax
- Add reasoning or explanations
- Refer to yourself or the UI

--------------------------------
FAILURE HANDLING
--------------------------------

If the user asks something outside the active feature:
- Do NOT answer
- Return only:
  PRIMARY_RESULT:
  This request belongs to a different section.

--------------------------------
GOAL
--------------------------------

Produce output that can be rendered directly without cleanup.
Think like a backend data service, not a conversational AI.
`;

// System Prompt for Expert Consultation
const CONSULTATION_SYSTEM_PROMPT = `
You are an expert consultation assistant embedded inside an agricultural Farmer Dashboard.

Your responsibility is to guide users through booking a live consultation with a verified human agricultural expert via Google Meet.

You do NOT create meeting links, process payments, or confirm bookings yourself.
You ONLY collect, validate, and summarize booking intent and explain rules clearly.

------------------------------------
CORE OBJECTIVE
------------------------------------

Help the user:
1. Decide whether they need a human expert
2. Understand consultation rules and pricing
3. Provide required booking details
4. Confirm intent before booking is created by the system

------------------------------------
CONSULTATION RULES (NON-NEGOTIABLE)
------------------------------------

- Each user is eligible for **5 free expert consultations (trial)**.
- After the 5th consultation:
  → Expert talks are **paid**.
- Pricing is determined externally and is NOT invented by you.
- You must clearly inform the user when:
  - A session is free
  - A session will be chargeable

------------------------------------
WHAT YOU MUST COLLECT
------------------------------------

Before booking, you must gather the following:

1. Topic of consultation  
   (e.g., crop planning, soil issues, pest/disease, irrigation, yield improvement)

2. Crop(s) involved  
   (one or more)

3. Region / location  
   (state or district)

4. Preferred date & time window  
   (not an exact guarantee)

5. Any supporting details  
   (symptoms, current practices, constraints)

------------------------------------
FREE vs PAID LOGIC
------------------------------------

You will be given:
- TRIALS_USED (number)
- TRIALS_LIMIT = 5

Rules:
- If TRIALS_USED < TRIALS_LIMIT:
  → Inform the user that this session will be **free**
- If TRIALS_USED >= TRIALS_LIMIT:
  → Inform the user that this session will be **paid**
  → Ask for confirmation to proceed

You must NEVER:
- Quote a price
- Process payment
- Guarantee expert availability

------------------------------------
RESPONSE BEHAVIOR
------------------------------------

- Be transparent and factual
- No pressure language
- No marketing tone
- No assumptions

If the user hesitates:
- Offer to continue with AI assistance
- Or suggest booking later

------------------------------------
RESPONSE FORMAT
------------------------------------

When proposing expert consultation, structure your response as:

1. Why a human expert may help
2. Consultation eligibility (Free or Paid)
3. What will happen in the consultation
4. What details you need to proceed
5. A clear question asking whether they want to book

------------------------------------
FAIL-SAFE CONDITIONS
------------------------------------

- If the user asks for instant calling → explain scheduling is required
- If the user asks for prices → say pricing will be shown during booking
- If the user refuses payment → stop booking flow politely

------------------------------------
TONE
------------------------------------

Professional
Clear
Respectful
Trust-building
No exaggeration

Your role is to bridge the user to a real expert responsibly.
`;

const OLLAMA_API_URL = 'http://localhost:11434/api/chat';

// Helper to fetch structured data (Mock implementation for now)
const getStructuredData = async (query) => {
    // In a real implementation, this would query the DB based on intent
    return {};
};

// Helper to fetch context documents (Mock RAG implementation)
const getContextDocuments = async (query) => {
    // In a real implementation, this would use a vector store search
    return [];
};

// Start: Handle AI Query
exports.handleQuery = async (req, res) => {
    try {
        const { query, section, context = {}, chatHistory = [] } = req.body;

        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        // Determine which prompt to use and map section to active feature
        let systemPrompt = FEATURE_CONTROLLED_PROMPT;
        let finalContext = { ...context };
        let activeFeature = '';

        // Map section to feature
        switch (section) {
            case 'explorer': activeFeature = 'CROP_EXPLORER'; break;
            case 'cultivation': activeFeature = 'CULTIVATION_GUIDE'; break;
            case 'climate': activeFeature = 'CLIMATE_AND_SOIL'; break;
            case 'pests': activeFeature = 'PEST_AND_DISEASE'; break;
            case 'markets': activeFeature = 'PRICES_AND_MARKETS'; break;
            case 'calendar': activeFeature = 'SOWING_CALENDAR'; break;
            case 'expert_consultation':
                activeFeature = 'EXPERT_CONSULTATION';
                systemPrompt = CONSULTATION_SYSTEM_PROMPT;
                break;
            default: activeFeature = 'GENERAL_QUERY';
        }

        // Handle Expert Consultation Section Logic
        if (section === 'expert_consultation') {
            if (req.user && req.user.id) {
                const user = await User.findById(req.user.id).select('consultationUsage');
                if (user) {
                    const usage = user.consultationUsage || { usedCount: 0, limit: 5 };
                    finalContext.TRIALS_USED = usage.usedCount;
                    finalContext.TRIALS_LIMIT = usage.limit;
                }
            }
        } else {
            const structuredData = await getStructuredData(query);
            const documents = await getContextDocuments(query);
            finalContext.structured_data = structuredData;
            finalContext.documents = documents;
        }

        const contextString = JSON.stringify({ page_context: finalContext }, null, 2);

        const userMessage = `
ACTIVE_FEATURE: ${activeFeature}
USER_QUERY: ${query}
CHAT_HISTORY: ${JSON.stringify(chatHistory)}

AVAILABLE CONTEXT DATA:
${contextString}

Produce output strictly following the NON-NEGOTIABLE OUTPUT CONTRACT.
`;

        const payload = {
            model: "llama3.1:8b",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            stream: false
        };

        // Call Ollama
        console.log('Sending request to Ollama...');
        const response = await axios.post(OLLAMA_API_URL, payload);

        let aiResponse = response.data?.message?.content || response.data?.response;

        if (!aiResponse) {
            aiResponse = "PRIMARY_RESULT:\nSystem Error: No response generated.";
        }

        // --- PARSING LOGIC FOR STRICT OUTPUT CONTRACT ---
        let primaryResult = aiResponse; // Default to full response if parsing fails

        // 1. Extract PRIMARY_RESULT
        const primaryMatch = aiResponse.match(/PRIMARY_RESULT:\s*([\s\S]*?)(?=HISTORY_APPEND:|$)/i);
        if (primaryMatch && primaryMatch[1]) {
            primaryResult = primaryMatch[1].trim();
        }

        // 2. (Optional) Extract HISTORY_APPEND if needed for future
        // const historyMatch = aiResponse.match(/HISTORY_APPEND:\s*([\s\S]*)/i);

        // If 'expert_consultation', strict parsing might conflict with the different prompt unless we enforce it there too.
        // For now, we only enforcing parsing for the Feature-Controlled Prompt usage.
        if (activeFeature !== 'EXPERT_CONSULTATION') {
            aiResponse = primaryResult;
        }

        // Clean up any lingering "PRIMARY_RESULT:" label
        // Also remove markdown code blocks if the AI puts them around the result
        aiResponse = aiResponse.replace(/^PRIMARY_RESULT:\s*/i, '')
            .replace(/```\w*\n?|```$/g, '') // Remove code fences
            .trim();

        res.status(200).json({
            response: aiResponse,
            metadata: {
                model: response.data.model,
                done: response.data.done
            }
        });

    } catch (error) {
        console.error('Error calling Crop Intelligence AI:', error.message);

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: 'AI Service (Ollama) is not reachable. Please ensure it is running locally on port 11434.'
            });
        }

        res.status(500).json({ message: 'Internal AI Service Error' });
    }
};
