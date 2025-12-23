# Solidev Apps - Progressive Web App Store Platform

> **⚠️ PORTFOLIO SHOWCASE REPOSITORY**  
> This repository contains **sanitized code** with production credentials removed. This is intended for demonstration and portfolio purposes.

## 📋 Project Overview

Solidev Apps is a Progressive Web App (PWA) that serves as a mobile application marketplace. This project demonstrates modern web development practices, cloud integration, and mobile-first design principles.

### **What This Project Demonstrates**

- 🎯 **Enterprise Angular Architecture** - Scalable Angular 19+ application with modular design
- 📱 **Progressive Web App** - Installable, offline-capable web application
- 🔥 **Firebase Integration** - Authentication, Firestore database, and Analytics
- ☁️ **Azure Cloud Services** - Email communication via Azure Communication Services
- 🔐 **Authentication & Authorization** - Role-based access control (User/Admin)
- 🚀 **Production-Ready Code** - TypeScript, best practices, comprehensive testing
- 📦 **Android Companion App** - Capacitor-based mobile wrapper

### **Tech Stack**

- **Frontend:** Angular 19, Material Design, Bootstrap 5, RxJS
- **Backend:** Firebase (Firestore, Auth, Analytics)
- **Email:** Azure Communication Services
- **Mobile:** Android (Capacitor wrapper)
- **PWA:** Service Workers, Offline Support, Installable

---

## ⚠️ Important: Configuration Required

This repository does **NOT** include production credentials. To run locally, you must:

1. ✅ Create your own Firebase project
2. ✅ Configure environment variables (see `.env.example`)
3. ✅ Set up Azure Communication Services (optional, for email)
4. ✅ Update configuration files with your credentials

**Files requiring configuration:**
- `src/app/firebase.config.ts` (or set values in root `.env`)
- `src/app/config/azure-email.config.ts` (if using email features)
- `src/app/guards/admin.guard.ts` (set `ADMIN_EMAIL` in `.env`)
- `src/scripts/.env` (copy from `src/scripts/.env.example` for population scripts)
- `solidev_store_android/app/google-services.json` (Android Firebase config — add your own; template provided)

For details on sanitization, pre-release checks, and verification steps see the security folder: `docs/security/` (Sanitization Guide, Pre-Release Checklist, Final Report).

📖 **[Complete Setup Guide](#-getting-started)**

---

## 📖 Documentation

**Detailed documentation is available in the [`docs/`](./docs/) folder:**

📚 **[View Complete Documentation Index →](./docs/README.md)**

- Android app build and installation guides (`docs/`)
- Feature & implementation details (`docs/implementation/`)
- Azure and Firebase setup instructions (`docs/`)
- PWA implementation details and testing (`docs/`)
- Security & pre-release materials (`docs/security/`) — Sanitization Guide, Pre-Release Checklist, Final Report
- Internal maintainer notes (`docs/internal/`) — marked INTERNAL and not intended for public audiences

> Note: Root-level `.md` files (except `README.md`) were moved into `docs/` for better organization. Internal documents are in `docs/internal/` and security/audit artifacts are in `docs/security/`.

---

## ✨ Features

### **Core Functionality**
- 📱 App browsing and discovery
- 🔍 Advanced search and filtering
- ⭐ User reviews and ratings
- 👤 User authentication (Email/Google)
- 📧 Contact form with email automation
- 🔐 Admin dashboard for content management

### **Progressive Web App**
- ✨ Installable on mobile and desktop devices
- 🔄 Offline support via service workers
- 📱 Mobile-first responsive design
- 🚀 Fast loading with intelligent caching
- 🔔 Custom install prompts  

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ and npm
- Angular CLI: `npm install -g @angular/cli`
- Firebase account (required)
- Azure account (optional, for email functionality)

### **Installation Steps**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solidev-apps
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database
   - Copy your Firebase configuration

4. **Configure environment variables**

   Copy the example file:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your credentials:
   - Firebase configuration (required)
   - Azure Communication Services (optional)
   - Admin email address

5. **Update configuration files**

   Replace placeholder values in:
   - `src/app/firebase.config.ts` - Your Firebase config
   - `src/app/config/azure-email.config.ts` - Your Azure config (if using email)
   - `src/app/guards/admin.guard.ts` - Your admin email
   - `src/app/header/header.component.ts` - Your admin email

   > 🔒 **Security:** Never commit real credentials to version control!

6. **Populate sample data (optional)**
   ```bash
   cd src/scripts
   npm install
   npm run populate-categories
   npm run populate-featured-apps
   ```

### **Running the Application**

**Development server:**
```bash
npm start
# or
ng serve
```
Navigate to `http://localhost:4200/`

**Production build with PWA features:**
```bash
npm run build:prod
npm run serve:pwa
```

**Running tests:**
```bash
npm test
```

---

## 🔥 Firebase Configuration

### **Required Setup:**

1. Create Firebase project
2. Enable Authentication providers:
   - Email/Password
   - Google Sign-In
3. Create Firestore database with these collections:
   - `apps` - Application listings
   - `categories` - App categories
   - `reviews` - User reviews
   - `users` - User profiles

### **Update firebase.config.ts:**

```typescript
export const firebaseConfig = {
  apiKey: process.env['FIREBASE_API_KEY'] || "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "G-XXXXXXXXXX"
};
```

📖 More details: See `.env.example` for all required variables

---

## ☁️ Azure Email Setup (Optional)

For contact form functionality, configure Azure Communication Services:

1. Create Azure Communication Services resource
2. Set up Email Communication Service
3. Verify domain or use Azure's free subdomain
4. Copy connection string
5. Update `src/app/config/azure-email.config.ts`

📖 Detailed guide: [docs/AZURE_EMAIL_SETUP.md](docs/AZURE_EMAIL_SETUP.md)

---

## 📱 Development & Testing

### **Development Server**

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## PWA Development & Testing

### Building and Serving the PWA Locally

To test the PWA functionality locally with service workers enabled:

```bash
# Build the production version (required for service worker)
npm run build:prod

# Serve the PWA locally on port 4200
npm run serve:pwa
```

**Note**: Service workers only work in production builds. The development server (`ng serve`) does not include service worker functionality.

### PWA Features Testing

1. **Install Prompt**: 
   - Open Chrome Developer Tools → Application → Manifest
   - Check "Install app" functionality
   - Test the custom install banner

2. **Offline Support**:
   - Build and serve the app
   - Visit the app, then go offline
   - Navigate through cached pages

3. **Service Worker**:
   - Check Application → Service Workers in DevTools
   - Verify caching strategies are working

### PWA Configuration Files

- `public/manifest.webmanifest` - App manifest with metadata and icons
- `ngsw-config.json` - Service worker configuration
- `src/app/services/pwa-prompt.service.ts` - Install prompt logic
- `src/app/components/install-prompt/` - Custom install UI component

### **Code Scaffolding**

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

---

## 📦 Build & Production

### **Build Commands**

```bash
# Development build
ng build

# Production build (required for PWA features)
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

### **Deployment Targets**

This app can be deployed to:
- Azure Static Web Apps (configuration included)
- Firebase Hosting
- Netlify
- Any static hosting provider supporting SPA routing

---

## 🧪 Testing

### **Unit Tests**

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### **PWA-Specific Tests**

The project includes comprehensive tests for PWA functionality:

- `src/app/services/pwa-prompt.service.spec.ts` - PWA service tests
- `src/app/components/install-prompt/install-prompt.component.spec.ts` - Install prompt component tests
- `e2e/pwa.spec.ts` - End-to-end PWA tests

---

## 📱 Progressive Web App Features

### **PWA Testing Checklist**

1. **Install Prompt**: 
   - Open Chrome Developer Tools → Application → Manifest
   - Check "Install app" functionality
   - Test the custom install banner

2. **Offline Support**:
   - Build and serve the app
   - Visit the app, then go offline
   - Navigate through cached pages

3. **Service Worker**:
   - Check Application → Service Workers in DevTools
   - Verify caching strategies are working

### **PWA Configuration Files**

- `public/manifest.webmanifest` - App manifest with metadata and icons
- `ngsw-config.json` - Service worker configuration
- `src/app/services/pwa-prompt.service.ts` - Install prompt logic
- `src/app/components/install-prompt/` - Custom install UI component

### **Lighthouse PWA Audit**

To verify PWA compliance:

1. Build and serve the production app: `npm run build:prod && npm run serve:pwa`
2. Open Chrome DevTools → Lighthouse
3. Run PWA audit
4. Target: Score ≥ 90

---

## 🤖 Android App

A companion Android app is available in the `solidev_store_android/` directory.

### **Build Commands:**

```bash
cd solidev_store_android

# Build debug APK
./gradlew assembleDebug

# Install on connected device
./gradlew installDebug

# Run on device
./gradlew installDebug && adb shell am start -n com.solidev.store/.MainActivity
```

### **Configuration:**

Update `solidev_store_android/app/google-services.json` with your Firebase Android configuration.

📖 Complete guide: [docs/ANDROID_APK_BUILD_SUMMARY.md](docs/ANDROID_APK_BUILD_SUMMARY.md)

---

## 🔐 Authentication & Authorization

### **User Roles:**

- **Regular Users:** Browse apps, leave reviews, manage profile
- **Admin Users:** All user features + Developer Dashboard access

### **Admin Configuration:**

Admin access is controlled by email address. Update in:
- `src/app/guards/admin.guard.ts` - `ADMIN_EMAIL` constant
- `src/app/header/header.component.ts` - `ADMIN_EMAIL` constant

---

## 📁 Project Structure

```
solidev-apps/
├── src/
│   ├── app/
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # Business logic & API services
│   │   ├── guards/             # Route guards (auth, admin)
│   │   ├── config/             # Configuration files
│   │   ├── [feature-modules]/  # Feature-based modules
│   │   └── firebase.config.ts  # Firebase configuration
│   ├── assets/                 # Static assets
│   └── scripts/                # Database population scripts
├── solidev_store_android/      # Android app wrapper
├── docs/                       # Detailed documentation
├── public/                     # PWA assets
├── .env.example                # Environment variables template
└── angular.json                # Angular configuration
```

---

## Browser Support

### **Installation Support**
- ✅ **Chrome/Edge (Android/Desktop)** - Full install prompt support
- ✅ **Samsung Internet** - Full install prompt support
- ⚠️ **iOS Safari** - Manual installation instructions provided
- ⚠️ **Firefox** - Limited PWA support

### **Service Worker Support**
- ✅ All modern browsers support service workers
- ✅ Offline functionality works across all supported browsers

---

## 🚀 Deployment

### **Azure Static Web Apps**

The app is configured for Azure Static Web Apps deployment with `staticwebapp.config.json`.

### **Other Hosting Platforms**

Ensure your hosting platform:
1. Serves files over HTTPS (required for service workers)
2. Properly serves the `manifest.webmanifest` file
3. Supports single-page application routing

---

## ⚠️ Security & Privacy Notes

### **What's Included in This Repository:**
✅ Complete source code (sanitized)  
✅ Architecture and implementation patterns  
✅ Documentation and setup guides  

### **What's NOT Included:**
❌ Production API keys or secrets  
❌ Firebase credentials  
❌ Azure connection strings  
❌ User data or production database  

### **Security & Audit Documents:**
All sanitization steps, the pre-release checklist, and the final audit report are in `docs/security/`.
- `docs/security/SANITIZATION_GUIDE.md` — exact code changes and implementation notes
- `docs/security/PRE_RELEASE_SECURITY_CHECKLIST.md` — what to verify before pushing
- `docs/security/SANITIZATION_COMPLETE.md` — final audit and status

> **Internal Notes:** Maintainers-only content is in `docs/internal/` and may contain internal optimization notes. Do not publish or expose these beyond maintainers.

### **Before Public Deployment:**
1. 🔒 Regenerate all API keys and secrets
2. 🔒 Review and update `.gitignore` to exclude sensitive files
3. 🔒 Use environment variables for all credentials
4. 🔒 Enable Firebase security rules
5. 🔒 Review and test authentication flows

---

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Azure Communication Services](https://learn.microsoft.com/azure/communication-services/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

---

## 🤝 Contributing & Usage

This is a **portfolio showcase project**. Feel free to:
- Study the code architecture
- Fork for learning purposes
- Use as reference for your own projects

Please note: This code is provided as-is for educational purposes.

---

## 👤 Author

**Solidev ElectroSoft**

This project demonstrates expertise in:
- Modern Angular development (19+)
- Progressive Web App implementation
- Cloud service integration (Firebase, Azure)
- Mobile app development (Android)
- Enterprise application architecture
- Full-stack development patterns

---

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
