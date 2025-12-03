# Campus Verse Backend - Complete API Documentation

## Overview
Campus Verse Backend is a RESTful API built with Express.js and MongoDB for managing campus events, clubs, RSVPs, QR-based attendance, and push notifications.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **QR Code**: qrcode library
- **Push Notifications**: Expo Server SDK
- **Password Hashing**: bcryptjs

## Project Structure
```
backend/
├── models/              # Mongoose models
│   ├── User.js         # User schema with authentication
│   ├── Event.js        # Event schema
│   ├── Club.js         # Club schema
│   ├── RSVP.js         # RSVP schema
│   └── Attendance.js   # Attendance schema
├── routes/              # API routes
│   ├── authRoutes.js   # Authentication endpoints
│   ├── eventRoutes.js  # Event management endpoints
│   ├── clubRoutes.js   # Club management endpoints
│   ├── rsvpRoutes.js   # RSVP endpoints
│   └── attendanceRoutes.js # Attendance endpoints
├── middleware/          # Express middleware
│   └── authMiddleware.js # JWT verification & role checking
├── services/            # Business logic services
│   └── notificationService.js # Push notification service
├── .env                # Environment variables
├── .env.example        # Environment template
├── server.js           # Main server file
└── package.json        # Dependencies
```

## Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (enum: ['student', 'admin'], default: 'student'),
  expoPushToken: String (nullable),
  followedClubs: [ObjectId] (ref: Club),
  createdAt: Date
}
```

### Event Model
```javascript
{
  title: String (required),
  description: String (required),
  date: Date (required),
  time: String (required),
  venue: String (required),
  organizer: String (required),
  tags: [String],
  clubId: ObjectId (ref: Club, nullable),
  qrCode: String (Data URL),
  createdBy: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Club Model
```javascript
{
  name: String (unique, required),
  description: String (required),
  category: String (enum: ['Academic', 'Sports', 'Cultural', 'Technical', 'Social', 'Other']),
  logoUrl: String (nullable),
  contactEmail: String (required),
  createdAt: Date
}
```

### RSVP Model
```javascript
{
  userId: ObjectId (ref: User, required),
  eventId: ObjectId (ref: Event, required),
  status: String (enum: ['attending', 'cancelled'], default: 'attending'),
  createdAt: Date,
  updatedAt: Date
}
// Unique index on (userId, eventId)
```

### Attendance Model
```javascript
{
  userId: ObjectId (ref: User, required),
  eventId: ObjectId (ref: Event, required),
  checkedInAt: Date (default: now),
  qrCodeScanned: Boolean (default: true)
}
// Unique index on (userId, eventId)
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "student" // or "admin"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "student"
    }
  }
}
```

#### POST /api/auth/signin
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "student"
    }
  }
}
```

#### POST /api/auth/expo-token
Save Expo push notification token (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Expo push token saved successfully"
}
```

#### GET /api/auth/me
Get current user info (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "student",
      "followedClubs": ["club_id_1", "club_id_2"]
    }
  }
}
```

### Event Endpoints

#### GET /api/events
Get all events with optional filters.

**Query Parameters:**
- `tags`: Comma-separated list of tags (e.g., "tech,workshop")
- `clubId`: Filter by club ID
- `upcoming`: "true" to show only upcoming events

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "data": {
    "events": [
      {
        "_id": "event_id",
        "title": "Tech Workshop",
        "description": "Learn React Native",
        "date": "2024-01-15T00:00:00.000Z",
        "time": "3:00 PM",
        "venue": "Room 101",
        "organizer": "Tech Club",
        "tags": ["tech", "workshop"],
        "clubId": { "_id": "club_id", "name": "Tech Club" },
        "qrCode": "data:image/png;base64,...",
        "createdBy": { "_id": "user_id", "name": "Admin" }
      }
    ]
  }
}
```

#### GET /api/events/:id
Get event by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "event": {
      "_id": "event_id",
      "title": "Tech Workshop",
      ...
    }
  }
}
```

#### POST /api/events
Create new event (admin only, requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "Tech Workshop",
  "description": "Learn React Native",
  "date": "2024-01-15",
  "time": "3:00 PM",
  "venue": "Room 101",
  "organizer": "Tech Club",
  "tags": ["tech", "workshop"],
  "clubId": "club_id_or_null"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event": { ... }
  }
}
```

**Note:** QR code is automatically generated when event is created.

#### PUT /api/events/:id
Update event (admin only, requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "time": "4:00 PM",
  "venue": "Room 202"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "event": { ... }
  }
}
```

**Note:** Notifications are sent to RSVP'd users if time or venue changes.

#### DELETE /api/events/:id
Delete event (admin only, requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Note:** Cancellation notifications are sent to RSVP'd users.

#### GET /api/events/:id/qrcode
Get QR code for event (admin only, requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,...",
    "eventId": "event_id",
    "eventTitle": "Tech Workshop"
  }
}
```

### Club Endpoints

#### GET /api/clubs
Get all clubs.

**Query Parameters:**
- `category`: Filter by category (Academic, Sports, Cultural, Technical, Social, Other)

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": {
    "clubs": [
      {
        "_id": "club_id",
        "name": "Tech Club",
        "description": "Technology enthusiasts",
        "category": "Technical",
        "logoUrl": "https://...",
        "contactEmail": "tech@campus.edu"
      }
    ]
  }
}
```

#### GET /api/clubs/:id
Get club by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "club": { ... }
  }
}
```

#### POST /api/clubs
Create new club (admin only, requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Tech Club",
  "description": "Technology enthusiasts",
  "category": "Technical",
  "logoUrl": "https://...",
  "contactEmail": "tech@campus.edu"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Club created successfully",
  "data": {
    "club": { ... }
  }
}
```

#### PUT /api/clubs/:id
Update club (admin only, requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:** (all fields optional)
```json
{
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Club updated successfully",
  "data": {
    "club": { ... }
  }
}
```

#### DELETE /api/clubs/:id
Delete club (admin only, requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Club deleted successfully"
}
```

#### POST /api/clubs/:id/follow
Follow a club (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully followed club",
  "data": {
    "clubId": "club_id",
    "clubName": "Tech Club"
  }
}
```

#### POST /api/clubs/:id/unfollow
Unfollow a club (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully unfollowed club",
  "data": {
    "clubId": "club_id",
    "clubName": "Tech Club"
  }
}
```

#### GET /api/clubs/my/followed
Get user's followed clubs (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": {
    "clubs": [ ... ]
  }
}
```

### RSVP Endpoints

#### POST /api/rsvp/:eventId
RSVP to an event (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (201):**
```json
{
  "success": true,
  "message": "RSVP successful",
  "data": {
    "rsvp": {
      "_id": "rsvp_id",
      "userId": "user_id",
      "eventId": "event_id",
      "status": "attending"
    }
  }
}
```

#### DELETE /api/rsvp/:eventId
Cancel RSVP (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "RSVP cancelled successfully",
  "data": {
    "rsvp": { ... }
  }
}
```

#### GET /api/rsvp/my-rsvps
Get user's RSVPs (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status`: Filter by status ("attending" or "cancelled")

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": {
    "rsvps": [
      {
        "_id": "rsvp_id",
        "userId": "user_id",
        "eventId": { event details with populated club },
        "status": "attending"
      }
    ]
  }
}
```

#### GET /api/rsvp/event/:eventId/count
Get RSVP count for an event.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "eventId": "event_id",
    "rsvpCount": 25
  }
}
```

#### GET /api/rsvp/event/:eventId/status
Get user's RSVP status for an event (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "eventId": "event_id",
    "hasRSVP": true,
    "status": "attending"
  }
}
```

#### GET /api/rsvp/event/:eventId/attendees
Get list of attendees for an event.

**Response (200):**
```json
{
  "success": true,
  "count": 25,
  "data": {
    "attendees": [
      {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "rsvpDate": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Attendance Endpoints

#### POST /api/attendance/checkin
Check in to event via QR code scan (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "qrData": "{\"eventId\":\"event_id\",\"title\":\"Event Title\",\"type\":\"attendance\"}"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "attendance": {
      "_id": "attendance_id",
      "userId": "user_id",
      "eventId": "event_id",
      "checkedInAt": "2024-01-15T15:30:00.000Z",
      "qrCodeScanned": true
    },
    "event": {
      "id": "event_id",
      "title": "Tech Workshop",
      "date": "2024-01-15",
      "time": "3:00 PM",
      "venue": "Room 101"
    }
  }
}
```

#### GET /api/attendance/event/:eventId
Get attendance list for event (admin only, requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": {
    "eventId": "event_id",
    "eventTitle": "Tech Workshop",
    "attendees": [
      {
        "id": "attendance_id",
        "user": {
          "id": "user_id",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "student"
        },
        "checkedInAt": "2024-01-15T15:30:00.000Z",
        "qrCodeScanned": true
      }
    ]
  }
}
```

#### GET /api/attendance/my-attendance
Get user's attendance history (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "data": {
    "attendance": [
      {
        "id": "attendance_id",
        "event": { event details with populated club },
        "checkedInAt": "2024-01-15T15:30:00.000Z",
        "qrCodeScanned": true
      }
    ]
  }
}
```

#### GET /api/attendance/event/:eventId/status
Check if user has checked in (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "eventId": "event_id",
    "hasCheckedIn": true,
    "checkedInAt": "2024-01-15T15:30:00.000Z"
  }
}
```

#### GET /api/attendance/event/:eventId/count
Get attendance count for an event.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "eventId": "event_id",
    "attendanceCount": 15
  }
}
```

## Push Notification Service

The notification service automatically sends push notifications for:

1. **New Events**: When an admin creates an event associated with a club, all followers of that club receive a notification
2. **Event Updates**: When time or venue changes, all RSVP'd users receive update notifications
3. **Event Reminders**: Can be implemented with a scheduled task (not included in basic version)
4. **Event Cancellation**: When an event is deleted, all RSVP'd users are notified

### Notification Types

**New Event:**
```
Title: "New Event from {Club Name}"
Body: "{Event Title} - {Date} at {Time}"
Data: { type: 'new_event', eventId, clubName }
```

**Time Change:**
```
Title: "Time Changed: {Event Title}"
Body: "Event time has been updated to {new time}"
Data: { type: 'event_update', eventId, updateType: 'time_change' }
```

**Venue Change:**
```
Title: "Venue Changed: {Event Title}"
Body: "Event venue has been updated to {new venue}"
Data: { type: 'event_update', eventId, updateType: 'venue_change' }
```

**Event Cancelled:**
```
Title: "Event Cancelled: {Event Title}"
Body: "This event has been cancelled"
Data: { type: 'event_update', eventId, updateType: 'cancelled' }
```

## Authentication & Authorization

### JWT Token Structure
```javascript
{
  userId: "user_id",
  role: "student" | "admin",
  exp: timestamp
}
```

### Protected Routes
All routes except the following require authentication:
- POST /api/auth/signup
- POST /api/auth/signin
- GET /api/events
- GET /api/events/:id
- GET /api/clubs
- GET /api/clubs/:id
- GET /api/rsvp/event/:eventId/count
- GET /api/rsvp/event/:eventId/attendees
- GET /api/attendance/event/:eventId/count

### Admin-Only Routes
- POST /api/events
- PUT /api/events/:id
- DELETE /api/events/:id
- GET /api/events/:id/qrcode
- POST /api/clubs
- PUT /api/clubs/:id
- DELETE /api/clubs/:id
- GET /api/attendance/event/:eventId

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

### Common HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Environment Variables

Create a `.env` file in the backend directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/campus_verse

# JWT Secret (use a strong random string in production)
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

## Setup & Installation

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Change `JWT_SECRET` to a secure random string

3. **Start MongoDB:**
   - Ensure MongoDB is running locally or provide a MongoDB Atlas URI

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Run Production Server:**
   ```bash
   npm start
   ```

## Testing the API

### Using Postman or Similar Tools

1. **Register a new user:**
   - POST `http://localhost:5000/api/auth/signup`
   - Body: `{ "email": "admin@test.com", "password": "admin123", "name": "Admin User", "role": "admin" }`

2. **Login:**
   - POST `http://localhost:5000/api/auth/signin`
   - Body: `{ "email": "admin@test.com", "password": "admin123" }`
   - Copy the token from response

3. **Create a club (use token in Authorization header):**
   - POST `http://localhost:5000/api/clubs`
   - Headers: `Authorization: Bearer <token>`
   - Body: `{ "name": "Tech Club", "description": "...", "category": "Technical", "contactEmail": "tech@test.com" }`

4. **Create an event:**
   - POST `http://localhost:5000/api/events`
   - Headers: `Authorization: Bearer <token>`
   - Body: Include all required event fields

5. **Test other endpoints similarly**

## QR Code Format

When scanning QR codes in the mobile app, the QR data is a JSON string:

```json
{
  "eventId": "event_id_here",
  "title": "Event Title",
  "type": "attendance"
}
```

The mobile app should:
1. Scan the QR code
2. Parse the JSON data
3. Send the raw QR data string to POST /api/attendance/checkin

## Database Indexes

The following indexes are automatically created:

1. **User**: email (unique)
2. **Club**: name (unique)
3. **RSVP**: (userId, eventId) compound unique index
4. **Attendance**: (userId, eventId) compound unique index

## Security Best Practices

1. **Password Security**: Passwords are hashed using bcryptjs with salt rounds of 10
2. **JWT Expiration**: Tokens expire after 30 days
3. **CORS**: Enabled for all origins (configure for production)
4. **Input Validation**: All endpoints validate required fields
5. **Error Handling**: Sensitive error details only shown in development mode

## Future Enhancements

1. **Email Verification**: Add email verification for new users
2. **Forgot Password**: Implement password reset flow
3. **Event Reminders**: Scheduled job to send reminders 24 hours before events
4. **File Uploads**: Support for club logos and event images
5. **Analytics**: Track attendance rates, popular events, etc.
6. **Search**: Full-text search for events and clubs
7. **Pagination**: Add pagination to list endpoints
8. **Rate Limiting**: Implement rate limiting for API security
