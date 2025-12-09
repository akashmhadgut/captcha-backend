# API Testing Guide

## Testing Endpoints without Frontend

Use these curl commands or Postman to test all endpoints.

### Base URL
```
http://localhost:5000
```

---

## 1. Authentication

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49c1234567890abcde",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Register Admin
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

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Save the token from response for authenticated requests.

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 2. Plans Management

### Get All Plans
```bash
curl -X GET http://localhost:5000/api/plans
```

### Create Plan (Admin Only)
```bash
curl -X POST http://localhost:5000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "Starter Plan",
    "price": 100,
    "captchaLimit": 50,
    "validityDays": 30,
    "earningsPerCaptcha": 2,
    "description": "Best for beginners"
  }'
```

### Get Single Plan
```bash
curl -X GET http://localhost:5000/api/plans/PLAN_ID
```

### Update Plan (Admin)
```bash
curl -X PUT http://localhost:5000/api/plans/PLAN_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "price": 150,
    "earningsPerCaptcha": 3
  }'
```

### Delete Plan (Admin)
```bash
curl -X DELETE http://localhost:5000/api/plans/PLAN_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 3. Payment Integration

### Initialize Payment
```bash
curl -X POST http://localhost:5000/api/plans/payment/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "planId": "PLAN_ID_FROM_ABOVE"
  }'
```

**Response includes:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxxx",
    "amount": 10000,  // in paise (100 = ₹1)
    "currency": "INR",
    "keyId": "razorpay_key_id"
  }
}
```

### Verify Payment (After Razorpay)
```bash
curl -X POST http://localhost:5000/api/plans/payment/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "razorpayOrderId": "order_xxxx",
    "razorpayPaymentId": "pay_xxxx",
    "razorpaySignature": "signature_from_razorpay",
    "planId": "PLAN_ID"
  }'
```

---

## 4. Captcha Management

### Get Random Captcha (User)
```bash
curl -X GET http://localhost:5000/api/captchas/random \
  -H "Authorization: Bearer USER_TOKEN"
```

### Submit Captcha Answer (User)
```bash
curl -X POST http://localhost:5000/api/captchas/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "captchaId": "CAPTCHA_ID_FROM_ABOVE",
    "answer": "ABC123"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Correct answer! Earnings credited",
  "earned": 2,
  "totalBalance": 12.5
}
```

**Wrong Answer Response:**
```json
{
  "success": false,
  "message": "Incorrect answer",
  "earned": 0
}
```

### Upload Captcha (Admin)
```bash
# Using curl with file
curl -X POST http://localhost:5000/api/captchas/upload \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "image=@/path/to/image.png" \
  -F "answer=ABC123" \
  -F "difficulty=medium"
```

### Get All Captchas (Admin)
```bash
curl -X GET http://localhost:5000/api/captchas \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Delete Captcha (Admin)
```bash
curl -X DELETE http://localhost:5000/api/captchas/CAPTCHA_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 5. Wallet Management

### Get Wallet
```bash
curl -X GET http://localhost:5000/api/wallet \
  -H "Authorization: Bearer USER_TOKEN"
```

### Get Balance
```bash
curl -X GET http://localhost:5000/api/wallet/balance \
  -H "Authorization: Bearer USER_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "balance": 25.5,
  "totalEarned": 50.0,
  "totalWithdrawn": 24.5
}
```

### Get Transactions
```bash
curl -X GET "http://localhost:5000/api/wallet/transactions?page=1&limit=50" \
  -H "Authorization: Bearer USER_TOKEN"
```

### Add Funds (Admin - for testing)
```bash
curl -X POST http://localhost:5000/api/wallet/add-funds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "amount": 100,
    "description": "Bonus credits"
  }'
```

---

## 6. Withdrawal Management

### Request Withdrawal
```bash
curl -X POST http://localhost:5000/api/withdrawals/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "amount": 500,
    "bankDetails": {
      "accountHolder": "John Doe",
      "accountNumber": "1234567890123456",
      "bankName": "HDFC Bank",
      "ifscCode": "HDFC0001234",
      "upiId": "john@upi"
    }
  }'
```

### Get My Withdrawals
```bash
curl -X GET http://localhost:5000/api/withdrawals/my \
  -H "Authorization: Bearer USER_TOKEN"
```

### Get All Withdrawals (Admin)
```bash
curl -X GET "http://localhost:5000/api/withdrawals?status=pending&page=1&limit=50" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Approve Withdrawal (Admin)
```bash
curl -X PUT http://localhost:5000/api/withdrawals/WITHDRAWAL_ID/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "remarks": "Approved - Processing tomorrow"
  }'
```

### Reject Withdrawal (Admin)
```bash
curl -X PUT http://localhost:5000/api/withdrawals/WITHDRAWAL_ID/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "remarks": "Account details incorrect"
  }'
```

### Mark Completed (Admin)
```bash
curl -X PUT http://localhost:5000/api/withdrawals/WITHDRAWAL_ID/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "remarks": "Amount transferred successfully"
  }'
```

---

## 7. Admin Dashboard

### Get Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response includes:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 15,
    "blockedUsers": 2,
    "totalCaptchas": 500,
    "activeCaptchas": 450,
    "totalEarnings": 5000,
    "totalWithdrawn": 3000,
    "pendingWithdrawals": 5,
    "approvedWithdrawals": 10
  }
}
```

### Get All Users (Admin)
```bash
curl -X GET "http://localhost:5000/api/admin/users?page=1&limit=50&search=john" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Get User Details (Admin)
```bash
curl -X GET http://localhost:5000/api/admin/users/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Block User (Admin)
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID/block \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Unblock User (Admin)
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID/unblock \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Delete User (Admin)
```bash
curl -X DELETE http://localhost:5000/api/admin/users/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Get Earning Reports (Admin)
```bash
curl -X GET "http://localhost:5000/api/admin/reports?startDate=2024-01-01&endDate=2024-12-31&period=monthly" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Testing Sequence (Complete Flow)

### 1. Setup Data
```bash
# Register admin
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"admin123","role":"admin"}'
# Save ADMIN_TOKEN

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@test.com","password":"user123"}'
# Save USER_TOKEN

# Create plan
curl -X POST http://localhost:5000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"name":"Test Plan","price":100,"captchaLimit":50,"validityDays":30,"earningsPerCaptcha":5}'
# Save PLAN_ID
```

### 2. Upload Captcha
```bash
curl -X POST http://localhost:5000/api/captchas/upload \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "image=@image.png" \
  -F "answer=ABC123"
```

### 3. User Solves
```bash
# Get random captcha
curl -X GET http://localhost:5000/api/captchas/random \
  -H "Authorization: Bearer USER_TOKEN"
# Save CAPTCHA_ID

# Submit answer
curl -X POST http://localhost:5000/api/captchas/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"captchaId":"CAPTCHA_ID","answer":"ABC123"}'

# Check balance
curl -X GET http://localhost:5000/api/wallet/balance \
  -H "Authorization: Bearer USER_TOKEN"
```

### 4. Withdrawal
```bash
# Request withdrawal
curl -X POST http://localhost:5000/api/withdrawals/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"amount":200,"bankDetails":{"accountHolder":"User","accountNumber":"1234567890","bankName":"Bank","ifscCode":"BANK0001","upiId":"user@upi"}}'

# Get as admin
curl -X GET "http://localhost:5000/api/withdrawals?status=pending" \
  -H "Authorization: Bearer ADMIN_TOKEN"
# Save WITHDRAWAL_ID

# Approve
curl -X PUT http://localhost:5000/api/withdrawals/WITHDRAWAL_ID/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"remarks":"Approved"}'
```

---

## Common Issues & Solutions

### 401 Unauthorized
- Token missing or invalid
- Re-login and get new token
- Check Authorization header format: `Bearer TOKEN`

### 403 Forbidden
- Not admin for admin endpoints
- Register with `role: "admin"`

### 404 Not Found
- Check if resource exists
- Verify ID is correct

### 400 Bad Request
- Missing required fields
- Check request body format
- Verify data types

### 500 Server Error
- Check backend logs
- Verify MongoDB connection
- Check .env configuration

---

## Postman Environment Variables

After testing, set these in Postman for automation:

```json
{
  "baseUrl": "http://localhost:5000",
  "userToken": "",
  "adminToken": "",
  "planId": "",
  "captchaId": "",
  "withdrawalId": "",
  "userId": ""
}
```

In tests, use `{{variable}}` to reference them.

---

## Performance Testing

Check response times:
```bash
time curl -X GET http://localhost:5000/api/plans
```

Expected: < 100ms for simple queries

---

## Security Testing

### Test Invalid Token
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid_token"
```

### Test Expired Token
Update JWT_EXPIRE to very short time, wait, then test

### Test CORS
Request from different origin - should be blocked or allowed based on FRONTEND_URL

---

Happy Testing! 🚀
