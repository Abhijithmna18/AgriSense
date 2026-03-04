const mongoose = require('mongoose');
const path = require('path');
const HelpArticle = require('../src/models/HelpArticle');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Seed Help Center Database
 * 
 * Populates the database with comprehensive help articles
 * covering FAQs, guides, tutorials, and troubleshooting.
 */

const helpArticlesData = [
    // FAQs
    {
        title: 'How do I create an account on AgriSense?',
        slug: 'how-to-create-account',
        type: 'faq',
        category: 'Getting Started',
        tags: ['account', 'registration', 'signup', 'getting-started'],
        content: {
            question: 'How do I create an account on AgriSense?',
            answer: 'Creating an account on AgriSense is simple and takes just a few minutes. Visit the AgriSense website and click on the "Sign Up" button in the top right corner. Fill in your details including name, email, phone number, and create a secure password. You can also sign up using your Google account for faster registration. After submitting the form, you\'ll receive a verification email. Click the verification link to activate your account and start using AgriSense.',
            tips: [
                'Use a strong password with at least 8 characters',
                'Verify your email address to access all features',
                'Complete your profile for better recommendations'
            ]
        },
        status: 'published',
        isFeatured: true,
        priority: 100,
        difficulty: 'beginner'
    },
    {
        title: 'How do I add my farm to the system?',
        slug: 'how-to-add-farm',
        type: 'faq',
        category: 'Farm Management',
        tags: ['farm', 'add-farm', 'farm-management', 'setup'],
        content: {
            question: 'How do I add my farm to the system?',
            answer: 'To add your farm, log in to your AgriSense account and navigate to the "Farm Management" section from the dashboard. Click on "Add New Farm" button. Enter your farm details including farm name, location (you can use the map to pinpoint exact location), total area, soil type, and water source. You can also add multiple plots within a farm if you have different cultivation areas. Once saved, your farm will be ready for crop planning and monitoring.',
            tips: [
                'Use accurate GPS coordinates for weather alerts',
                'Add soil test reports for better recommendations',
                'Update farm details regularly'
            ]
        },
        status: 'published',
        isFeatured: true,
        priority: 95,
        difficulty: 'beginner'
    },
    {
        title: 'How does the weather alert system work?',
        slug: 'weather-alert-system',
        type: 'faq',
        category: 'Weather & Alerts',
        tags: ['weather', 'alerts', 'notifications', 'monitoring'],
        content: {
            question: 'How does the weather alert system work?',
            answer: 'AgriSense\'s weather alert system monitors weather conditions for your farm location 24/7. When potentially harmful weather conditions are detected (like heavy rain, frost, heat stress, or drought), the system automatically sends you alerts via SMS, email, and in-app notifications. Alerts include the type of weather event, severity level, expected duration, and recommended actions to protect your crops. You can customize alert preferences in your account settings.',
            tips: [
                'Enable push notifications for instant alerts',
                'Set up multiple contact numbers for critical alerts',
                'Review alert history to understand weather patterns'
            ]
        },
        status: 'published',
        isFeatured: true,
        priority: 90,
        difficulty: 'beginner'
    },
    {
        title: 'What payment methods are accepted in the marketplace?',
        slug: 'marketplace-payment-methods',
        type: 'faq',
        category: 'Marketplace',
        tags: ['payment', 'marketplace', 'transactions', 'money'],
        content: {
            question: 'What payment methods are accepted in the marketplace?',
            answer: 'AgriSense marketplace supports multiple payment methods for your convenience. You can pay using credit/debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), net banking, and digital wallets. For large orders, we also offer cash on delivery (COD) option. All transactions are secured with bank-grade encryption. Sellers receive payments directly to their registered bank accounts after order completion.',
            tips: [
                'Link your bank account for faster refunds',
                'Save payment methods for quick checkout',
                'Check for available offers and discounts'
            ]
        },
        status: 'published',
        priority: 85,
        difficulty: 'beginner'
    },

    // Guides
    {
        title: 'Complete Guide to Using AgriSense Dashboard',
        slug: 'dashboard-complete-guide',
        type: 'guide',
        category: 'Getting Started',
        tags: ['dashboard', 'guide', 'overview', 'features'],
        content: {
            summary: 'Learn how to navigate and use all features of the AgriSense dashboard effectively. This comprehensive guide covers every section and helps you get the most out of the platform.',
            body: 'The AgriSense dashboard is your central hub for managing all farming activities. The dashboard is divided into several key sections:\n\n**Overview Section**: Displays quick stats about your farms, crops, weather conditions, and recent activities. Use this for a quick daily check-in.\n\n**Farm Management**: Access all your farms, view crop status, manage cultivation activities, and track growth stages. You can add new farms, update existing ones, and manage multiple plots.\n\n**Weather Intelligence**: Real-time weather data, forecasts, and historical trends for your farm locations. Set up custom alerts for specific weather conditions.\n\n**Marketplace**: Buy and sell agricultural products, equipment, and services. Browse listings, place orders, and manage your transactions.\n\n**Finance**: Track expenses, income, loans, and generate financial reports. Manage invoices and payment records.\n\n**Crop Intelligence**: Get AI-powered recommendations for crop selection, pest management, and yield optimization based on your farm data.\n\n**Community**: Connect with other farmers, share experiences, ask questions, and learn from experts.',
            steps: [
                {
                    title: 'Login to Your Account',
                    description: 'Visit AgriSense website and login with your credentials. You\'ll be directed to the dashboard.',
                    order: 1
                },
                {
                    title: 'Explore the Overview',
                    description: 'Familiarize yourself with the overview section showing key metrics and quick actions.',
                    order: 2
                },
                {
                    title: 'Set Up Your Farms',
                    description: 'Navigate to Farm Management and add your farms with accurate details.',
                    order: 3
                },
                {
                    title: 'Configure Alerts',
                    description: 'Go to Weather Intelligence and set up weather alerts for your farms.',
                    order: 4
                },
                {
                    title: 'Explore Other Features',
                    description: 'Take time to explore marketplace, finance, and community sections.',
                    order: 5
                }
            ],
            prerequisites: ['Active AgriSense account', 'Basic computer or smartphone skills'],
            tips: [
                'Bookmark the dashboard for quick access',
                'Check the dashboard daily for updates',
                'Use the search function to find features quickly',
                'Customize your dashboard layout in settings'
            ]
        },
        status: 'published',
        isFeatured: true,
        priority: 80,
        difficulty: 'beginner',
        estimatedTime: '15 minutes'
    },
    {
        title: 'How to Sell Products in AgriSense Marketplace',
        slug: 'sell-products-marketplace-guide',
        type: 'guide',
        category: 'Marketplace',
        tags: ['selling', 'marketplace', 'vendor', 'products'],
        content: {
            summary: 'Step-by-step guide to becoming a seller on AgriSense marketplace and listing your products for sale.',
            body: 'Selling on AgriSense marketplace is a great way to reach more customers and grow your agricultural business. The platform provides tools for listing products, managing inventory, processing orders, and receiving payments securely.\n\n**Getting Started as a Seller**: First, you need to register as a vendor. Go to your profile settings and select "Become a Seller". Fill in your business details, bank account information for payments, and upload required documents (PAN card, bank details, address proof).\n\n**Creating Product Listings**: Once approved as a seller, you can start adding products. Include clear product photos, detailed descriptions, pricing, available quantity, and delivery options. Use relevant categories and tags to help buyers find your products.\n\n**Managing Orders**: When buyers place orders, you\'ll receive notifications. Process orders promptly, update order status, and arrange delivery or pickup. Good service leads to positive reviews and repeat customers.\n\n**Receiving Payments**: Payments are processed securely through the platform. After order completion and buyer confirmation, funds are transferred to your registered bank account within 3-5 business days.',
            steps: [
                {
                    title: 'Register as Vendor',
                    description: 'Complete vendor registration with business and bank details.',
                    order: 1
                },
                {
                    title: 'Wait for Approval',
                    description: 'Admin team will verify your documents (usually within 24-48 hours).',
                    order: 2
                },
                {
                    title: 'Add Your First Product',
                    description: 'Create a product listing with photos, description, and pricing.',
                    order: 3
                },
                {
                    title: 'Set Delivery Options',
                    description: 'Configure delivery areas, charges, and pickup options.',
                    order: 4
                },
                {
                    title: 'Manage Orders',
                    description: 'Process incoming orders and update status regularly.',
                    order: 5
                }
            ],
            prerequisites: [
                'Verified AgriSense account',
                'Valid business documents',
                'Bank account for receiving payments',
                'Products to sell'
            ],
            tips: [
                'Use high-quality product photos',
                'Write detailed, honest descriptions',
                'Price competitively',
                'Respond quickly to buyer inquiries',
                'Maintain good inventory levels'
            ],
            warnings: [
                'Ensure product quality matches description',
                'Follow delivery timelines',
                'Do not share personal contact details in listings'
            ]
        },
        status: 'published',
        priority: 75,
        difficulty: 'intermediate',
        estimatedTime: '30 minutes'
    },

    // Tutorials
    {
        title: 'Setting Up Automated Weather Alerts for Your Farm',
        slug: 'setup-weather-alerts-tutorial',
        type: 'tutorial',
        category: 'Weather & Alerts',
        tags: ['weather', 'alerts', 'automation', 'tutorial'],
        content: {
            summary: 'Learn how to configure automated weather alerts to protect your crops from adverse weather conditions.',
            body: 'Automated weather alerts are one of the most valuable features of AgriSense. By setting up custom alerts, you can receive timely warnings about weather conditions that could harm your crops, allowing you to take preventive action.\n\n**Understanding Alert Types**: AgriSense monitors various weather parameters including temperature, rainfall, humidity, wind speed, and frost conditions. You can set thresholds for each parameter based on your crop requirements.\n\n**Configuring Alerts**: Navigate to Weather Intelligence section and click on "Alert Settings". Select your farm, choose the weather parameters you want to monitor, and set threshold values. For example, you might want an alert when temperature drops below 15°C or when rainfall exceeds 50mm in 24 hours.\n\n**Notification Preferences**: Choose how you want to receive alerts - SMS, email, push notifications, or all three. You can also set quiet hours if you don\'t want to be disturbed at night for non-critical alerts.\n\n**Testing and Refinement**: After setup, monitor the alerts you receive and adjust thresholds as needed. Too many alerts can be overwhelming, while too few might miss important events.',
            steps: [
                {
                    title: 'Access Weather Intelligence',
                    description: 'From dashboard, click on Weather Intelligence section.',
                    order: 1
                },
                {
                    title: 'Open Alert Settings',
                    description: 'Click on "Alert Settings" or "Configure Alerts" button.',
                    order: 2
                },
                {
                    title: 'Select Your Farm',
                    description: 'Choose the farm for which you want to set up alerts.',
                    order: 3
                },
                {
                    title: 'Choose Weather Parameters',
                    description: 'Select parameters to monitor: temperature, rainfall, humidity, etc.',
                    order: 4
                },
                {
                    title: 'Set Threshold Values',
                    description: 'Define threshold values that will trigger alerts (e.g., temp < 15°C).',
                    order: 5
                },
                {
                    title: 'Configure Notifications',
                    description: 'Choose notification methods: SMS, email, push notifications.',
                    order: 6
                },
                {
                    title: 'Save and Test',
                    description: 'Save settings and use "Test Alert" feature to verify configuration.',
                    order: 7
                }
            ],
            prerequisites: [
                'Farm added to your account',
                'Accurate farm location coordinates',
                'Mobile number and email verified'
            ],
            tips: [
                'Start with default thresholds and adjust based on experience',
                'Enable SMS for critical alerts',
                'Set different thresholds for different crop stages',
                'Review alert history to understand patterns'
            ],
            warnings: [
                'Ensure mobile number is always active',
                'Don\'t set thresholds too sensitive to avoid alert fatigue',
                'Update settings when changing crops'
            ],
            commonIssues: [
                {
                    issue: 'Not receiving SMS alerts',
                    solution: 'Verify mobile number is correct and active. Check if SMS service is enabled in settings.'
                },
                {
                    issue: 'Too many alerts',
                    solution: 'Adjust threshold values to be less sensitive. Enable quiet hours for non-critical alerts.'
                },
                {
                    issue: 'Alerts for wrong location',
                    solution: 'Update farm GPS coordinates in Farm Management section.'
                }
            ]
        },
        status: 'published',
        priority: 70,
        difficulty: 'intermediate',
        estimatedTime: '20 minutes'
    },

    // Troubleshooting
    {
        title: 'Troubleshooting Login Issues',
        slug: 'troubleshooting-login-issues',
        type: 'troubleshooting',
        category: 'Technical Support',
        tags: ['login', 'troubleshooting', 'password', 'access'],
        content: {
            summary: 'Solutions for common login problems including forgotten passwords, account lockouts, and authentication errors.',
            body: 'Login issues can be frustrating, but most problems have simple solutions. This guide covers the most common login problems and how to resolve them.\n\n**Forgotten Password**: If you\'ve forgotten your password, click on "Forgot Password" link on the login page. Enter your registered email address, and you\'ll receive a password reset link. Click the link and create a new password. Make sure to use a strong password.\n\n**Account Locked**: After multiple failed login attempts, your account may be temporarily locked for security. Wait for 30 minutes and try again, or contact support for immediate assistance.\n\n**Email Not Verified**: If you haven\'t verified your email address, some features may be restricted. Check your inbox for the verification email and click the link. If you didn\'t receive it, request a new verification email from your profile settings.\n\n**Browser Issues**: Sometimes browser cache or cookies can cause login problems. Try clearing your browser cache, using incognito mode, or switching to a different browser.',
            commonIssues: [
                {
                    issue: 'Forgot password',
                    solution: 'Click "Forgot Password" on login page, enter your email, and follow the reset link sent to your inbox.'
                },
                {
                    issue: 'Account locked after multiple failed attempts',
                    solution: 'Wait 30 minutes for automatic unlock, or contact support at support@agrisense.com for immediate help.'
                },
                {
                    issue: 'Email not verified',
                    solution: 'Check your email inbox (and spam folder) for verification link. Resend verification email from profile settings if needed.'
                },
                {
                    issue: 'Password reset link expired',
                    solution: 'Password reset links expire after 1 hour. Request a new reset link from the login page.'
                },
                {
                    issue: 'Login button not working',
                    solution: 'Clear browser cache and cookies, try incognito mode, or use a different browser. Ensure JavaScript is enabled.'
                },
                {
                    issue: 'Two-factor authentication code not received',
                    solution: 'Check if your mobile number is correct. Request a new code. If problem persists, contact support.'
                }
            ],
            tips: [
                'Use a password manager to remember passwords',
                'Enable two-factor authentication for extra security',
                'Keep your email address up to date',
                'Use a modern browser (Chrome, Firefox, Safari, Edge)'
            ],
            warnings: [
                'Never share your password with anyone',
                'Don\'t use the same password for multiple accounts',
                'Be cautious of phishing emails asking for login credentials'
            ]
        },
        status: 'published',
        priority: 65,
        difficulty: 'beginner',
        estimatedTime: '10 minutes'
    },
    {
        title: 'Fixing Payment Transaction Failures',
        slug: 'fixing-payment-failures',
        type: 'troubleshooting',
        category: 'Finance & Payments',
        tags: ['payment', 'transaction', 'troubleshooting', 'failed'],
        content: {
            summary: 'Resolve payment transaction failures and understand why payments might fail in the marketplace.',
            body: 'Payment failures can occur for various reasons, but most can be resolved quickly. Understanding the cause helps prevent future issues.\n\n**Common Causes of Payment Failures**:\n1. Insufficient funds in bank account or card\n2. Card expired or blocked\n3. Incorrect CVV or OTP entered\n4. Bank server issues or maintenance\n5. Transaction limit exceeded\n6. Network connectivity problems\n\n**Immediate Steps**: If a payment fails, first check if the amount was deducted from your account. Sometimes the payment goes through but confirmation fails. Check your bank statement or SMS. If amount is deducted but order not confirmed, contact support immediately with transaction reference number.\n\n**Retry Payment**: If no amount was deducted, you can retry the payment. Ensure you have sufficient balance, your card is active, and you have stable internet connection. Try a different payment method if the problem persists.\n\n**Refunds**: If amount was deducted but order failed, refund will be processed automatically within 5-7 business days. You\'ll receive confirmation via email.',
            commonIssues: [
                {
                    issue: 'Payment declined by bank',
                    solution: 'Contact your bank to check if card is active and has sufficient balance. Ensure online transactions are enabled.'
                },
                {
                    issue: 'OTP not received',
                    solution: 'Check if mobile number registered with bank is correct. Request OTP again. Try alternative payment method if issue persists.'
                },
                {
                    issue: 'Transaction timeout',
                    solution: 'Check internet connection. Retry payment. If amount was deducted, wait for auto-refund or contact support.'
                },
                {
                    issue: 'Payment successful but order not confirmed',
                    solution: 'Check order history. If order not showing, contact support with transaction ID. Refund will be processed if needed.'
                },
                {
                    issue: 'Card details not saving',
                    solution: 'Ensure you\'re checking the "Save card" option. Clear browser cache. Try different browser.'
                }
            ],
            tips: [
                'Keep sufficient balance before making payment',
                'Use saved payment methods for faster checkout',
                'Enable online transactions on your card',
                'Save transaction reference numbers',
                'Use UPI for instant payments'
            ],
            warnings: [
                'Never share OTP with anyone',
                'Verify seller details before payment',
                'Check refund policy before ordering',
                'Report suspicious transactions immediately'
            ]
        },
        status: 'published',
        priority: 60,
        difficulty: 'intermediate',
        estimatedTime: '15 minutes'
    },

    // Documentation
    {
        title: 'AgriSense Mobile App User Manual',
        slug: 'mobile-app-user-manual',
        type: 'documentation',
        category: 'Mobile App',
        tags: ['mobile', 'app', 'manual', 'documentation'],
        content: {
            summary: 'Complete user manual for AgriSense mobile application covering installation, features, and usage.',
            body: 'The AgriSense mobile app brings all the power of the platform to your smartphone, allowing you to manage your farm on the go.\n\n**Installation**: Download the AgriSense app from Google Play Store (Android) or App Store (iOS). Search for "AgriSense" and install the official app. The app requires Android 6.0+ or iOS 12.0+.\n\n**First Time Setup**: Open the app and login with your existing AgriSense credentials. If you don\'t have an account, you can create one directly from the app. Grant necessary permissions (location, notifications, camera) for full functionality.\n\n**Key Features**:\n- Dashboard with farm overview and quick stats\n- Real-time weather updates and alerts\n- Farm and crop management\n- Marketplace for buying and selling\n- Disease detection using camera\n- Offline mode for basic features\n- Push notifications for important updates\n\n**Navigation**: The app uses a bottom navigation bar with five main sections: Home, Farms, Marketplace, Weather, and Profile. Swipe left/right to switch between sections or tap the icons.\n\n**Offline Mode**: The app caches important data so you can view farm information, crop details, and weather forecasts even without internet. Changes made offline will sync when connection is restored.',
            prerequisites: [
                'Smartphone with Android 6.0+ or iOS 12.0+',
                'Active internet connection for download',
                'AgriSense account (can be created in app)'
            ],
            tips: [
                'Enable push notifications for instant alerts',
                'Allow location access for accurate weather data',
                'Update app regularly for new features',
                'Use offline mode in areas with poor connectivity'
            ]
        },
        status: 'published',
        priority: 55,
        difficulty: 'beginner',
        estimatedTime: '25 minutes'
    }
];

async function seedHelpCenter() {
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

        // Clear existing help articles
        await HelpArticle.deleteMany({});
        console.log('🗑️  Cleared existing help articles');

        // Add author to each article
        const articlesWithAuthor = helpArticlesData.map(article => ({
            ...article,
            author: adminUser._id,
            publishedAt: new Date()
        }));

        // Insert help articles
        const inserted = await HelpArticle.insertMany(articlesWithAuthor);
        console.log(`✅ Inserted ${inserted.length} help articles`);

        // Display summary
        console.log('\n📊 Summary by Type:');
        const types = await HelpArticle.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        types.forEach(type => {
            console.log(`   ${type._id}: ${type.count} articles`);
        });

        console.log('\n📊 Summary by Category:');
        const categories = await HelpArticle.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        categories.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count} articles`);
        });

        console.log('\n✨ Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding help center:', error);
        process.exit(1);
    }
}

// Run the seed function
seedHelpCenter();
