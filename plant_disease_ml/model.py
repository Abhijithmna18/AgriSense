import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

class DiseaseClassifier(nn.Module):
    def __init__(self, num_classes):
        super(DiseaseClassifier, self).__init__()
        
        # 1. Load pretrained ImageNet weights
        weights = EfficientNet_B0_Weights.DEFAULT
        self.base_model = efficientnet_b0(weights=weights)
        
        # 2. Freeze base layers initially
        for param in self.base_model.parameters():
            param.requires_grad = False
            
        # Get the input features of the original classifier (usually 1280 for B0)
        num_ftrs = self.base_model.classifier[1].in_features
        
        # 3. Add custom head
        self.base_model.classifier = nn.Sequential(
            nn.Dropout(p=0.5),
            nn.Linear(num_ftrs, 512),
            nn.ReLU(),
            nn.Dropout(p=0.5),
            nn.Linear(512, num_classes)
            # Softmax is omitted here because we will use CrossEntropyLoss which combines LogSoftmax and NLLLoss over the scores
        )
        
    def forward(self, x):
        return self.base_model(x)

    def unfreeze_top_n_layers(self, n=20):
        """
        Unfreeze the top N layers for Phase 2 fine-tuning.
        Useful when the classifier head is already warm.
        """
        # Collect all parameters
        all_params = list(self.base_model.features.parameters())
        
        # Turn requires_grad to True for the last N parameter tensors
        num_layers = len(all_params)
        start_idx = max(0, num_layers - n)
        
        for idx, param in enumerate(all_params):
            if idx >= start_idx:
                param.requires_grad = True
                
        print(f"Unfroze top {min(n, num_layers)} parameter groups in base model features.")
