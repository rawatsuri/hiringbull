# HiringBull API Documentation - Postman Guide

Complete API flow documentation for using HiringBull without a frontend, covering user creation, job exploration, company management, social posts, and payment integration.

---

## Table of Contents

1. [Setup & Authentication](#setup--authentication)
2. [API Flow Overview](#api-flow-overview)
3. [User Management APIs](#user-management-apis)
4. [Company APIs](#company-apis)
5. [Job APIs](#job-apis)
6. [Social Post APIs](#social-post-apis)
7. [Payment APIs (Razorpay)](#payment-apis-razorpay)
8. [Device Management APIs](#device-management-apis)
9. [Complete User Journey Example](#complete-user-journey-example)

---

## Setup & Authentication

### Base URL
```
http://localhost:4000/api
```

### Authentication Methods

HiringBull uses **two authentication mechanisms**:

#### 1. **Clerk Authentication** (For User-Facing APIs)
- Required for: User, Payment APIs
- Header: `Authorization: Bearer <CLERK_TOKEN>`
- The Clerk token is obtained from Clerk's authentication service
- In development mode (if Clerk keys are missing), authentication is bypassed with a mock user ID

#### 2. **API Key Authentication** (For Internal/Bulk Operations)
- Required for: Bulk job creation, company creation, social post creation
- Header: `x-api-key: <YOUR_INTERNAL_API_KEY>`
- Set in environment variable: `INTERNAL_API_KEY`

### Environment Setup

Create a `.env` file with:
```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/hiringbull
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
INTERNAL_API_KEY=your-secret-api-key
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

---

## API Flow Overview

```mermaid
graph TD
    A[User Signs Up via Clerk] --> B[Create User Profile]
    B --> C[Get Current User Info]
    C --> D[Browse Jobs/Companies]
    D --> E{Want Premium Access?}
    E -->|Yes| F[Create Payment Order]
    F --> G[Complete Payment]
    G --> H[Verify Payment]
    H --> I[User Upgraded to Paid]
    E -->|No| J[Continue with Free Access]
    D --> K[Browse Social Posts]
    D --> L[Follow Companies]
```

---

## User Management APIs

### 1. Create User Profile

**Endpoint:** `POST /api/users`

**Authentication:** Required (Clerk Token)

**Description:** Creates or updates a user profile. Uses upsert logic based on Clerk ID from the authentication token.

**Headers:**
```
Authorization: Bearer <CLERK_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "img_url": "https://example.com/avatar.jpg",
  "is_experienced": true,
  "company_name": "Google",
  "years_of_experience": 5,
  "resume_link": "https://example.com/resume.pdf",
  "segment": "software_engineering"
}
```

**Optional Fields:**
```json
{
  "active": true,
  "college_name": "MIT",
  "cgpa": "9.2",
  "promo_code": "HIRING2024",
  "companies": ["company-uuid-1", "company-uuid-2"]
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "clerkId": "user_2abc123xyz",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "img_url": "https://example.com/avatar.jpg",
  "active": true,
  "is_experienced": true,
  "college_name": null,
  "cgpa": null,
  "company_name": "Google",
  "years_of_experience": 5,
  "resume_link": "https://example.com/resume.pdf",
  "segment": "software_engineering",
  "promo_code": null,
  "promo_code_used": null,
  "tokens_left": 3,
  "tokens_last_update": null,
  "total_paid": 0,
  "last_paid": null,
  "current_plan_start": null,
  "current_plan_end": null,
  "created_at": "2024-12-21T07:00:00.000Z",
  "updated_at": "2024-12-21T07:00:00.000Z",
  "expiry": null,
  "isPaid": false,
  "planExpiry": null
}
```

---

### 2. Get Current User

**Endpoint:** `GET /api/users/me`

**Authentication:** Required (Clerk Token)

**Description:** Retrieves the authenticated user's profile with devices and followed companies.

**Headers:**
```
Authorization: Bearer <CLERK_TOKEN>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "clerkId": "user_2abc123xyz",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "img_url": "https://example.com/avatar.jpg",
  "active": true,
  "is_experienced": true,
  "company_name": "Google",
  "years_of_experience": 5,
  "resume_link": "https://example.com/resume.pdf",
  "segment": "software_engineering",
  "isPaid": false,
  "planExpiry": null,
  "tokens_left": 3,
  "created_at": "2024-12-21T07:00:00.000Z",
  "updated_at": "2024-12-21T07:00:00.000Z",
  "devices": [],
  "followedCompanies": []
}
```

---

### 3. Get All Users

**Endpoint:** `GET /api/users`

**Authentication:** Required (Clerk Token)

**Description:** Retrieves all users (admin functionality).

**Headers:**
```
Authorization: Bearer <CLERK_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "is_experienced": true,
    "segment": "software_engineering"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "is_experienced": false,
    "segment": "data_science"
  }
]
```

---

### 4. Get User by ID

**Endpoint:** `GET /api/users/:id`

**Authentication:** Required (Clerk Token)

**Description:** Retrieves a specific user by their UUID.

**Headers:**
```
Authorization: Bearer <CLERK_TOKEN>
```

**URL Parameters:**
- `id` (UUID): User ID

**Example:** `GET /api/users/550e8400-e29b-41d4-a716-446655440000`

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "is_experienced": true,
  "company_name": "Google",
  "years_of_experience": 5,
  "segment": "software_engineering",
  "isPaid": false
}
```

---

### 5. Update User

**Endpoint:** `PUT /api/users/:id`

**Authentication:** Required (Clerk Token)

**Description:** Updates user profile. Users can only update their own profile (security check via Clerk ID).

**Headers:**
```
Authorization: Bearer <CLERK_TOKEN>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "John Updated Doe",
  "img_url": "https://example.com/new-avatar.jpg",
  "is_experienced": true,
  "college_name": "Stanford",
  "cgpa": "9.5",
  "company_name": "Meta",
  "years_of_experience": 6,
  "resume_link": "https://example.com/updated-resume.pdf",
  "segment": "machine_learning",
  "companies": ["company-uuid-1", "company-uuid-3"]
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Updated Doe",
  "email": "john.doe@example.com",
  "company_name": "Meta",
  "years_of_experience": 6,
  "segment": "machine_learning",
  "updated_at": "2024-12-21T08:00:00.000Z",
  "followedCompanies": [
    {
      "id": "company-uuid-1",
      "name": "Google"
    },
    {
      "id": "company-uuid-3",
      "name": "Amazon"
    }
  ]
}
```

---

### 6. Delete User

**Endpoint:** `DELETE /api/users/:id`

**Authentication:** Required (Clerk Token)

**Description:** Deletes a user profile. Users can only delete their own profile.

**Headers:**
```
Authorization: Bearer <CLERK_TOKEN>
```

**Response (204 No Content)**

---

## Company APIs

### 1. Get All Companies

**Endpoint:** `GET /api/companies`

**Authentication:** None (Public)

**Description:** Retrieves all companies with optional filtering by category.

**Query Parameters:**
- `category` (optional): Filter by company category
  - Values: `global_mnc`, `global_startup`, `indian_startup`

**Example:** `GET /api/companies?category=global_mnc`

**Response (200 OK):**
```json
[
  {
    "id": "company-uuid-1",
    "name": "Google",
    "logo": "https://example.com/google-logo.png",
    "description": "Technology company specializing in Internet-related services",
    "category": "global_mnc",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "company-uuid-2",
    "name": "Microsoft",
    "logo": "https://example.com/microsoft-logo.png",
    "description": "Multinational technology corporation",
    "category": "global_mnc",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 2. Create Company

**Endpoint:** `POST /api/companies`

**Authentication:** Required (API Key)

**Description:** Creates a single company (internal/admin use).

**Headers:**
```
x-api-key: <YOUR_INTERNAL_API_KEY>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Stripe",
  "logo": "https://example.com/stripe-logo.png",
  "description": "Payment processing platform",
  "category": "global_startup"
}
```

**Response (201 Created):**
```json
{
  "id": "company-uuid-new",
  "name": "Stripe",
  "logo": "https://example.com/stripe-logo.png",
  "description": "Payment processing platform",
  "category": "global_startup",
  "createdAt": "2024-12-21T07:00:00.000Z"
}
```

---

### 3. Bulk Create Companies

**Endpoint:** `POST /api/companies/bulk`

**Authentication:** Required (API Key)

**Description:** Creates multiple companies in a single request (internal/admin use).

**Headers:**
```
x-api-key: <YOUR_INTERNAL_API_KEY>
Content-Type: application/json
```

**Request Body:**
```json
[
  {
    "name": "Airbnb",
    "logo": "https://example.com/airbnb-logo.png",
    "description": "Online marketplace for lodging",
    "category": "global_startup"
  },
  {
    "name": "Uber",
    "logo": "https://example.com/uber-logo.png",
    "description": "Ride-sharing platform",
    "category": "global_startup"
  },
  {
    "name": "Flipkart",
    "logo": "https://example.com/flipkart-logo.png",
    "description": "E-commerce platform",
    "category": "indian_startup"
  }
]
```

**Response (201 Created):**
```json
{
  "count": 3,
  "companies": [
    {
      "id": "company-uuid-4",
      "name": "Airbnb"
    },
    {
      "id": "company-uuid-5",
      "name": "Uber"
    },
    {
      "id": "company-uuid-6",
      "name": "Flipkart"
    }
  ]
}
```

---

## Job APIs

### 1. Get All Jobs

**Endpoint:** `GET /api/jobs`

**Authentication:** None (Public)

**Description:** Retrieves all jobs with pagination and filtering.

**Query Parameters:**
- `segment` (optional): Filter by job segment (e.g., "software_engineering", "data_science")
- `companyId` (optional): Filter by company UUID
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 20, max: 100): Number of results per page

**Example:** `GET /api/jobs?segment=software_engineering&page=1&limit=10`

**Response (200 OK):**
```json
{
  "jobs": [
    {
      "id": "job-uuid-1",
      "company": "Google",
      "companyId": "company-uuid-1",
      "segment": "software_engineering",
      "title": "Senior Software Engineer",
      "careerpage_link": "https://careers.google.com/jobs/123",
      "created_at": "2024-12-20T00:00:00.000Z"
    },
    {
      "id": "job-uuid-2",
      "company": "Microsoft",
      "companyId": "company-uuid-2",
      "segment": "software_engineering",
      "title": "Principal Engineer",
      "careerpage_link": "https://careers.microsoft.com/jobs/456",
      "created_at": "2024-12-20T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

### 2. Get Job by ID

**Endpoint:** `GET /api/jobs/:id`

**Authentication:** None (Public)

**Description:** Retrieves a specific job by UUID.

**Example:** `GET /api/jobs/job-uuid-1`

**Response (200 OK):**
```json
{
  "id": "job-uuid-1",
  "company": "Google",
  "companyId": "company-uuid-1",
  "segment": "software_engineering",
  "title": "Senior Software Engineer",
  "careerpage_link": "https://careers.google.com/jobs/123",
  "company_id": "ext_google_123",
  "created_at": "2024-12-20T00:00:00.000Z",
  "created_by": "admin",
  "companyRel": {
    "id": "company-uuid-1",
    "name": "Google",
    "logo": "https://example.com/google-logo.png",
    "category": "global_mnc"
  }
}
```

---

### 3. Bulk Create Jobs

**Endpoint:** `POST /api/jobs/bulk`

**Authentication:** Required (API Key)

**Description:** Creates multiple jobs in a single request (internal/admin use).

**Headers:**
```
x-api-key: <YOUR_INTERNAL_API_KEY>
Content-Type: application/json
```

**Request Body:**
```json
[
  {
    "title": "Machine Learning Engineer",
    "company": "Google",
    "companyId": "company-uuid-1",
    "segment": "machine_learning",
    "careerpage_link": "https://careers.google.com/jobs/ml-123",
    "company_id": "ext_google_ml_123",
    "created_by": "admin"
  },
  {
    "title": "Data Scientist",
    "company": "Microsoft",
    "companyId": "company-uuid-2",
    "segment": "data_science",
    "careerpage_link": "https://careers.microsoft.com/jobs/ds-456"
  }
]
```

**Response (201 Created):**
```json
{
  "count": 2,
  "jobs": [
    {
      "id": "job-uuid-new-1",
      "title": "Machine Learning Engineer",
      "company": "Google"
    },
    {
      "id": "job-uuid-new-2",
      "title": "Data Scientist",
      "company": "Microsoft"
    }
  ]
}
```

---

## Social Post APIs

### 1. Get All Social Posts

**Endpoint:** `GET /api/social-posts`

**Authentication:** None (Public)

**Description:** Retrieves all social posts with pagination and filtering.

**Query Parameters:**
- `segment` (optional): Filter by segment
- `source` (optional): Filter by source (e.g., "linkedin", "reddit", "twitter", "direct")
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20, max: 100): Results per page

**Example:** `GET /api/social-posts?source=linkedin&page=1&limit=10`

**Response (200 OK):**
```json
{
  "posts": [
    {
      "id": "post-uuid-1",
      "name": "Google Referral - SWE Role",
      "description": "Looking for referrals for Software Engineer position at Google...",
      "segment": "software_engineering",
      "company": "Google",
      "source": "linkedin",
      "source_link": "https://linkedin.com/posts/123",
      "image_link": "https://example.com/post-image.jpg",
      "created_at": "2024-12-21T00:00:00.000Z",
      "created_by": "admin"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### 2. Get Social Post by ID

**Endpoint:** `GET /api/social-posts/:id`

**Authentication:** None (Public)

**Description:** Retrieves a specific social post with comments.

**Example:** `GET /api/social-posts/post-uuid-1`

**Response (200 OK):**
```json
{
  "id": "post-uuid-1",
  "name": "Google Referral - SWE Role",
  "description": "Looking for referrals for Software Engineer position at Google...",
  "segment": "software_engineering",
  "company": "Google",
  "source": "linkedin",
  "source_link": "https://linkedin.com/posts/123",
  "image_link": "https://example.com/post-image.jpg",
  "created_at": "2024-12-21T00:00:00.000Z",
  "comments": [
    {
      "id": "comment-uuid-1",
      "content": "I can help with the referral!",
      "userId": "user-uuid-1",
      "createdAt": "2024-12-21T01:00:00.000Z",
      "user": {
        "name": "Jane Smith",
        "img_url": "https://example.com/jane-avatar.jpg"
      }
    }
  ]
}
```

---

### 3. Bulk Create Social Posts

**Endpoint:** `POST /api/social-posts/bulk`

**Authentication:** Required (API Key)

**Description:** Creates multiple social posts (internal/admin use).

**Headers:**
```
x-api-key: <YOUR_INTERNAL_API_KEY>
Content-Type: application/json
```

**Request Body:**
```json
[
  {
    "name": "Amazon Referral - ML Engineer",
    "description": "Seeking referrals for Machine Learning Engineer at Amazon...",
    "segment": "machine_learning",
    "company": "Amazon",
    "source": "linkedin",
    "source_link": "https://linkedin.com/posts/456",
    "image_link": "https://example.com/amazon-post.jpg",
    "created_by": "admin"
  },
  {
    "name": "Microsoft Interview Tips",
    "description": "Tips for cracking Microsoft interviews...",
    "segment": "software_engineering",
    "company": "Microsoft",
    "source": "reddit",
    "source_link": "https://reddit.com/r/cscareerquestions/789"
  }
]
```

**Response (201 Created):**
```json
{
  "count": 2,
  "posts": [
    {
      "id": "post-uuid-new-1",
      "name": "Amazon Referral - ML Engineer"
    },
    {
      "id": "post-uuid-new-2",
      "name": "Microsoft Interview Tips"
    }
  ]
}
```

---

## Payment APIs (Razorpay)

### 1. Create Payment Order

**Endpoint:** `POST /api/payment/order`

**Authentication:** Required (Clerk Token)

**Description:** Creates a Razorpay payment order for subscription/premium access.

**Headers:**
```
Authorization: Bearer <CLERK_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 999,
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Field Details:**
- `amount` (number, required): Amount in INR (will be converted to paise internally)
- `userId` (UUID, required): User ID making the payment

**Response (201 Created):**
```json
{
  "id": "order_MNopQRstUvWxYz",
  "entity": "order",
  "amount": 99900,
  "amount_paid": 0,
  "amount_due": 99900,
  "currency": "INR",
  "receipt": "receipt_order_1703145600000",
  "status": "created",
  "attempts": 0,
  "notes": [],
  "created_at": 1703145600
}
```

> **Note:** This order ID should be used in the Razorpay payment gateway on the frontend. A payment record with status "PENDING" is created in the database.

---

### 2. Verify Payment

**Endpoint:** `POST /api/payment/verify`

**Authentication:** Required (Clerk Token)

**Description:** Verifies the payment signature after successful payment and upgrades user to paid status.

**Headers:**
```
Authorization: Bearer <CLERK_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "razorpay_order_id": "order_MNopQRstUvWxYz",
  "razorpay_payment_id": "pay_ABcdEFghIJklMN",
  "razorpay_signature": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Field Details:**
- `razorpay_order_id` (string, required): Order ID from create order response
- `razorpay_payment_id` (string, required): Payment ID from Razorpay callback
- `razorpay_signature` (string, required): Signature from Razorpay callback
- `userId` (UUID, required): User ID making the payment

**Success Response (200 OK):**
```json
{
  "message": "Payment Verified",
  "success": true
}
```

**What Happens on Success:**
1. Payment status updated to "SUCCESS" in database
2. User's `isPaid` field set to `true`
3. User's `planExpiry` set to 1 year from now

**Failure Response (400 Bad Request):**
```json
{
  "message": "Invalid Signature",
  "success": false
}
```

**What Happens on Failure:**
- Payment status updated to "FAILED" in database
- User remains unpaid

---

## Device Management APIs

### 1. Register Device (Authenticated)

**Endpoint:** `POST /api/users/devices`

**Authentication:** Required (Clerk Token)

**Description:** Registers a device for push notifications (FCM tokens) associated with the authenticated user.

**Headers:**
```
Authorization: Bearer <CLERK_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "fcm_token_abc123xyz789",
  "type": "android"
}
```

**Response (201 Created):**
```json
{
  "id": "device-uuid-1",
  "token": "fcm_token_abc123xyz789",
  "type": "android",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-12-21T07:00:00.000Z"
}
```

---

### 2. Register Device (Public/Unauthenticated)

**Endpoint:** `POST /api/users/devices/public`

**Authentication:** None (Public)

**Description:** Registers a device token without requiring user authentication. Useful for initial registration or testing.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "fcm_token_public_123",
  "type": "ios",
  "userId": "optional-user-uuid"
}
```

**Field Details:**
- `token` (string, required): FCM token
- `type` (string, optional): "ios", "android", "web"
- `userId` (UUID, optional): Associate with a user if known

**Response (201 Created):**
```json
{
  "id": "device-uuid-public",
  "token": "fcm_token_public_123",
  "type": "ios",
  "userId": null,
  "createdAt": "2024-12-21T07:05:00.000Z"
}
```

---

## Complete User Journey Example

### Step 1: User Signs Up (via Clerk)
First, the user authenticates via Clerk and receives a JWT token.

**Clerk Token:** `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### Step 2: Create User Profile

**Request:**
```http
POST /api/users
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "img_url": "https://example.com/alice.jpg",
  "is_experienced": false,
  "college_name": "Stanford University",
  "cgpa": "9.1",
  "segment": "software_engineering"
}
```

**Response:**
```json
{
  "id": "user-alice-uuid",
  "clerkId": "user_clerk_alice",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "is_experienced": false,
  "college_name": "Stanford University",
  "cgpa": "9.1",
  "segment": "software_engineering",
  "isPaid": false,
  "tokens_left": 3,
  "created_at": "2024-12-21T07:00:00.000Z"
}
```

---

### Step 3: Browse Companies

**Request:**
```http
GET /api/companies?category=global_mnc
```

**Response:**
```json
[
  {
    "id": "company-google-uuid",
    "name": "Google",
    "logo": "https://example.com/google-logo.png",
    "category": "global_mnc"
  },
  {
    "id": "company-microsoft-uuid",
    "name": "Microsoft",
    "logo": "https://example.com/microsoft-logo.png",
    "category": "global_mnc"
  }
]
```

---

### Step 4: Follow Companies

**Request:**
```http
PUT /api/users/user-alice-uuid
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "companies": ["company-google-uuid", "company-microsoft-uuid"]
}
```

**Response:**
```json
{
  "id": "user-alice-uuid",
  "name": "Alice Johnson",
  "followedCompanies": [
    {
      "id": "company-google-uuid",
      "name": "Google"
    },
    {
      "id": "company-microsoft-uuid",
      "name": "Microsoft"
    }
  ]
}
```

---

### Step 5: Browse Jobs

**Request:**
```http
GET /api/jobs?segment=software_engineering&companyId=company-google-uuid&page=1&limit=5
```

**Response:**
```json
{
  "jobs": [
    {
      "id": "job-1-uuid",
      "company": "Google",
      "companyId": "company-google-uuid",
      "title": "Software Engineer II",
      "segment": "software_engineering",
      "careerpage_link": "https://careers.google.com/jobs/123"
    },
    {
      "id": "job-2-uuid",
      "company": "Google",
      "title": "Senior Software Engineer",
      "segment": "software_engineering",
      "careerpage_link": "https://careers.google.com/jobs/456"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "totalPages": 5
  }
}
```

---

### Step 6: Browse Social Posts

**Request:**
```http
GET /api/social-posts?source=linkedin&page=1&limit=5
```

**Response:**
```json
{
  "posts": [
    {
      "id": "post-1-uuid",
      "name": "Google Referral - SWE",
      "description": "Looking for referrals...",
      "company": "Google",
      "source": "linkedin",
      "created_at": "2024-12-21T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 15,
    "totalPages": 3
  }
}
```

---

### Step 7: Decide to Upgrade to Premium

Alice wants premium access to unlock all features.

---

### Step 8: Create Payment Order

**Request:**
```http
POST /api/payment/order
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 999,
  "userId": "user-alice-uuid"
}
```

**Response:**
```json
{
  "id": "order_MNopQRstUvWxYz",
  "entity": "order",
  "amount": 99900,
  "amount_paid": 0,
  "amount_due": 99900,
  "currency": "INR",
  "receipt": "receipt_order_1703145600000",
  "status": "created",
  "created_at": 1703145600
}
```

> **Database State:** Payment record created with status "PENDING"

---

### Step 9: Complete Payment (via Razorpay)

Alice completes the payment using Razorpay's payment gateway. After successful payment, Razorpay returns:
- `razorpay_order_id`: "order_MNopQRstUvWxYz"
- `razorpay_payment_id`: "pay_ABcdEFghIJklMN"
- `razorpay_signature`: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"

---

### Step 10: Verify Payment

**Request:**
```http
POST /api/payment/verify
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "razorpay_order_id": "order_MNopQRstUvWxYz",
  "razorpay_payment_id": "pay_ABcdEFghIJklMN",
  "razorpay_signature": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "userId": "user-alice-uuid"
}
```

**Response:**
```json
{
  "message": "Payment Verified",
  "success": true
}
```

> **Database State:**
> - Payment status updated to "SUCCESS"
> - User's `isPaid` = `true`
> - User's `planExpiry` = "2025-12-21T07:00:00.000Z" (1 year from now)

---

### Step 11: Verify Premium Status

**Request:**
```http
GET /api/users/me
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": "user-alice-uuid",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "isPaid": true,
  "planExpiry": "2025-12-21T07:00:00.000Z",
  "tokens_left": 3,
  "followedCompanies": [
    {
      "id": "company-google-uuid",
      "name": "Google"
    }
  ]
}
```

---

## Error Responses

All APIs follow standard HTTP status codes:

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "must be a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "User not authenticated"
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized to update this user"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

---

## Postman Collection Setup

### Environment Variables

Create a Postman environment with these variables:

```
BASE_URL: http://localhost:4000/api
CLERK_TOKEN: <your-clerk-jwt-token>
API_KEY: <your-internal-api-key>
USER_ID: <created-user-uuid>
COMPANY_ID: <company-uuid>
JOB_ID: <job-uuid>
ORDER_ID: <razorpay-order-id>
```

### Pre-request Scripts

For authenticated requests, add this pre-request script:

```javascript
pm.environment.set("CLERK_TOKEN", "your-actual-clerk-token");
```

### Collection Structure

```
HiringBull API
├── Health Check
│   └── GET /
├── Users
│   ├── Create User (POST /users)
│   ├── Get Current User (GET /users/me)
│   ├── Get All Users (GET /users)
│   ├── Get User by ID (GET /users/:id)
│   ├── Update User (PUT /users/:id)
│   └── Delete User (DELETE /users/:id)
├── Companies
│   ├── Get All Companies (GET /companies)
│   ├── Get Companies by Category (GET /companies?category=global_mnc)
│   ├── Create Company (POST /companies)
│   └── Bulk Create Companies (POST /companies/bulk)
├── Jobs
│   ├── Get All Jobs (GET /jobs)
│   ├── Get Jobs with Filters (GET /jobs?segment=software_engineering)
│   ├── Get Job by ID (GET /jobs/:id)
│   └── Bulk Create Jobs (POST /jobs/bulk)
├── Social Posts
│   ├── Get All Posts (GET /social-posts)
│   ├── Get Posts by Source (GET /social-posts?source=linkedin)
│   ├── Get Post by ID (GET /social-posts/:id)
│   └── Bulk Create Posts (POST /social-posts/bulk)
├── Payments
│   ├── Create Order (POST /payment/order)
│   └── Verify Payment (POST /payment/verify)
└── Devices
    ├── Register Device (POST /users/devices)
    └── Register Device Public (POST /users/devices/public)
```

---

## Testing Flow in Postman

### 1. **Setup Phase**
   - Set environment variables
   - Get Clerk authentication token
   - Test health check endpoint

### 2. **User Onboarding**
   - Create user profile
   - Verify user creation with GET /users/me

### 3. **Explore Content**
   - Get companies list
   - Get jobs with filters
   - Get social posts

### 4. **User Actions**
   - Update user profile
   - Follow companies

### 5. **Payment Flow**
   - Create payment order
   - (Simulate Razorpay payment)
   - Verify payment
   - Check updated user status

### 6. **Admin Operations** (using API Key)
   - Bulk create companies
   - Bulk create jobs
   - Bulk create social posts

---

## Rate Limiting

The API implements rate limiting:
- **Default:** 100 requests per 15 minutes per IP
- Headers returned:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

**Rate Limit Exceeded Response (429):**
```json
{
  "message": "Too many requests, please try again later."
}
```

---

## Additional Notes

### Development Mode
When Clerk keys are not configured, the API runs in development mode:
- Authentication is bypassed with a mock user ID
- Useful for testing without Clerk setup
- **Warning:** Never use in production

### Razorpay Integration
To test payments:
1. Use Razorpay test keys (starts with `rzp_test_`)
2. Use test card: `4111 1111 1111 1111`
3. Any future CVV and expiry date

### Database Schema
Key relationships:
- User → Payments (one-to-many)
- User → Devices (one-to-many)
- User → Companies (many-to-many via followedCompanies)
- Company → Jobs (one-to-many)
- SocialPost → Comments (one-to-many)
- User → Comments (one-to-many)

---

## Support & Troubleshooting

### Common Issues

**1. "User not authenticated" error**
- Ensure Clerk token is valid and not expired
- Check Authorization header format: `Bearer <token>`

**2. "Invalid or missing API key" error**
- Verify `x-api-key` header is set
- Check `INTERNAL_API_KEY` environment variable

**3. "Razorpay is not configured" error**
- Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`

**4. Validation errors**
- Check request body matches validation schema
- Ensure UUIDs are valid format
- Verify required fields are present

---

## Conclusion

This guide covers the complete API flow for HiringBull from user creation to payment completion. Use this as a reference for:
- Building frontend applications
- Testing API endpoints in Postman
- Understanding the application flow
- Integrating with third-party services (Clerk, Razorpay)

For any additional endpoints or features, refer to the route files in the codebase or contact the development team.
