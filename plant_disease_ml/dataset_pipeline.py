import os
import glob
from pathlib import Path
from sklearn.model_selection import train_test_split
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, datasets
from torchvision.datasets import ImageFolder
from PIL import Image
import torch
import numpy as np
import json

class PlantDiseaseDataset(Dataset):
    def __init__(self, file_paths, labels, transform=None):
        self.file_paths = file_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, idx):
        img_path = self.file_paths[idx]
        image = Image.open(img_path).convert("RGB")
        label = self.labels[idx]
        
        if self.transform:
            image = self.transform(image)
            
        return image, label

def build_data_pipeline(data_dir, batch_size=32, target_size=(224, 224)):
    """
    Scans directory, creates train/val/test splits (70/15/15), and returns PyTorch dataloaders.
    """
    if not os.path.exists(data_dir):
        raise FileNotFoundError(f"Dataset path not found: {data_dir}")
        
    # Discover classes dynamically based on folder names
    classes = sorted([d.name for d in os.scandir(data_dir) if d.is_dir()])
    class_to_idx = {cls: i for i, cls in enumerate(classes)}
    idx_to_class = {i: cls for i, cls in enumerate(classes)}
    
    # Save class mapping to disk
    with open('class_indices.json', 'w') as f:
        json.dump(idx_to_class, f, indent=4)
        
    all_files = []
    all_labels = []
    
    for cls in classes:
        cls_dir = os.path.join(data_dir, cls)
        # Handle jpg, JPG, png, jpeg
        for ext in ('*.jpg', '*.jpeg', '*.png', '*.JPG'):
            img_paths = glob.glob(os.path.join(cls_dir, ext))
            all_files.extend(img_paths)
            all_labels.extend([class_to_idx[cls]] * len(img_paths))
            
    # Train test split (70% train, 30% temp)
    X_train, X_temp, y_train, y_temp = train_test_split(
        all_files, all_labels, test_size=0.3, stratify=all_labels, random_state=42
    )
    
    # Split temp into val and test (50% of 30% = 15% each)
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42
    )
    
    # ImageNet normalization standards
    normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                     std=[0.229, 0.224, 0.225])
    
    # Data Augmentation for training
    train_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomResizedCrop(target_size, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        normalize
    ])
    
    # Validation/Test transformations
    val_test_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(target_size),
        transforms.ToTensor(),
        normalize
    ])
    
    # Datasets
    train_dataset = PlantDiseaseDataset(X_train, y_train, transform=train_transform)
    val_dataset = PlantDiseaseDataset(X_val, y_val, transform=val_test_transform)
    test_dataset = PlantDiseaseDataset(X_test, y_test, transform=val_test_transform)
    
    # Handle Class Imbalance using WeightedRandomSampler
    class_counts = np.bincount(y_train)
    class_weights = 1. / class_counts
    sample_weights = np.array([class_weights[t] for t in y_train])
    sampler = torch.utils.data.WeightedRandomSampler(weights=sample_weights, num_samples=len(sample_weights), replacement=True)
    
    # Dataloaders
    # NOTE: num_workers=0 is required on Windows to avoid multiprocessing pickling errors.
    # On Linux/macOS you can safely increase this to 4 for faster data loading.
    train_loader = DataLoader(train_dataset, batch_size=batch_size, sampler=sampler, num_workers=0, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0, pin_memory=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0, pin_memory=True)
    
    return train_loader, val_loader, test_loader, idx_to_class
