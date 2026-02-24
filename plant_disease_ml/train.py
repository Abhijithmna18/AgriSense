import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
from model import DiseaseClassifier
from dataset_pipeline import build_data_pipeline

def train_model(data_dir, num_epochs=30, batch_size=32, device="cpu"):
    print(f"Using device: {device}")
    
    # 1. Pipeline
    train_loader, val_loader, test_loader, idx_to_class = build_data_pipeline(data_dir, batch_size=batch_size)
    num_classes = len(idx_to_class)
    print(f"Found {num_classes} classes.")
    
    # 2. Model & Optimization
    model = DiseaseClassifier(num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.base_model.classifier.parameters(), lr=1e-3)
    scheduler = ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=3)
    
    best_val_loss = float('inf')
    epochs_no_improve = 0
    patience = 5
    
    # PHASE 1: Train just the custom head
    print("PHASE 1: Training classifier head with frozen base layers...")
    best_model_state = _training_loop(
        model, train_loader, val_loader, criterion, optimizer, scheduler,
        device, num_epochs=10, patience=patience, phase_name="Phase 1"
    )
    
    if best_model_state:
        model.load_state_dict(best_model_state)
    
    # PHASE 2: Unfreeze top layers and fine-tune
    print("\nPHASE 2: Unfreezing top 20 layers for fine-tuning...")
    model.unfreeze_top_n_layers(n=20)
    
    # Use smaller learning rate for fine tuning
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-4)
    scheduler = ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=2)
    
    best_model_state = _training_loop(
        model, train_loader, val_loader, criterion, optimizer, scheduler,
        device, num_epochs=num_epochs, patience=patience, phase_name="Phase 2"
    )
    
    if best_model_state:
        model.load_state_dict(best_model_state)
        torch.save(model.state_dict(), 'best_model.pth')
        print("Saved best_model.pth")
    
    # 3. Final Evaluation
    print("\nEvaluating on Test Set...")
    evaluate_model(model, test_loader, idx_to_class, device)


def _training_loop(model, train_loader, val_loader, criterion, optimizer, scheduler, device, num_epochs, patience, phase_name):
    best_loss = float('inf')
    epochs_no_improve = 0
    best_state = None
    
    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        correct, total = 0, 0
        
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * inputs.size(0)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
        train_loss = running_loss / len(train_loader.dataset)
        train_acc = correct / total
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_correct, val_total = 0, 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item() * inputs.size(0)
                _, predicted = torch.max(outputs.data, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
                
        val_loss = val_loss / len(val_loader.dataset)
        val_acc = val_correct / val_total
        
        print(f"[{phase_name}] Epoch {epoch+1}/{num_epochs} - Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}")
        
        scheduler.step(val_loss)
        
        if val_loss < best_loss:
            best_loss = val_loss
            epochs_no_improve = 0
            best_state = model.state_dict()
        else:
            epochs_no_improve += 1
            if epochs_no_improve >= patience:
                print(f"Early stopping triggered after {epoch + 1} epochs!")
                break
                
    return best_state


def evaluate_model(model, test_loader, idx_to_class, device):
    model.eval()
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            
    # Classification Report
    target_names = [idx_to_class[i] for i in range(len(idx_to_class))]
    print(classification_report(all_labels, all_preds, target_names=target_names))
    
    # Confusion Matrix Plot
    cm = confusion_matrix(all_labels, all_preds)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=target_names, yticklabels=target_names)
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Confusion Matrix')
    plt.tight_layout()
    plt.savefig('confusion_matrix.png')
    print("Saved confusion_matrix.png")

if __name__ == "__main__":
    # Point this to your actual dataset path if different
    data_directory = r"C:\Users\abhij\Downloads\disease\color"
    train_model(data_directory)
