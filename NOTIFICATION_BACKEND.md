# 🔔 Notification Backend System - Complete Documentation

## Overview
The notification backend system stores notifications in the database and provides a complete API for managing in-app notifications. This replaces the Expo push notification system with a more reliable database-driven approach.

---

## 📦 Models

### Notification Model (`backend/models/Notification.js`)
```javascript
{
  userId: ObjectId (ref: User),
  title: String (required),
  body: String (required),
  type: String (enum: 'event_reminder', 'event_update', 'new_event', 'announcement', 'rsvp', 'attendance', 'general'),
  data: Object (additional data),
  read: Boolean (default: false),
  createdAt: Date
}
```

**Indexes:**
- `userId + read + createdAt` - For efficient queries
- `userId` - For user-specific queries

---

## 🛠️ Services

### Notification Service (`backend/services/notificationService.js`)

#### Functions:

1. **`createNotification(userId, title, body, type, data)`**
   - Creates a single notification for a user
   - Returns: `{ success: true, notification }`

2. **`createBulkNotifications(userIds, title, body, type, data)`**
   - Creates notifications for multiple users
   - Returns: `{ success: true, count }`

3. **`sendEventReminder(userId, event)`**
   - Creates an event reminder notification
   - Used when reminder time is reached

4. **`sendEventUpdate(userIds, event, updateType)`**
   - Sends notifications when event is updated
   - Update types: 'time_change', 'venue_change', 'cancelled', 'general'

5. **`sendNewEventNotification(userIds, event, clubName)`**
   - Notifies club followers about new events

6. **`sendAnnouncementNotification(userIds, announcement)`**
   - Sends announcement notifications to target audience

---

## 🛣️ API Routes

### Base Path: `/api/notifications`

All routes require authentication.

#### 1. Get All Notifications
```
GET /api/notifications
Query Parameters:
  - read: boolean (filter by read status)
  - type: string (filter by notification type)
  - limit: number (default: 50)

Response:
{
  success: true,
  data: { notifications: [...] }
}
```

#### 2. Get Unread Count
```
GET /api/notifications/unread/count

Response:
{
  success: true,
  data: { count: 5 }
}
```

#### 3. Mark Notification as Read
```
PUT /api/notifications/:notificationId/read

Response:
{
  success: true,
  data: { notification: {...} }
}
```

#### 4. Mark All as Read
```
PUT /api/notifications/read-all

Response:
{
  success: true,
  data: { updated: 10 }
}
```

#### 5. Delete Notification
```
DELETE /api/notifications/:notificationId

Response:
{
  success: true,
  message: 'Notification deleted'
}
```

#### 6. Delete All Read Notifications
```
DELETE /api/notifications/read/all

Response:
{
  success: true,
  data: { deleted: 5 }
}
```

---

## 🔗 Automatic Notifications

### 1. Event Creation
- **Trigger**: When admin creates an event associated with a club
- **Recipients**: All users following that club
- **Type**: `new_event`
- **Location**: `backend/routes/eventRoutes.js` (POST /api/events)

### 2. Event Updates
- **Trigger**: When event time or venue is changed
- **Recipients**: All users who RSVP'd to the event
- **Type**: `event_update`
- **Update Types**: `time_change`, `venue_change`
- **Location**: `backend/routes/eventRoutes.js` (PUT /api/events/:id)

### 3. Event Cancellation
- **Trigger**: When event is deleted
- **Recipients**: All users who RSVP'd to the event
- **Type**: `event_update` with `updateType: 'cancelled'`
- **Location**: `backend/routes/eventRoutes.js` (DELETE /api/events/:id)

### 4. RSVP Confirmation
- **Trigger**: When user RSVPs to an event
- **Recipients**: The user who RSVP'd
- **Type**: `rsvp`
- **Location**: `backend/routes/rsvpRoutes.js` (POST /api/rsvp/:eventId)

### 5. RSVP Cancellation
- **Trigger**: When user cancels RSVP
- **Recipients**: The user who cancelled
- **Type**: `rsvp` with `cancelled: true`
- **Location**: `backend/routes/rsvpRoutes.js` (DELETE /api/rsvp/:eventId)

### 6. Attendance Check-in
- **Trigger**: When user checks in via QR code
- **Recipients**: The user who checked in
- **Type**: `attendance`
- **Location**: `backend/routes/attendanceRoutes.js` (POST /api/attendance/checkin)

### 7. Announcements
- **Trigger**: When admin creates an announcement
- **Recipients**: Based on `targetAudience` (all, students, admins)
- **Type**: `announcement`
- **Location**: `backend/routes/announcementRoutes.js` (POST /api/announcements)

### 8. Event Reminders
- **Trigger**: When reminder time is reached (requires scheduled job)
- **Recipients**: User who set the reminder
- **Type**: `event_reminder`
- **Service**: `backend/services/reminderService.js` (processDueReminders)

---

## ⚙️ Integration Points

### Event Routes
- ✅ New event creation → Notify club followers
- ✅ Event update → Notify RSVP'd users
- ✅ Event deletion → Notify RSVP'd users

### RSVP Routes
- ✅ RSVP creation → Confirm notification
- ✅ RSVP cancellation → Cancellation notification

### Attendance Routes
- ✅ Check-in → Attendance confirmation notification

### Announcement Routes
- ✅ Announcement creation → Notify target audience

### Reminder Service
- ⚠️ Reminder processing → Requires scheduled job/cron
- **Note**: You can call `processDueReminders()` periodically or set up a cron job

---

## 📊 Notification Types

| Type | Description | Data Fields |
|------|-------------|-------------|
| `event_reminder` | Event reminder | `eventId` |
| `event_update` | Event was updated | `eventId`, `updateType` |
| `new_event` | New event from followed club | `eventId`, `clubName` |
| `announcement` | Campus announcement | `announcementId` |
| `rsvp` | RSVP confirmation/cancellation | `eventId`, `cancelled?` |
| `attendance` | Check-in confirmation | `eventId` |
| `general` | General notification | Custom |

---

## 🔄 Reminder Processing

To process due reminders, you can:

1. **Manual Call** (for testing):
   ```javascript
   const { processDueReminders } = require('./services/reminderService');
   await processDueReminders();
   ```

2. **Scheduled Job** (recommended):
   - Use `node-cron` or similar
   - Run every minute: `*/1 * * * *`
   - Or use a cloud scheduler (AWS EventBridge, etc.)

3. **Add to server.js**:
   ```javascript
   const cron = require('node-cron');
   const { processDueReminders } = require('./services/reminderService');
   
   // Run every minute
   cron.schedule('*/1 * * * *', async () => {
     await processDueReminders();
   });
   ```

---

## ✅ Testing

### Test Notification Creation
```bash
# Create a notification manually
POST /api/notifications
{
  "userId": "user_id_here",
  "title": "Test Notification",
  "body": "This is a test",
  "type": "general"
}
```

### Test Getting Notifications
```bash
# Get all notifications
GET /api/notifications
Authorization: Bearer <token>

# Get unread count
GET /api/notifications/unread/count
Authorization: Bearer <token>
```

### Test Marking as Read
```bash
# Mark single as read
PUT /api/notifications/:id/read
Authorization: Bearer <token>

# Mark all as read
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

---

## 🎯 Features

✅ **Complete CRUD operations** for notifications  
✅ **Automatic notifications** for events, RSVPs, attendance  
✅ **Bulk notification support** for multiple users  
✅ **Read/unread tracking**  
✅ **Filtering and pagination**  
✅ **Type-based categorization**  
✅ **User-specific queries**  
✅ **Efficient database indexes**  

---

## 📝 Notes

- All notifications are stored in MongoDB
- Notifications are automatically created when relevant actions occur
- Users can view, mark as read, and delete notifications
- The system is fully integrated with events, RSVPs, attendance, and announcements
- Reminder processing requires a scheduled job (not automatically running)

---

**The notification backend is now fully functional and integrated!** 🎉

