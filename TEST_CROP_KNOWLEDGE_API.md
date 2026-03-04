# Crop Knowledge API Testing Guide

## ✅ Database Seeded Successfully!

The database now contains 5 crop knowledge articles:
1. Rice Cultivation - Complete Guide (Cereals)
2. Coconut Farming - Kerala's Pride (Cash Crops)
3. Banana Cultivation - High Value Crop (Fruits)
4. Black Pepper - King of Spices (Spices)
5. Tomato Cultivation - Profitable Vegetable (Vegetables)

---

## 🧪 API Testing with Postman/Thunder Client

### 1. Get All Articles (Public)
```
GET http://localhost:5002/api/resources/crop-knowledge
```

**Expected Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "page": 1,
  "pages": 1,
  "data": [...]
}
```

---

### 2. Get Single Article by Slug (Public)
```
GET http://localhost:5002/api/resources/crop-knowledge/rice-cultivation-complete-guide
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Rice Cultivation - Complete Guide",
    "slug": "rice-cultivation-complete-guide",
    "category": "Cereals",
    "content": {...},
    "views": 0,
    "likes": 0
  }
}
```

---

### 3. Get Featured Articles (Public)
```
GET http://localhost:5002/api/resources/crop-knowledge/featured
```

**Expected Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "title": "Rice Cultivation - Complete Guide",
      "slug": "rice-cultivation-complete-guide",
      "category": "Cereals",
      "isFeatured": true,
      "featuredOrder": 1
    },
    ...
  ]
}
```

---

### 4. Get Articles by Category (Public)
```
GET http://localhost:5002/api/resources/crop-knowledge/category/Cereals
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "data": [
    {
      "title": "Rice Cultivation - Complete Guide",
      "category": "Cereals"
    }
  ]
}
```

---

### 5. Search Articles (Public)
```
GET http://localhost:5002/api/resources/crop-knowledge/search?q=rice
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "data": [
    {
      "title": "Rice Cultivation - Complete Guide",
      "slug": "rice-cultivation-complete-guide"
    }
  ]
}
```

---

### 6. Get Categories List (Public)
```
GET http://localhost:5002/api/resources/crop-knowledge/categories/list
```

**Expected Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "category": "Cereals",
      "count": 1,
      "sampleArticles": [...]
    },
    ...
  ]
}
```

---

### 7. Get Tags List (Public)
```
GET http://localhost:5002/api/resources/crop-knowledge/tags/list
```

**Expected Response:**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "tag": "rice",
      "count": 1
    },
    ...
  ]
}
```

---

### 8. Get Popular Articles (Public)
```
GET http://localhost:5002/api/resources/crop-knowledge/popular?limit=5
```

---

### 9. Get Related Articles (Public)
```
GET http://localhost:5002/api/resources/crop-knowledge/{article_id}/related
```

---

## 🔐 Protected Endpoints (Require Authentication)

### 10. Like Article (Authenticated Users)
```
POST http://localhost:5002/api/resources/crop-knowledge/{article_id}/like
Headers:
  Authorization: Bearer {your_jwt_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "likes": 1,
    "isLiked": true
  }
}
```

---

## 👨‍💼 Admin Endpoints (Require Admin Role)

### 11. Create Article (Admin Only)
```
POST http://localhost:5002/api/resources/crop-knowledge
Headers:
  Authorization: Bearer {admin_jwt_token}
  Content-Type: application/json

Body:
{
  "title": "Test Crop Article",
  "category": "Vegetables",
  "tags": ["test", "vegetable"],
  "status": "draft",
  "content": {
    "introduction": "This is a test article..."
  }
}
```

---

### 12. Update Article (Admin Only)
```
PUT http://localhost:5002/api/resources/crop-knowledge/{article_id}
Headers:
  Authorization: Bearer {admin_jwt_token}
  Content-Type: application/json

Body:
{
  "title": "Updated Title",
  "status": "published"
}
```

---

### 13. Delete Article (Admin Only)
```
DELETE http://localhost:5002/api/resources/crop-knowledge/{article_id}
Headers:
  Authorization: Bearer {admin_jwt_token}
```

---

### 14. Toggle Publish Status (Admin Only)
```
PATCH http://localhost:5002/api/resources/crop-knowledge/{article_id}/publish
Headers:
  Authorization: Bearer {admin_jwt_token}
```

---

### 15. Toggle Featured Status (Admin Only)
```
PATCH http://localhost:5002/api/resources/crop-knowledge/{article_id}/feature
Headers:
  Authorization: Bearer {admin_jwt_token}
  Content-Type: application/json

Body:
{
  "order": 1
}
```

---

## 🔑 Getting Admin JWT Token

1. Login as admin user:
```
POST http://localhost:5002/api/auth/login
Content-Type: application/json

Body:
{
  "email": "abhijithmnair2002@gmail.com",
  "password": "your_password"
}
```

2. Copy the `token` from response
3. Use it in Authorization header: `Bearer {token}`

---

## ✅ Testing Checklist

- [ ] Get all articles works
- [ ] Get single article by slug works
- [ ] Get featured articles works
- [ ] Get articles by category works
- [ ] Search functionality works
- [ ] Get categories list works
- [ ] Get tags list works
- [ ] Like article works (with auth)
- [ ] Create article works (admin)
- [ ] Update article works (admin)
- [ ] Delete article works (admin)
- [ ] Toggle publish works (admin)
- [ ] Toggle featured works (admin)

---

## 🐛 Common Issues

### Issue: 401 Unauthorized
**Solution:** Make sure you're sending the JWT token in Authorization header

### Issue: 403 Forbidden
**Solution:** Make sure your user has admin role

### Issue: 404 Not Found
**Solution:** Check if the article slug/ID is correct

### Issue: 500 Server Error
**Solution:** Check server logs for detailed error message

---

## 📊 Expected Database State

After seeding, your MongoDB should have:
- **Collection:** `cropknowledges`
- **Documents:** 5 articles
- **Featured:** 3 articles (Rice, Coconut, Banana)
- **Published:** All 5 articles
- **Categories:** Cereals, Cash Crops, Fruits, Spices, Vegetables

---

## 🎯 Next Steps

1. ✅ Test all public endpoints
2. ✅ Test authenticated endpoints (like)
3. ✅ Test admin endpoints (CRUD)
4. ✅ Verify data in MongoDB Compass
5. ✅ Test frontend pages
6. ✅ Add routes to React Router
7. ✅ Update footer navigation

---

**Status:** ✅ Backend is ready for testing!
**Server:** Make sure your backend is running on `http://localhost:5002`
