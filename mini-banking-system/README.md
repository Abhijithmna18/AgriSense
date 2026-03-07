# Mini Banking System - Full Stack Application

A comprehensive banking system with wallet, transactions, ledger, UPI payments, bills, savings goals, fixed deposits, and virtual cards.

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- JavaScript
- Axios
- React Router
- QRCode.react
- Framer Motion

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication
- Bcrypt
- Node-cron (for scheduled tasks)

## Features

1. **Wallet System** - Digital wallet with balance management
2. **Transactions** - Send/receive money with history
3. **Double Entry Ledger** - Proper accounting system
4. **UPI/QR Payments** - Generate QR codes and VPA
5. **Bills Management** - Pay utility bills
6. **Savings Goals** - Track multiple savings targets
7. **Fixed Deposits** - Create FDs with interest calculation
8. **Virtual Card** - Secure card management
9. **Security** - JWT + OTP verification
10. **Notifications** - Real-time alerts

## Project Structure

```
mini-banking-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   └── public/
└── README.md
```

## Installation

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure MongoDB Atlas connection
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

## API Documentation

See `/backend/API_DOCUMENTATION.md` for complete API reference.

## License

MIT
