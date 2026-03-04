const mongoose = require('mongoose');
const path = require('path');
const CropKnowledge = require('../src/models/CropKnowledge');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Seed Crop Knowledge Database
 * 
 * Populates the database with comprehensive crop knowledge articles
 * covering major crops grown in India, especially Kerala region.
 */

const cropKnowledgeData = [
    {
        title: 'Rice Cultivation - Complete Guide',
        slug: 'rice-cultivation-complete-guide',
        category: 'Cereals',
        tags: ['rice', 'paddy', 'cereals', 'kharif', 'wetland'],
        content: {
            introduction: 'Rice (Oryza sativa) is the staple food crop of India and a primary source of nutrition for over half the world\'s population. In Kerala, rice cultivation is traditionally done in wetlands with abundant water supply. This guide covers modern cultivation practices for optimal yield.',
            cultivation: {
                soilRequirements: 'Clay loam to silty clay loam soils with good water retention capacity. pH range of 5.5 to 7.0 is ideal. Soil should be rich in organic matter.',
                climate: 'Tropical and subtropical climate with high humidity. Requires warm temperature during growing season.',
                season: 'Kharif (June-November) and Rabi (December-May) seasons. In Kerala, mainly cultivated during monsoon season.',
                waterRequirements: 'High water requirement - approximately 1200-1500mm during crop period. Requires standing water of 5-10cm during most growth stages.',
                temperature: { min: 20, max: 35, optimal: 25 },
                rainfall: { min: 1000, max: 2000, unit: 'mm' }
            },
            practices: {
                landPreparation: 'Plough the field 2-3 times to achieve fine tilth. Level the field properly for uniform water distribution. Apply FYM @ 10-12 tonnes/ha during last ploughing.',
                sowing: {
                    method: 'Transplanting of 21-25 days old seedlings',
                    depth: '2-3 cm',
                    spacing: '20cm x 15cm or 20cm x 20cm',
                    seedRate: '40-50 kg/ha for transplanting, 80-100 kg/ha for direct seeding'
                },
                fertilization: {
                    basal: 'Apply 50% N, full P and K at the time of transplanting',
                    topDressing: 'Apply 25% N at tillering stage and 25% N at panicle initiation',
                    organic: 'FYM @ 10-12 tonnes/ha or compost @ 5 tonnes/ha',
                    npkRatio: '120:60:60 kg/ha for high yielding varieties'
                },
                irrigation: {
                    method: 'Continuous flooding method or alternate wetting and drying (AWD)',
                    frequency: 'Maintain 5-10cm standing water from transplanting to grain filling',
                    criticalStages: ['Tillering', 'Panicle initiation', 'Flowering', 'Grain filling']
                },
                weedManagement: 'Manual weeding at 20 and 40 days after transplanting. Pre-emergence herbicides like Butachlor @ 2.5 kg/ha can be applied 3 days after transplanting.',
                pestManagement: {
                    commonPests: ['Stem borer', 'Leaf folder', 'Brown plant hopper', 'Gall midge'],
                    diseases: ['Blast', 'Sheath blight', 'Bacterial leaf blight', 'Tungro virus'],
                    management: 'Use resistant varieties. Follow integrated pest management. Apply neem-based pesticides. Chemical control only when threshold level is reached.'
                }
            },
            harvest: {
                duration: '120-150 days depending on variety',
                maturityIndicators: ['80-85% of grains turn golden yellow', 'Grains become hard', 'Moisture content 20-25%'],
                harvestingMethod: 'Manual harvesting using sickle or mechanical harvester. Cut the crop close to ground level.',
                expectedYield: { min: 4000, max: 6000, unit: 'kg/ha' },
                harvestingTime: 'Early morning to minimize grain shattering'
            },
            postHarvest: {
                cleaning: 'Remove straw and foreign materials. Winnowing to separate chaff.',
                drying: 'Sun drying to reduce moisture content to 12-14% for safe storage.',
                storage: {
                    conditions: 'Store in cool, dry place with good ventilation. Use moisture-proof containers.',
                    duration: '6-12 months under proper storage',
                    packaging: 'Jute bags or HDPE bags of 50kg capacity'
                },
                processing: 'Milling to remove husk and bran. Polishing for white rice. Parboiling for better nutrition retention.',
                marketing: 'Sell through FCI, local mandis, or directly to rice mills. MSP support available.',
                valueAddition: ['Rice flour', 'Puffed rice', 'Rice bran oil', 'Rice flakes']
            },
            economics: {
                costOfCultivation: '₹40,000-50,000 per hectare',
                marketPrice: '₹18-25 per kg (varies by variety and quality)',
                profitability: 'Net profit of ₹30,000-50,000 per hectare with good management'
            },
            nutritionalValue: 'Rich in carbohydrates (78%), provides energy. Contains protein (7%), vitamins (B-complex), and minerals. Brown rice retains more nutrients.',
            uses: ['Staple food', 'Rice flour', 'Animal feed', 'Industrial starch', 'Brewing']
        },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c',
                caption: 'Rice paddy field ready for harvest',
                type: 'cover'
            }
        ],
        status: 'published',
        isFeatured: true,
        featuredOrder: 1
    },
    {
        title: 'Coconut Farming - Kerala\'s Pride',
        slug: 'coconut-farming-kerala-pride',
        category: 'Cash Crops',
        tags: ['coconut', 'cash crop', 'perennial', 'kerala', 'plantation'],
        content: {
            introduction: 'Coconut (Cocos nucifera) is known as "Kalpavriksha" or the tree of life. Kerala is the largest coconut producing state in India. Coconut cultivation provides year-round income and every part of the tree has economic value.',
            cultivation: {
                soilRequirements: 'Well-drained sandy loam to clay loam soils. Can tolerate saline and alkaline soils. pH range of 5.5 to 8.0.',
                climate: 'Tropical climate with high humidity and rainfall. Requires warm temperature throughout the year.',
                season: 'Planting done during onset of monsoon (May-June) for better establishment.',
                waterRequirements: 'Requires 1500-2500mm annual rainfall. Irrigation needed during dry months.',
                temperature: { min: 20, max: 32, optimal: 27 },
                rainfall: { min: 1500, max: 2500, unit: 'mm' }
            },
            practices: {
                landPreparation: 'Clear the land and dig pits of 1m x 1m x 1m size. Fill with topsoil mixed with FYM and fertilizers.',
                sowing: {
                    method: 'Transplanting of 10-12 months old seedlings',
                    depth: 'Plant at same depth as in nursery',
                    spacing: '7.5m x 7.5m triangular system (200 palms/ha) or 9m x 9m square system (123 palms/ha)',
                    seedRate: '220-250 seed nuts per hectare including 10% extra for gap filling'
                },
                fertilization: {
                    basal: 'Apply 50kg FYM per palm annually',
                    topDressing: 'Split application of fertilizers in 2-3 doses during rainy season',
                    organic: 'Green manure, compost, vermicompost @ 25kg per palm',
                    npkRatio: '500:320:1200 g/palm/year for adult palms'
                },
                irrigation: {
                    method: 'Basin irrigation or drip irrigation',
                    frequency: 'Weekly during summer, fortnightly during other seasons',
                    criticalStages: ['Flowering', 'Nut development', 'Summer months']
                },
                weedManagement: 'Regular weeding in basin area. Mulching with coconut leaves. Cover crops like legumes can be grown.',
                pestManagement: {
                    commonPests: ['Rhinoceros beetle', 'Red palm weevil', 'Black headed caterpillar', 'Eriophyid mite'],
                    diseases: ['Root wilt', 'Bud rot', 'Stem bleeding', 'Leaf blight'],
                    management: 'Regular inspection and removal of affected parts. Pheromone traps for beetles. Neem cake application. Resistant varieties.'
                }
            },
            harvest: {
                duration: 'Starts bearing from 5-7 years, full bearing from 10-12 years',
                maturityIndicators: ['Nuts are 11-12 months old', 'Brown color of husk', 'Dried sound when tapped'],
                harvestingMethod: 'Climbing and cutting using sickle. Mechanical harvesters available. Harvest every 45-60 days.',
                expectedYield: { min: 60, max: 120, unit: 'nuts/palm/year' },
                harvestingTime: 'Throughout the year at 45-60 days interval'
            },
            postHarvest: {
                cleaning: 'Remove outer husk if required. Clean and dry the nuts.',
                drying: 'Copra making requires sun drying or kiln drying for 2-3 days.',
                storage: {
                    conditions: 'Store in cool, dry place. Copra should be stored in moisture-proof containers.',
                    duration: 'Fresh nuts: 1-2 months, Copra: 6-12 months',
                    packaging: 'Jute bags for copra, coir bags for nuts'
                },
                processing: 'Copra extraction, coconut oil extraction, desiccated coconut, coconut milk, tender coconut water.',
                marketing: 'Sell as fresh nuts, copra, or processed products. Direct marketing or through cooperatives.',
                valueAddition: ['Coconut oil', 'Desiccated coconut', 'Coconut milk', 'Coir products', 'Shell charcoal', 'Tender coconut water']
            },
            economics: {
                costOfCultivation: '₹1,50,000-2,00,000 per hectare for establishment, ₹50,000-75,000 annual maintenance',
                marketPrice: '₹15-30 per nut, Copra ₹80-120 per kg',
                profitability: 'Net income of ₹1,50,000-3,00,000 per hectare per year after full bearing'
            },
            nutritionalValue: 'Rich in medium-chain fatty acids, vitamins (E, K), minerals (iron, manganese). Tender coconut water is rich in electrolytes.',
            uses: ['Edible oil', 'Food products', 'Cosmetics', 'Coir industry', 'Shell products', 'Tender coconut beverage']
        },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1598616235440-8b5c0f1b7e5f',
                caption: 'Coconut plantation in Kerala',
                type: 'cover'
            }
        ],
        status: 'published',
        isFeatured: true,
        featuredOrder: 2
    },
    {
        title: 'Banana Cultivation - High Value Crop',
        slug: 'banana-cultivation-high-value-crop',
        category: 'Fruits',
        tags: ['banana', 'fruits', 'high-value', 'year-round', 'kerala'],
        content: {
            introduction: 'Banana (Musa spp.) is one of the most important fruit crops in India. It provides quick returns and can be grown throughout the year. Kerala is a major banana producing state with varieties like Nendran, Robusta, and Poovan being popular.',
            cultivation: {
                soilRequirements: 'Deep, rich loamy soils with good drainage. pH range of 6.0 to 7.5. Avoid waterlogged and saline soils.',
                climate: 'Tropical and subtropical climate. Requires warm and humid conditions.',
                season: 'Can be planted throughout the year. Best planting time is June-July and February-March.',
                waterRequirements: 'High water requirement - 2000-2500mm annually. Regular irrigation essential.',
                temperature: { min: 15, max: 35, optimal: 25 },
                rainfall: { min: 1500, max: 2500, unit: 'mm' }
            },
            practices: {
                landPreparation: 'Deep ploughing and leveling. Dig pits of 60cm x 60cm x 60cm. Fill with topsoil, FYM, and fertilizers.',
                sowing: {
                    method: 'Planting of sword suckers or tissue culture plants',
                    depth: '15-20 cm',
                    spacing: '1.8m x 1.8m (3086 plants/ha) or 2m x 2m (2500 plants/ha)',
                    seedRate: '3000-3500 suckers per hectare including 10-15% extra'
                },
                fertilization: {
                    basal: 'Apply 10kg FYM per pit at planting',
                    topDressing: 'Split application at 2, 4, and 6 months after planting',
                    organic: 'Vermicompost @ 5kg per plant, neem cake @ 1kg per plant',
                    npkRatio: '200:60:300 g/plant for Nendran, 300:100:400 g/plant for Robusta'
                },
                irrigation: {
                    method: 'Drip irrigation or basin irrigation',
                    frequency: 'Weekly during dry season, adjust based on soil moisture',
                    criticalStages: ['Vegetative growth', 'Flowering', 'Fruit development']
                },
                weedManagement: 'Regular weeding and mulching. Use of cover crops. Herbicides like glyphosate can be used carefully.',
                pestManagement: {
                    commonPests: ['Banana weevil', 'Aphids', 'Thrips', 'Nematodes'],
                    diseases: ['Panama wilt', 'Sigatoka leaf spot', 'Bunchy top virus', 'Rhizome rot'],
                    management: 'Use disease-free planting material. Crop rotation. Remove and destroy infected plants. Neem-based pesticides.'
                }
            },
            harvest: {
                duration: '11-13 months for Nendran, 12-15 months for Robusta',
                maturityIndicators: ['Full development of fingers', 'Disappearance of angularity', 'Change in peel color', 'Drying of top leaves'],
                harvestingMethod: 'Cut the bunch with sharp knife leaving 30cm stalk. Handle carefully to avoid bruising.',
                expectedYield: { min: 25, max: 40, unit: 'tonnes/ha' },
                harvestingTime: 'Harvest when 75-80% mature for distant markets, fully mature for local markets'
            },
            postHarvest: {
                cleaning: 'Remove dried leaves and clean the bunch. De-hand if required.',
                drying: 'Not applicable for fresh fruit. For chips, slice and dry.',
                storage: {
                    conditions: 'Store at 13-15°C with 85-90% RH for table varieties. Nendran can be stored at room temperature.',
                    duration: 'Fresh: 7-15 days, Ripened: 3-5 days',
                    packaging: 'Corrugated boxes with cushioning material'
                },
                processing: 'Banana chips, banana powder, banana puree, dried banana.',
                marketing: 'Sell through local markets, wholesale markets, or directly to processors. Export potential for organic bananas.',
                valueAddition: ['Banana chips', 'Banana powder', 'Banana fiber', 'Banana wine', 'Banana puree']
            },
            economics: {
                costOfCultivation: '₹2,00,000-2,50,000 per hectare',
                marketPrice: '₹15-30 per kg for table varieties, ₹20-40 per kg for Nendran',
                profitability: 'Net profit of ₹2,00,000-4,00,000 per hectare per crop'
            },
            nutritionalValue: 'Rich in carbohydrates, potassium, vitamin B6, vitamin C, and dietary fiber. Good source of instant energy.',
            uses: ['Fresh fruit', 'Chips', 'Powder', 'Fiber extraction', 'Leaf plates', 'Animal feed']
        },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
                caption: 'Banana plantation with mature bunches',
                type: 'cover'
            }
        ],
        status: 'published',
        isFeatured: true,
        featuredOrder: 3
    },
    {
        title: 'Black Pepper - King of Spices',
        slug: 'black-pepper-king-of-spices',
        category: 'Spices',
        tags: ['pepper', 'spices', 'cash crop', 'kerala', 'export'],
        content: {
            introduction: 'Black pepper (Piper nigrum) is known as the "King of Spices" and is one of the most important export commodities from India. Kerala is the traditional home of black pepper cultivation. It is a perennial climbing vine that can be grown as an intercrop.',
            cultivation: {
                soilRequirements: 'Well-drained laterite or red loamy soils rich in organic matter. pH range of 5.5 to 6.5.',
                climate: 'Humid tropical climate with well-distributed rainfall. Requires partial shade.',
                season: 'Planting done during onset of monsoon (May-June).',
                waterRequirements: 'Annual rainfall of 2000-3000mm. Irrigation during dry months.',
                temperature: { min: 20, max: 35, optimal: 28 },
                rainfall: { min: 2000, max: 3000, unit: 'mm' }
            },
            practices: {
                landPreparation: 'Dig pits of 50cm x 50cm x 50cm near support trees. Fill with topsoil, FYM, and compost.',
                sowing: {
                    method: 'Planting of rooted cuttings or layered vines',
                    depth: '10-15 cm',
                    spacing: '2.5m x 2.5m (1600 vines/ha) when grown with standards',
                    seedRate: '1600-2000 rooted cuttings per hectare'
                },
                fertilization: {
                    basal: 'Apply 10kg FYM per vine at planting',
                    topDressing: 'Split application in May-June and September-October',
                    organic: 'Compost @ 10kg, neem cake @ 1kg per vine annually',
                    npkRatio: '50:50:150 g/vine/year for young vines, 100:100:300 g/vine/year for bearing vines'
                },
                irrigation: {
                    method: 'Basin irrigation or drip irrigation',
                    frequency: 'Weekly during summer months',
                    criticalStages: ['Flowering', 'Berry development', 'Summer months']
                },
                weedManagement: 'Regular weeding in basin area. Mulching with organic materials. Cover crops can be grown.',
                pestManagement: {
                    commonPests: ['Pollu beetle', 'Scale insects', 'Nematodes'],
                    diseases: ['Foot rot', 'Anthracnose', 'Leaf spot', 'Slow wilt'],
                    management: 'Use disease-free planting material. Proper drainage. Bordeaux mixture spray. Trichoderma application.'
                }
            },
            harvest: {
                duration: 'Starts bearing from 3rd year, full bearing from 7-8 years',
                maturityIndicators: ['One or two berries turn red', 'Berries are fully developed', 'Easy separation from spike'],
                harvestingMethod: 'Hand picking of spikes. Harvest when 1-2 berries turn red for black pepper.',
                expectedYield: { min: 1, max: 3, unit: 'kg/vine/year' },
                harvestingTime: 'December to February for main crop'
            },
            postHarvest: {
                cleaning: 'Remove stalks and immature berries.',
                drying: 'Sun drying for 5-7 days until moisture content reaches 10-12%. Mechanical drying also possible.',
                storage: {
                    conditions: 'Store in cool, dry place in moisture-proof containers.',
                    duration: '12-18 months under proper storage',
                    packaging: 'Gunny bags or HDPE bags'
                },
                processing: 'Cleaning, grading, and packaging. White pepper production by removing outer skin.',
                marketing: 'Sell through spice board registered dealers, cooperatives, or export directly.',
                valueAddition: ['Ground pepper', 'White pepper', 'Pepper oil', 'Oleoresin']
            },
            economics: {
                costOfCultivation: '₹1,50,000-2,00,000 per hectare for establishment, ₹50,000 annual maintenance',
                marketPrice: '₹400-600 per kg (varies with quality and market)',
                profitability: 'Net income of ₹2,00,000-4,00,000 per hectare per year after full bearing'
            },
            nutritionalValue: 'Rich in piperine, vitamins (C, K), minerals (iron, manganese). Has antioxidant and antimicrobial properties.',
            uses: ['Spice', 'Medicine', 'Essential oil', 'Cosmetics', 'Food preservation']
        },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1599909533730-f9d7e4f2e3e5',
                caption: 'Black pepper vine with mature berries',
                type: 'cover'
            }
        ],
        status: 'published',
        isFeatured: false
    },
    {
        title: 'Tomato Cultivation - Profitable Vegetable',
        slug: 'tomato-cultivation-profitable-vegetable',
        category: 'Vegetables',
        tags: ['tomato', 'vegetables', 'high-value', 'protected-cultivation'],
        content: {
            introduction: 'Tomato (Solanum lycopersicum) is one of the most important and widely cultivated vegetables in India. It is rich in vitamins and minerals and has high market demand throughout the year. Both open field and protected cultivation are practiced.',
            cultivation: {
                soilRequirements: 'Well-drained sandy loam to loamy soils rich in organic matter. pH range of 6.0 to 7.0.',
                climate: 'Warm season crop. Cannot tolerate frost. Requires moderate temperature.',
                season: 'Kharif (June-July), Rabi (October-November), and Summer (January-February).',
                waterRequirements: 'Moderate water requirement - 600-800mm during crop period.',
                temperature: { min: 15, max: 30, optimal: 24 },
                rainfall: { min: 600, max: 800, unit: 'mm' }
            },
            practices: {
                landPreparation: 'Deep ploughing and leveling. Prepare raised beds of 15cm height and 1m width.',
                sowing: {
                    method: 'Transplanting of 25-30 days old seedlings',
                    depth: '1-2 cm in nursery',
                    spacing: '60cm x 45cm or 75cm x 60cm depending on variety',
                    seedRate: '200-250g per hectare for hybrid varieties, 400-500g for open pollinated varieties'
                },
                fertilization: {
                    basal: 'Apply 25 tonnes FYM per hectare. 50% N and full P, K at transplanting',
                    topDressing: 'Apply 25% N at 30 days and 25% N at 45 days after transplanting',
                    organic: 'Vermicompost @ 5 tonnes/ha, neem cake @ 500kg/ha',
                    npkRatio: '150:100:100 kg/ha for hybrid varieties'
                },
                irrigation: {
                    method: 'Drip irrigation is most efficient. Furrow irrigation also practiced',
                    frequency: 'Light and frequent irrigation. Daily in summer, alternate days in other seasons',
                    criticalStages: ['Flowering', 'Fruit setting', 'Fruit development']
                },
                weedManagement: 'Manual weeding at 20 and 40 days after transplanting. Mulching with plastic or organic materials.',
                pestManagement: {
                    commonPests: ['Fruit borer', 'Whitefly', 'Aphids', 'Leaf miner'],
                    diseases: ['Early blight', 'Late blight', 'Leaf curl virus', 'Bacterial wilt'],
                    management: 'Use resistant varieties. Yellow sticky traps for whiteflies. Neem-based pesticides. Crop rotation.'
                }
            },
            harvest: {
                duration: '70-90 days for early varieties, 110-130 days for late varieties',
                maturityIndicators: ['Full color development', 'Firm texture', 'Glossy appearance'],
                harvestingMethod: 'Hand picking with stalk. Harvest at breaker stage for distant markets.',
                expectedYield: { min: 25, max: 50, unit: 'tonnes/ha' },
                harvestingTime: 'Multiple pickings at 3-4 days interval'
            },
            postHarvest: {
                cleaning: 'Remove dirt and grade based on size and quality.',
                drying: 'Not applicable for fresh market. For processing, can be dried.',
                storage: {
                    conditions: 'Store at 10-12°C with 85-90% RH for ripe fruits. Green fruits at 12-15°C.',
                    duration: 'Ripe: 7-10 days, Green: 2-3 weeks',
                    packaging: 'Ventilated crates or cartons with cushioning'
                },
                processing: 'Tomato puree, paste, ketchup, sauce, juice, dried tomatoes.',
                marketing: 'Sell through local markets, wholesale markets, or directly to processing units.',
                valueAddition: ['Tomato puree', 'Tomato paste', 'Ketchup', 'Sauce', 'Dried tomatoes']
            },
            economics: {
                costOfCultivation: '₹1,50,000-2,00,000 per hectare',
                marketPrice: '₹10-30 per kg (highly variable with season)',
                profitability: 'Net profit of ₹1,50,000-3,00,000 per hectare with good management'
            },
            nutritionalValue: 'Rich in lycopene, vitamins (A, C, K), potassium, and antioxidants. Low in calories.',
            uses: ['Fresh consumption', 'Cooking', 'Processing', 'Salads', 'Juice']
        },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
                caption: 'Tomato plants with ripe fruits',
                type: 'cover'
            }
        ],
        status: 'published',
        isFeatured: false
    }
];

async function seedCropKnowledge() {
    try {
        // Connect to MongoDB (try both MONGO_URI and MONGODB_URI)
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        
        if (!mongoUri) {
            console.error('❌ MongoDB URI not found in environment variables');
            console.error('Please ensure MONGO_URI or MONGODB_URI is set in .env file');
            process.exit(1);
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Get admin user (first user with admin role)
        const User = require('../src/models/User');
        const adminUser = await User.findOne({ roles: 'admin' });
        
        if (!adminUser) {
            console.error('❌ No admin user found. Please create an admin user first.');
            process.exit(1);
        }

        console.log(`📝 Using admin user: ${adminUser.firstName} ${adminUser.lastName}`);

        // Clear existing crop knowledge data
        await CropKnowledge.deleteMany({});
        console.log('🗑️  Cleared existing crop knowledge data');

        // Add author to each article
        const articlesWithAuthor = cropKnowledgeData.map(article => ({
            ...article,
            author: adminUser._id,
            publishedAt: new Date()
        }));

        // Insert crop knowledge data
        const inserted = await CropKnowledge.insertMany(articlesWithAuthor);
        console.log(`✅ Inserted ${inserted.length} crop knowledge articles`);

        // Display summary
        console.log('\n📊 Summary:');
        const categories = await CropKnowledge.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        categories.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count} articles`);
        });

        console.log('\n✨ Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding crop knowledge:', error);
        process.exit(1);
    }
}

// Run the seed function
seedCropKnowledge();
