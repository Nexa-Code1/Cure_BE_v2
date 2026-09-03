# Cure Backend API v2 🏥

Cure Backend API is a robust, scalable Node.js/Express backend service powering the Cure healthcare platform. This RESTful API provides authentication, doctor management, appointment booking, payment processing, and user management functionalities.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [API Documentation](#-api-documentation)
- [Database Models](#-database-models)
- [Authentication](#-authentication)
- [Payment Processing](#-payment-processing)
- [File Uploads](#-file-uploads)
- [Deployment](#-deployment)
- [Development](#-development)
- [Testing](#-testing)
- [Contributing](#-contributing)

## 🎯 Overview

Cure Backend API serves as the core backend service for the Cure healthcare platform, providing:

- **User Authentication**: JWT-based secure authentication system
- **Doctor Management**: CRUD operations for healthcare providers
- **Appointment Booking**: Schedule and manage medical appointments
- **Payment Processing**: Stripe integration for secure payments
- **Review System**: Patient feedback and ratings
- **File Management**: Cloudinary integration for media uploads
- **Email Notifications**: Nodemailer for transactional emails

## ✨ Features

### Core Features
- **RESTful API**: Clean, predictable API endpoints
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for patients, doctors, and admins
- **Data Validation**: Comprehensive request validation
- **Error Handling**: Structured error responses
- **CORS Configuration**: Secure cross-origin resource sharing

### Business Features
- **User Registration & Login**: Secure account creation and authentication
- **Doctor Profiles**: Complete healthcare provider profiles
- **Appointment Management**: Schedule, reschedule, cancel appointments
- **Payment Gateway**: Integrated Stripe payment processing
- **Review System**: Rate and review healthcare experiences
- **Favorites System**: Bookmark frequently visited doctors
- **Search & Filter**: Advanced doctor search capabilities
- **Email Notifications**: Appointment reminders and updates

## 🛠️ Tech Stack

### Backend Framework
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: JavaScript ES6+ (ES Modules)

### Database
- **Database**: MongoDB
- **ODM**: Mongoose 8.x
- **Hosting**: MongoDB Atlas

### Authentication & Security
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcrypt
- **Encryption**: crypto-js
- **CORS**: Express CORS middleware

### Third-Party Services
- **Payment Processing**: Stripe
- **File Storage**: Cloudinary + multer-storage-cloudinary
- **Email Service**: Nodemailer
- **File Uploads**: Multer

### Development & Deployment
- **Environment Management**: dotenv
- **Development Server**: Nodemon
- **Deployment Platform**: Vercel
- **UUID Generation**: uuid

## 🏗️ Architecture

### Project Structure
```
Cure_BE_v2/
├── src/
│   ├── DB/
│   │   ├── connection.js          # Database connection
│   │   └── models/                # Mongoose models
│   │       ├── user.model.js
│   │       ├── doctor.model.js
│   │       ├── booking.model.js
│   │       ├── reviews.model.js
│   │       └── fav.model.js
│   ├── Modules/                   # Feature modules
│   │   ├── Auth/                  # Authentication
│   │   ├── User/                  # User management
│   │   ├── Doctor/                # Doctor management
│   │   ├── Booking/               # Appointment booking
│   │   ├── Payment/               # Payment processing
│   │   ├── Review/                # Review system
│   │   ├── Favourite/             # Favorites system
│   │   └── Specialists/           # Specialist management
│   ├── Middlewares/               # Express middlewares
│   │   ├── authentication-middleware.js
│   │   └── error-handler-middleware.js
│   ├── config/                    # Configuration
│   │   ├── cloudinary.js
│   │   └── multer.js
│   ├── Utils/                     # Utilities
│   │   ├── email-template.js
│   │   ├── router-handler.js
│   │   ├── send-email.js
│   │   └── token-blacklist.js
│   └── main.js                    # Application entry point
├── api/                           # Vercel serverless functions
├── uploads/                       # Local file uploads (development)
├── index.js                       # Vercel entry point
└── package.json                   # Dependencies
```

### Design Patterns
- **Modular Architecture**: Feature-based module separation
- **MVC Pattern**: Models, Controllers, Services separation
- **Middleware Chain**: Express middleware pipeline
- **Service Layer**: Business logic encapsulation
- **Repository Pattern**: Data access abstraction

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- **MongoDB**: Local instance or MongoDB Atlas account
- **Cloudinary Account**: For file uploads
- **Stripe Account**: For payment processing
- **Email Service**: SMTP credentials for notifications

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-organization/cure.git
   cd Cure/Cure_BE_v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Configuration](#environment-configuration))

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Verify the API is running**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run build` - Build for Vercel deployment
- `npm run vercel-build` - Vercel-specific build script

## ⚙️ Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/Cure
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
DATABASE_PASSWORD=your_mongodb_password

# Authentication
JWT_SECRET_LOGIN=your_jwt_secret_key
SALT=10
ENCRYPT_SECRET=your_encryption_secret

# Email Configuration
EMAIL=your_email@example.com
EMAIL_PASSWORD=your_email_app_password

# Frontend URLs
FRONTEND_URL=https://your-frontend-domain.com
FRONTEND_DEFAULT_URL=http://localhost:5173

# Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# File Uploads (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Environment Variables Explained

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `DATABASE_URL` | Local MongoDB connection string | Development |
| `DATABASE` | MongoDB Atlas connection string | Production |
| `JWT_SECRET_LOGIN` | Secret key for JWT token signing | Yes |
| `EMAIL` | SMTP email address | Yes |
| `EMAIL_PASSWORD` | SMTP email password | Yes |
| `FRONTEND_URL` | Production frontend URL | Yes |
| `FRONTEND_DEFAULT_URL` | Development frontend URL | Yes |
| `STRIPE_SECRET_KEY` | Stripe API secret key | Yes |
| `CLOUDINARY_*` | Cloudinary API credentials | Yes |

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "patient" // or "doctor", "admin"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient"
    },
    "token": "jwt_token_here"
  }
}
```

#### Logout User
```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <jwt_token>
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1234567890"
}
```

### Doctor Endpoints

#### Get All Doctors
```http
GET /api/doctors
```

#### Get Doctor Details
```http
GET /api/doctors/:id
```

#### Search Doctors
```http
GET /api/doctors/search?specialty=Cardiology&location=New+York
```

#### Create Doctor (Admin)
```http
POST /api/doctors
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

name: Dr. John Smith
specialty: Cardiology
experience: 10
description: Experienced cardiologist
fees: 200
availability: Monday-Friday, 9am-5pm
image: [file]
```

### Appointment Endpoints

#### Book Appointment
```http
POST /api/appointments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "doctorId": "doctor_id",
  "date": "2024-12-25",
  "time": "10:00",
  "reason": "Regular checkup",
  "paymentMethod": "card"
}
```

#### Get User Appointments
```http
GET /api/appointments
Authorization: Bearer <jwt_token>
```

#### Cancel Appointment
```http
DELETE /api/appointments/:id
Authorization: Bearer <jwt_token>
```

### Payment Endpoints

#### Create Payment Intent
```http
POST /api/payments/create-payment-intent
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 20000, // amount in cents
  "appointmentId": "appointment_id"
}
```

#### Confirm Payment
```http
POST /api/payments/confirm
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "paymentIntentId": "pi_123456789",
  "appointmentId": "appointment_id"
}
```

### Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "message": "Descriptive message",
  "data": {}, // Response data or null
  "error": null // Error details if success is false
}
```

### Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

## 💾 Database Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  role: String, // 'patient', 'doctor', 'admin'
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  medicalHistory: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Doctor Model
```javascript
{
  _id: ObjectId,
  name: String,
  specialty: String,
  experience: Number,
  description: String,
  fees: Number,
  availability: [String],
  rating: Number,
  totalReviews: Number,
  image: String,
  location: {
    coordinates: [Number], // [longitude, latitude]
    address: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model
```javascript
{
  _id: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  date: Date,
  time: String,
  reason: String,
  status: String, // 'pending', 'confirmed', 'completed', 'cancelled'
  paymentStatus: String, // 'pending', 'paid', 'refunded'
  amount: Number,
  paymentIntentId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Review Model
```javascript
{
  _id: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  rating: Number, // 1-5
  comment: String,
  appointmentId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Favourite Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  doctorId: ObjectId,
  createdAt: Date
}
```

## 🔐 Authentication

### JWT Implementation
- **Token Type**: JSON Web Tokens (JWT)
- **Algorithm**: HS256
- **Token Expiry**: Configurable (default: 24 hours)
- **Storage**: HTTP-only cookies or Authorization header

### Authentication Flow
1. User submits credentials via `/api/auth/login`
2. Server validates credentials against database
3. Server generates JWT token with user payload
4. Token returned to client for subsequent requests
5. Client includes token in `Authorization: Bearer <token>` header
6. Middleware validates token for protected routes

### Protected Routes
All routes except `/api/auth/login` and `/api/auth/signup` require authentication.

### Role-Based Access Control
- **Patient**: Can book appointments, view doctors, write reviews
- **Doctor**: Can manage appointments, update profile, view patient details
- **Admin**: Full system access, user management, content moderation

## 💳 Payment Processing

### Stripe Integration
- **Payment Methods**: Credit/debit cards, digital wallets
- **Currency**: USD (configurable)
- **Security**: PCI DSS compliant via Stripe
- **Webhooks**: Payment confirmation and failure handling

### Payment Flow
1. User initiates appointment booking
2. System creates Stripe Payment Intent
3. Client collects payment via Stripe Elements
4. Payment confirmed via webhook
5. Appointment status updated to "confirmed"

### Test Cards
For development and testing:

| Card Number | Type | CVC | Expiry |
|-------------|------|-----|--------|
| 4242 4242 4242 4242 | Visa | Any 3 digits | Any future date |
| 5555 5555 5555 4444 | MasterCard | Any 3 digits | Any future date |
| 3782 822463 10005 | American Express | Any 4 digits | Any future date |

## 📁 File Uploads

### Cloudinary Integration
- **Storage**: Cloudinary cloud storage
- **File Types**: Images (JPG, PNG, GIF, WebP)
- **Optimization**: Automatic image optimization
- **Transformations**: Resize, crop, format conversion

### Upload Endpoints
```http
POST /api/upload/profile-image
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

file: [image_file]
```

### File Size Limits
- **Profile Images**: Max 5MB
- **Doctor Images**: Max 10MB
- **Document Uploads**: Max 20MB

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   vercel --prod
   ```

3. **Configure Environment Variables**
   Set all environment variables in Vercel project settings.

### Manual Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

**Build and Run:**
```bash
docker build -t cure-backend .
docker run -p 3000:3000 --env-file .env cure-backend
```

### Environment Configuration for Production

Ensure these production environment variables are set:

```env
NODE_ENV=production
DATABASE=your_production_mongodb_connection_string
JWT_SECRET_LOGIN=strong_production_secret
FRONTEND_URL=https://your-production-frontend.com
STRIPE_SECRET_KEY=sk_live_your_stripe_key
```

## 👨‍💻 Development

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Implement Changes**
   - Follow existing code patterns
   - Add appropriate error handling
   - Update documentation as needed

3. **Test Locally**
   ```bash
   npm run dev
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   ```

5. **Create Pull Request**

### Code Style Guidelines

- **ES6+ Syntax**: Use modern JavaScript features
- **Async/Await**: Prefer over callbacks for async operations
- **Error Handling**: Try/catch blocks with proper error messages
- **File Structure**: One class/component per file
- **Naming Conventions**: camelCase for variables/functions, PascalCase for classes

### API Design Principles
- **RESTful**: Use appropriate HTTP methods and status codes
- **Consistent**: Maintain consistent response formats
- **Documented**: Keep API documentation up to date
- **Versioned**: Plan for API versioning if needed

## 🧪 Testing

### Test Accounts

For development and testing purposes, use these accounts:

**Test Patient Account:**
- **Email**: `robert.king@eduplatform.com`
- **Password**: `pass1234`

**Test Doctor Account:**
- **Email**: `doctor.test@example.com`
- **Password**: `doctorpass123`

**Admin Account:**
- Contact system administrator for credentials

### Manual Testing

1. **Authentication Flow**
   - Register new user
   - Login with credentials
   - Access protected routes
   - Logout functionality

2. **Doctor Management**
   - View doctor list
   - Search and filter doctors
   - View doctor details
   - Create/update doctor profiles (admin only)

3. **Appointment Booking**
   - Book appointment
   - View appointment history
   - Cancel appointment
   - Payment integration

4. **Payment Processing**
   - Create payment intent
   - Process test payment
   - Verify payment confirmation

### API Testing Tools
- **Postman**: API testing and documentation
- **Insomnia**: REST API client
- **curl**: Command-line testing
- **Browser DevTools**: Network request inspection

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

### Commit Message Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Cure Backend API v2** © 2026 - Present. Built with ❤️ for better healthcare access.