import pandas as pd
import os

# Source path (User would drop Kaggle 'Crop_recommendation.csv' here)
RAW_DATA_PATH = 'Crop_recommendation.csv' 
OUTPUT_DIR = 'processed'
OUTPUT_FILE = 'crop_recommendation.csv'

def ingest_data():
    if not os.path.exists(RAW_DATA_PATH):
        print(f"Error: {RAW_DATA_PATH} not found.")
        print("Please place the Kaggle dataset in this directory.")
        return

    print("Reading raw data...")
    df = pd.read_csv(RAW_DATA_PATH)
    
    print("Basic Validation...")
    # Check for missing values
    if df.isnull().sum().sum() > 0:
        print("Found missing values. Imputing...")
        df = df.fillna(df.mean(numeric_only=True))
    
    # Verify Columns
    required_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label']
    if not all(col in df.columns for col in required_cols):
        print("Error: Missing required columns in dataset.")
        return
    
    # Cleaning anomalies (pH range 0-14 validation example)
    anomalies = df[(df['ph'] < 0) | (df['ph'] > 14)]
    if not anomalies.empty:
        print(f"Removing {len(anomalies)} rows with invalid pH values.")
        df = df[(df['ph'] >= 0) & (df['ph'] <= 14)]

    # Result Statistics
    print("\nData Summary:")
    print(df.describe())

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    out_path = os.path.join(OUTPUT_DIR, OUTPUT_FILE)
    df.to_csv(out_path, index=False)
    print(f"\nProcessed data saved to {out_path}")

if __name__ == '__main__':
    ingest_data()
