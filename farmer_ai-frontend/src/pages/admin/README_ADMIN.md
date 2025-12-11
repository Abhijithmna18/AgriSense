# Farmer_AI Admin Dashboard

## Overview
This is a secure, production-grade Admin Dashboard for the Farmer_AI platform. It is designed with a strict "dark slate" visual identity to distinguish it from the consumer-facing application.

## 🎨 Visual Identity
- **Background**: Dark Slate `#0f1724`
- **Cards**: `#111827`
- **Accent**: Gold `#FFD166`
- **Typography**: Inter (Sans-serif)

## 🛠 Features
- **Dashboard**: High-level metrics (Users, Farms, System Health).
- **User Management**: Searchable table, role badges, and **Account Suspension/Activation** with audit logging.
- **Feature Flags**: Toggle features on/off dynamically with rollout percentages.
- **Audit Logs**: Immutable log of all admin actions (who, what, when, details).
- **Environment Safety**: Visual indicators for DEV/PROD environments.

## 🏗 Architecture
### Frontend (`frontend/src/pages/admin/*`)
- **AdminLayout**: Enforces the sidebar and dark theme.
- **Components**: `DataTable`, `CompactMetric`, `ConfirmModal`.
- **Service**: `services/adminApi.js` handles API calls with automatic `X-Actor` and Auth headers.

### Backend (`backend/src/routes/adminRoutes.js`)
- **Security**: Protected by `adminAuth` middleware (JWT + Role Check).
- **Models**: 
    - `AdminAudit` (Log actions)
    - `FeatureFlag` (Control features)
- **Routes**: `/api/admin/*`

## 🚀 Getting Started
1. **Access**: Navigate to `/admin`.
2. **Auth**: You must be logged in as a user with `role: 'admin'`.
3. **Mock Mode**: Set `VITE_USE_MOCK=true` in `.env` to bypass backend for UI testing.

## ⚠️ Security Notes
- Destructive actions (Suspend, Delete) require explicit confirmation via `ConfirmModal`.
- All mutations are audited.
