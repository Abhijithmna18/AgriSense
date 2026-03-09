"""
Test script for leaf validation system.
Tests various image types to verify validation logic.
"""

import requests
import os
from pathlib import Path

ML_SERVICE_URL = "http://localhost:8000"

def test_health():
    """Test if ML service is running."""
    print("Testing ML service health...")
    try:
        response = requests.get(f"{ML_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ ML Service is online")
            print(f"   Model loaded: {data.get('model_loaded')}")
            print(f"   Device: {data.get('device')}")
            print(f"   Classes: {data.get('num_classes')}")
            return True
        else:
            print(f"❌ ML Service returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ ML Service is not running. Start it with: python main.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_validation_endpoint(image_path, expected_result=None):
    """Test validation endpoint with an image."""
    if not os.path.exists(image_path):
        print(f"⚠️  Image not found: {image_path}")
        return
    
    print(f"\nTesting: {os.path.basename(image_path)}")
    print("-" * 50)
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
            response = requests.post(
                f"{ML_SERVICE_URL}/validate-leaf",
                files=files,
                timeout=30
            )
        
        if response.status_code == 200:
            data = response.json()
            is_leaf = data.get('is_leaf')
            confidence = data.get('confidence', 0)
            message = data.get('message', '')
            
            result_icon = "✅" if is_leaf else "❌"
            print(f"{result_icon} Result: {'LEAF DETECTED' if is_leaf else 'NOT A LEAF'}")
            print(f"   Confidence: {confidence:.2%}")
            print(f"   Message: {message}")
            
            if expected_result is not None:
                if is_leaf == expected_result:
                    print(f"   ✅ Test PASSED (expected: {expected_result})")
                else:
                    print(f"   ❌ Test FAILED (expected: {expected_result}, got: {is_leaf})")
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"   Response: {response.text}")
    
    except Exception as e:
        print(f"❌ Error: {e}")

def test_disease_prediction_with_validation(image_path):
    """Test disease prediction endpoint (includes automatic validation)."""
    if not os.path.exists(image_path):
        print(f"⚠️  Image not found: {image_path}")
        return
    
    print(f"\nTesting Disease Prediction: {os.path.basename(image_path)}")
    print("-" * 50)
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
            response = requests.post(
                f"{ML_SERVICE_URL}/predict-disease",
                files=files,
                timeout=30
            )
        
        if response.status_code == 200:
            data = response.json()
            disease = data.get('disease_prediction', {})
            print(f"✅ Disease Detection Successful")
            print(f"   Crop: {disease.get('crop')}")
            print(f"   Disease: {disease.get('disease')}")
            print(f"   Confidence: {disease.get('confidence', 0):.2%}")
        elif response.status_code == 400:
            # Validation failed
            error = response.json()
            detail = error.get('detail', {})
            if isinstance(detail, dict) and detail.get('error') == 'INVALID_IMAGE':
                print(f"❌ Validation Failed (as expected)")
                print(f"   Message: {detail.get('message')}")
                print(f"   Confidence: {detail.get('confidence', 0):.2%}")
                print(f"   ✅ Validation system working correctly!")
            else:
                print(f"❌ Request failed: {error}")
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"   Response: {response.text}")
    
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Run all tests."""
    print("=" * 60)
    print("  LEAF VALIDATION SYSTEM - TEST SUITE")
    print("=" * 60)
    print()
    
    # Test 1: Health check
    if not test_health():
        print("\n⚠️  ML Service is not running. Please start it first.")
        print("   Run: python main.py")
        return
    
    print("\n" + "=" * 60)
    print("  VALIDATION ENDPOINT TESTS")
    print("=" * 60)
    
    # Test 2: Test with sample images (if available)
    # You can add your own test images here
    test_images = [
        # Format: (path, expected_is_leaf)
        # ("test_images/leaf.jpg", True),
        # ("test_images/face.jpg", False),
        # ("test_images/object.jpg", False),
    ]
    
    if not test_images:
        print("\n⚠️  No test images configured.")
        print("   Add test images to test_images/ directory and update this script.")
        print("\n   Example:")
        print("   test_images = [")
        print("       ('test_images/tomato_leaf.jpg', True),")
        print("       ('test_images/human_face.jpg', False),")
        print("   ]")
    else:
        for image_path, expected in test_images:
            test_validation_endpoint(image_path, expected)
    
    print("\n" + "=" * 60)
    print("  INTEGRATION TEST (Disease Prediction with Validation)")
    print("=" * 60)
    
    # Test 3: Test disease prediction with validation
    if test_images:
        for image_path, _ in test_images[:2]:  # Test first 2 images
            test_disease_prediction_with_validation(image_path)
    
    print("\n" + "=" * 60)
    print("  TEST SUITE COMPLETE")
    print("=" * 60)
    print()
    print("Manual Testing:")
    print("1. Open the frontend application")
    print("2. Navigate to Disease Detection page")
    print("3. Upload various images:")
    print("   - Plant leaf (should pass validation)")
    print("   - Human face (should fail validation)")
    print("   - Object/tool (should fail validation)")
    print("   - Landscape (should fail validation)")
    print()
    print("Expected Behavior:")
    print("✅ Valid leaf → Validation passes → Diagnosis enabled")
    print("❌ Invalid image → Validation fails → Diagnosis blocked")
    print()

if __name__ == "__main__":
    main()
