/**
 * Disease Radar Data Seeder
 * 
 * Seeds the DiseaseScan collection with realistic crop disease data
 * based on real diseases prevalent in Kerala / South India.
 * 
 * Usage: node src/seeders/seedDiseaseRadar.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const DiseaseScan = require('../models/DiseaseScan');

// Kerala center: ~10.85, 76.27
// We scatter diseases across different districts
const KERALA_DISEASES = [
    // --- Rice Diseases (Palakkad, Alappuzha, Kuttanad) ---
    {
        diseaseName: 'Rice Blast (Pyricularia oryzae)',
        severity: 'critical',
        symptoms: ['Diamond-shaped lesions on leaves', 'Gray-green water-soaked spots', 'Neck rot causing panicle drooping', 'White to gray center with brown margin'],
        treatment: {
            organic: ['Apply Trichoderma viride @ 4g/kg seed', 'Spray Pseudomonas fluorescens 0.5%', 'Use neem oil spray 3%'],
            chemical: ['Tricyclazole 75% WP @ 0.6g/L', 'Isoprothiolane 40% EC @ 1.5ml/L', 'Carbendazim 50% WP @ 1g/L'],
            prevention: ['Use blast-resistant varieties (Jyothi, Kanchana)', 'Avoid excess nitrogen fertilization', 'Maintain proper spacing', 'Remove infected crop debris']
        },
        baseCoords: [76.65, 10.78], // Palakkad paddy fields
        spreadRadius: 0.08
    },
    {
        diseaseName: 'Brown Spot of Rice (Bipolaris oryzae)',
        severity: 'high',
        symptoms: ['Oval brown spots on leaves', 'Spots with gray center and brown halo', 'Grain discoloration', 'Reduced grain filling'],
        treatment: {
            organic: ['Seed treatment with Pseudomonas fluorescens @ 10g/kg', 'Spray neem kernel extract 5%'],
            chemical: ['Mancozeb 75% WP @ 2g/L', 'Propiconazole 25% EC @ 1ml/L'],
            prevention: ['Use certified disease-free seeds', 'Balanced NPK fertilization', 'Avoid water stress during grain filling']
        },
        baseCoords: [76.34, 9.50], // Alappuzha / Kuttanad
        spreadRadius: 0.06
    },
    {
        diseaseName: 'Bacterial Leaf Blight of Rice (Xanthomonas oryzae)',
        severity: 'high',
        symptoms: ['Water-soaked lesions on leaf margins', 'Yellowish-white lesions with wavy margins', 'Leaves drying from tip', 'Milky bacterial ooze on leaves'],
        treatment: {
            organic: ['Spray Pseudomonas fluorescens @ 0.5%', 'Apply neem cake to soil'],
            chemical: ['Streptomycin sulphate 0.025%', 'Copper hydroxide 77% WP @ 2.5g/L'],
            prevention: ['Use resistant varieties', 'Avoid clipping of seedling tips during transplanting', 'Balanced N application', 'Drain excess water']
        },
        baseCoords: [76.20, 10.52], // Thrissur
        spreadRadius: 0.05
    },

    // --- Coconut Diseases (Across Kerala) ---
    {
        diseaseName: 'Coconut Root Wilt (Phytoplasma)',
        severity: 'critical',
        symptoms: ['Yellowing and drooping of outer leaves', 'Ribbing and flaccidity of leaflets', 'Necrosis of root tips', 'Reduced nut size and copra weight', 'Shedding of immature nuts'],
        treatment: {
            organic: ['Apply neem cake 5kg per palm per year', 'Raise green manure crops in coconut garden', 'Mulching with coconut leaves'],
            chemical: ['Root feeding with Oxytetracycline HCl 3g in 100ml water', 'Application of Phorate 10G around root zone'],
            prevention: ['Use disease-free seedlings from certified nurseries', 'Remove and destroy severely affected palms', 'Control leafhopper vector Proutista moesta', 'Maintain adequate drainage']
        },
        baseCoords: [76.60, 9.30], // Pathanamthitta / Central Kerala
        spreadRadius: 0.12
    },
    {
        diseaseName: 'Bud Rot of Coconut (Phytophthora palmivora)',
        severity: 'high',
        symptoms: ['Yellowing of one or two youngest leaves', 'Drooping of spindle leaf', 'Foul-smelling dark brown rot of bud region', 'Crown falls off in advanced stages'],
        treatment: {
            organic: ['Remove affected tissue and apply Bordeaux paste', 'Improve drainage around palms'],
            chemical: ['Pour Copper Oxychloride 0.25% solution into crown', 'Apply Metalaxyl-Mancozeb 0.125% to crown'],
            prevention: ['Avoid injury to crown during climbing', 'Ensure proper drainage during monsoon', 'Prophylactic Bordeaux mixture spray before monsoon']
        },
        baseCoords: [75.77, 11.87], // Kannur
        spreadRadius: 0.07
    },

    // --- Pepper Diseases (Wayanad, Idukki - spice belt) ---
    {
        diseaseName: 'Pepper Quick Wilt (Phytophthora capsici)',
        severity: 'critical',
        symptoms: ['Sudden drooping of leaves', 'Black lesions on stem base', 'Root rot with blackening', 'Complete vine death within 2-3 weeks', 'Foul smell from affected parts'],
        treatment: {
            organic: ['Drench with Trichoderma harzianum @ 50g/L', 'Apply neem cake 1kg per vine', 'Mulch with dried leaves'],
            chemical: ['Potassium Phosphonate 0.3% drenching', 'Metalaxyl + Mancozeb @ 0.125% soil drench', 'Copper Hydroxide @ 2g/L spray'],
            prevention: ['Improve drainage in pepper gardens', 'Avoid waterlogging during monsoon', 'Use disease-tolerant varieties (Panniyur-1, IISR Thevam)', 'Apply Trichoderma to soil before monsoon']
        },
        baseCoords: [76.08, 11.62], // Wayanad
        spreadRadius: 0.09
    },
    {
        diseaseName: 'Pollu Disease of Pepper (Colletotrichum gloeosporioides)',
        severity: 'medium',
        symptoms: ['Black spots on developing berries', 'Premature fruit drop', 'Shrivelled and hollow berries', 'Dark brown discoloration of spikes'],
        treatment: {
            organic: ['Spray Bordeaux mixture 1%', 'Biocontrol using Pseudomonas fluorescens'],
            chemical: ['Carbendazim 0.1%', 'Copper Oxychloride 0.25%'],
            prevention: ['Adequate shade regulation', 'Removal of affected spikes', 'Post-monsoon prophylactic spray']
        },
        baseCoords: [77.05, 9.85], // Idukki
        spreadRadius: 0.06
    },

    // --- Banana Diseases (Across Kerala) ---
    {
        diseaseName: 'Panama Wilt of Banana (Fusarium oxysporum f.sp. cubense)',
        severity: 'critical',
        symptoms: ['Yellowing of oldest leaves first', 'Longitudinal splitting of pseudostem base', 'Brown discoloration of vascular tissue', 'Internal pseudostem shows reddish-brown streaks'],
        treatment: {
            organic: ['Apply Trichoderma viride enriched FYM', 'Drench with Pseudomonas fluorescens @ 20g/L', 'Grow Marigold as intercrop'],
            chemical: ['Soil drenching with Carbendazim 0.2%', 'Inject Carbendazim into pseudostem'],
            prevention: ['Use disease-free tissue culture plants', 'Avoid planting Nendran in infected soil for 3 years', 'Apply lime to raise soil pH', 'Destroy infected plants and debris']
        },
        baseCoords: [76.27, 10.85], // Ernakulam
        spreadRadius: 0.07
    },
    {
        diseaseName: 'Sigatoka Leaf Spot of Banana (Mycosphaerella musicola)',
        severity: 'medium',
        symptoms: ['Yellow streaks on leaves parallel to veins', 'Brown oval spots with gray centers', 'Premature leaf drying', 'Reduced bunch weight'],
        treatment: {
            organic: ['Remove and destroy affected leaves', 'Spray neem oil 2%'],
            chemical: ['Propiconazole 0.1%', 'Mancozeb 0.25%', 'Carbendazim 0.1%'],
            prevention: ['Maintain proper spacing between plants', 'Avoid overhead irrigation', 'Remove dried leaves regularly']
        },
        baseCoords: [76.95, 8.52], // Thiruvananthapuram
        spreadRadius: 0.05
    },

    // --- Rubber Disease (Kottayam) ---
    {
        diseaseName: 'Abnormal Leaf Fall of Rubber (Phytophthora spp.)',
        severity: 'high',
        symptoms: ['Water-soaked lesions on leaves', 'Extensive defoliation during monsoon', 'Shot-hole appearance on leaves', 'Black lesions on petioles and green shoots', 'Latex flow reduction by 30-50%'],
        treatment: {
            organic: ['Improve air circulation by thinning', 'Apply Bordeaux mixture pre-monsoon'],
            chemical: ['Aerial spraying of Mancozeb 0.25%', 'Copper Oxychloride 0.25% spray', 'Phosphorous acid-based sprays'],
            prevention: ['Use resistant clones (RRII 105, RRII 414)', 'Pre-monsoon prophylactic spraying', 'Ensure proper drainage in rubber estates']
        },
        baseCoords: [76.52, 9.59], // Kottayam
        spreadRadius: 0.08
    },

    // --- Cardamom Disease (Idukki) ---
    {
        diseaseName: 'Katte Disease of Cardamom (Cardamom mosaic virus)',
        severity: 'high',
        symptoms: ['Green mosaic pattern on leaves', 'Pale green stripes along veins', 'Stunted growth of new tillers', 'Reduction in capsule size and yield'],
        treatment: {
            organic: ['Uproot and destroy infected clumps', 'Spray neem oil to control aphid vector'],
            chemical: ['Dimethoate 0.05% to control Pentalonia nigronervosa vector', 'Imidacloprid 0.005% spray'],
            prevention: ['Use virus-free planting material', 'Regular removal of infected plants', 'Control banana aphid (vector)', 'Maintain border rows to prevent spread']
        },
        baseCoords: [77.10, 9.75], // Idukki Hills
        spreadRadius: 0.05
    },

    // --- Tea Disease (Munnar) ---
    {
        diseaseName: 'Blister Blight of Tea (Exobasidium vexans)',
        severity: 'medium',
        symptoms: ['Circular blister-like spots on young leaves', 'Blisters with white fungal growth on underside', 'Distortion and curling of tender leaves', 'Severe infection causes shoot die-back'],
        treatment: {
            organic: ['Pluck and destroy infected leaves', 'Copper-based organic sprays'],
            chemical: ['Hexaconazole 5% EC @ 1ml/L', 'Propiconazole 25% EC @ 0.5ml/L'],
            prevention: ['Avoid planting in very shaded, humid areas', 'Proper pruning and thinning', 'Ensure good air circulation']
        },
        baseCoords: [77.06, 10.09], // Munnar
        spreadRadius: 0.04
    },

    // --- Arecanut ---
    {
        diseaseName: 'Yellow Leaf Disease of Arecanut (Phytoplasma)',
        severity: 'medium',
        symptoms: ['Yellowing of lower leaves', 'Crown reduced to 3-4 leaves', 'Hard and dark brown nut kernel', 'Tapering of trunk in later stages'],
        treatment: {
            organic: ['Apply neem cake 5kg per palm', 'Root feeding with Aureofungin'],
            chemical: ['Oxytetracycline HCl root feeding 3g in 100ml water three times a year'],
            prevention: ['Use disease-free seedlings', 'Remove and burn severely affected palms', 'Intercropping with cocoa or banana']
        },
        baseCoords: [75.55, 12.50], // Kasaragod
        spreadRadius: 0.06
    }
];

// Generate scatter points around base coordinates
function generateScatterPoints(baseLon, baseLat, radius, count) {
    const points = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const r = Math.random() * radius;
        points.push({
            lon: baseLon + r * Math.cos(angle),
            lat: baseLat + r * Math.sin(angle)
        });
    }
    return points;
}

async function seedDiseaseRadar() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        // Clear existing disease scan data (optional — remove this line to keep existing)
        const existingCount = await DiseaseScan.countDocuments();
        console.log(`📊 Existing DiseaseScan records: ${existingCount}`);

        // We need a user ID to associate scans with
        const User = require('../models/User');
        const firstUser = await User.findOne();
        if (!firstUser) {
            console.error('❌ No user found in database. Please register a user first.');
            process.exit(1);
        }
        console.log(`👤 Using user: ${firstUser.email || firstUser._id}`);

        const scanDocuments = [];
        const now = new Date();

        for (const disease of KERALA_DISEASES) {
            // Generate 1-3 outbreak points per disease
            const outbreakCount = Math.floor(Math.random() * 3) + 1;
            const points = generateScatterPoints(
                disease.baseCoords[0],
                disease.baseCoords[1],
                disease.spreadRadius,
                outbreakCount
            );

            for (const point of points) {
                // Random time in last 7 days
                const hoursAgo = Math.floor(Math.random() * 168); // up to 7 days
                const scannedAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

                scanDocuments.push({
                    user: firstUser._id,
                    imageUrl: 'uploads/disease-scans/seeded-placeholder.jpg',
                    status: 'detected',
                    diseaseName: disease.diseaseName,
                    confidence: 0.75 + Math.random() * 0.2, // 75-95%
                    severity: disease.severity,
                    symptoms: disease.symptoms,
                    treatment: disease.treatment,
                    location: {
                        type: 'Point',
                        coordinates: [point.lon, point.lat]
                    },
                    scannedAt
                });
            }
        }

        // Insert all documents
        const result = await DiseaseScan.insertMany(scanDocuments);
        console.log(`\n🌿 Successfully seeded ${result.length} disease outbreak records across Kerala!`);
        console.log(`\n📍 Diseases seeded:`);

        const diseaseNames = [...new Set(scanDocuments.map(d => d.diseaseName))];
        diseaseNames.forEach(name => {
            const count = scanDocuments.filter(d => d.diseaseName === name).length;
            const sev = scanDocuments.find(d => d.diseaseName === name).severity;
            console.log(`   • ${name} — ${count} outbreak(s) [${sev.toUpperCase()}]`);
        });

        console.log(`\n✅ Done! Refresh the Disease Radar page to see real data.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedDiseaseRadar();
