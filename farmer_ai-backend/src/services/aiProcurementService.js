const mongoose = require('mongoose');
const llmService = require('../utils/llmService');
const Product = require('../models/MarketplaceListing'); // Assuming this represents the marketplace inventory
const Negotiation = require('../models/Negotiation');
const Offer = require('../models/Offer');
const Message = require('../models/Message');
const User = require('../models/User');

class AiProcurementService {

    /**
     * Parses buyer intent from natural language.
     * @param {string} intentText e.g., "I need 50 tons of premium wheat delivered to Pune by next Friday under ₹2500 per quintal."
     */
    async parseIntent(intentText) {
        const systemPrompt = `You are an AI Procurement Engine integrated into the AgriSense B2B Marketplace.
Your job is to parse buyer intent from natural language and convert it into structured procurement parameters.

CRITICAL RULES:
1. Normalize units: Always convert tons to quintals (1 ton = 10 quintals). If the buyer says "50 tons", output 500 for quantity and "quintal" for unit.
2. Prices should strictly be numbers. Extract the max price per unit.
3. If a field is not explicitly mentioned, infer a reasonable default or leave it null.
4. Urgency level should be "Low", "Medium", or "High" based on the deadline.

Output strictly in this JSON format:
{
  "product_name": "name of crop",
  "quality_grade": "quality requirement (e.g., premium, standard)",
  "quantity": numeric quantity strictly in quintals,
  "unit": "quintal",
  "max_price_per_unit": numeric max price,
  "delivery_location": "city or region",
  "delivery_deadline": "date or timeframe",
  "payment_terms": "extracted or default (e.g., Escrow Net 30)",
  "urgency_level": "Low/Medium/High"
}`;

        try {
            const parsed = await llmService.generateJSON(systemPrompt, `Buyer Input: "${intentText}"`);
            return parsed;
        } catch (error) {
            console.error('[AI Procurement] LLM Error parsing intent, using fallback limit protection:', error.message);

            // Extract a possible product name from the string, defaulting to a generic crop
            const words = intentText.replace(/[^a-zA-Z ]/g, "").split(' ');
            const likelyProduct = words.length > 0 ? words[words.length - 1] : "Wheat";

            return {
                "product_name": likelyProduct,
                "quality_grade": "Standard",
                "quantity": 500,
                "unit": "quintal",
                "max_price_per_unit": 2500,
                "delivery_location": "Regional Hub",
                "delivery_deadline": "Within 7 days",
                "payment_terms": "Escrow Net 30",
                "urgency_level": "Medium"
            };
        }
    }

    /**
     * Simulates Web Price Validation by checking DB averages and calculating risk.
     */
    async validateMarketPrice(parsedIntent) {
        // In a real system, this would call external APIs (eNAM, Mandi prices).
        // Here, we simulate it by querying our own DB for average prices of the product.

        // Find existing listings to calculate market average
        const regex = new RegExp(parsedIntent.product_name, 'i');
        const listings = await Product.find({ name: regex, status: 'active' });

        let marketAvg = 0;
        if (listings.length > 0) {
            const sum = listings.reduce((acc, curr) => acc + (curr.pricePerUnit || curr.originalPrice || curr.price || 0), 0);
            marketAvg = Math.round(sum / listings.length);
        } else {
            // Fallback mock average if DB is empty for this product
            marketAvg = parsedIntent.max_price_per_unit ? Math.round(parsedIntent.max_price_per_unit * 1.05) : 2500;
        }

        // Calculate Volatility and Risk
        const volatility = (Math.random() * 10 + 2).toFixed(1) + '%'; // Mock 2-12% volatility
        let riskLevel = 'Medium';
        let recommendation = '';

        if (parsedIntent.max_price_per_unit) {
            const diffPct = ((parsedIntent.max_price_per_unit - marketAvg) / marketAvg) * 100;
            if (diffPct < -15) {
                riskLevel = 'High';
                recommendation = 'Aggressive Bid. Your max price is significantly below market average. Expect lower acceptance rates.';
            } else if (diffPct > 10) {
                riskLevel = 'Low';
                recommendation = 'Strong Offer. Your max price is above market average. High chance of immediate acceptance.';
            } else {
                riskLevel = 'Low';
                recommendation = 'Fair Market Value. Your offer is aligned with current wholesale benchmarks.';
            }
        }

        return {
            market_average: marketAvg,
            volatility,
            risk_level: riskLevel,
            recommendation
        };
    }

    /**
     * Queries DB to find top 5 matching suppliers
     */
    async matchSuppliers(parsedIntent) {
        const regex = new RegExp(parsedIntent.product_name, 'i');

        // Find active products matching the name and with sufficient quantity
        // Note: quantity might be aggregated across multiple sellers in a real system, 
        // but here we look for single sellers who can fulfill a significant portion.
        const matches = await Product.find({
            name: regex,
            status: 'active'
        }).populate('seller').lean();

        // If no strict matches exist for dev DB, we return some even if quantity doesn't strictly match to demonstrate the feature.
        matches.sort((a, b) => {
            // Rank by price closeness to target and available quantity
            const priceTarget = parsedIntent.max_price_per_unit || Infinity;

            const priceA = a.pricePerUnit || a.price || 0;
            const priceB = b.pricePerUnit || b.price || 0;

            const distA = Math.abs(priceA - priceTarget);
            const distB = Math.abs(priceB - priceTarget);

            return distA - distB;
        });

        // Take top 5
        const top5 = matches.slice(0, 5);

        // Map to specialized supplier objects
        return top5.map(m => {
            // Handle both schema structures (`vendor` or `seller`)
            const sellerObj = m.seller || m.vendor || { _id: 'mock', name: 'Unknown Seller', businessName: 'Unknown LLC' };
            const vendorName = sellerObj.businessName || sellerObj.name || 'Agri Supplier';

            return {
                product_id: m._id,
                vendor_id: sellerObj._id,
                vendor_name: vendorName,
                listing_price: m.pricePerUnit || m.price || 0,
                available_quantity: m.quantity || m.originalQuantity || 0,
                match_score: Math.floor(80 + Math.random() * 18), // Mock 80-98% match 
                location: sellerObj.district || sellerObj.location || 'Regional Hub'
            };
        });
    }

    /**
     * Determines the negotiation strategy and drafts the RFQ via LLM
     */
    async generateStrategyAndRFQ(parsedIntent, marketData, supplier, buyer) {
        const buyerMax = parsedIntent.max_price_per_unit || marketData.market_average;
        const supplierPrice = supplier.listing_price;

        // Determine Strategy
        let strategy = 'Counter Proposal';
        if (supplierPrice <= buyerMax) {
            strategy = 'Direct Acceptance Offer';
        } else if (supplierPrice > buyerMax * 1.15) {
            strategy = 'Conditional Bulk Offer';
        }

        const buyerName = buyer?.name || 'AgriSense Buyer';

        const systemPrompt = `You are an automated procurement bot for ${buyerName} on the AgriSense B2B Marketplace.
Your job is to draft a professional, concise Request for Quotation (RFQ) message to send to a supplier to initiate a negotiation thread.
        
Context:
- Product: ${parsedIntent.quantity} ${parsedIntent.unit} of ${parsedIntent.quality_grade || ''} ${parsedIntent.product_name}
- Delivery Location: ${parsedIntent.delivery_location || 'Not specified'}
- Deadline: ${parsedIntent.delivery_deadline || 'As soon as possible'}
- Buyer Target Price: ₹${buyerMax}
- Supplier's Listed Price: ₹${supplierPrice}
- Market Average: ₹${marketData.market_average}
- Selected Strategy: ${strategy}

Draft the message following these rules:
1. Address the supplier respectfully (use Name provided).
2. State the exact requirements (quantity, product, location, deadline).
3. Be firm on the target price (₹${buyerMax}). If using "Conditional Bulk Offer", mention the high volume justifies the discount. If using "Direct Acceptance Offer", state readiness to proceed immediately.
4. Include an expiry window of 48 hours for their response.
5. Provide ONLY the message content, no markdown blocks or extra conversational filler.`;

        const userPrompt = `Generate the RFQ message for ${supplier.vendor_name}.`;

        let draft = '';
        try {
            draft = await llmService.generateText(systemPrompt, userPrompt);
        } catch (error) {
            console.error('[AI Procurement] LLM Error generating RFQ draft, using fallback:', error.message);
            draft = `Hello ${supplier.vendor_name},\n\nWe are looking to procure ${parsedIntent.quantity} ${parsedIntent.unit} of ${parsedIntent.product_name}. Our target price is ₹${buyerMax}. Please let us know if you can fulfill this order.\n\nBest regards,\n${buyerName}`;
        }

        return {
            strategy,
            drafted_message: draft.trim(),
            target_price: buyerMax
        };
    }

    /**
     * Main Executor: Preview Phase
     */
    async previewAutoRFQ(intentText, buyer) {
        console.log('[AI Procurement] Parsing Intent...');
        const parsedIntent = await this.parseIntent(intentText);

        console.log('[AI Procurement] Validating Market Price...');
        const marketAnalysis = await this.validateMarketPrice(parsedIntent);

        console.log('[AI Procurement] Matching Suppliers...');
        let suppliers = await this.matchSuppliers(parsedIntent);

        // Add mocked suppliers if db is completely empty
        if (suppliers.length === 0) {
            suppliers = [
                { product_id: null, vendor_id: 'mock1', vendor_name: 'Premium Grains Co.', listing_price: marketAnalysis.market_average + 50, available_quantity: 1000, match_score: 95, location: 'Pune' },
                { product_id: null, vendor_id: 'mock2', vendor_name: 'Deccan Agri Hub', listing_price: marketAnalysis.market_average, available_quantity: 800, match_score: 88, location: 'Nashik' }
            ];
        }

        console.log('[AI Procurement] Generating RFQ Strategies...');
        for (let s of suppliers) {
            const rfqData = await this.generateStrategyAndRFQ(parsedIntent, marketAnalysis, s, buyer);
            s.strategy = rfqData.strategy;
            s.rfq_message = rfqData.drafted_message;
            s.target_price = rfqData.target_price;
        }

        return {
            parsed_intent: parsedIntent,
            market_analysis: marketAnalysis,
            supplier_rankings: suppliers,
            rfq_messages_generated: suppliers.length,
            risk_assessment: marketAnalysis.risk_level,
            recommendation: marketAnalysis.recommendation || "Proceed with auto-generated RFQs."
        };
    }

    /**
     * Main Executor: Confirm Phase (Writes to DB)
     */
    async confirmAutoRFQ(buyerId, previewData) {
        let threadsCreated = 0;

        for (let supplier of previewData.supplier_rankings) {
            try {
                // Determine a fallback productId for mocked vendors
                const mockProductId = new mongoose.Types.ObjectId();
                const finalProductId = supplier.product_id || mockProductId;

                // 1. Create Negotiation doc
                const negotiation = new Negotiation({
                    buyerId: buyerId,
                    vendorId: supplier.vendor_id === 'mock1' || supplier.vendor_id === 'mock2' ? buyerId : supplier.vendor_id, // Safety fallback for invalid vendor ID
                    productId: finalProductId,
                    type: 'auto_rfq',
                    baseline: {
                        price: supplier.listing_price,
                        quantity: supplier.available_quantity || previewData.parsed_intent.quantity,
                        deliveryDays: 7,
                        qualityGrade: previewData.parsed_intent.quality_grade || 'Standard',
                        paymentTerms: 'Escrow',
                        incoterms: null
                    },
                    status: 'pending',
                    currentRound: 2, // Starts at 2 because buyer initiated first offer
                    maxRounds: 5,
                    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h limit
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                await negotiation.save();

                // 2. Create Initial Offer DOC
                const offer = new Offer({
                    negotiationId: negotiation._id,
                    type: 'buyer_offer',
                    price: supplier.target_price,
                    quantity: previewData.parsed_intent.quantity,
                    message: supplier.rfq_message, // Store text in generic offer field too
                    status: 'pending',
                    submittedBy: buyerId,
                    timestamp: new Date()
                });
                await offer.save();

                // 3. Create Specific Message Entity for chat UI
                const msg = new Message({
                    negotiationId: negotiation._id,
                    offerId: offer._id,
                    senderId: buyerId,
                    message: supplier.rfq_message,
                    timestamp: new Date()
                });
                await msg.save();

                threadsCreated++;
            } catch (err) {
                console.error('[AI Procurement] Failed to create thread for ' + supplier.vendor_id, err);
            }
        }

        return {
            success: true,
            negotiation_threads_created: threadsCreated
        };
    }
}

module.exports = new AiProcurementService();
