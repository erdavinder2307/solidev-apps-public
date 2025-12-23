# App Store Review System

This implementation provides a comprehensive review system similar to Google Play Store and Apple App Store.

## Features

### Display Features
- **Rating Summary**: Shows overall app rating with star display
- **Rating Breakdown**: Visual bars showing distribution of 1-5 star ratings
- **Individual Reviews**: User reviews with avatars, ratings, timestamps, and helpful counts
- **Review Metadata**: Shows app version, device info, and time since review
- **Responsive Design**: Works on mobile and desktop

### Data Structure

### Firestore Collections

#### Apps Collection (`/apps/{appId}`)
```typescript
{
  name: string;
  publisher: string;
  iconUrl: string;
  rating: number;        // Average rating (1-5)
  reviews: number;       // Total review count
  screenshotUrls: string[];
  description: string;
  whatsNew?: string;
  version: string;
}
```

#### Reviews Sub-Collection (`/apps/{appId}/reviews/{reviewId}`)
```typescript
{
  userId: string;        // Unique user identifier
  userName: string;      // Display name
  userAvatar?: string;   // Profile picture URL
  rating: number;        // 1-5 star rating
  title: string;         // Review title
  comment: string;       // Review text
  timestamp: Date;       // When review was posted
  helpfulCount: number;  // How many found it helpful
  appVersion?: string;   // App version when reviewed
  deviceInfo?: string;   // Device used for review
}
```

## Setup Instructions

### 1. Install Dependencies
Make sure your Angular project has the required Firebase dependencies:

```bash
npm install firebase
```

### 2. Configure Firebase
Update `src/app/firebase.config.ts` with your Firebase project configuration.

### 3. Populate Sample Data
To add sample review data to Firestore:

```bash
cd src/scripts
npm install
npm run populate
```

### 4. Update Firestore Security Rules
Add these rules to your Firestore to secure the review data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apps are readable by all, writable by admin only
    match /apps/{appId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
      
      // Reviews are readable by all, writable by authenticated users
      match /reviews/{reviewId} {
        allow read: if true;
        allow create: if request.auth != null && 
                     request.auth.uid == request.resource.data.userId;
        allow update: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
        allow delete: if request.auth != null && 
                     (request.auth.uid == resource.data.userId || 
                      request.auth.token.admin == true);
      }
    }
  }
}
```

## Usage

### Viewing Reviews
Navigate to any app details page: `/app-details/{appId}`

The component will automatically:
- Load app details from Firestore
- Load and display reviews
- Calculate rating breakdown
- Show formatted timestamps

### Adding Reviews (Future Enhancement)
To add review functionality, you would need to:

1. **Add Authentication**: Implement user login/signup
2. **Review Form**: Create a form component for submitting reviews
3. **Review Validation**: Ensure users can only review once per app
4. **Moderation**: Add admin tools for managing inappropriate reviews

### API Methods Available

The `AppDetailsComponent` provides these methods:

- `loadReviews(appId: string)`: Load reviews for an app
- `calculateRatingBreakdown(appId: string)`: Calculate star distribution
- `toggleShowAllReviews()`: Show/hide additional reviews
- `getStarArray(rating: number)`: Get array for star display
- `getTimeSince(date: Date)`: Format relative time
- `getTotalReviews()`: Get total review count
- `getRatingPercentage(starCount: number)`: Get percentage for progress bars

## Styling

The component includes comprehensive CSS styling that:
- Matches modern app store designs
- Provides hover effects and transitions
- Uses Bootstrap classes for responsiveness
- Includes custom star rating displays
- Provides proper color schemes and typography

## Sample Data

The populate script creates:
- 1 sample app (TaskMaster Pro)
- 8 sample reviews with varying ratings
- Realistic timestamps and user data
- Different device types and app versions

This gives you a fully functional review system that looks and feels like a professional app store!
