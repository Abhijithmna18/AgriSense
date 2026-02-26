"""
download_dataset.py
Downloads the crop yield prediction dataset from Kaggle using kagglehub path API.
The dataset file has no extension, so we use kagglehub.dataset_download() to get
the raw folder path, then glob for CSV files.

Run this once before training:  python download_dataset.py
"""
import os
import sys
import glob
import shutil

def download():
    try:
        import kagglehub
        import pandas as pd
    except ImportError:
        print("[ERROR] Required packages not found.")
        print("  Run:  pip install kagglehub pandas")
        sys.exit(1)

    print("Downloading dataset: patelris/crop-yield-prediction-dataset ...")

    # Use the path API (returns local folder with downloaded files)
    dataset_path = kagglehub.dataset_download("patelris/crop-yield-prediction-dataset")
    print(f"  Dataset downloaded to: {dataset_path}")

    # Find all files in the dataset folder
    all_files = glob.glob(os.path.join(dataset_path, "**", "*"), recursive=True)
    print(f"  Files in dataset folder: {[os.path.basename(f) for f in all_files if os.path.isfile(f)]}")

    # Try to find a CSV file first, then try reading any file as CSV
    csv_files = [f for f in all_files if f.lower().endswith('.csv') and os.path.isfile(f)]
    data_files = [f for f in all_files if os.path.isfile(f)]

    df = None
    loaded_from = None

    # Try CSV files first
    for fpath in csv_files:
        try:
            df = pd.read_csv(fpath)
            loaded_from = fpath
            break
        except Exception as e:
            print(f"  Could not read {fpath} as CSV: {e}")

    # If no CSV found, try all files as CSV (many Kaggle datasets store CSV without extension)
    if df is None:
        for fpath in data_files:
            try:
                df = pd.read_csv(fpath)
                loaded_from = fpath
                print(f"  Successfully read file without extension as CSV: {os.path.basename(fpath)}")
                break
            except Exception:
                pass

    if df is None:
        print("\n[ERROR] Could not read any file from the dataset as CSV.")
        print("  Downloaded files:")
        for f in data_files:
            print(f"    {f}")
        print("\n  Please manually download the dataset from:")
        print("  https://www.kaggle.com/datasets/patelris/crop-yield-prediction-dataset")
        print("  and place the CSV as: data/crop_yield_dataset.csv")
        sys.exit(1)

    print(f"\n  Loaded {len(df)} rows, {len(df.columns)} columns from: {os.path.basename(loaded_from)}")
    print("  Columns:", list(df.columns))
    print("\n  First 5 records:")
    print(df.head())
    print("\n  Data types:")
    print(df.dtypes)
    print("\n  Missing values:")
    print(df.isnull().sum())

    # Save locally so training doesn't need to re-download
    os.makedirs("data", exist_ok=True)
    df.to_csv("data/crop_yield_dataset.csv", index=False)
    print("\n  Saved to data/crop_yield_dataset.csv")
    return df


if __name__ == "__main__":
    download()
