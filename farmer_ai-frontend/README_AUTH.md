# AgriSense Frontend - Authentication UI

React authentication interface integrated with AgriSense design system.

## Features

✅ **Authentication Pages**
- Register (with phone validation - integers only)
- Email OTP Verification
- Login (email/password + Google Sign-In button)
- Protected Dashboard

✅ **Design Integration**
- AgriSense color scheme (primary green, light green, accent gold)
- Glassmorphism effects
- Framer Motion animations
- Dark/Light theme support
- Responsive design

✅ **Security**
- JWT token management
- Protected routes (PrivateRoute component)
- Automatic token refresh
- 401 redirect handling

---

## Quick Start

### 1. Install Dependencies

```bash
cd farmer_ai-frontend
npm install
```

**Required packages:**
```bash
npm install axios react-router-dom framer-motion lucide-react
```

### 2. Configure Environment

Create `.env` file in frontend root:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:3000` (or `http://localhost:5173` for Vite)

---

## Routes

| Route | Component | Protected | Description |
|-------|-----------|-----------|-------------|
| `/` | Home | No | Landing page |
| `/register` | Register | No | User registration |
| `/verify` | Verify | No | Email OTP verification |
| `/login` | Login | No | User login |
| `/dashboard` | Dashboard | Yes | User dashboard |

---

## Components

### Auth Pages

#### Register.jsx
- Form: firstName, lastName, email, phone, password
- Phone validation: **integers only** (no spaces, no characters)
- Redirects to `/verify?email=...` on success

#### Verify.jsx
- 6-digit OTP input
- Resend OTP button (rate limited)
- Auto-redirect to `/dashboard` on success
- Saves JWT token to localStorage

#### Login.jsx
- Email + password form
- Google Sign-In button (placeholder)
- Error handling for unverified emails
- Redirects to `/dashboard` on success

#### Dashboard.jsx
- Protected route (requires authentication)
- Displays user profile
- Logout button

### Utilities

#### authApi.js
- Axios instance with base URL
- Request interceptor (attaches JWT token)
- Response interceptor (handles 401 errors)
- Auth API methods

#### PrivateRoute.jsx
- Wrapper for protected routes
- Verifies JWT token on mount
- Shows loading state
- Redirects to `/login` if unauthorized

---

## Phone Number Validation

**Requirement:** Phone input must accept **integers only** (no spaces, no characters)

**Implementation:**
```javascript
const handleChange = (e) => {
  if (e.target.name === 'phone') {
    const cleaned = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setFormData({ ...formData, phone: cleaned });
  }
};
```

**Input:**
```jsx
<input
  type="tel"
  name="phone"
  pattern="[0-9]+"
  placeholder="919876543210"
/>
```

**Format:** E.164 (e.g., `919876543210` for India, `14155551234` for USA)

---

## Token Management

### Storage
```javascript
// Save token after login/verify
localStorage.setItem('auth_token', response.data.token);

// Retrieve token
const token = localStorage.getItem('auth_token');

// Remove token on logout
localStorage.removeItem('auth_token');
```

### Automatic Attachment
```javascript
// Request interceptor in authApi.js
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 401 Handling
```javascript
// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Design System Integration

### Colors
```css
--primary-green: #2D7A4F
--light-green: #52B788
--accent-gold: #D4AF37
--warm-ivory: #F9F8F4
--dark-green-text: #1B4332
--deep-forest: #0B231E (dark mode)
```

### Typography
- **Headings:** Playfair Display (serif)
- **Body:** Inter (sans-serif)

### Components
- Glassmorphism cards
- Gradient buttons
- Icon inputs (Lucide React)
- Framer Motion animations

---

## User Flow

```
1. User visits /register
   ↓
2. Fills form (phone: integers only)
   ↓
3. Submits → OTP sent to email
   ↓
4. Redirected to /verify?email=...
   ↓
5. Enters 6-digit OTP
   ↓
6. Verified → Token saved → Redirect to /dashboard
   ↓
7. Dashboard (protected route)
   ↓
8. Logout → Token removed → Redirect to /login
```

---

## Google Sign-In Setup (Optional)

**Note:** Google Sign-In button is currently a placeholder. To implement:

### 1. Install Firebase
```bash
npm install firebase
```

### 2. Configure Firebase
```javascript
// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 3. Implement Sign-In
```javascript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  
  const response = await authAPI.googleLogin(idToken);
  localStorage.setItem('auth_token', response.data.token);
  navigate('/dashboard');
};
```

---

## Troubleshooting

**API Connection Error:**
```
Error: Network Error
```
→ Check `REACT_APP_API_URL` in `.env`  
→ Ensure backend is running on port 5000

**Token Not Persisting:**
→ Check browser localStorage  
→ Verify token is saved after login/verify

**Protected Route Not Working:**
→ Check PrivateRoute component  
→ Verify token is valid (call `/api/user/me`)

**Phone Validation Not Working:**
→ Check `handleChange` function  
→ Verify `pattern="[0-9]+"` attribute

---

## Project Structure

```
farmer_ai-frontend/
├── src/
│   ├── pages/
│   │   ├── Register.jsx
│   │   ├── Verify.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── Home.jsx
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── ...
│   ├── services/
│   │   └── authApi.js
│   ├── context/
│   │   └── ThemeContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── .env
└── package.json
```

---

## Testing Checklist

- [ ] Register with valid data
- [ ] Phone input accepts only integers
- [ ] OTP email received
- [ ] Verify with correct OTP
- [ ] Resend OTP works
- [ ] Login with verified account
- [ ] Dashboard displays user data
- [ ] Logout removes token
- [ ] Protected route redirects if not authenticated
- [ ] Dark/Light theme toggle works

---

## Dependencies

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.0",
  "framer-motion": "^10.16.0",
  "lucide-react": "^0.294.0"
}
```

---

## License

MIT

---

**For backend API documentation, see:** [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)
