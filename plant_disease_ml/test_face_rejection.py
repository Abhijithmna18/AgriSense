"""
Quick test to verify face detection is working correctly.
This test creates synthetic images to verify the validation logic.
"""

import numpy as np
from PIL import Image
from leaf_validator import get_validator

def create_synthetic_face_image():
    """Create a synthetic image with skin-like colors (simulating a face)."""
    # Create 224x224 image with skin tones
    img_array = np.zeros((224, 224, 3), dtype=np.uint8)
    
    # Fill with skin-like RGB values
    # Typical skin: R=200, G=150, B=100
    img_array[:, :, 0] = 200  # R
    img_array[:, :, 1] = 150  # G
    img_array[:, :, 2] = 100  # B
    
    # Add some darker regions (simulating eyes/hair)
    img_array[80:100, 70:90, :] = 30    # Left eye
    img_array[80:100, 134:154, :] = 30  # Right eye
    
    return Image.fromarray(img_array, 'RGB')

def create_synthetic_leaf_image():
    """Create a synthetic image with green colors (simulating a leaf)."""
    # Create 224x224 image with green tones
    img_array = np.zeros((224, 224, 3), dtype=np.uint8)
    
    # Fill with leaf-like RGB values
    # Typical leaf: R=50, G=150, B=50
    img_array[:, :, 0] = 50   # R
    img_array[:, :, 1] = 150  # G
    img_array[:, :, 2] = 50   # B
    
    # Add some variation (leaf texture)
    noise = np.random.randint(-20, 20, (224, 224, 3))
    img_array = np.clip(img_array + noise, 0, 255).astype(np.uint8)
    
    return Image.fromarray(img_array, 'RGB')

def create_synthetic_object_image():
    """Create a synthetic image with non-plant colors (simulating an object)."""
    # Create 224x224 image with gray/blue tones
    img_array = np.zeros((224, 224, 3), dtype=np.uint8)
    
    # Fill with object-like RGB values (gray/blue)
    img_array[:, :, 0] = 100  # R
    img_array[:, :, 1] = 100  # G
    img_array[:, :, 2] = 150  # B
    
    return Image.fromarray(img_array, 'RGB')

def test_validation():
    """Run validation tests on synthetic images."""
    print("=" * 60)
    print("  FACE REJECTION TEST SUITE")
    print("=" * 60)
    print()
    
    validator = get_validator()
    
    # Test 1: Synthetic Face Image
    print("Test 1: Synthetic Face Image (Skin Tones)")
    print("-" * 60)
    face_img = create_synthetic_face_image()
    result = validator.validate(face_img)
    
    print(f"Result: {'REJECTED' if not result['is_valid'] else 'ACCEPTED'}")
    print(f"Confidence: {result['confidence']:.4f}")
    print(f"Message: {result['message']}")
    
    if not result['is_valid']:
        print("✅ TEST PASSED - Face correctly rejected")
    else:
        print("❌ TEST FAILED - Face incorrectly accepted!")
    print()
    
    # Test 2: Synthetic Leaf Image
    print("Test 2: Synthetic Leaf Image (Green Colors)")
    print("-" * 60)
    leaf_img = create_synthetic_leaf_image()
    result = validator.validate(leaf_img)
    
    print(f"Result: {'REJECTED' if not result['is_valid'] else 'ACCEPTED'}")
    print(f"Confidence: {result['confidence']:.4f}")
    print(f"Message: {result['message']}")
    
    if result['is_valid']:
        print("✅ TEST PASSED - Leaf correctly accepted")
    else:
        print("❌ TEST FAILED - Leaf incorrectly rejected!")
    print()
    
    # Test 3: Synthetic Object Image
    print("Test 3: Synthetic Object Image (Gray/Blue)")
    print("-" * 60)
    object_img = create_synthetic_object_image()
    result = validator.validate(object_img)
    
    print(f"Result: {'REJECTED' if not result['is_valid'] else 'ACCEPTED'}")
    print(f"Confidence: {result['confidence']:.4f}")
    print(f"Message: {result['message']}")
    
    if not result['is_valid']:
        print("✅ TEST PASSED - Object correctly rejected")
    else:
        print("❌ TEST FAILED - Object incorrectly accepted!")
    print()
    
    print("=" * 60)
    print("  TEST SUITE COMPLETE")
    print("=" * 60)
    print()
    print("Next Steps:")
    print("1. If all tests passed, the fix is working correctly")
    print("2. Test with real images (face photo, leaf photo)")
    print("3. Deploy to production")
    print()
    print("To test with real images:")
    print("  python test_validation.py")
    print()

if __name__ == "__main__":
    test_validation()
