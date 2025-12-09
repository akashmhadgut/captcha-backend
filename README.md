# Captcha Earning Platform - Backend API

Complete Node.js/Express backend for the Captcha Earning Platform with MongoDB, JWT authentication, Razorpay integration, and Admin dashboard.

## Tech Stack

- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **Payment:** Razorpay Integration
- **File Upload:** Multer
- **API Documentation:** Swagger/OpenAPI
- **Validation:** Express-validator & Joi

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud - MongoDB Atlas)
- Razorpay account for payment integration

### Setup Steps

1. **Clone the repository**
```bash
cd captcha-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure .env**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/captcha-platform
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=http://localhost:3000
```

5. **Start the server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`
API Documentation: `http://localhost:5000/api-docs`

## Project Structure

```
src/
├── config/              # Configuration files
│   ├── database.js     # MongoDB connection
│   └── swagger.js      # Swagger/OpenAPI setup
├── models/             # Mongoose schemas
│   ├── User.js
│   ├── Plan.js
│   ├── Captcha.js
│   ├── Wallet.js
│   ├── Transaction.js
│   ├── Withdrawal.js
│   └── Payment.js
├── controllers/        # Business logic
│   ├── authController.js
│   ├── planController.js
│   ├── captchaController.js
│   ├── walletController.js
│   ├── withdrawalController.js
│   └── adminController.js
├── routes/            # API routes
│   ├── authRoutes.js
│   ├── planRoutes.js
│   ├── captchaRoutes.js
│   ├── walletRoutes.js
│   ├── withdrawalRoutes.js
│   └── adminRoutes.js
├── middleware/        # Custom middleware
│   ├── auth.js
│   ├── adminAuth.js
│   ├── errorHandler.js
│   └── upload.js
├── utils/            # Utility functions
│   ├── generateToken.js
│   └── razorpay.js
└── server.js         # Express app setup
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Plans
- `GET /api/plans` - Get all active plans
- `GET /api/plans/:id` - Get single plan
- `POST /api/plans` - Create plan (Admin)
- `PUT /api/plans/:id` - Update plan (Admin)
- `DELETE /api/plans/:id` - Delete plan (Admin)

### Payment
- `POST /api/plans/payment/initialize` - Initialize Razorpay payment
- `POST /api/plans/payment/verify` - Verify payment and assign plan

### Captchas
- `GET /api/captchas/random` - Get random captcha (protected)
- `POST /api/captchas/submit` - Submit captcha answer (protected)
- `POST /api/captchas/upload` - Upload captcha (Admin)
- `GET /api/captchas` - Get all captchas (Admin)
- `PUT /api/captchas/:id` - Update captcha (Admin)
- `DELETE /api/captchas/:id` - Delete captcha (Admin)

### Wallet
- `GET /api/wallet` - Get wallet details (protected)
- `GET /api/wallet/balance` - Get wallet balance (protected)
- `GET /api/wallet/transactions` - Get transaction history (protected)
- `POST /api/wallet/add-funds` - Add funds to wallet (Admin)

### Withdrawals
- `POST /api/withdrawals/request` - Request withdrawal (protected)
- `GET /api/withdrawals/my` - Get user's withdrawals (protected)
- `GET /api/withdrawals` - Get all withdrawals (Admin)
- `PUT /api/withdrawals/:id/approve` - Approve withdrawal (Admin)
- `PUT /api/withdrawals/:id/reject` - Reject withdrawal (Admin)
- `PUT /api/withdrawals/:id/complete` - Mark as completed (Admin)

### Admin Dashboard
- `GET /api/admin/dashboard` - Get dashboard stats (Admin)
- `GET /api/admin/users` - Get all users (Admin)
- `GET /api/admin/users/:id` - Get user details (Admin)
- `PUT /api/admin/users/:id/block` - Block user (Admin)
- `PUT /api/admin/users/:id/unblock` - Unblock user (Admin)
- `DELETE /api/admin/users/:id` - Delete user (Admin)
- `GET /api/admin/reports` - Get earning reports (Admin)

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  plan: ObjectId (ref: Plan),
  planExpiry: Date,
  totalCaptchasSolved: Number,
  totalEarnings: Number,
  isBlocked: Boolean,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Plan
```javascript
{
  name: String,
  price: Number,
  currency: String,
  captchaLimit: Number,
  validityDays: Number,
  earningsPerCaptcha: Number,
  description: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Captcha
```javascript
{
  image: String (file path),
  answer: String,
  difficulty: String (easy/medium/hard),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Wallet
```javascript
{
  user: ObjectId (ref: User),
  balance: Number,
  totalEarned: Number,
  totalWithdrawn: Number,
  transactions: [ObjectId] (ref: Transaction),
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction
```javascript
{
  user: ObjectId (ref: User),
  type: String (credit/debit),
  amount: Number,
  description: String,
  referenceId: ObjectId,
  status: String (completed/pending/failed),
  createdAt: Date,
  updatedAt: Date
}
```

### Withdrawal
```javascript
{
  user: ObjectId (ref: User),
  amount: Number,
  status: String (pending/approved/rejected/completed),
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    upiId: String
  },
  remarks: String,
  approvedBy: ObjectId (ref: User),
  approvalDate: Date,
  completionDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment
```javascript
{
  user: ObjectId (ref: User),
  plan: ObjectId (ref: Plan),
  amount: Number,
  currency: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: String (initiated/completed/failed),
  paymentMethod: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication

### JWT Token Flow
1. User registers or logs in
2. Server generates JWT token
3. Token sent to frontend
4. Frontend includes token in Authorization header: `Authorization: Bearer <token>`
5. Server validates token on protected routes

### Token Payload
```javascript
{
  id: userId,
  role: "user" or "admin",
  iat: issuedAt,
  exp: expiry
}
```

## Payment Integration (Razorpay)

### Payment Flow
1. Frontend gets plan ID
2. Calls `/api/plans/payment/initialize` with planId
3. Backend creates Razorpay order and returns orderId
4. Frontend opens Razorpay payment widget
5. User completes payment
6. Frontend calls `/api/plans/payment/verify` with payment details
7. Backend verifies signature and assigns plan to user

### Razorpay Setup
1. Create account at https://razorpay.com
2. Get API Key ID and Secret from dashboard
3. Add to .env file
4. Test mode uses test credentials

## File Upload

Captcha images are uploaded using Multer:
- **Location:** `uploads/captchas/`
- **Max Size:** 5MB
- **Allowed Types:** JPEG, PNG, GIF
- **Access:** Via `/uploads/{filename}` URL

## Error Handling

All endpoints return consistent error responses:
```javascript
{
  success: false,
  message: "Error description"
}
```

Common HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Security Features

✅ JWT authentication with expiry
✅ Password hashing with bcrypt
✅ Role-based access control (RBAC)
✅ CORS enabled for frontend integration
✅ Input validation and sanitization
✅ Razorpay signature verification
✅ Admin-only protected routes
✅ Error handling middleware

## Testing with Postman

### Setup
1. Import API into Postman
2. Create environment variable for token after login
3. Use `{{token}}` in Authorization header for protected routes

### Example Requests

**Register:**
```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login:**
```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Get Random Captcha:**
```
GET /api/captchas/random
Header: Authorization: Bearer <token>
```

**Submit Captcha:**
```
POST /api/captchas/submit
Header: Authorization: Bearer <token>
{
  "captchaId": "60d5ec49c1234567890abcde",
  "answer": "ABC123"
}
```

**Request Withdrawal:**
```
POST /api/withdrawals/request
Header: Authorization: Bearer <token>
{
  "amount": 500,
  "bankDetails": {
    "accountHolder": "John Doe",
    "accountNumber": "1234567890",
    "bankName": "Bank Name",
    "ifscCode": "BANK0001234",
    "upiId": "john@upi"
  }
}
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in .env
- Verify MongoDB credentials

### Razorpay Error
- Verify API keys in .env
- Check if test mode is enabled
- Ensure correct currency (INR)

### CORS Error
- Add frontend URL to FRONTEND_URL in .env
- Ensure browser allows cross-origin requests

### JWT Token Expired
- User needs to login again
- Token expiry is set in JWT_EXPIRE in .env

## Deployment

### Environment Setup
1. Use production-grade MongoDB (MongoDB Atlas)
2. Set `NODE_ENV=production`
3. Use strong JWT_SECRET
4. Enable HTTPS only
5. Set proper CORS origin

### Deployment Platforms
- **Heroku**: Easy deployment with free tier
- **Railway**: Simple Node.js hosting
- **DigitalOcean**: VPS hosting
- **AWS EC2**: Scalable cloud hosting

## Best Practices Implemented

✅ MVC Architecture
✅ Centralized error handling
✅ Environment-based configuration
✅ Input validation
✅ Secure password hashing
✅ JWT token expiry
✅ Proper HTTP status codes
✅ Consistent API response format
✅ Database indexing
✅ Swagger documentation

## Future Enhancements

- [ ] Email notifications
- [ ] SMS OTP verification
- [ ] Advanced analytics
- [ ] User referral system
- [ ] Captcha timer configuration
- [ ] Multiple payment gateways
- [ ] Admin email reports
- [ ] User badges/achievements
- [ ] Cache optimization
- [ ] Rate limiting

## Support

For issues or questions:
1. Check API documentation at `/api-docs`
2. Review error messages carefully
3. Check console logs for backend errors
4. Verify .env configuration
5. Test endpoints with Postman

## License

ISC
