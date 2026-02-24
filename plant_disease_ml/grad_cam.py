import torch
import torch.nn.functional as F
import numpy as np
import cv2

class GradCAM:
    """
    Implements Grad-CAM for PyTorch EfficientNet.
    Extracts gradients and activations from the final convolutional layer to generate a heatmap.
    """
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        # Hooks to extract tensors
        self.target_layer.register_forward_hook(self.save_activation)
        self.target_layer.register_full_backward_hook(self.save_gradient)

    def save_activation(self, module, input, output):
        self.activations = output

    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]

    def generate_heatmap(self, input_tensor, class_idx=None):
        self.model.eval()
        self.model.zero_grad()
        
        output = self.model(input_tensor)
        
        if class_idx is None:
            class_idx = torch.argmax(output, dim=1).item()
            
        score = output[0][class_idx]
        score.backward()
        
        # Pool the gradients across the spatial dimensions
        pooled_gradients = torch.mean(self.gradients, dim=[0, 2, 3])
        
        # Multiply activations by the pooled gradients
        activations = self.activations[0]
        for i in range(activations.size(0)):
            activations[i] *= pooled_gradients[i]
            
        # Create heatmap (ReLU on the weighted combination of activations)
        heatmap = torch.mean(activations, dim=0).detach().cpu().numpy()
        heatmap = np.maximum(heatmap, 0)
        
        # Normalize
        heatmap = heatmap / (np.max(heatmap) + 1e-8)
        return heatmap

def apply_heatmap_to_image(image_cv2, heatmap):
    """
    Overlays the raw heatmap onto the original BGR cv2 image.
    """
    heatmap = cv2.resize(heatmap, (image_cv2.shape[1], image_cv2.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    
    superimposed_img = heatmap * 0.4 + image_cv2
    # Ensure values are valid 0-255 uint8 range
    superimposed_img = np.clip(superimposed_img, 0, 255).astype(np.uint8)
    return superimposed_img
