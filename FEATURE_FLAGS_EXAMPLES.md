# Feature Flags - Usage Examples

## Real-World Examples

### Example 1: AI Crop Predictions

**Create the Flag:**
```javascript
{
  name: "AI Crop Predictions",
  key: "ai_crop_predictions",
  description: "Enables AI-powered crop yield predictions using machine learning",
  isEnabled: true,
  environment: "production",
  rolloutPercentage: 25,
  targetRoles: ["farmer"]
}
```

**Use in Code:**
```javascript
import { FeatureFlag } from '../hooks/useFeatureFlag';

function FarmDashboard() {
    return (
        <div>
            <FarmOverview />
            <CropList />
            
            <FeatureFlag flagKey="ai_crop_predictions">
                <AICropPredictionModule />
            </FeatureFlag>
        </div>
    );
}
```

### Example 2: Vendor Marketplace

**Create the Flag:**
```javascript
{
  name: "Vendor Marketplace",
  key: "vendor_marketplace",
  description: "Enables vendor marketplace for buying/selling agricultural products",
  isEnabled: true,
  environment: "production",
  rolloutPercentage: 100,
  targetRoles: ["vendor", "farmer"]
}
```

**Use in Navigation:**
```javascript
import { useFeatureFlag } from '../hooks/useFeatureFlag';

function Navigation() {
    const { isEnabled: marketplaceEnabled } = useFeatureFlag('vendor_marketplace');

    return (
        <nav>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/farms">Farms</Link>
            {marketplaceEnabled && (
                <Link to="/marketplace">Marketplace</Link>
            )}
        </nav>
    );
}
```

### Example 3: Warehouse Booking

**Create the Flag:**
```javascript
{
  name: "Warehouse Booking",
  key: "warehouse_booking",
  description: "Enable warehouse reservation system",
  isEnabled: true,
  environment: "production",
  rolloutPercentage: 50,
  targetRoles: []  // All roles
}
```

**Use in Component:**
```javascript
function WarehousePage() {
    const { isEnabled, loading } = useFeatureFlag('warehouse_booking');

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <h1>Warehouses</h1>
            {isEnabled ? (
                <WarehouseBookingSystem />
            ) : (
                <WarehouseListView />
            )}
        </div>
    );
}
```

### Example 4: Advanced Analytics

**Create the Flag:**
```javascript
{
  name: "Advanced Analytics",
  key: "advanced_analytics",
  description: "Premium analytics dashboard with AI insights",
  isEnabled: true,
  environment: "production",
  rolloutPercentage: 100,
  targetRoles: ["admin", "manager"]
}
```

**Use in Backend:**
```javascript
// In route handler
router.get('/analytics/advanced', protect, async (req, res) => {
    const flag = await FeatureFlag.findOne({ key: 'advanced_analytics' });
    
    if (!flag || !flag.isEnabled) {
        return res.status(403).json({ 
            message: 'Advanced analytics not available' 
        });
    }

    // Check role targeting
    if (flag.targetRoles.length > 0 && 
        !flag.targetRoles.includes(req.user.activeRole)) {
        return res.status(403).json({ 
            message: 'Not authorized for advanced analytics' 
        });
    }

    // Proceed with advanced analytics
    const data = await getAdvancedAnalytics();
    res.json(data);
});
```

### Example 5: Beta Features

**Create the Flag:**
```javascript
{
  name: "New Dashboard Beta",
  key: "new_dashboard_beta",
  description: "New dashboard interface (beta testing)",
  isEnabled: true,
  environment: "staging",
  rolloutPercentage: 100,
  targetRoles: []
}
```

**Use with Redirect:**
```javascript
function DashboardRouter() {
    const { isEnabled: betaEnabled } = useFeatureFlag('new_dashboard_beta');

    useEffect(() => {
        if (betaEnabled) {
            navigate('/dashboard-beta');
        }
    }, [betaEnabled]);

    return betaEnabled ? <DashboardBeta /> : <DashboardLegacy />;
}
```

### Example 6: Emergency Kill Switch

**Scenario:** A critical bug is found in production

**Solution:**
1. Go to Feature Flags admin page
2. Find the problematic feature flag
3. Click the toggle to turn it OFF
4. Feature is immediately disabled for all users
5. No code deployment needed!

**Example:**
```javascript
// If "payment_processing" flag is turned off
<FeatureFlag flagKey="payment_processing">
    <PaymentForm />
</FeatureFlag>
// PaymentForm won't render, preventing buggy payments
```

### Example 7: Gradual Rollout Strategy

**Week 1: 10% Rollout**
```javascript
{
  name: "AI Recommendations V2",
  key: "ai_recommendations_v2",
  rolloutPercentage: 10
}
```

**Week 2: 25% Rollout** (if no issues)
```javascript
{
  rolloutPercentage: 25
}
```

**Week 3: 50% Rollout**
```javascript
{
  rolloutPercentage: 50
}
```

**Week 4: 100% Rollout**
```javascript
{
  rolloutPercentage: 100
}
```

### Example 8: A/B Testing

**Variant A (Control):**
```javascript
function ProductPage() {
    const { isEnabled: newLayout } = useFeatureFlag('product_page_new_layout');

    return newLayout ? (
        <ProductPageNewLayout />  // Test variant
    ) : (
        <ProductPageOldLayout />  // Control
    );
}
```

**Track Results:**
```javascript
useEffect(() => {
    if (newLayout) {
        analytics.track('variant_b_shown');
    } else {
        analytics.track('variant_a_shown');
    }
}, [newLayout]);
```

### Example 9: Environment-Specific Features

**Development Only:**
```javascript
{
  name: "Debug Panel",
  key: "debug_panel",
  environment: "development",
  isEnabled: true
}
```

**Staging Only:**
```javascript
{
  name: "Test Data Generator",
  key: "test_data_generator",
  environment: "staging",
  isEnabled: true
}
```

**Production Only:**
```javascript
{
  name: "Payment Gateway",
  key: "payment_gateway",
  environment: "production",
  isEnabled: true
}
```

### Example 10: Feature Dependencies

**Parent Feature:**
```javascript
{
  name: "Marketplace",
  key: "marketplace",
  isEnabled: true
}
```

**Child Feature:**
```javascript
function MarketplaceFeatures() {
    const { isEnabled: marketplaceEnabled } = useFeatureFlag('marketplace');
    const { isEnabled: reviewsEnabled } = useFeatureFlag('marketplace_reviews');

    if (!marketplaceEnabled) {
        return null;
    }

    return (
        <div>
            <ProductList />
            {reviewsEnabled && <ReviewsSection />}
        </div>
    );
}
```

## Common Patterns

### Pattern 1: Feature with Fallback

```javascript
<FeatureFlag 
    flagKey="premium_features"
    fallback={<UpgradePrompt />}
>
    <PremiumDashboard />
</FeatureFlag>
```

### Pattern 2: Multiple Flags

```javascript
function Dashboard() {
    const { isEnabled: aiEnabled } = useFeatureFlag('ai_features');
    const { isEnabled: analyticsEnabled } = useFeatureFlag('analytics');
    const { isEnabled: reportsEnabled } = useFeatureFlag('reports');

    return (
        <div>
            <Overview />
            {aiEnabled && <AIInsights />}
            {analyticsEnabled && <Analytics />}
            {reportsEnabled && <Reports />}
        </div>
    );
}
```

### Pattern 3: Conditional API Calls

```javascript
const fetchData = async () => {
    const { data: flagData } = await api.get('/feature-flags/check/advanced_api');
    
    if (flagData.enabled) {
        return await api.get('/api/advanced-data');
    } else {
        return await api.get('/api/basic-data');
    }
};
```

### Pattern 4: Feature Toggle Button

```javascript
function FeatureToggle({ flagKey, label }) {
    const { isEnabled, loading } = useFeatureFlag(flagKey);
    const [localEnabled, setLocalEnabled] = useState(isEnabled);

    useEffect(() => {
        setLocalEnabled(isEnabled);
    }, [isEnabled]);

    return (
        <div>
            <label>{label}</label>
            <Switch 
                checked={localEnabled}
                disabled={loading}
                onChange={setLocalEnabled}
            />
        </div>
    );
}
```

## Testing Strategies

### Strategy 1: Test with Flag ON

```javascript
describe('Feature with flag enabled', () => {
    beforeEach(() => {
        // Mock feature flag as enabled
        jest.mock('../hooks/useFeatureFlag', () => ({
            useFeatureFlag: () => ({ isEnabled: true, loading: false })
        }));
    });

    it('should render new feature', () => {
        render(<MyComponent />);
        expect(screen.getByText('New Feature')).toBeInTheDocument();
    });
});
```

### Strategy 2: Test with Flag OFF

```javascript
describe('Feature with flag disabled', () => {
    beforeEach(() => {
        jest.mock('../hooks/useFeatureFlag', () => ({
            useFeatureFlag: () => ({ isEnabled: false, loading: false })
        }));
    });

    it('should not render new feature', () => {
        render(<MyComponent />);
        expect(screen.queryByText('New Feature')).not.toBeInTheDocument();
    });
});
```

## Monitoring & Cleanup

### Check Active Flags

```javascript
// In MongoDB
db.featureflags.find({ isEnabled: true }).pretty()
```

### Find Unused Flags

```javascript
// Flags older than 90 days at 100% rollout
db.featureflags.find({
    isEnabled: true,
    rolloutPercentage: 100,
    createdAt: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
})
```

### Cleanup Old Flags

After a feature is fully rolled out and stable:
1. Remove the flag from code
2. Delete the flag from admin panel
3. Deploy code without flag checks

## Summary

Feature flags enable:
- ✅ Safe deployments
- ✅ Gradual rollouts
- ✅ A/B testing
- ✅ Emergency kill switches
- ✅ Environment-specific features
- ✅ Role-based access
- ✅ Zero-downtime feature releases

Use them wisely to ship faster and safer!
