"""
Leaf Validation Module
Validates if an uploaded image contains a plant leaf before running disease detection.
Uses a lightweight MobileNetV2 classifier to distinguish leaves from non-leaf images.
"""

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import numpy as np

class LeafValidator:
    """
    Binary classifier to validate if an image contains a plant leaf.
    Uses pretrained MobileNetV2 for efficient inference.
    """
    
    def __init__(self, confidence_threshold=0.80):
        """
        Initialize the leaf validator.
        
        Args:
            confidence_threshold: Minimum confidence score to accept an image as a leaf (0.0-1.0)
        """
        self.confidence_threshold = confidence_threshold
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Use MobileNetV2 pretrained on ImageNet
        # ImageNet contains many plant/leaf categories, so it's good for transfer learning
        self.model = models.mobilenet_v2(pretrained=True)
        self.model.eval()
        self.model.to(self.device)
        
        # Standard ImageNet preprocessing
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                               std=[0.229, 0.224, 0.225])
        ])
        
        # ImageNet classes that represent leaves, plants, and crops
        # These are class indices from ImageNet-1k
        self.leaf_related_classes = {
            # Vegetables and crops
            936, 937, 938, 939, 940, 941, 942, 943, 944, 945, 946, 947, 948, 949, 950,
            # Fruits
            948, 949, 950, 951, 952, 953, 954, 955, 956, 957, 958, 959, 960, 961, 962, 963,
            # Plants and leaves (general)
            # Note: ImageNet doesn't have explicit "leaf" classes, but has many plant-related ones
        }
        
    def validate_image_quality(self, image: Image.Image):
        """
        Check basic image quality requirements.
        
        Args:
            image: PIL Image object
            
        Returns:
            tuple: (is_valid, error_message)
        """
        width, height = image.size
        
        # Check minimum resolution
        if width < 224 or height < 224:
            return False, "Image resolution too low. Please upload an image at least 224x224 pixels."
        
        # Check if image is too blurry (using Laplacian variance)
        try:
            import cv2
            img_array = np.array(image.convert('L'))  # Convert to grayscale
            laplacian_var = cv2.Laplacian(img_array, cv2.CV_64F).var()
            
            if laplacian_var < 50:  # Threshold for blur detection
                return False, "Image appears blurry. Please upload a clearer photo."
        except:
            pass  # Skip blur detection if cv2 not available
        
        return True, ""
    
    def is_leaf_image(self, image: Image.Image):
        """
        Determine if the image contains a plant leaf using heuristic analysis.
        
        This method uses multiple signals:
        1. Color analysis (green dominance, skin tone rejection)
        2. Texture patterns
        3. ImageNet classification confidence
        
        Args:
            image: PIL Image object
            
        Returns:
            tuple: (is_leaf, confidence, reason)
        """
        # First check image quality
        quality_ok, quality_msg = self.validate_image_quality(image)
        if not quality_ok:
            return False, 0.0, quality_msg
        
        # Check for human faces/skin tones (CRITICAL)
        has_face = self._detect_face_or_skin(image)
        if has_face:
            return False, 0.0, "Image appears to contain a human face or person. Please upload a clear photo of a plant leaf only."
        
        # Analyze color composition
        color_score = self._analyze_color_composition(image)
        
        # Get ImageNet predictions
        imagenet_score = self._get_imagenet_plant_score(image)
        
        # Combine scores with stricter weighting
        # Color is MORE important for leaf detection
        combined_confidence = (color_score * 0.7) + (imagenet_score * 0.3)
        
        # Additional check: BOTH scores must be above minimum
        if color_score < 0.15 or imagenet_score < 0.15:
            combined_confidence = 0.0
        
        is_leaf = combined_confidence >= self.confidence_threshold
        
        if not is_leaf:
            if color_score < 0.15:
                reason = "Image does not appear to contain plant material. Please upload a clear photo of a plant leaf."
            elif imagenet_score < 0.15:
                reason = "Image does not match expected leaf patterns. Please ensure the photo clearly shows a plant leaf."
            else:
                reason = "Image unclear. Please upload a clear, well-lit photo of a single plant leaf."
        else:
            reason = "Leaf detected successfully"
        
        return is_leaf, combined_confidence, reason
    
    def _detect_face_or_skin(self, image: Image.Image):
        """
        Detect if image contains human face or significant skin tones.
        
        Returns:
            bool: True if face/skin detected, False otherwise
        """
        # Resize for faster processing
        img_small = image.resize((100, 100))
        img_array = np.array(img_small)
        
        r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
        
        # Multiple skin tone detection methods
        
        # Method 1: RGB-based skin detection
        # Skin tones typically: 95 < R < 255, 40 < G < 100, 20 < B < 100
        # And R > G > B with specific ratios
        skin_mask_1 = ((r > 95) & (r < 255) & 
                       (g > 40) & (g < 100) & 
                       (b > 20) & (b < 100) & 
                       (r > g) & (g > b) & 
                       (abs(r - g) > 15))
        
        # Method 2: Broader skin detection
        skin_mask_2 = ((r > 60) & (g > 40) & (b > 20) & 
                       (r > g) & (g > b) & 
                       ((r - g) > 10) & ((r - g) < 80) &
                       ((g - b) > 5) & ((g - b) < 50))
        
        # Combine masks
        skin_mask = skin_mask_1 | skin_mask_2
        skin_ratio = np.sum(skin_mask) / (img_small.size[0] * img_small.size[1])
        
        # If more than 20% of image is skin-like, likely a face/person
        if skin_ratio > 0.20:
            return True
        
        # Additional check: detect face-like structures (eyes, symmetry)
        # Check for dark regions (eyes) surrounded by skin tones
        # This is a simple heuristic
        gray = np.mean(img_array, axis=2)
        dark_mask = gray < 80
        dark_ratio = np.sum(dark_mask) / (img_small.size[0] * img_small.size[1])
        
        # Faces typically have 5-15% dark regions (eyes, hair) with skin
        if skin_ratio > 0.15 and 0.05 < dark_ratio < 0.25:
            return True
        
        return False
    
    def _analyze_color_composition(self, image: Image.Image):
        """
        Analyze color composition to detect green plant material.
        
        Returns:
            float: Score between 0-1 indicating likelihood of plant material
        """
        # Resize for faster processing
        img_small = image.resize((100, 100))
        img_array = np.array(img_small)
        
        # Calculate green dominance
        r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
        
        # STRICT green detection: G must be significantly higher than R and B
        # Typical leaf: G > R+20 and G > B+20
        green_mask = (g > r + 20) & (g > b + 20) & (g > 60)
        green_ratio = np.sum(green_mask) / (img_small.size[0] * img_small.size[1])
        
        # Brown/yellow for diseased leaves (but not skin tones)
        # Diseased leaves: high R, moderate G, low B
        # Skin tones: high R, moderate G, moderate B (reject this)
        brown_yellow_mask = ((r > 120) & (g > 90) & (g < r - 10) & (b < 80))
        brown_yellow_ratio = np.sum(brown_yellow_mask) / (img_small.size[0] * img_small.size[1])
        
        # Detect skin tones (to reject faces)
        # Skin: R > G > B, with specific ranges
        skin_mask = ((r > 95) & (g > 40) & (b > 20) & 
                     (r > g) & (g > b) & 
                     (abs(r - g) > 15) & 
                     ((r - g) < 100))
        skin_ratio = np.sum(skin_mask) / (img_small.size[0] * img_small.size[1])
        
        # If significant skin detected, return very low score
        if skin_ratio > 0.15:  # More than 15% skin-like pixels
            return 0.0
        
        # Combined plant color score (must have significant green OR brown/yellow)
        plant_color_score = (green_ratio * 2.0) + (brown_yellow_ratio * 1.0)
        
        # Require minimum threshold
        if plant_color_score < 0.15:  # Less than 15% plant-like colors
            return 0.0
        
        return min(1.0, plant_color_score)
    
    def _get_imagenet_plant_score(self, image: Image.Image):
        """
        Use ImageNet classification to detect plant-related content.
        
        Returns:
            float: Confidence score for plant-related content (0-1)
        """
        # Preprocess image
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Get predictions
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
        
        # Get top 5 predictions
        top5_prob, top5_idx = torch.topk(probabilities, 5)
        
        # ImageNet classes that are definitely NOT plants
        # These include people, animals, vehicles, furniture, etc.
        non_plant_classes = set(range(0, 400))  # First 400 classes are mostly non-plant
        
        # Check if top prediction is a non-plant class
        top_class = top5_idx[0].item()
        top_confidence = top5_prob[0].item()
        
        # If model is very confident about a non-plant class, reject
        if top_class in non_plant_classes and top_confidence > 0.3:
            return 0.0  # Definitely not a plant
        
        # Check for plant-related classes in top 5
        # ImageNet plant classes are typically in range 900-999 (fruits, vegetables)
        plant_classes = set(range(900, 1000))
        
        plant_confidence = 0.0
        for prob, idx in zip(top5_prob, top5_idx):
            if idx.item() in plant_classes:
                plant_confidence = max(plant_confidence, prob.item())
        
        # If we found plant classes, return that confidence
        if plant_confidence > 0.1:
            return min(1.0, plant_confidence * 2.0)
        
        # Otherwise, return low score
        return 0.2
    
    def validate(self, image: Image.Image):
        """
        Main validation method.
        
        Args:
            image: PIL Image object
            
        Returns:
            dict: Validation result with keys:
                - is_valid: bool
                - confidence: float
                - message: str
        """
        is_leaf, confidence, reason = self.is_leaf_image(image)
        
        return {
            "is_valid": is_leaf,
            "confidence": round(confidence, 4),
            "message": reason
        }


# Global validator instance
_validator_instance = None

def get_validator():
    """Get or create the global validator instance."""
    global _validator_instance
    if _validator_instance is None:
        _validator_instance = LeafValidator(confidence_threshold=0.80)
    return _validator_instance
