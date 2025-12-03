# Campus Verse Mobile App

This is the React Native mobile application for Campus Verse, built with Expo SDK 54.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed
- Expo Go app on your physical device (Android/iOS)
- Backend server running

### 2. Configuration
**IMPORTANT:** Before running on a physical device, you must update the API URL.

1. Open `config.js`
2. Find your computer's local IP address:
   - Windows: Run `ipconfig` in terminal
   - Mac/Linux: Run `ifconfig` in terminal
3. Update `API_BASE_URL` in `config.js`:
   ```javascript
   API_BASE_URL: 'http://YOUR_IP_ADDRESS:5000'
   // Example: 'http://192.168.1.105:5000'
   ```

### 3. Installation
```bash
npm install
```

### 4. Running the App
```bash
npx expo start
```
- Scan the QR code with the **Expo Go** app on your phone.
- Press `a` to run on Android Emulator.
- Press `i` to run on iOS Simulator (Mac only).

## 📱 Features

- **Authentication**: Sign Up, Sign In (Student/Admin)
- **Events**: Browse, Search, Filter, RSVP
- **Clubs**: Explore clubs, Follow/Unfollow
- **Profile**: View stats, Attendance history, RSVP list
- **QR Scanner**: Check-in to events using camera
- **Push Notifications**: Get updates for followed clubs and RSVPs

## 🛠️ Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **Networking**: Axios
- **UI Components**: Custom components with standard React Native views
- **Icons**: Ionicons (@expo/vector-icons)

## ⚠️ Troubleshooting

**"Network request failed"**
- Ensure your phone and computer are on the **same WiFi network**.
- Check if your firewall is blocking port 5000.
- Verify the IP address in `config.js` is correct.

**"Camera permission denied"**
- Go to your phone settings -> Apps -> Expo Go -> Permissions -> Enable Camera.
