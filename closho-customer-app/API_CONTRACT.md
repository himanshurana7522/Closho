# Closho API Contract
**Version:** 1.0  
**Base URL:** `https://api.closho.com/v1` (replace with real URL later)  
**Authentication:** Bearer Token (JWT) in `Authorization` header  
**Content-Type:** `application/json`  
**Date Format:** ISO 8601  

---

## Global Response Format

### Success
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Human readable error",
  "errorCode": "INVALID_CREDENTIALS",
  "errors": [                  // optional field-level errors
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### Common HTTP Status Codes

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Validation Error
- 429 Too Many Requests
- 500 Server Error

### Common Error Codes

- INVALID_CREDENTIALS
- USER_NOT_FOUND
- USER_DISABLED
- EMAIL_ALREADY_EXISTS
- PHONE_ALREADY_EXISTS
- WEAK_PASSWORD
- OTP_INVALID
- OTP_EXPIRED
- TOKEN_EXPIRED
- TOKEN_INVALID
- NETWORK_ERROR
- SERVER_ERROR
- STORE_NOT_FOUND
- PRODUCT_NOT_FOUND
- OUT_OF_STOCK
- INSUFFICIENT_STOCK
- COUPON_INVALID
- COUPON_EXPIRED
- PAYMENT_FAILED
- UNAUTHORIZED


## 1. AUTHENTICATION (Customer)

### 1.1 Register
**POST** `/auth/register`
#### Request Body
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",          // or phone
  "phone": "+919876543210",             // optional if email provided
  "password": "SecurePass123!"
}
```
#### Success Response (201)
```json
{
  "success": true,
  "message": "Registration successful. Please verify OTP.",
  "data": {
    "userId": "usr_123",
    "email": "john@example.com",
    "requiresOtp": true
  }
}
```

### 1.2 Login
**POST** `/auth/login`
#### Request Body
```json
{
  "emailOrPhone": "john@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```
#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "user": {
      "id": "usr_123",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "avatar": null
    }
  }
}
```

### 1.3 Google Sign-In
**POST** `/auth/google`
#### Request Body
```json
{
  "idToken": "google_id_token_here"
}
```
#### Success Response – same shape as Login

### 1.4 Forgot Password
**POST** `/auth/forgot-password`
#### Request Body
```json
{
  "email": "john@example.com"
}
```
#### Success Response (200)
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "email": "john@example.com",
    "expiresIn": 300
  }
}
```

### 1.5 Verify OTP
**POST** `/auth/verify-otp`
#### Request Body
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "purpose": "password_reset"   // or "registration"
}
```
#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "resetToken": "temporary_reset_token"   // only for password_reset
  }
}
```

### 1.6 Reset Password
**POST** `/auth/reset-password`
#### Request Body
```json
{
  "resetToken": "temporary_reset_token",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

### 1.7 Refresh Token
**POST** `/auth/refresh`
#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 1.8 Logout
**POST** `/auth/logout`
(Requires Authorization header)

### 1.9 Get Current User
**GET** `/auth/me`
(Requires Authorization)

---

## 2. STORES (Customer + Admin)

### 2.1 Get Nearest Stores
**GET** `/stores/nearest?lat=19.0760&lng=72.8777&radius=10`
#### Success Response
```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "id": "store_001",
        "name": "Closho Andheri",
        "address": "123 Main Street, Andheri West, Mumbai",
        "city": "Mumbai",
        "pincode": "400058",
        "latitude": 19.1197,
        "longitude": 72.8468,
        "deliveryRadiusKm": 5,
        "distanceKm": 1.2,
        "isOpen": true,
        "openingHours": "10:00 - 22:00"
      }
    ],
    "selectedStoreId": "store_001"
  }
}
```

### 2.2 Get All Stores (Admin)
**GET** `/admin/stores`

### 2.3 Create Store (Admin)
**POST** `/admin/stores`

### 2.4 Update Store (Admin)
**PUT** `/admin/stores/:storeId`

### 2.5 Toggle Store Status (Admin)
**PATCH** `/admin/stores/:storeId/status`

---

## 3. PRODUCTS (Customer)

### 3.1 Get Products (Store-specific)
**GET** `/products?storeId=store_001&page=1&limit=20&category=men&sort=newest&minPrice=500&maxPrice=3000&size=M&color=black&search=jacket`
#### Success Response
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_001",
        "name": "Premium Brown Jacket",
        "slug": "premium-brown-jacket",
        "price": 5999,
        "originalPrice": 7999,
        "discountPercent": 25,
        "thumbnail": "https://cdn.closho.com/...",
        "rating": 4.5,
        "reviewCount": 128,
        "isWishlisted": false,
        "inStock": true,
        "availableSizes": ["S", "M", "L"],
        "availableColors": ["Brown", "Black"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

### 3.2 Get Product Details
**GET** `/products/:productId?storeId=store_001`
#### Success Response
```json
{
  "success": true,
  "data": {
    "id": "prod_001",
    "name": "Premium Brown Jacket",
    "description": "High quality jacket made from premium materials...",
    "price": 5999,
    "originalPrice": 7999,
    "discountPercent": 25,
    "images": ["url1", "url2", "url3"],
    "category": { "id": "cat_01", "name": "Men" },
    "brand": "Closho",
    "material": "Premium quality jacket...",
    "careInstructions": "Dry clean only",
    "rating": 4.5,
    "reviewCount": 128,
    "variants": [
      {
        "id": "var_001",
        "size": "M",
        "color": "Brown",
        "colorHex": "#8B4513",
        "sku": "CBJ-M-BRN",
        "stock": 12,
        "price": 5999
      }
    ],
    "isWishlisted": false
  }
}
```

### 3.3 Get Categories
**GET** `/categories`

### 3.4 Get Banners / Home Sections
**GET** `/home?storeId=store_001`

---

## 4. CART (Customer)

### 4.1 Get Cart
**GET** `/cart?storeId=store_001`

### 4.2 Add to Cart
**POST** `/cart/items`
#### Request Body
```json
{
  "storeId": "store_001",
  "productId": "prod_001",
  "variantId": "var_001",
  "quantity": 1
}
```

### 4.3 Update Cart Item Quantity
**PATCH** `/cart/items/:itemId`
#### Request Body
```json
{
  "quantity": 2
}
```

### 4.4 Remove Cart Item
**DELETE** `/cart/items/:itemId`

### 4.5 Apply Coupon
**POST** `/cart/apply-coupon`
#### Request Body
```json
{
  "code": "WELCOME50",
  "storeId": "store_001"
}
```

### 4.6 Clear Cart
**DELETE** `/cart`

---

## 5. CHECKOUT & ORDERS (Customer)

### 5.1 Create Order
**POST** `/orders`
#### Request Body
```json
{
  "storeId": "store_001",
  "addressId": "addr_001",
  "paymentMethod": "razorpay",   // or "cod", "upi"
  "couponCode": "WELCOME50"
}
```
#### Success Response
```json
{
  "success": true,
  "data": {
    "orderId": "ord_12345",
    "orderNumber": "CLOSHO-2026-001234",
    "amount": 11498,
    "currency": "INR",
    "payment": {
      "gateway": "razorpay",
      "orderId": "order_Razorpay123",
      "key": "rzp_live_xxx"
    }
  }
}
```

### 5.2 Verify Payment
**POST** `/orders/verify-payment`
#### Request Body
```json
{
  "orderId": "ord_12345",
  "paymentId": "pay_xxx",
  "signature": "razorpay_signature"
}
```

### 5.3 Get My Orders
**GET** `/orders?status=all&page=1&limit=10`

### 5.4 Get Order Details
**GET** `/orders/:orderId`

### 5.5 Cancel Order
**POST** `/orders/:orderId/cancel`

### 5.6 Request Return
**POST** `/orders/:orderId/return`

---

## 6. WISHLIST (Customer)

### 6.1 Get Wishlist
**GET** `/wishlist`

### 6.2 Add to Wishlist
**POST** `/wishlist`
#### Request Body
```json
{
  "productId": "prod_001"
}
```

### 6.3 Remove from Wishlist
**DELETE** `/wishlist/:productId`

### 6.4 Move Wishlist Item to Cart
**POST** `/wishlist/:productId/move-to-cart`

---

## 7. USER PROFILE & ADDRESSES (Customer)

### 7.1 Update Profile
**PUT** `/user/profile`

### 7.2 Get Addresses
**GET** `/user/addresses`

### 7.3 Add Address
**POST** `/user/addresses`
#### Request Body
```json
{
  "fullName": "John Doe",
  "phone": "+919876543210",
  "addressLine1": "123 Main Street",
  "addressLine2": "Near Metro",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "type": "home",          // home | office | other
  "isDefault": true
}
```

### 7.4 Update Address
**PUT** `/user/addresses/:addressId`

### 7.5 Delete Address
**DELETE** `/user/addresses/:addressId`

### 7.6 Get Payment Methods
**GET** `/user/payment-methods`

### 7.7 Add Payment Method
**POST** `/user/payment-methods`

### 7.8 Delete Payment Method
**DELETE** `/user/payment-methods/:id`

---

## 8. REELS / TRENDING (Customer)

### 8.1 Get Reels Feed
**GET** `/reels?page=1&limit=10`
#### Success Response
```json
{
  "success": true,
  "data": {
    "reels": [
      {
        "id": "reel_001",
        "videoUrl": "https://cdn.closho.com/reels/xxx.mp4",
        "thumbnail": "https://cdn.closho.com/...",
        "caption": "New winter collection drop!",
        "likesCount": 1240,
        "commentsCount": 89,
        "isLiked": false,
        "products": [
          {
            "id": "prod_001",
            "name": "Premium Brown Jacket",
            "price": 5999,
            "thumbnail": "..."
          }
        ],
        "createdAt": "2026-07-20T10:00:00Z"
      }
    ]
  }
}
```

### 8.2 Like / Unlike Reel
**POST** `/reels/:reelId/like`  
**DELETE** `/reels/:reelId/like`

---

## 9. NOTIFICATIONS (Customer)

### 9.1 Get Notifications
**GET** `/notifications?page=1`

### 9.2 Mark as Read
**PATCH** `/notifications/:id/read`

### 9.3 Mark All as Read
**POST** `/notifications/read-all`

---

## 10. ADMIN – AUTHENTICATION

### 10.1 Admin Login
**POST** `/admin/auth/login`

### 10.2 Admin Me
**GET** `/admin/auth/me`

---

## 11. ADMIN – DASHBOARD

### 11.1 Dashboard Stats
**GET** `/admin/dashboard?storeId=store_001` (optional storeId for store admin)
Response includes: todayOrders, todayRevenue, totalProducts, lowStockCount, activeStores, salesChart, recentOrders, lowStockProducts

---

## 12. ADMIN – PRODUCTS

### 12.1 List Products
**GET** `/admin/products?page=1&search=&category=&status=`

### 12.2 Create Product
**POST** `/admin/products`

### 12.3 Update Product
**PUT** `/admin/products/:productId`

### 12.4 Delete / Archive Product
**DELETE** `/admin/products/:productId`

### 12.5 Upload Product Images
**POST** `/admin/products/upload-images` (multipart/form-data)

---

## 13. ADMIN – STOCK

### 13.1 Get Stock by Store
**GET** `/admin/stock?storeId=store_001`

### 13.2 Update Stock
**PUT** `/admin/stock`
#### Request Body
```json
{
  "storeId": "store_001",
  "updates": [
    { "variantId": "var_001", "quantity": 25 },
    { "variantId": "var_002", "quantity": 0 }
  ]
}
```

### 13.3 Bulk Stock Upload (CSV)
**POST** `/admin/stock/bulk`

---

## 14. ADMIN – ORDERS

### 14.1 List Orders
**GET** `/admin/orders?status=&storeId=&fromDate=&toDate=&page=1`

### 14.2 Get Order Details
**GET** `/admin/orders/:orderId`

### 14.3 Update Order Status
**PATCH** `/admin/orders/:orderId/status`
#### Request Body
```json
{
  "status": "shipped",
  "note": "Left with security"
}
```

---

## 15. ADMIN – REELS

### 15.1 List Reels
**GET** `/admin/reels`

### 15.2 Create Reel
**POST** `/admin/reels` (multipart: video + data)

### 15.3 Update Reel
**PUT** `/admin/reels/:reelId`

### 15.4 Delete / Unpublish Reel
**DELETE** `/admin/reels/:reelId`

---

## 16. ADMIN – CATEGORIES, BANNERS, COUPONS

### Categories
- **GET** `/admin/categories`
- **POST** `/admin/categories`
- **PUT** `/admin/categories/:id`
- **DELETE** `/admin/categories/:id`

### Banners
- **GET** `/admin/banners`
- **POST** `/admin/banners`
- **PUT** `/admin/banners/:id`
- **DELETE** `/admin/banners/:id`

### Coupons
- **GET** `/admin/coupons`
- **POST** `/admin/coupons`
- **PUT** `/admin/coupons/:id`
- **PATCH** `/admin/coupons/:id/status`

---

## 17. ADMIN – CUSTOMERS & SETTINGS

### Customers
- **GET** `/admin/customers`
- **GET** `/admin/customers/:id`

### Settings
- **GET** `/admin/settings`
- **PUT** `/admin/settings`
