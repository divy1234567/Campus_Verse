# 🎓 Campus Verse

> A comprehensive full-stack mobile application for managing campus events, clubs, RSVPs, QR-based attendance, and push notifications.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-green)
![Backend](https://img.shields.io/badge/Backend-Express.js-blue)
![Frontend](https://img.shields.io/badge/Frontend-React_Native-purple)
![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen)

## ✨ Features

### 📅 Events Management
- Browse upcoming campus events
- Create, edit, and delete events (Admin)
- Search and filter by tags, clubs, dates
- RSVP system with real-time counts
- QR code generation for each event

### 🏛️ Clubs Directory
- Discover campus clubs by category
- Follow/unfollow clubs
- View club events and details
- 6 categories: Academic, Sports, Cultural, Technical, Social, Other

### 🎫 RSVP System
- One-tap RSVP to events
- Cancel RSVPs anytime
- View RSVP history
- See who's attending

### 📷 QR-Based Attendance
- Automated QR code generation
- Mobile QR scanner for check-ins
- Attendance tracking and history
- Admin attendance reports

### 🔔 Push Notifications
- Event reminders
- New event alerts (for followed clubs)
- Event update notifications
- Cancellation notices

### 👥 User Roles
- **Students**: Browse, RSVP, check-in, follow clubs
- **Admins**: All student features + create/manage events and clubs

## 🏗️ Architecture

```
┌─────────────────┐
│  React Native   │ ←→ Push Notifications (Expo)
│   Expo App      │
└────────┬────────┘
         │
         │ REST API
         │
┌────────▼────────┐
│   Express.js    │
│     Backend     │
└────────┬────────┘
         │
         │ Mongoose ODM
         │
┌────────▼────────┐
│    MongoDB      │
│    Database     │
└─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd Campus_Connect
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set your MongoDB URI and JWT secret
npm run dev
```

Backend runs on **http://localhost:5000**

### 3. Mobile App Setup
```bash
cd mobile
npm install
# Edit config.js and set API_BASE_URL (use your IP for physical device)
npm start
```

Scan QR code with Expo Go app!

## 📁 Project Structure

```
Campus_Connect/
├── backend/              # Express.js + MongoDB
│   ├── models/          # 5 Mongoose models
│   ├── routes/          # 5 API route files
│   ├── middleware/      # JWT authentication
│   ├── services/        # Push notifications
│   └── server.js        # Main server
│
├── mobile/              # React Native Expo
│   ├── screens/        # 8 app screens
│   ├── services/       # 7 API services
│   ├── context/        # Auth context
│   ├── navigation/     # Tab & stack navigation
│   └── components/     # Reusable components
│
└── docs/               # Documentation
    ├── COMPLETE_GUIDE.md
    ├── BACKEND_DOCUMENTATION.md
    └── BACKEND_CONTEXT.md
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **QR Codes**: qrcode library
- **Notifications**: Expo Server SDK

### Frontend
- **Framework**: React Native
- **Platform**: Expo
- **Navigation**: React Navigation (Stack & Tabs)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **QR Scanner**: Expo Barcode Scanner
- **Notifications**: Expo Notifications

## 📱 Screenshots

### Mobile App Screens
- 🔐 **Authentication**: Modern sign in/sign  up
- 📅 **Events List**: Card-based with search & filters
- 📝 **Event Detail**: Full info with RSVP button
- 🏛️ **Clubs**: Directory with follow/unfollow
- 👤 **Profile**: RSVPs and attendance history
- 📷 **QR Scanner**: For event check-ins
- 🔳 **QR Display**: Admin view for event QR

## 📊 API Endpoints

### Core Features
- **Authentication**: 4 endpoints (signup, signin, token, user)
- **Events**: 7 endpoints (CRUD, QR, filters)
- **Clubs**: 8 endpoints (CRUD, follow/unfollow)
- **RSVP**: 6 endpoints (create, cancel, status, counts)
- **Attendance**: 5 endpoints (check-in, history, lists)

**Total**: 35+ endpoints

See `BACKEND_DOCUMENTATION.md` for complete API reference.

## 🎨 Design System

### Modern & Vibrant UI
- **Primary Color**: `#6C63FF` (Purple Blue)
- **Secondary Color**: `#FF6584` (Pink)
- **Accent Color**: `#4ECDC4` (Teal)
- **Card-based layout** with smooth animations
- **Glassmorphism effects**
- **Responsive design**

## 🔐 Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token authentication (30-day expiration)
- ✅ Role-based access control
- ✅ Protected API endpoints
- ✅ Input validation
- ✅ Secure token storage

## 📚 Documentation

1. **[COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md)** - Full project guide
2. **[BACKEND_DOCUMENTATION.md](./backend/BACKEND_DOCUMENTATION.md)** - Complete API docs
3. **[BACKEND_CONTEXT.md](./BACKEND_CONTEXT.md)** - Frontend integration guide
4. **[backend/README.md](./backend/README.md)** - Backend setup
5. **[mobile/README.md](./mobile/README.md)** - Mobile app setup

## 🧪 Testing

### Test Backend API
Use Postman or similar:

1. Create admin account
2. Create club
3. Create event (QR auto-generated)
4. Test RSVP endpoints
5. Test attendance check-in

### Test Mobile App
1. Sign up as student
2. Browse events and clubs
3. RSVP to an event
4. Scan QR code (need admin QR)
5. Check profile for RSVPs/attendance

## 🚀 Deployment

### Backend
- Deploy to Railway, Render, or Heroku
- Use MongoDB Atlas for database
- Set environment variables

### Mobile App
```bash
# Using EAS Build
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## 🎯 Use Cases

### Student Experience
1. Sign up → Browse events → RSVP
2. Get notifications for new events from followed clubs
3. On event day → Scan QR to check in
4. View attendance history in profile

### Admin Experience
1. Create events → QR automatically generated
2. Create/manage clubs
3. View attendance reports
4. Send updates (auto-notifies attendees)

## 📈 Project Stats

- **Backend Files**: 15+
- **Frontend Files**: 25+
- **Total Lines of Code**: 5000+
- **API Endpoints**: 35+
- **Screens**: 8
- **Features**: 5 major systems

## 🤝 Contributing

This is a school project. Suggestions and improvements welcome!

## 📄 License

MIT License

## 🎓 About

**Project**: Campus Verse  
**Purpose**: School Project  
**Type**: Full-Stack Mobile Application  
**Year**: 2024

### Features Implemented
✅ User Authentication (Student/Admin)  
✅ Events Management (CRUD)  
✅ Clubs Directory with Follow System  
✅ RSVP System  
✅ QR-Based Attendance  
✅ Push Notifications  
✅ Role-Based Access Control  
✅ Modern UI/UX  

## 🙋 FAQ

**Q: Can I use this for my campus?**  
A: Yes! Just deploy the backend and mobile app, and customize as needed.

**Q: How do I get started?**  
A: Follow the Quick Start section above and refer to COMPLETE_GUIDE.md

**Q: Do I need a Mac for iOS?**  
A: For testing with Expo Go, no. For building standalone iOS apps, yes.

**Q: Is this production-ready?**  
A: This is a school project. For production, add email verification, rate limiting, and more robust error handling.

## 📞 Support

For help:
1. Check `COMPLETE_GUIDE.md` for detailed instructions
2. See `BACKEND_DOCUMENTATION.md` for API reference
3. Review `mobile/README.md` for mobile app troubleshooting

---

**Built with ❤️ for Campus Event Management**

🎓 **Campus Verse** - Where Campus Events Come to Life!
