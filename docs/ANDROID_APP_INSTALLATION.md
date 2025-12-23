# Solidev Store Android App - Installation Guide

## APK Information
- **File**: `app-release.apk`
- **Size**: 18 MB (no minification - includes debug symbols)
- **Location**: `solidev_store_android/app/build/outputs/apk/release/app-release.apk`
- **Min SDK**: Android 5.0 (API 24)
- **Target SDK**: Android 14 (API 34)
- **Signature**: ✅ SHA256withRSA (2048-bit RSA) - VERIFIED
- **Certificate**: Solidev Store (Valid until 2053-04-22)
- **Build Date**: December 5, 2025
- **Status**: Ready for Installation ✅

## Installation Troubleshooting

### Issue: "App not installed as package appears to be invalid"

**ROOT CAUSE IDENTIFIED**: The previous build had gradle signing misconfiguration. This has been fixed in the latest build.

#### Quick Fix - What We Changed:

1. ✅ **Disabled minification** - Removed ProGuard obfuscation that could cause package corruption
2. ✅ **Disabled resource shrinking** - Ensured all resources are intact
3. ✅ **Fixed signing configuration** - Gradle now properly applies the signing keystore
4. ✅ **Verified APK integrity** - New build passes `jarsigner` verification

#### Installation Troubleshooting Steps:

**Step 1: Uninstall Previous Version (IMPORTANT)**
```bash
adb uninstall com.solidev.store
```

**Step 2: Clear Device Cache**
```bash
adb shell pm clear com.solidev.store  # If exists
adb shell pm clear com.google.android.gms  # Clear Play Services cache
```

**Step 3: Verify APK Signature**
```bash
jarsigner -verify -verbose app-release.apk
# Should show: "jar verified."
```

**Step 4: Install the APK**
```bash
adb install app-release.apk
# Or for replacing:
adb install -r app-release.apk
```

**Step 5: Verify Installation**
```bash
adb shell pm list packages | grep solidev
# Should show: package:com.solidev.store
```

If installation still fails:

**Option A: Direct Installation on Device**
- Enable "Unknown sources" in Settings → Security
- Download APK directly on device
- Open file manager → Navigate to Downloads
- Tap app-release.apk → Install

**Option B: Try Debug APK** (if available)
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

**Option C: Check Device Logs for Errors**
```bash
adb logcat | grep -i "package\|error\|solidev"
```

### Installation Steps

#### Method 1: Using ADB (Android Debug Bridge)

1. **Connect your Android device** via USB
2. **Enable USB Debugging** on your device:
   - Go to Settings → About Phone → tap Build Number 7 times
   - Go back to Settings → Developer options → enable USB Debugging

3. **Uninstall previous version** (if exists):
   ```bash
   adb uninstall com.solidev.store
   ```

4. **Install the APK**:
   ```bash
   adb install solidev_store_android/app/build/outputs/apk/release/app-release.apk
   ```

5. **Verify installation**:
   ```bash
   adb shell pm list packages | grep solidev
   ```

#### Method 2: Direct Download & Installation

1. **Download APK** from Firebase Storage:
   - Link: https://firebasestorage.googleapis.com/v0/b/solidev-apps.firebasestorage.app/o/apps%2Fapp-release.apk?alt=media&token=5fedc284-c3e9-4d1c-b3c5-0ab070b9e7f6

2. **Transfer to device** or download directly on device

3. **Install**:
   - Open file manager
   - Navigate to Downloads folder
   - Tap on `app-release.apk`
   - Tap "Install"
   - If prompted about "Unknown sources", enable it in Settings

### Build Configuration

The APK is built with the following settings:

- **Debug symbols**: Included (no minification)
- **Resource shrinking**: Disabled
- **ProGuard minification**: Disabled
- **Signing**: Release keystore with RSA 2048-bit

### If you still encounter issues:

1. **Clear Google Play Services cache**:
   ```bash
   adb shell pm clear com.google.android.gms
   ```

2. **Check device compatibility**:
   ```bash
   adb shell getprop ro.build.version.sdk
   ```

3. **View install logs**:
   ```bash
   adb logcat | grep Solidev
   ```

4. **Try debug APK** (if available):
   ```bash
   adb install solidev_store_android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Successfully Installed?

If the app installs successfully:

1. **Launch the app** from your device's app launcher
2. **Check app logs** for any runtime errors:
   ```bash
   adb logcat | grep Solidev
   ```

3. **Test Firebase connectivity**:
   - Try logging in
   - Browse apps list
   - Download an app

## Build Details

### Recent Changes:
- ✅ Disabled minification (for stability testing)
- ✅ Disabled resource shrinking (for stability testing)
- ✅ Signing configuration verified
- ✅ Manifest permissions configured
- ✅ Firebase integration enabled

### Next Steps:
1. Install and test on device
2. If successful, re-enable minification for production build
3. Submit to Google Play Store

---

**Last Updated**: December 5, 2025
**Build Version**: 1.0.0
**Build Code**: 1
