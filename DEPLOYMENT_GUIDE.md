# 🌸 Study Bloom - Google Play Store Deployment Guide

## Complete Step-by-Step Instructions

### Phase 1: Google Play Console Setup (30 minutes)

#### Step 1: Create Developer Account
1. Go to **[Google Play Console](https://play.google.com/console)**
2. Sign in with your Google account (use AdvikaGoel@gmail.com)
3. Accept terms and conditions
4. **Pay $25 one-time registration fee**
5. Complete your merchant account setup

#### Step 2: Create New App
1. Click **"Create app"**
2. Fill in details:
   - **App name:** Study Bloom
   - **Default language:** English
   - **App type:** Application
   - **Category:** Education
   - **Free or paid:** Free

#### Step 3: Fill App Listing (Details Tab)
1. **Short description (50 chars):**
   ```
   Making Study Easy
   ```

2. **Full description (4000 chars max):**
   ```
   Study Bloom is your personal study companion designed to make learning easy and enjoyable.

   Features:
   📚 Create and manage study notes
   🎯 Track your study progress
   ✨ Beautiful, intuitive interface
   📱 Works offline
   🔄 Sync across devices
   
   Perfect for students of all levels. Whether you're preparing for exams or just want to organize your learning, Study Bloom helps you achieve your academic goals.

   Start studying smarter today with Study Bloom! 🌸
   ```

3. **Screenshots (at least 2):**
   - Use browser screenshots of the app
   - Recommended size: 1080 x 1920 pixels
   - Add text overlays showing key features

4. **Feature Graphic (1024 x 500):**
   - Create a beautiful banner showing app's main features

5. **Icon (512 x 512):**
   - Create a colorful app icon with 📚 or 🌸 theme
   - Can use: https://www.favicon-generator.org/

6. **Privacy Policy:** 
   - Create one at: https://www.privacypolicygenerator.info/
   - Upload/link it

### Phase 2: Build Signed APK (45 minutes)

#### Step 1: Install Required Tools
```bash
# Install Node.js from nodejs.org
# Then open terminal/command prompt and run:

npm install -g cordova
```

#### Step 2: Create Cordova Project
```bash
cordova create StudyBloomApp com.advikagoel.studybloom StudyBloom
cd StudyBloomApp
cordova platform add android@latest
```

#### Step 3: Add Your Files
```bash
# Replace the www folder contents with your files:
# Copy index.html, style.css, script.js, manifest.json, service-worker.js
# into StudyBloomApp/www/
```

#### Step 4: Update config.xml
Edit `config.xml` in the project and update version:
```xml
<widget id="com.advikagoel.studybloom" version="1.0.0" versionCode="1">
```

#### Step 5: Build APK
```bash
cordova build android --release
```

#### Step 6: Create Keystore (Sign APK)
```bash
# In the android project folder:
keytool -genkey -v -keystore study-bloom.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias studybloom
```

When prompted:
- Keystore password: **Create a strong password** (save it!)
- First name: Advika
- Last name: Goel
- Organization: StudyBloom
- City: Your City
- Country Code: IN

#### Step 7: Sign the APK
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore study-bloom.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk studybloom
```

#### Step 8: Optimize with zipalign
```bash
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk StudyBloom.apk
```

**Result:** `StudyBloom.apk` is ready! 🎉

### Phase 3: Upload to Google Play (15 minutes)

#### Step 1: Upload Release APK
1. Go to Google Play Console → Your App → Release → Production
2. Click **"Create new release"**
3. Upload `StudyBloom.apk`
4. Add release notes:
   ```
   🌸 Study Bloom v1.0 - Launch Release
   
   ✨ Features:
   📚 Create and manage study notes
   🎯 Track your study progress
   📱 Offline support
   
   We're excited to launch Study Bloom to help students study smarter!
   ```

#### Step 2: Fill Content Rating
1. Go to **Content rating** section
2. Complete the questionnaire (~10 minutes)
3. Submit for rating

#### Step 3: Set Pricing & Distribution
1. Go to **Pricing & distribution**
2. Select countries where you want to distribute
3. Keep as "Free"

#### Step 4: Review & Submit
1. Review all information
2. Click **"Review release"**
3. Verify everything is correct
4. Click **"Start rollout to Production"**
5. Choose rollout percentage (start with 5-10%, then increase to 100%)

### Phase 4: Monitoring & Updates

#### After Launch
- Monitor crash reports in Play Console
- Check user ratings and reviews
- Update based on feedback
- Release updates when needed

#### Update Process
```bash
# Make changes to your files
# Update version in config.xml
cordova build android --release
# Sign APK with same keystore
# Upload new APK to Play Console
# Increment version code
```

---

## Troubleshooting

### APK Build Issues
```bash
# Clear and rebuild
cordova clean
cordova platform remove android
cordova platform add android
cordova build android --release
```

### Signing Issues
- Keystore password wrong? Create new keystore
- APK not signing? Check Java/Android SDK installed
- Use Android Studio's built-in signing tool if issues persist

### Upload Fails
- APK too large? Use ProGuard to reduce size
- Wrong signature? Re-sign with same keystore
- Version code already exists? Increment in config.xml

---

## Timeline Expectations

| Phase | Duration | Notes |
|-------|----------|-------|
| Setup & Account | 30 min | One-time $25 fee |
| Building APK | 45 min | First time, faster after |
| Uploading & Listing | 15 min | Fill all store listing details |
| **Review & Approval** | **24-48 hours** | Google Play review |
| **LIVE ON STORE** | **~2 days** | ✅ Available for download! |

---

## Success Checklist

- [ ] Google Play Developer account created ($25 paid)
- [ ] App name: "Study Bloom"
- [ ] Category: Education
- [ ] Pricing: Free
- [ ] Screenshots uploaded (minimum 2)
- [ ] App icon (512x512) uploaded
- [ ] Privacy policy added
- [ ] APK signed with keystore
- [ ] Version code incremented
- [ ] Release notes written
- [ ] Content rating submitted
- [ ] Pricing & distribution configured
- [ ] Release submitted to production
- [ ] Waiting for approval ⏳

---

## After Launch

Your app will be available at:
```
https://play.google.com/store/apps/details?id=com.advikagoel.studybloom
```

Share this link with users! 🌸

---

## Support Links

- **Google Play Console:** https://play.google.com/console
- **Cordova Docs:** https://cordova.apache.org/
- **Android Development:** https://developer.android.com/
- **Privacy Policy Generator:** https://www.privacypolicygenerator.info/

---

**Questions? Issues? Check the docs or Google Play Console help!** 🎉
