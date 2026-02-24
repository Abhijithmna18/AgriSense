import sys
import json
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'pricing_model.pkl')
ENCODERS_PATH = os.path.join(os.path.dirname(__file__), 'pricing_encoders.pkl')

def predict_price(category, product_type, unit):
    try:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODERS_PATH):
            print(json.dumps({"error": "Model files not found. Run training script first."}))
            return
            
        encoders = joblib.load(ENCODERS_PATH)
        models = joblib.load(MODEL_PATH)
        
        le_cat = encoders['category']
        le_ptc = encoders['productType']
        le_unit = encoders['unit']
        
        price_model = models['price_model']
        prob_model = models['prob_model']
        
        # Handle unknown categories gracefully using a default if possible
        cat_en = le_cat.transform([category])[0] if category in le_cat.classes_ else le_cat.transform([le_cat.classes_[0]])[0]
        ptc_en = le_ptc.transform([product_type])[0] if product_type in le_ptc.classes_ else le_ptc.transform([le_ptc.classes_[0]])[0]
        unit_en = le_unit.transform([unit])[0] if unit in le_unit.classes_ else le_unit.transform([le_unit.classes_[0]])[0]
        
        X = [[cat_en, ptc_en, unit_en]]
        
        # Predictions
        suggested_price = price_model.predict(X)[0]
        prob_sell = prob_model.predict(X)[0]
        
        # Calculate market average using the predictions of all similar items in the tree
        # For simplicity in this script, we'll estimate market average as slightly varied from suggested price
        # In a real model, this could be extracted from training data distribution or tree variance
        market_average = suggested_price * 1.05 # Assume market is generally 5% higher than optimal sell price
        
        result = {
            "suggestedPrice": round(suggested_price, 2),
            "marketAverage": round(market_average, 2),
            "sellingProbability": round(prob_sell * 100, 1) # As percentage
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Missing required arguments: category, productType, unit"}))
        sys.exit(1)
        
    cat = sys.argv[1]
    ptype = sys.argv[2]
    unit = sys.argv[3]
    
    predict_price(cat, ptype, unit)
