# BugTracker Pro - Backend API

Node.js Express backend for the BugTracker Pro application.

## Getting Started

### Install Dependencies
```bash
cd backend
npm install
```

### Run Development Server
```bash
npm run dev
```
Or without nodemon:
```bash
npm start
```

The server runs on `http://localhost:5001`

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Sign in and get JWT token
- `POST /api/auth/signout` - Sign out (requires auth)
- `GET /api/auth/me` - Get current user (requires auth)

### Bugs
- `GET /api/bugs` - Get all bugs (requires auth)
- `GET /api/bugs/:id` - Get single bug (requires auth)
- `POST /api/bugs` - Create a new bug (requires auth)
- `PUT /api/bugs/:id` - Update a bug (requires auth)
- `DELETE /api/bugs/:id` - Delete a bug (requires auth)

### Users
- `GET /api/users` - Get all users (requires auth)
- `GET /api/users/:id` - Get user by ID (requires auth)
- `PUT /api/users/profile` - Update own profile (requires auth)

### Admin (requires admin role)
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/activities` - Get recent activities
- `GET /api/admin/users` - Get all users (full info)
- `POST /api/admin/users` - Create a new user
- `PUT /api/admin/users/:id` - Update any user
- `DELETE /api/admin/users/:id` - Delete a user
- `GET /api/admin/bugs` - Get all bugs (admin view)
- `DELETE /api/admin/bugs/:id` - Delete any bug

## Authentication

Use JWT Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Default Admin User
- Email: `admin@company.com`
- Password: `admin123`
