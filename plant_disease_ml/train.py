import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
import argparse
from model import DiseaseClassifier
from dataset_pipeline import build_data_pipeline


def train_model(data_dir, num_epochs=30, batch_size=32, device="cpu"):
    print(f"{'='*60}")
    print(f"  Plant Disease Model Training")
    print(f"{'='*60}")
    print(f"  Device       : {device}")
    print(f"  Dataset path : {data_dir}")
    print(f"  Epochs       : {num_epochs}")
    print(f"  Batch size   : {batch_size}")
    print(f"{'='*60}\n")

    # 1. Build data pipeline
    train_loader, val_loader, test_loader, idx_to_class = build_data_pipeline(data_dir, batch_size=batch_size)
    num_classes = len(idx_to_class)
    print(f"Found {num_classes} classes.")
    print(f"Example classes: {list(idx_to_class.values())[:5]}\n")

    # 2. Model & Optimization
    model = DiseaseClassifier(num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.base_model.classifier.parameters(), lr=1e-3)
    scheduler = ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=3)

    patience = 5

    # PHASE 1: Train just the custom head (feature extraction)
    print("=" * 60)
    print("PHASE 1: Training classifier head (base layers frozen)")
    print("=" * 60)
    best_model_state = _training_loop(
        model, train_loader, val_loader, criterion, optimizer, scheduler,
        device, num_epochs=10, patience=patience, phase_name="Phase 1"
    )

    if best_model_state:
        model.load_state_dict(best_model_state)

    # PHASE 2: Unfreeze top layers and fine-tune
    print("\n" + "=" * 60)
    print("PHASE 2: Fine-tuning (unfreezing top 20 layers)")
    print("=" * 60)
    model.unfreeze_top_n_layers(n=20)

    # Use smaller LR for fine tuning to avoid catastrophic forgetting
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-4)
    scheduler = ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=2)

    best_model_state = _training_loop(
        model, train_loader, val_loader, criterion, optimizer, scheduler,
        device, num_epochs=num_epochs, patience=patience, phase_name="Phase 2"
    )

    if best_model_state:
        model.load_state_dict(best_model_state)
        torch.save(model.state_dict(), 'best_model.pth')
        print("\nSaved: best_model.pth")

    # Save class indices for the inference server to use
    with open('class_indices.json', 'w') as f:
        json.dump(idx_to_class, f, indent=4)
    print("Saved: class_indices.json")

    # 3. Final Evaluation
    print("\n" + "=" * 60)
    print("Final Evaluation on Test Set")
    print("=" * 60)
    evaluate_model(model, test_loader, idx_to_class, device)

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE!")
    print("  To start the inference API server, run:")
    print("    uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
    print("=" * 60)


def _training_loop(model, train_loader, val_loader, criterion, optimizer, scheduler,
                   device, num_epochs, patience, phase_name):
    best_loss = float('inf')
    epochs_no_improve = 0
    best_state = None

    for epoch in range(num_epochs):
        # --- Train ---
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

        # --- Validation ---
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

        print(f"[{phase_name}] Epoch {epoch+1:02d}/{num_epochs} | "
              f"Train Loss: {train_loss:.4f}  Acc: {train_acc:.4f} | "
              f"Val Loss: {val_loss:.4f}  Acc: {val_acc:.4f}")

        scheduler.step(val_loss)

        if val_loss < best_loss:
            best_loss = val_loss
            epochs_no_improve = 0
            best_state = {k: v.clone() for k, v in model.state_dict().items()}
        else:
            epochs_no_improve += 1
            if epochs_no_improve >= patience:
                print(f"  Early stopping triggered after {epoch + 1} epochs for {phase_name}.")
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
    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, target_names=target_names))

    # Confusion Matrix Plot
    cm = confusion_matrix(all_labels, all_preds)
    fig_size = max(10, len(idx_to_class) // 2)
    plt.figure(figsize=(fig_size, fig_size - 2))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=target_names, yticklabels=target_names)
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Confusion Matrix')
    plt.tight_layout()
    plt.savefig('confusion_matrix.png', dpi=150)
    print("Saved: confusion_matrix.png")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the Plant Disease Classifier")
    parser.add_argument(
        "--data_dir",
        type=str,
        default=r"C:\Users\abhij\Downloads\disease\color",
        help="Path to the PlantVillage dataset root folder (with one subfolder per class)"
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=30,
        help="Maximum number of fine-tuning epochs in Phase 2 (default: 30)"
    )
    parser.add_argument(
        "--batch_size",
        type=int,
        default=32,
        help="Batch size for DataLoaders (default: 32)"
    )
    parser.add_argument(
        "--device",
        type=str,
        default="cuda" if torch.cuda.is_available() else "cpu",
        choices=["cpu", "cuda"],
        help="Device to train on (default: auto-detect)"
    )

    args = parser.parse_args()
    train_model(
        data_dir=args.data_dir,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        device=args.device
    )
