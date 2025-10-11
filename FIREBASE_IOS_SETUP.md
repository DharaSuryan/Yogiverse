# Firebase iOS Setup Guide for Yogiverse

## ✅ Completed Steps

### 1. Dependencies Installed
- ✅ Added Firebase pods to `ios/Podfile`
- ✅ Installed `@react-native-firebase/app` and `@react-native-firebase/messaging`
- ✅ Updated `AppDelegate.mm` with Firebase initialization
- ✅ Updated `Info.plist` with background modes
- ✅ Created `GoogleService-Info.plist` template

### 2. Code Updates
- ✅ Updated `Firebase.ts` to work with both platforms
- ✅ Added proper Firebase messaging setup

## 🔧 Manual Steps Required

### 1. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project (or create a new one)
3. Click "Add app" and select iOS
4. Enter your iOS bundle ID: `com.yogiverse.app` (or your actual bundle ID)
5. Download the `GoogleService-Info.plist` file
6. Replace the template file in `ios/Yogiverse/GoogleService-Info.plist` with the downloaded file

### 2. iOS Project Configuration
1. Open `ios/Yogiverse.xcworkspace` in Xcode
2. Drag and drop the `GoogleService-Info.plist` file into the Xcode project
3. Make sure "Copy items if needed" is checked
4. Ensure the file is added to the target

### 3. Install iOS Dependencies
```bash
cd ios
pod install
cd ..
```

### 4. Update Bundle Identifier (if needed)
If your bundle ID is different from `com.yogiverse.app`, update it in:
- Xcode project settings
- `GoogleService-Info.plist`
- Firebase Console

## 🧪 Testing

### 1. Run the iOS App
```bash
npx react-native run-ios
```

### 2. Check Firebase Connection
- Look for Firebase initialization logs in the console
- Check if FCM token is generated
- Test push notifications from Firebase Console

### 3. Debug Common Issues
- Ensure `GoogleService-Info.plist` is properly added to Xcode project
- Check bundle ID matches between Xcode and Firebase
- Verify all pods are installed correctly

## 📱 Push Notification Testing

### 1. Send Test Notification
1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter notification title and text
4. Select your iOS app
5. Send the message

### 2. Check Notification Handling
- Foreground: Should trigger `onMessage` handler
- Background: Should trigger `setBackgroundMessageHandler`
- App closed: Should show notification and handle tap

## 🔍 Troubleshooting

### Common Issues:
1. **Firebase not initialized**: Check `GoogleService-Info.plist` is in the right location
2. **No FCM token**: Ensure proper permissions are granted
3. **Notifications not received**: Check background modes in `Info.plist`
4. **Build errors**: Run `pod install` and clean build folder

### Debug Commands:
```bash
# Clean and rebuild
cd ios && pod install && cd ..
npx react-native run-ios --reset-cache

# Check Firebase logs
# Look for "Firebase initialized" in console
```

## 📋 Final Checklist

- [ ] Replace `GoogleService-Info.plist` with actual Firebase config
- [ ] Add `GoogleService-Info.plist` to Xcode project
- [ ] Run `pod install`
- [ ] Test app builds and runs
- [ ] Test push notifications work
- [ ] Verify FCM token generation
- [ ] Test background/foreground notification handling

## 🚀 Next Steps

Once setup is complete:
1. Test push notifications from Firebase Console
2. Implement server-side notification sending
3. Add notification handling for different notification types
4. Test on physical device (push notifications don't work on simulator)

---

**Note**: Make sure to replace the template `GoogleService-Info.plist` with your actual Firebase configuration file from the Firebase Console.












