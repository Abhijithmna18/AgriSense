"""
train.py — Crop Yield Prediction Model Training
================================================
Dataset: patelris/crop-yield-prediction-dataset (Kaggle)
Algorithm: VotingRegressor (GradientBoosting + RandomForest + Ridge)
Output: model.pkl, feature_columns.json, crop_stats.json

Usage:
  python train.py                           # uses data/crop_yield_dataset.csv
  python train.py --data path/to/data.csv  # custom path
  python download_dataset.py && python train.py   # full pipeline
"""

import os
import sys
import json
import argparse
import warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor, VotingRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer

warnings.filterwarnings('ignore')

# --------------------------------------------------------------------------
# Constants
# --------------------------------------------------------------------------
DATA_PATH = "data/crop_yield_dataset.csv"
MODEL_PATH = "model.pkl"
FEATURE_COLS_PATH = "feature_columns.json"
CROP_STATS_PATH = "crop_stats.json"
LABEL_ENCODERS_PATH = "label_encoders.pkl"


def load_and_clean(data_path: str) -> pd.DataFrame:
    print(f"\n[1/5] Loading data from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"      Shape: {df.shape}")
    print(f"      Columns: {list(df.columns)}")

    # Normalize column names: lowercase, strip, replace spaces with underscores
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_').str.replace('-', '_')
    print(f"      Normalized columns: {list(df.columns)}")

    # Drop unnamed index columns (common in Kaggle CSVs saved with index)
    df = df.loc[:, ~df.columns.str.startswith('unnamed')]
    print(f"      After dropping unnamed columns: {list(df.columns)}")

    # Drop rows with missing target
    # Common target column names in this dataset
    possible_targets = ['yield', 'crop_yield', 'yield_(kg/ha)', 'yield_kg_per_ha',
                        'production', 'yield_hg/ha_yield']
    target_col = None
    for t in possible_targets:
        if t in df.columns:
            target_col = t
            break

    if target_col is None:
        # Try to find any column that could be yield
        for col in df.columns:
            if 'yield' in col.lower() or 'production' in col.lower():
                target_col = col
                break

    if target_col is None:
        print("ERROR: Could not detect target 'yield' column. Available columns:")
        print(df.columns.tolist())
        sys.exit(1)

    print(f"      Target column detected: '{target_col}'")

    # Drop nulls in target
    df = df.dropna(subset=[target_col])

    # Remove obvious outliers (yield = 0 or extremely high values)
    q_low = df[target_col].quantile(0.01)
    q_high = df[target_col].quantile(0.99)
    df = df[(df[target_col] >= q_low) & (df[target_col] <= q_high)]
    print(f"      After outlier removal: {len(df)} rows")

    return df, target_col


def engineer_features(df: pd.DataFrame, target_col: str):
    print("\n[2/5] Feature engineering ...")

    # Identify categorical and numerical columns
    cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    num_cols = [c for c in num_cols if c != target_col]

    print(f"      Categorical features: {cat_cols}")
    print(f"      Numerical features: {num_cols}")

    # Compute per-crop statistics for the API response
    crop_col = None
    for c in cat_cols:
        if 'crop' in c.lower() or c.lower() == 'item':
            crop_col = c
            break

    crop_stats = {}
    if crop_col:
        stats = df.groupby(crop_col)[target_col].agg(['mean', 'min', 'max', 'std']).round(2)
        crop_stats = stats.to_dict(orient='index')
        print(f"      Found {len(crop_stats)} unique crops")

    return cat_cols, num_cols, crop_stats, crop_col


def build_pipeline(cat_cols, num_cols):
    """Build a sklearn ColumnTransformer pipeline."""
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(transformers=[
        ('num', numeric_transformer, num_cols),
        ('cat', categorical_transformer, cat_cols)
    ])

    # Ensemble: GBM + RF + Ridge in a VotingRegressor
    gbm = GradientBoostingRegressor(
        n_estimators=300, max_depth=5, learning_rate=0.05,
        subsample=0.8, min_samples_split=5, random_state=42
    )
    rf = RandomForestRegressor(
        n_estimators=200, max_depth=10, min_samples_split=5,
        n_jobs=-1, random_state=42
    )
    ridge = Ridge(alpha=1.0)

    ensemble = VotingRegressor(estimators=[
        ('gbm', gbm),
        ('rf', rf),
        ('ridge', ridge)
    ], weights=[3, 2, 1])

    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', ensemble)
    ])

    return model


def train(data_path: str):
    df, target_col = load_and_clean(data_path)
    cat_cols, num_cols, crop_stats, crop_col = engineer_features(df, target_col)

    feature_cols = cat_cols + num_cols
    X = df[feature_cols]
    y = df[target_col]

    print("\n[3/5] Splitting data (80/10/10) ...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"      Train: {len(X_train)}, Test: {len(X_test)}")

    print("\n[4/5] Training ensemble model (GBM + RF + Ridge) ...")
    pipeline = build_pipeline(cat_cols, num_cols)
    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print(f"\n{'='*50}")
    print(f"  Test MAE  : {mae:.2f}")
    print(f"  Test RMSE : {rmse:.2f}")
    print(f"  Test R²   : {r2:.4f}")
    print(f"{'='*50}")

    # Cross-validation
    cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring='r2', n_jobs=-1)
    print(f"  5-Fold CV R²: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    print("\n[5/5] Saving artifacts ...")
    os.makedirs("data", exist_ok=True)

    # Save the full pipeline (preprocessor + model)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"  Saved: {MODEL_PATH}")

    # Save metadata for the API to use
    metadata = {
        "feature_columns": feature_cols,
        "categorical_columns": cat_cols,
        "numerical_columns": num_cols,
        "target_column": target_col,
        "crop_column": crop_col,
        "metrics": {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "r2": round(r2, 4),
            "cv_r2_mean": round(cv_scores.mean(), 4),
            "cv_r2_std": round(cv_scores.std(), 4)
        },
        "unique_values": {}
    }

    # Capture unique values for each categorical column (for frontend dropdowns)
    for col in cat_cols:
        metadata["unique_values"][col] = sorted(df[col].dropna().unique().tolist())

    # Capture numerical ranges for validation
    metadata["numerical_ranges"] = {
        col: {
            "min": round(float(df[col].min()), 2),
            "max": round(float(df[col].max()), 2),
            "mean": round(float(df[col].mean()), 2)
        }
        for col in num_cols
    }

    with open(FEATURE_COLS_PATH, 'w') as f:
        json.dump(metadata, f, indent=4)
    print(f"  Saved: {FEATURE_COLS_PATH}")

    # Save crop statistics (avg yield per crop for reference)
    with open(CROP_STATS_PATH, 'w') as f:
        json.dump(crop_stats, f, indent=4)
    print(f"  Saved: {CROP_STATS_PATH}")

    # Plot prediction vs actual
    plt.figure(figsize=(8, 6))
    plt.scatter(y_test, y_pred, alpha=0.4, edgecolors='k', linewidths=0.3, s=20)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
    plt.xlabel('Actual Yield')
    plt.ylabel('Predicted Yield')
    plt.title(f'Actual vs Predicted Yield (R² = {r2:.3f})')
    plt.tight_layout()
    plt.savefig('data/prediction_scatter.png', dpi=150)
    plt.close()
    print("  Saved: data/prediction_scatter.png")

    print(f"\n{'='*50}")
    print("  TRAINING COMPLETE!")
    print("  To start the inference server, run:")
    print("    uvicorn main:app --host 0.0.0.0 --port 8001 --reload")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the Crop Yield Prediction Model")
    parser.add_argument(
        "--data",
        type=str,
        default=DATA_PATH,
        help=f"Path to the CSV dataset (default: {DATA_PATH})"
    )
    args = parser.parse_args()

    if not os.path.exists(args.data):
        print(f"[ERROR] Dataset not found at: {args.data}")
        print("  Run: python download_dataset.py   to download it first.")
        sys.exit(1)

    train(args.data)
