# Campus Verse Backend API

> RESTful API for Campus Verse - A campus events and clubs management platform with QR-based attendance and push notifications.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or Atlas URI)
- npm or yarn

### Installation

1. **Clone and Navigate:**
   ```bash
   cd backend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```

6. **Server will start on:** `http://localhost:5000`

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables
- **qrcode**: QR code generation
- **expo-server-sdk**: Push notifications

## 📚 API Documentation

Full API documentation available in [BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md)

### Key Endpoints

**Authentication:**
- `POST /api/auth/signup` - Register user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/expo-token` - Save push token

**Events:**
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin)
- `GET /api/events/:id/qrcode` - Get QR code (admin)

**Clubs:**
- `GET /api/clubs` - Get all clubs
- `POST /api/clubs/:id/follow` - Follow club

**RSVP:**
- `POST /api/rsvp/:eventId` - RSVP to event
- `DELETE /api/rsvp/:eventId` - Cancel RSVP

**Attendance:**
- `POST /api/attendance/checkin` - QR check-in
- `GET /api/attendance/event/:eventId` - Get attendance list (admin)

## 🗄️ Database Models

- **User**: Authentication, roles, push tokens
- **Event**: Event details, QR codes
- **Club**: Club information
- **RSVP**: Event RSVPs
- **Attendance**: QR-based check-ins

## 🔐 Authentication

Uses JWT (JSON Web Tokens) with 30-day expiration.

**Authorization Header:**
```
Authorization: Bearer <jwt_token>
```

**Roles:**
- `student`: Default role, can RSVP and check-in
- `admin`: Can create/edit/delete events and clubs

## 📱 Push Notifications

Automatically sends notifications for:
- New events (to club followers)
- Event updates (to RSVP'd users)
- Event cancellations

Uses **Expo Push Notification Service**.

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Create Admin User
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "admin"
  }'
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 🔧 Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/campus_verse
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

## 📄 License

ISC

## 👥 Contributing

This is a school project for Campus Verse.

---

**Built with Express.js + MongoDB** | **For use with React Native Expo frontend**
