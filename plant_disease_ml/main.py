import os
import json
import base64
from io import BytesIO
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
from torchvision import transforms
from PIL import Image
import numpy as np
import cv2

from model import DiseaseClassifier
from grad_cam import GradCAM, apply_heatmap_to_image

app = FastAPI(title="Plant Doctor - ML Inference Engine")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_PATH = "best_model.pth"
CLASS_INDEX_PATH = "class_indices.json"
MEDICINE_MAP_PATH = "disease_medicine_map.json"

model = None
idx_to_class = {}
medicine_map = {}
grad_cam = None

# Standard ImageNet Transforms
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

@app.on_event("startup")
async def load_resources():
    global model, idx_to_class, medicine_map, grad_cam
    
    # 1. Load Medicine Mapping
    if os.path.exists(MEDICINE_MAP_PATH):
        with open(MEDICINE_MAP_PATH, "r") as f:
            medicine_map = json.load(f)
    else:
        print("Warning: disease_medicine_map.json not found!")

    # 2. Load Class Indices
    if os.path.exists(CLASS_INDEX_PATH):
        with open(CLASS_INDEX_PATH, "r") as f:
            data = json.load(f)
            # Keys from JSON are strings, convert back to int
            idx_to_class = {int(k): v for k, v in data.items()}
    else:
        print("Warning: class_indices.json not found! Using dummy classes.")
        idx_to_class = {0: "Tomato_Early_blight", 1: "Healthy"}

    # 3. Load Model
    num_classes = len(idx_to_class)
    model = DiseaseClassifier(num_classes=num_classes).to(DEVICE)
    if os.path.exists(MODEL_PATH):
        model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
        print("Model loaded successfully.")
    else:
        print(f"Warning: {MODEL_PATH} not found. Running with untrained weights.")
        
    model.eval()
    
    # 4. Initialize Grad-CAM targeting the last conv layer of EfficientNet
    target_layer = model.base_model.features[-1]
    grad_cam = GradCAM(model, target_layer)

def generate_base64_heatmap(image_tensor, raw_image_pil):
    """
    Generate a Grad-CAM heatmap, overlay it on the original image, and encode it in base64.
    """
    # Requires requires_grad=True to compute gradients backwards to the target layer
    image_tensor.requires_grad = True
    
    # Generates raw map
    heatmap = grad_cam.generate_heatmap(image_tensor)
    
    # Convert PIL directly to OpenCV BGR format 
    cv2_img = cv2.cvtColor(np.array(raw_image_pil), cv2.COLOR_RGB2BGR)
    
    # Overlay heatmap
    superimposed = apply_heatmap_to_image(cv2_img, heatmap)
    
    # Encode as Base64 JPEG
    _, buffer = cv2.imencode('.jpg', superimposed)
    b64_string = base64.b64encode(buffer).decode('utf-8')
    return b64_string

@app.post("/predict-disease")
async def predict_disease(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
        
    # Read Image limit 10MB
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit.")
        
    try:
        image = Image.open(BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Error decoding image file.")
        
    # Preprocess
    input_tensor = transform(image).unsqueeze(0).to(DEVICE)
    
    # Inference
    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
        
    confidence_tensor, predicted_idx = torch.max(probabilities, 0)
    confidence = confidence_tensor.item()
    pred_class_name = idx_to_class.get(predicted_idx.item(), "Unknown")
    
    # Severity Logic
    if confidence > 0.90:
        severity = "High"
    elif 0.70 <= confidence <= 0.90:
        severity = "Medium"
    else:
        severity = "Low"
        
    # Mapping
    treatment_plan = medicine_map.get(
        pred_class_name, 
        {"message": "No specific treatment mapped for this disease yet."}
    )
    
    # Crop Name vs Disease Name (Basic splitting logic)
    # E.g., "Tomato_Early_blight" -> Crop: Tomato, Disease: Early Blight
    parts = pred_class_name.split("_", 1)
    crop = parts[0] if len(parts) > 1 else "Unknown Crop"
    disease = parts[1].replace("_", " ") if len(parts) > 1 else pred_class_name
    
    if pred_class_name == "Healthy":
        crop = "Unknown Plant"
        disease = "Healthy"
    
    # Generate Heatmap Explainability
    # Must re-enable gradient tracking specifically for Grad-cam
    input_tensor_for_cam = transform(image).unsqueeze(0).to(DEVICE)
    try:
        heatmap_b64 = generate_base64_heatmap(input_tensor_for_cam, image.resize((224, 224)))
    except Exception as e:
        print(f"Error generating GradCAM: {e}")
        heatmap_b64 = None

    response = {
        "disease_prediction": {
            "crop": crop,
            "disease": disease,
            "raw_class": pred_class_name,
            "confidence": round(confidence, 4),
            "severity_estimation": severity,
            "consult_expert_recommended": confidence < 0.75
        },
        "treatment_plan": treatment_plan,
        "visual_explanation": f"data:image/jpeg;base64,{heatmap_b64}" if heatmap_b64 else None
    }
    
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
