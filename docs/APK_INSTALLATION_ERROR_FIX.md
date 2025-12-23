# Solidev Store Android - Installation Error Resolution

## Error: "App not installed as package appears to be invalid"

### Quick Fix (TRY THIS FIRST)

This error typically means the device has a cached or conflicting installation. Follow these steps:

#### Step 1: Complete Uninstall
```bash
adb uninstall com.solidev.store
adb shell pm clear com.solidev.store
```

#### Step 2: Clear System Caches
```bash
adb shell pm clear com.google.android.gms
adb shell pm clear com.android.packageinstaller
```

#### Step 3: Restart Device
- Unplug device
- Power off completely
- Wait 30 seconds
- Power on again
- Reconnect USB

#### Step 4: Install Fresh
```bash
adb install /Users/davinderpal/development/solidev-apps/solidev_store_android/app/build/outputs/apk/release/solidev-store.apk
```

#### Step 5: Verify
```bash
adb shell pm list packages | grep solidev
adb shell pm dump com.solidev.store | grep versionCode
```

---

## If Still Getting Error

### Diagnostic: Check Device Architecture Compatibility

```bash
# Check device ABI
adb shell getprop ro.product.cpu.abi
adb shell getprop ro.product.cpu.abilist

# Check SDK version
adb shell getprop ro.build.version.sdk

# Check if minSdk is compatible  (should be >= 24)
adb shell getprop ro.build.version.release
```

**Expected:**
- SDK version >= 24 (Android 5.0)
- ABI: armeabi-v7a or arm64-v8a or x86 or x86_64

### Diagnostic: Check Storage Space

```bash
# Check available space
adb shell df /data/app
adb shell df /system

# Check if we can write
adb shell touch /data/test.txt && adb shell rm /data/test.txt && echo "Storage writable"
```

**Expected:**
- At least 50 MB free in /data/app
- /system partition not full

### Diagnostic: Check Manifest Compatibility

```bash
# Dump manifest info
adb shell pm dump com.solidev.store

# Check compiled libs
adb shell ls -la /data/app/com.solidev.store*/lib/
```

### Diagnostic: View Installation Logs

```bash
# Clear logcat
adb logcat -c

# Try to install and watch logs
adb install solidev-store.apk &
adb logcat | grep -i "package\|install\|error\|solidev"

# Look for specific error patterns
adb logcat | grep -E "PackageManager|INSTALL_FAILED|VERIFICATION"
```

---

## Alternative Installation Methods

### Method 1: Side-Load Directly on Device

1. **Transfer APK to device:**
   ```bash
   adb push solidev-store.apk /sdcard/Download/
   ```

2. **On device:**
   - Open Settings → Apps → Special app access → Install unknown apps
   - Grant permission to your file manager
   - Navigate to: Internal Storage → Download → solidev-store.apk
   - Tap to install
   - Grant all permissions when prompted

3. **Verify installation:**
   ```bash
   adb shell pm list packages | grep solidev
   adb shell am start -n com.solidev.store/.MainActivity
   ```

### Method 2: Use Android Studio

1. Connect device via USB
2. Enable USB Debugging
3. Open Android Studio
4. Select: Run → Run app
5. Select your device
6. Click OK

### Method 3: Build Debug APK (No Signing Required)

```bash
cd solidev_store_android
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/solidev-store-debug.apk
```

---

## Advanced Troubleshooting

### If Installation Hangs

```bash
# Kill adb and restart
adb kill-server
adb start-server
adb devices

# Try again with timeout
adb install -l solidev-store.apk
```

### If Device Says "Unknown Provider"

```bash
# Check if your file manager has permission
adb shell pm grant com.android.documentsui android.permission.READ_EXTERNAL_STORAGE

# Or use built-in file manager
adb shell am start -a android.intent.action.GET_CONTENT \
  -t "application/vnd.android.package-archive"
```

### If Getting "Signature Error"

This shouldn't happen, but if it does:

```bash
# Verify APK signature
jarsigner -verify -verbose solidev-store.apk

# Expected output: "jar verified."

# If not verified, re-sign:
jarsigner -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore solidev-store-release.keystore \
  -storepass solidev@123 \
  -keypass solidev@123 \
  solidev-store.apk \
  solidev-store
```

### If Getting "Package Name Conflict"

```bash
# Uninstall ALL instances
adb uninstall com.solidev.store
adb shell pm list packages | grep solidev  # Should be empty

# Then try install again
```

---

## APK File Information

**Current Build:**
- File: `solidev-store.apk`
- Size: 18 MB
- Build: December 5, 2025
- Signature: ✅ Valid (SHA256withRSA, 2048-bit RSA)
- MinSDK: 24 (Android 5.0)
- TargetSDK: 34 (Android 14)

**Location:**
```
/Users/davinderpal/development/solidev-apps/solidev_store_android/app/build/outputs/apk/release/solidev-store.apk
```

---

## Device Requirements

| Requirement | Minimum | Current Config |
|---|---|---|
| Android Version | 5.0 (API 24) | ✅ Targets 14 |
| Device RAM | 2 GB | N/A |
| Free Storage | 100 MB | N/A |
| Architecture | ARM, ARM64, x86, x86_64 | ✅ All supported |
| ABI | armeabi-v7a, arm64-v8a | ✅ Included |

---

## If ALL Else Fails

### Nuclear Option: Complete Device Reset

1. **Backup data** (important!)
2. **Settings → System → Reset options → Erase all data**
3. **Turn device off and on**
4. **Reconnect to computer**
5. **Try fresh install**

### Or: Try on Different Device

If available, test on:
- Different physical device
- Android emulator
- AVD (Android Virtual Device) in Android Studio

---

## Collecting Diagnostics for Support

If you need help, collect:

```bash
# Device info
adb shell getprop > device_info.txt

# APK info  
unzip -l solidev-store.apk > apk_structure.txt

# Installation log
adb logcat > install_log.txt

# ADB install verbose
adb install -l -s solidev-store.apk > adb_install.txt 2>&1

# Send all files for analysis
```

---

## Success Indicators

When installation is successful, you should see:

```
Success
  package: com.solidev.store
  uid: 10XXX
```

And the app should appear in:
- Device app launcher
- Settings → Apps → Solidev Store
- Can be launched from terminal:
  ```bash
  adb shell am start -n com.solidev.store/.MainActivity
  ```

---

**Last Updated**: December 5, 2025  
**APK File**: solidev-store.apk (18 MB)  
**Package**: com.solidev.store  
**Signature Status**: ✅ Valid
