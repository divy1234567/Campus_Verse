# Campus Verse - Development Setup (Quick Start)

## ✅ Fixed Issues

1. **Asset errors** - Removed references to missing asset files
2. **BarCodeScanner** - Use Expo Go (it has built-in scanner support)

## 🚀 Run the App (Development)

### Step 1: Start Backend
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:5000

### Step 2: Start Expo
```bash
cd mobile
npm start
```

### Step 3: Run on Device

**Option A: Physical Device (Recommended)**
1. Install "Expo Go" app from Play Store/App Store
2. Scan the QR code shown in terminal
3. **IMPORTANT**: Update `config.js` with your computer's IP:
   ```javascript
   API_BASE_URL: 'http://YOUR_IP:5000'
   // Find IP: Run 'ipconfig' in CMD, look for IPv4
   ```

**Option B: Android Emulator**
- Press `a` in the Expo terminal
- No config change needed (localhost works)

## 📷 QR Scanner

The QR scanner will work in **Expo Go** without any build process! Expo Go has all the native modules (camera, notifications) built-in.

When you tap "Scan QR to Check In", it will:
1. Ask for camera permission
2. Open the scanner
3. Scan the QR code
4. Check you in to the event

## 🔔 Push Notifications

Push notifications also work in Expo Go during development!

## ⚠️ Common Issues

### "Cannot connect to backend"
- Make sure backend is running
- For physical device, use your computer's IP in `config.js`
- Example: `API_BASE_URL: 'http://192.168.1.100:5000'`

### "Network request failed"
- Check firewall isn't blocking port 5000
- Ensure phone and computer are on same WiFi network

## 🎯 Next Steps

1. Run backend: `cd backend && npm run dev`
2. Run mobile: `cd mobile && npm start`
3. Open in Expo Go
4. Sign up and test features!

## 📱 Building for Production (Later)

If you want to build a standalone app later, use EAS Build:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
```

But for development and testing, **Expo Go is perfect!** ✅
