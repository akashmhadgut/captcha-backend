# Complete Setup Guide - Captcha Earning Platform

## Project Overview

Full-stack Captcha Earning Platform with:
- User registration and JWT authentication
- Plan-based system with Razorpay payment integration
- Captcha solving with automatic earnings tracking
- Wallet management and withdrawal system
- Complete Admin dashboard with user/plan/withdrawal management
- Swagger API documentation

---

## Part 1: Backend Setup (Node.js + MongoDB)

### Step 1: Prerequisites Installation

**Install Node.js** (https://nodejs.org/)
- Download v16 or higher
- Verify installation: `node --version` && `npm --version`

**Install MongoDB**
- **Option A: Local MongoDB**
  - Download from https://www.mongodb.com/try/download/community
  - Install and start MongoDB service
  
- **Option B: MongoDB Atlas (Cloud)**
  - Create account at https://www.mongodb.com/cloud/atlas
  - Create free cluster
  - Get connection string

### Step 2: Backend Configuration

1. **Navigate to backend folder**
```bash
cd "captcha-earning-backend"
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file** (copy from .env.example)
```bash
cp .env.example .env
```

4. **Update .env with your values**
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/captcha-platform
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/captcha-platform

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_12345_change_in_production
JWT_EXPIRE=7d

# Razorpay Configuration (get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 3: Razorpay Setup

1. **Create Razorpay Account**
   - Go to https://razorpay.com
   - Sign up and verify email
   - Complete KYC (can use test mode without verification)

2. **Get API Keys**
   - Login to https://dashboard.razorpay.com/
   - Go to Settings > API Keys
   - Copy Key ID and Key Secret
   - Paste into .env file

3. **Test Mode**
   - Use test keys for development
   - Razorpay provides test card numbers for testing

### Step 4: Start Backend Server

```bash
# Development mode (with auto-reload using nodemon)
npm run dev

# Or production mode
npm start
```

**Expected Output:**
```
Server running on port 5000
API Docs available at http://localhost:5000/api-docs
MongoDB connected successfully
```

### Step 5: Verify Backend

- **Health Check**: Visit http://localhost:5000/api/health
- **Swagger Docs**: Visit http://localhost:5000/api-docs
- **Expected Response**: `{"success":true,"message":"Server is running"}`

---

## Part 2: Frontend Setup (React.js)

### Step 1: Navigate to Frontend

```bash
cd captcha-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create .env file

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

### Step 4: Start Frontend

```bash
npm start
```

**Expected**: Browser opens at http://localhost:3000

---

## Part 3: Database Setup

### Create Test Admin User

1. **Start MongoDB**
   - Local: MongoDB service should be running
   - Atlas: Database is cloud-hosted

2. **Create Admin via API**

Use Postman or curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "60d5ec49c1234567890abcde",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Create Test Plans

Use the token received above:

```bash
curl -X POST http://localhost:5000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Starter Plan",
    "price": 100,
    "captchaLimit": 50,
    "validityDays": 30,
    "earningsPerCaptcha": 2,
    "description": "Perfect for beginners"
  }'
```

---

## Part 4: Testing with Postman

### Import Collection

1. **Download Postman**: https://www.postman.com/downloads/
2. **Open Postman**
3. **Click Import** → Select `Postman_Collection.json` from backend folder
4. **Set Environment Variables**:
   - `baseUrl`: http://localhost:5000
   - `token`: (filled after login)
   - `adminToken`: (filled after admin login)

### Test Flow

1. **Register User**
   - Use Auth > Register endpoint
   - Copy token to `token` variable

2. **Get All Plans**
   - Use Plans > Get All Plans (no auth needed)

3. **Initialize Payment**
   - Use Payment > Initialize Payment
   - Copy planId from plans
   - Save orderId from response

4. **Create Captcha** (Admin)
   - Use Captchas > Upload Captcha
   - Upload image file
   - Set answer text

5. **Solve Captcha** (User)
   - Use Captchas > Get Random Captcha
   - Use Captchas > Submit Captcha
   - See earnings credited

6. **Check Wallet**
   - Use Wallet > Get Balance
   - View updated balance

---

## Part 5: Project Structure

### Backend
```
captcha-backend/
├── src/
│   ├── config/           # Database & Swagger config
│   ├── models/           # MongoDB schemas
│   ├── controllers/      # Business logic
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth, upload, error handling
│   ├── utils/            # JWT, Razorpay helpers
│   └── server.js         # Express app
├── uploads/
│   └── captchas/         # Uploaded captcha images
├── .env.example          # Environment template
├── package.json          # Dependencies
├── README.md             # API documentation
└── Postman_Collection.json
```

### Frontend
```
captcha-frontend/
├── src/
│   ├── components/       # React components
│   ├── pages/            # Page components
│   │   ├── auth/         # Login, Register
│   │   └── user/         # Captcha, Wallet, Withdraw
│   ├── context/          # Auth context
│   ├── api/              # API calls
│   └── App.js
├── public/
├── package.json
└── .env
```

---

## Part 6: Key API Endpoints

### Authentication
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/auth/register | No | Create new user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/me | Yes | Get current user |

### Plans & Payment
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/plans | No | Get all plans |
| POST | /api/plans | Admin | Create plan |
| POST | /api/plans/payment/initialize | Yes | Create payment order |
| POST | /api/plans/payment/verify | Yes | Verify payment |

### Captchas
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/captchas/random | Yes | Get random captcha |
| POST | /api/captchas/submit | Yes | Submit answer |
| POST | /api/captchas/upload | Admin | Upload captcha |

### Wallet
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/wallet | Yes | Get wallet details |
| GET | /api/wallet/balance | Yes | Get balance |
| GET | /api/wallet/transactions | Yes | Get history |

### Withdrawals
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/withdrawals/request | Yes | Request withdrawal |
| GET | /api/withdrawals/my | Yes | Get my requests |
| GET | /api/withdrawals | Admin | Get all requests |
| PUT | /api/withdrawals/:id/approve | Admin | Approve request |

### Admin
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/admin/dashboard | Admin | Dashboard stats |
| GET | /api/admin/users | Admin | All users |
| PUT | /api/admin/users/:id/block | Admin | Block user |

---

## Part 7: Complete User Flow

### 1. User Registration & Login
```
User → Register (POST /auth/register)
User → Login (POST /auth/login) → Get JWT Token
```

### 2. Purchase Plan
```
User → Get Plans (GET /plans)
User → Initialize Payment (POST /plans/payment/initialize)
→ Frontend: Open Razorpay Payment Widget
User → Complete Payment on Razorpay
Frontend → Verify Payment (POST /plans/payment/verify)
→ Backend: Update User Plan & Create Wallet
```

### 3. Solve Captchas & Earn
```
User → Get Random Captcha (GET /captchas/random)
→ Display image on frontend
User → Submit Answer (POST /captchas/submit)
→ If correct: Credit earnings to wallet
→ If wrong: Show error
Repeat 3+ times
```

### 4. Manage Wallet
```
User → Check Balance (GET /wallet/balance)
User → View History (GET /wallet/transactions)
```

### 5. Withdraw Funds
```
User → Request Withdrawal (POST /withdrawals/request)
→ Amount ≥ 200 ✓
→ Sufficient balance ✓
Admin → Get Withdrawal Requests (GET /withdrawals?status=pending)
Admin → Approve (PUT /withdrawals/:id/approve)
→ Deduct from wallet
→ Create transaction
User → See approval, funds sent via bank
```

---

## Part 8: Troubleshooting

### MongoDB Connection Error
**Problem**: `MongoDB connection error`
**Solution**:
- Check if MongoDB is running
- Verify connection string in .env
- For local: `mongo --version` should work
- For Atlas: Check username/password in URL

### Razorpay Error
**Problem**: `Razorpay error: Invalid API key`
**Solution**:
- Verify Key ID and Secret in .env
- Keys should be from https://dashboard.razorpay.com
- Don't use key names, use Key ID and Secret

### CORS Error
**Problem**: Browser blocks requests from frontend
**Solution**:
- Ensure FRONTEND_URL in .env matches your frontend origin
- Default: http://localhost:3000

### Port Already in Use
**Problem**: `Port 5000 is already in use`
**Solution**:
- Kill process: `lsof -i :5000` then `kill -9 <PID>`
- Or change PORT in .env

### Token Expired
**Problem**: `Token is not valid` after some time
**Solution**:
- User needs to login again
- Token expiry is 7 days (configured in JWT_EXPIRE)

---

## Part 9: Deployment Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to strong random value
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas instead of local database
- [ ] Set FRONTEND_URL to production domain
- [ ] Use production Razorpay keys (not test)
- [ ] Enable HTTPS only
- [ ] Set strong admin password
- [ ] Test all payment flows
- [ ] Create backup of database
- [ ] Set up monitoring/logging
- [ ] Configure email notifications (optional)
- [ ] Set up CDN for uploads (optional)

---

## Part 10: Next Steps

### Frontend Development
- [ ] Create landing page
- [ ] Build register/login forms
- [ ] Design captcha dashboard
- [ ] Create admin panel UI
- [ ] Add payment widget integration
- [ ] Responsive design

### Backend Enhancements
- [ ] Email notifications
- [ ] OTP verification
- [ ] Advanced analytics
- [ ] Referral system
- [ ] Captcha timer configuration
- [ ] Rate limiting
- [ ] Caching layer (Redis)

### DevOps
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated testing
- [ ] Performance optimization
- [ ] Security audit

---

## Getting Help

1. **Check API Docs**: http://localhost:5000/api-docs
2. **Review Backend README**: captcha-backend/README.md
3. **Check Console Logs**: Both frontend and backend
4. **Test Endpoints**: Use Postman collection provided
5. **Verify .env**: Ensure all required variables are set

---

## Important Links

- **Backend GitHub**: [Repository]
- **Frontend GitHub**: [Repository]
- **Razorpay Docs**: https://razorpay.com/docs/
- **MongoDB Docs**: https://docs.mongodb.com/
- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/

---

## Success Indicators

✅ Server running without errors
✅ Can see Swagger docs at /api-docs
✅ Can register and login users
✅ Can create plans in admin
✅ Can upload captchas
✅ Can solve captchas and see earnings
✅ Wallet balance updates correctly
✅ Can request withdrawals
✅ Admin can approve/reject

---

**Congratulations!** Your Captcha Earning Platform is ready! 🎉
