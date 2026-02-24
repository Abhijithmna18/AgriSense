import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import os

# Configuration
MODEL_PATH = 'pricing_model.pkl'
ENCODERS_PATH = 'pricing_encoders.pkl'

def generate_synthetic_data(num_samples=5000):
    np.random.seed(42)
    
    categories = ['inputs', 'rentals']
    # Realistic Base prices per unit (in INR)
    # Fertilizers (default unit: 50kg bag, we'll store base as per kg to easily scale)
    # Urea: ~268 INR for 50kg bag -> ~5.36 INR/kg
    # DAP: ~1350 INR for 50kg bag -> ~27 INR/kg
    # Seeds (highly variable, base per kg): Wheat ~40, Rice ~35, Mustard ~100, Tomato ~800, Watermelon ~1000, Cucumber ~180
    # Rentals (base per hour): Tractor ~800, Harvester ~2000, Water Pump ~200, Sprayer ~100
    base_prices_kg = {
        'Urea': 5.5, 'DAP': 27, 
        'Wheat Seeds': 40, 'Rice Seeds': 35, 'Tomato Seeds': 800, 'Mustard Seeds': 100, 'Watermelon Seeds': 1000, 'Cucumber Seeds': 180,
        'Pesticide': 450, 'Herbicide': 300
    }
    
    base_prices_hr = {
        'Tractor': 800, 'Harvester': 2000, 'Water Pump': 200, 'Sprayer': 100
    }
    
    product_types_inputs = list(base_prices_kg.keys())
    product_types_rentals = list(base_prices_hr.keys())
    
    data = []
    for _ in range(num_samples):
        cat = np.random.choice(categories)
        if cat == 'inputs':
            ptype = np.random.choice(product_types_inputs)
            # Assign appropriate units for inputs
            if ptype in ['Urea', 'DAP']:
                unit = np.random.choice(['kg', 'bag', 'ton'], p=[0.1, 0.8, 0.1]) # 80% time sold in bags
            elif 'Seeds' in ptype:
                if ptype in ['Wheat Seeds', 'Rice Seeds', 'Mustard Seeds']:
                    unit = np.random.choice(['kg', 'bag', 'ton'], p=[0.4, 0.5, 0.1])
                else:
                    unit = np.random.choice(['kg', 'packet', 'gram'], p=[0.3, 0.5, 0.2])
            else:
                unit = np.random.choice(['litre', 'bottle'])
                
            base_price = base_prices_kg.get(ptype, 100)
            
            # Scale base price by unit for inputs
            if unit == 'bag' and ptype in ['Urea', 'DAP']: multiplier = 50 # 50kg bags
            elif unit == 'bag' and 'Seeds' in ptype: multiplier = 30 # 30kg seed bags
            elif unit == 'ton': multiplier = 1000
            elif unit == 'packet': multiplier = 0.05 # 50g packets for high value seeds
            elif unit == 'gram': multiplier = 0.001
            elif unit == 'bottle': multiplier = 1 # assume 1L bottle
            else: multiplier = 1 # kg or litre
            
            base_price *= multiplier
            
        else:
            ptype = np.random.choice(product_types_rentals)
            unit = np.random.choice(['hour', 'day'], p=[0.7, 0.3])
            
            base_price = base_prices_hr.get(ptype, 800)
            if unit == 'day':
                base_price *= 8 # 8 hours per day
        
        # Add market fluctuation noise (seasonality, region, demand)
        # Random noise between -10% and +20%
        noise_factor = np.random.uniform(-0.10, 0.20)
        actual_price = base_price * (1 + noise_factor)
        
        # Did it sell quickly? Probability based on how actual price compares to base price
        # If it's cheaper than base, higher probability of selling
        price_diff = (base_price - actual_price) / base_price
        # map price_diff (-0.2 to +0.1) to probability (0.3 to 0.9)
        prob_sell = min(0.95, max(0.1, 0.6 + price_diff * 2))
        
        data.append({
            'category': cat,
            'productType': ptype,
            'unit': unit,
            'price': actual_price,
            'sellingProbability': prob_sell
        })
        
    return pd.DataFrame(data)

def train_model():
    print("Generating synthetic dataset...")
    df = generate_synthetic_data(5000)
    
    print(df.head())
    
    # Encode categorical features
    le_cat = LabelEncoder()
    le_ptc = LabelEncoder()
    le_unit = LabelEncoder()
    
    df['category_en'] = le_cat.fit_transform(df['category'])
    df['productType_en'] = le_ptc.fit_transform(df['productType'])
    df['unit_en'] = le_unit.fit_transform(df['unit'])
    
    X = df[['category_en', 'productType_en', 'unit_en']]
    y_price = df['price']
    y_prob = df['sellingProbability']
    
    # Train test split
    X_train, X_test, y_price_train, y_price_test = train_test_split(X, y_price, test_size=0.2, random_state=42)
    _, _, y_prob_train, y_prob_test = train_test_split(X, y_prob, test_size=0.2, random_state=42)
    
    # Train Models
    print("Training Price Predictor...")
    price_model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    price_model.fit(X_train, y_price_train)
    
    print("Training Sell Probability Predictor...")
    prob_model = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)
    prob_model.fit(X_train, y_prob_train)
    
    # Save encoders and models
    encoders = {
        'category': le_cat,
        'productType': le_ptc,
        'unit': le_unit
    }
    models = {
        'price_model': price_model,
        'prob_model': prob_model
    }
    
    joblib.dump(encoders, ENCODERS_PATH)
    joblib.dump(models, MODEL_PATH)
    
    print(f"Models saved to {MODEL_PATH} and {ENCODERS_PATH}")

if __name__ == '__main__':
    train_model()
