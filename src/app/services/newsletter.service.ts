import { Injectable } from '@angular/core';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { firebaseApp } from '../firebase.config';

export interface NewsletterSubscription {
  id?: string;
  email: string;
  subscribedAt: Date;
  isActive: boolean;
  preferences?: {
    newApps: boolean;
    updates: boolean;
    promotions: boolean;
  };
  source?: string; // where they subscribed from (footer, popup, etc.)
}

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private db = getFirestore(firebaseApp);

  constructor() { }

  async subscribe(email: string, source: string = 'footer'): Promise<{ success: boolean; message: string }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Please enter a valid email address' };
      }

      // Check if email already exists
      const existingSubscription = await this.getSubscriptionByEmail(email);
      if (existingSubscription) {
        if (existingSubscription.isActive) {
          return { success: false, message: 'This email is already subscribed to our newsletter' };
        } else {
          // Reactivate existing subscription
          await this.reactivateSubscription(existingSubscription.id!);
          return { success: true, message: 'Welcome back! Your subscription has been reactivated' };
        }
      }

      // Create new subscription
      const subscriptionData: Omit<NewsletterSubscription, 'id'> = {
        email: email.toLowerCase().trim(),
        subscribedAt: new Date(),
        isActive: true,
        preferences: {
          newApps: true,
          updates: true,
          promotions: true
        },
        source
      };

      const subscriptionsCollection = collection(this.db, 'newsletter_subscriptions');
      await addDoc(subscriptionsCollection, {
        ...subscriptionData,
        subscribedAt: serverTimestamp()
      });

      return { success: true, message: 'Successfully subscribed! Thank you for joining our newsletter' };
    } catch (error) {
      // Production: Error logged
      return { success: false, message: 'Failed to subscribe. Please try again later' };
    }
  }

  async unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const subscription = await this.getSubscriptionByEmail(email);
      if (!subscription) {
        return { success: false, message: 'Email not found in our subscription list' };
      }

      if (!subscription.isActive) {
        return { success: false, message: 'This email is already unsubscribed' };
      }

      // Deactivate subscription instead of deleting
      const subscriptionDoc = doc(this.db, 'newsletter_subscriptions', subscription.id!);
      await updateDoc(subscriptionDoc, {
        isActive: false,
        unsubscribedAt: serverTimestamp()
      });

      return { success: true, message: 'Successfully unsubscribed from newsletter' };
    } catch (error) {
      // Production: Error logged
      return { success: false, message: 'Failed to unsubscribe. Please try again later' };
    }
  }

  private async getSubscriptionByEmail(email: string): Promise<NewsletterSubscription | null> {
    try {
      const subscriptionsCollection = collection(this.db, 'newsletter_subscriptions');
      const emailQuery = query(
        subscriptionsCollection,
        where('email', '==', email.toLowerCase().trim())
      );
      const snapshot = await getDocs(emailQuery);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        subscribedAt: doc.data()['subscribedAt']?.toDate() || new Date()
      } as NewsletterSubscription;
    } catch (error) {
      // Production: Error logged
      return null;
    }
  }

  private async reactivateSubscription(subscriptionId: string): Promise<void> {
    const subscriptionDoc = doc(this.db, 'newsletter_subscriptions', subscriptionId);
    await updateDoc(subscriptionDoc, {
      isActive: true,
      reactivatedAt: serverTimestamp()
    });
  }

  async getAllActiveSubscriptions(): Promise<NewsletterSubscription[]> {
    try {
      const subscriptionsCollection = collection(this.db, 'newsletter_subscriptions');
      const activeQuery = query(
        subscriptionsCollection,
        where('isActive', '==', true),
        orderBy('subscribedAt', 'desc')
      );
      const snapshot = await getDocs(activeQuery);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        subscribedAt: doc.data()['subscribedAt']?.toDate() || new Date()
      } as NewsletterSubscription));
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  async getSubscriptionStats(): Promise<{
    totalActive: number;
    totalInactive: number;
    recentSubscriptions: number;
  }> {
    try {
      const subscriptionsCollection = collection(this.db, 'newsletter_subscriptions');
      
      // Get all subscriptions
      const allSnapshot = await getDocs(subscriptionsCollection);
      
      let totalActive = 0;
      let totalInactive = 0;
      let recentSubscriptions = 0;
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      allSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data['isActive']) {
          totalActive++;
          
          const subscribedAt = data['subscribedAt']?.toDate();
          if (subscribedAt && subscribedAt > oneWeekAgo) {
            recentSubscriptions++;
          }
        } else {
          totalInactive++;
        }
      });

      return {
        totalActive,
        totalInactive,
        recentSubscriptions
      };
    } catch (error) {
      // Production: Error logged
      return {
        totalActive: 0,
        totalInactive: 0,
        recentSubscriptions: 0
      };
    }
  }

  async updatePreferences(email: string, preferences: NewsletterSubscription['preferences']): Promise<{ success: boolean; message: string }> {
    try {
      const subscription = await this.getSubscriptionByEmail(email);
      if (!subscription) {
        return { success: false, message: 'Subscription not found' };
      }

      const subscriptionDoc = doc(this.db, 'newsletter_subscriptions', subscription.id!);
      await updateDoc(subscriptionDoc, {
        preferences,
        updatedAt: serverTimestamp()
      });

      return { success: true, message: 'Preferences updated successfully' };
    } catch (error) {
      // Production: Error logged
      return { success: false, message: 'Failed to update preferences' };
    }
  }

  // Utility method to validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Test method for development - can be removed in production
  async testNewsletterFunctionality(): Promise<void> {
    // Production: Log removed
    
    try {
      // Test subscription
      const testEmail = 'test@example.com';
      // Production: Log removed
      
      const subscribeResult = await this.subscribe(testEmail, 'test');
      // Production: Log removed
      
      // Test getting stats
      const stats = await this.getSubscriptionStats();
      // Production: Log removed
      
      // Test getting active subscriptions
      const activeSubscriptions = await this.getAllActiveSubscriptions();
      // Production: Log removed
      
      // Production: Log removed
    } catch (error) {
      // Production: Error logged
    }
  }
}
