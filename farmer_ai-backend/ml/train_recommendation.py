import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import xgboost as xgb
import joblib

# Configuration
DATA_PATH = '../data/processed/crop_recommendation.csv'
MODEL_PATH = 'crop_recommendation_xgb.pkl'

def train_model():
    print("Loading dataset...")
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        print("Data not found. Please run ingest_kaggle.py first.")
        return

    # Features: N, P, K, temperature, humidity, ph, rainfall
    # Target: label (crop name)
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']

    print(f"Dataset Shape: {X.shape}")
    print(f"Classes: {y.nunique()}")

    # Encoding target labels if needed (XGBoost handles strings in newer versions, but safe to encode)
    from sklearn.preprocessing import LabelEncoder
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Save label encoder for inference mapping
    joblib.dump(le, 'label_encoder.pkl')

    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

    # Train XGBoost
    print("Training XGBoost Classifier...")
    model = xgb.XGBClassifier(
        objective='multi:softprob',
        num_class=len(le.classes_),
        eval_metric='mlogloss',
        use_label_encoder=False
    )
    
    model.fit(X_train, y_train)

    # Evaluate
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Model Accuracy: {acc:.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, preds, target_names=le.classes_))

    # Save
    print(f"Saving model to {MODEL_PATH}...")
    joblib.dump(model, MODEL_PATH)
    print("Done.")

if __name__ == '__main__':
    train_model()
