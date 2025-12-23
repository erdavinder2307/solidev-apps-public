import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, getMetadata } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '../firebase.config';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'developer-add-app',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    NgOptimizedImage
  ],
  templateUrl: './developer-add-app.component.html',
  styleUrls: ['./developer-add-app.component.scss']
})
export class DeveloperAddAppComponent implements OnInit {
  categories: string[] = [
    'Health',
    'Productivity',
    'Education',
    'Finance',
    'Entertainment',
    'Lifestyle',
    'Business',
    'Other'
  ];
  
  form: FormGroup;
  currentStep = 1;
  
  // File handling
  iconFile: File | null = null;
  screenshots: File[] = [];
  featuredImages: File[] = [];
  apkFile: File | null = null;
  iconPreview: string | null = null;
  screenshotPreviews: string[] = [];
  featuredImagePreviews: string[] = [];
  
  // Upload progress
  iconUploadProgress = 0;
  screenshotsUploadProgress: number[] = [];
  featuredImagesUploadProgress: number[] = [];
  apkUploadProgress = 0;
  uploading = false;
  
  // Edit mode
  isEdit: boolean = false;
  appId: string | null = null;
  existingIconUrl: string | null = null;
  existingScreenshotUrls: string[] = [];
  existingFeaturedImageUrls: string[] = [];
  existingApkUrl: string | null = null;
  existingDownloads: number = 0;
  existingRating: number = 0;
  existingReviewsCount: number = 0;
  apkFileName: string = ''; // Store the sanitized APK filename

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      version: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      publisher: ['', Validators.required],
      packageName: ['', [Validators.required, Validators.pattern(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/)]],
      size: ['', Validators.required],
      requiresAndroid: ['5.0+', Validators.required],
      ageRating: ['Everyone', Validators.required],
      contentRating: ['Everyone'],
      whatsNew: [''],
      isFeatured: [false],
      isTopRated: [false],
      containsAds: [false],
      inAppPurchases: [false]
    });
  }

  async ngOnInit() {
    this.appId = this.route.snapshot.queryParamMap.get('id');
    if (this.appId) {
      this.isEdit = true;
      await this.loadAppData(this.appId);
    }
  }

  async loadAppData(id: string) {
    const db = getFirestore(firebaseApp);
    const appDoc = doc(db, 'apps', id);
    const snap = await getDoc(appDoc);
    if (snap.exists()) {
      const data = snap.data();
      this.form.patchValue({
        name: data['name'] || '',
        category: data['category'] || '',
        version: data['version'] || '',
        description: data['description'] || '',
        publisher: data['publisher'] || '',
        packageName: data['packageName'] || '',
        size: data['size'] || '',
        requiresAndroid: data['requiresAndroid'] || '5.0+',
        ageRating: data['ageRating'] || 'Everyone',
        contentRating: data['contentRating'] || 'Everyone',
        whatsNew: data['whatsNew'] || '',
        isFeatured: data['isFeatured'] || false,
        isTopRated: data['isTopRated'] || false,
        containsAds: data['containsAds'] || false,
        inAppPurchases: data['inAppPurchases'] || false
      });
      this.existingIconUrl = data['iconUrl'] || null;
      this.existingScreenshotUrls = data['screenshotUrls'] || [];
      this.existingFeaturedImageUrls = data['featuredImageUrls'] || [];
      this.existingApkUrl = data['apkUrl'] || null;
      this.existingDownloads = data['downloads'] || 0;
      this.existingRating = data['rating'] || 0;
      this.existingReviewsCount = data['reviewsCount'] || 0;
      this.apkFileName = data['apkFileName'] || ''; // Load existing APK filename
      
      // Fetch APK file size from Firebase Storage if no size is stored or if APK exists
      if (this.existingApkUrl && !data['size']) {
        await this.fetchApkSizeFromStorage(this.existingApkUrl);
      }
      
      // Set screenshot previews from existing URLs
      this.screenshotPreviews = [...this.existingScreenshotUrls];
      // Set featured image previews from existing URLs
      this.featuredImagePreviews = [...this.existingFeaturedImageUrls];
    }
  }

  private async fetchApkSizeFromStorage(apkUrl: string): Promise<void> {
    try {
      const storage = getStorage(firebaseApp);
      const apkRef = ref(storage, apkUrl);
      const metadata = await getMetadata(apkRef);
      
      if (metadata.size) {
        const sizeInBytes = metadata.size;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        const formattedSize = sizeInMB >= 1 
          ? `${sizeInMB.toFixed(1)} MB` 
          : `${(sizeInBytes / 1024).toFixed(1)} KB`;
        
        this.form.patchValue({
          size: formattedSize
        });
      }
    } catch (error) {
      // Silent error - size will remain as is from database or empty
      console.error('Failed to fetch APK size from storage:', error);
    }
  }

  onIconSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.iconFile = file;
      this.createImagePreview(file).then(preview => {
        this.iconPreview = preview;
      });
    }
  }

  onScreenshotsSelected(event: any) {
    const files = Array.from(event.target.files || []) as File[];
    this.screenshots = files;
    this.screenshotsUploadProgress = files.map(() => 0);
    
    // Create previews
    Promise.all(files.map(file => this.createImagePreview(file)))
      .then(previews => {
        this.screenshotPreviews = previews;
      });
  }

  onFeaturedImagesSelected(event: any) {
    const files = Array.from(event.target.files || []) as File[];
    this.featuredImages = files;
    this.featuredImagesUploadProgress = files.map(() => 0);
    
    // Create previews
    Promise.all(files.map(file => this.createImagePreview(file)))
      .then(previews => {
        this.featuredImagePreviews = previews;
      });
  }

  async onApkSelected(event: any) {
    this.apkFile = event.target.files[0] || null;
    if (this.apkFile) {
      // Auto-detect and set app size from APK file
      const sizeInBytes = this.apkFile.size;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      const formattedSize = sizeInMB >= 1 
        ? `${sizeInMB.toFixed(1)} MB` 
        : `${(sizeInBytes / 1024).toFixed(1)} KB`;
      
      this.form.patchValue({
        size: formattedSize
      });
      
      this.snackBar.open(`App size detected: ${formattedSize}`, 'Close', { duration: 2000 });
    }
  }

  private async createImagePreview(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  // Step navigation methods
  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return !!(this.form.get('name')?.valid && 
               this.form.get('category')?.valid && 
               this.form.get('version')?.valid && 
               this.form.get('publisher')?.valid && 
               this.form.get('description')?.valid);
      case 2:
        return !!(this.iconFile || this.existingIconUrl) && 
               !!(this.apkFile || this.existingApkUrl);
      case 3:
        return this.form.valid && 
               !!(this.iconFile || this.existingIconUrl) && 
               !!(this.apkFile || this.existingApkUrl);
      default:
        return false;
    }
  }

  // File management methods
  removeIcon() {
    this.iconFile = null;
    this.iconPreview = null;
    this.existingIconUrl = null;
  }

  removeScreenshot(index: number) {
    this.screenshots.splice(index, 1);
    this.screenshotPreviews.splice(index, 1);
    this.screenshotsUploadProgress.splice(index, 1);
    
    if (index < this.existingScreenshotUrls.length) {
      this.existingScreenshotUrls.splice(index, 1);
    }
  }

  removeFeaturedImage(index: number) {
    this.featuredImages.splice(index, 1);
    this.featuredImagePreviews.splice(index, 1);
    this.featuredImagesUploadProgress.splice(index, 1);
    
    if (index < this.existingFeaturedImageUrls.length) {
      this.existingFeaturedImageUrls.splice(index, 1);
    }
  }

  removeApk() {
    this.apkFile = null;
    this.existingApkUrl = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Health': 'heart-pulse',
      'Productivity': 'briefcase',
      'Education': 'book',
      'Finance': 'currency-dollar',
      'Entertainment': 'play-circle',
      'Lifestyle': 'house',
      'Business': 'building',
      'Other': 'grid'
    };
    return icons[category] || 'app';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget) {
      (event.currentTarget as HTMLElement).classList.add('dragover');
    }
  }

  onIconDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget) {
      (event.currentTarget as HTMLElement).classList.remove('dragover');
    }
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.iconFile = files[0];
    }
  }

  onScreenshotsDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget) {
      (event.currentTarget as HTMLElement).classList.remove('dragover');
    }
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.screenshots = Array.from(files);
      this.screenshotsUploadProgress = this.screenshots.map(() => 0);
      // Create previews
      Promise.all(this.screenshots.map(file => this.createImagePreview(file)))
        .then(previews => {
          this.screenshotPreviews = previews;
        });
    }
  }

  onFeaturedImagesDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget) {
      (event.currentTarget as HTMLElement).classList.remove('dragover');
    }
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.featuredImages = Array.from(files);
      this.featuredImagesUploadProgress = this.featuredImages.map(() => 0);
      // Create previews
      Promise.all(this.featuredImages.map(file => this.createImagePreview(file)))
        .then(previews => {
          this.featuredImagePreviews = previews;
        });
    }
  }

  async onApkDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget) {
      (event.currentTarget as HTMLElement).classList.remove('dragover');
    }
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.apkFile = files[0];
      
      // Auto-detect and set app size from APK file
      if (this.apkFile) {
        const sizeInBytes = this.apkFile.size;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        const formattedSize = sizeInMB >= 1 
          ? `${sizeInMB.toFixed(1)} MB` 
          : `${(sizeInBytes / 1024).toFixed(1)} KB`;
        
        this.form.patchValue({
          size: formattedSize
        });
        
        this.snackBar.open(`App size detected: ${formattedSize}`, 'Close', { duration: 2000 });
      }
    }
  }


  async onSubmit() {
    if (this.form.invalid || (!this.iconFile && !this.isEdit) || (!this.apkFile && !this.isEdit)) {
      this.snackBar.open('Please fill all required fields and select files.', 'Close', { duration: 3000 });
      return;
    }
    this.uploading = true;
    const storage = getStorage(firebaseApp);
    const db = getFirestore(firebaseApp);
    try {
      let iconUrl = this.existingIconUrl;
      let iconThumbUrl = '';
      let screenshotUrls = this.existingScreenshotUrls ? [...this.existingScreenshotUrls] : [];
      let screenshotThumbUrls: string[] = [];
      let featuredImageUrls = this.existingFeaturedImageUrls ? [...this.existingFeaturedImageUrls] : [];
      let featuredImageThumbUrls: string[] = [];
      let apkUrl = this.existingApkUrl;
      let apkFileName = this.apkFileName; // Initialize with existing filename

      // Upload icon and its thumbnail if new file selected
      if (this.iconFile) {
        // Create app-name based filename
        const appName = this.form.get('name')?.value || 'app';
        const sanitizedAppName = appName.toLowerCase()
          .replace(/[^a-z0-9]/g, '-')  // Replace non-alphanumeric chars with hyphens
          .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        const iconFileName = `${sanitizedAppName}-icon-${randomNumber}.${this.iconFile.name.split('.').pop()}`;
        
        // Upload original icon
        const iconRef = ref(storage, `apps/icons/${iconFileName}`);
        const iconTask = uploadBytesResumable(iconRef, this.iconFile);
        iconTask.on('state_changed', snap => {
          this.iconUploadProgress = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        });
        await iconTask;
        iconUrl = await getDownloadURL(iconRef);

        // Create and upload thumbnail with higher resolution for better quality
        const iconThumb = await imageCompression(this.iconFile, { maxWidthOrHeight: 256, maxSizeMB: 0.2 });
        const iconThumbFileName = `${sanitizedAppName}-icon-thumb-${randomNumber}.${this.iconFile.name.split('.').pop()}`;
        const iconThumbRef = ref(storage, `apps/icons/thumbnails/${iconThumbFileName}`);
        const iconThumbTask = uploadBytesResumable(iconThumbRef, iconThumb);
        await iconThumbTask;
        iconThumbUrl = await getDownloadURL(iconThumbRef);
      }

      // Upload screenshots and their thumbnails if new files selected
      if (this.screenshots.length > 0) {
        screenshotUrls = [];
        screenshotThumbUrls = [];
        
        // Create app-name based filename prefix
        const appName = this.form.get('name')?.value || 'app';
        const sanitizedAppName = appName.toLowerCase()
          .replace(/[^a-z0-9]/g, '-')  // Replace non-alphanumeric chars with hyphens
          .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
        
        for (let i = 0; i < this.screenshots.length; i++) {
          const file = this.screenshots[i];
          const randomNumber = Math.floor(Math.random() * 100) + 1;
          const screenshotFileName = `${sanitizedAppName}-screenshot-${i + 1}-${randomNumber}.${file.name.split('.').pop()}`;
          
          // Upload original screenshot
          const shotRef = ref(storage, `apps/screenshots/${screenshotFileName}`);
          const shotTask = uploadBytesResumable(shotRef, file);
          shotTask.on('state_changed', snap => {
            this.screenshotsUploadProgress[i] = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          });
          await shotTask;
          screenshotUrls.push(await getDownloadURL(shotRef));

          // Create and upload thumbnail with better resolution for web and mobile
          const thumb = await imageCompression(file, { maxWidthOrHeight: 320, maxSizeMB: 0.3 });
          const thumbFileName = `${sanitizedAppName}-screenshot-thumb-${i + 1}-${randomNumber}.${file.name.split('.').pop()}`;
          const thumbRef = ref(storage, `apps/screenshots/thumbnails/${thumbFileName}`);
          const thumbTask = uploadBytesResumable(thumbRef, thumb);
          await thumbTask;
          screenshotThumbUrls.push(await getDownloadURL(thumbRef));
        }
      }

      // Upload featured images and their thumbnails if new files selected
      if (this.featuredImages.length > 0) {
        featuredImageUrls = [];
        featuredImageThumbUrls = [];
        
        // Create app-name based filename prefix
        const appName = this.form.get('name')?.value || 'app';
        const sanitizedAppName = appName.toLowerCase()
          .replace(/[^a-z0-9]/g, '-')  // Replace non-alphanumeric chars with hyphens
          .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
        
        for (let i = 0; i < this.featuredImages.length; i++) {
          const file = this.featuredImages[i];
          const randomNumber = Math.floor(Math.random() * 100) + 1;
          const featuredFileName = `${sanitizedAppName}-featured-${i + 1}-${randomNumber}.${file.name.split('.').pop()}`;
          
          // Upload original featured image
          const featuredRef = ref(storage, `apps/featured/${featuredFileName}`);
          const featuredTask = uploadBytesResumable(featuredRef, file);
          featuredTask.on('state_changed', snap => {
            this.featuredImagesUploadProgress[i] = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          });
          await featuredTask;
          featuredImageUrls.push(await getDownloadURL(featuredRef));

          // Create and upload thumbnail optimized for featured carousel
          const thumb = await imageCompression(file, { maxWidthOrHeight: 600, maxSizeMB: 0.4 });
          const thumbFileName = `${sanitizedAppName}-featured-thumb-${i + 1}-${randomNumber}.${file.name.split('.').pop()}`;
          const thumbRef = ref(storage, `apps/featured/thumbnails/${thumbFileName}`);
          const thumbTask = uploadBytesResumable(thumbRef, thumb);
          await thumbTask;
          featuredImageThumbUrls.push(await getDownloadURL(thumbRef));
        }
      }

      // Upload APK if new file selected
      if (this.apkFile) {
        // Create app-name based filename with random number
        const appName = this.form.get('name')?.value || 'app';
        const sanitizedAppName = appName.toLowerCase()
          .replace(/[^a-z0-9]/g, '-')  // Replace non-alphanumeric chars with hyphens
          .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        const apkFileNameToUse = `${sanitizedAppName}-${randomNumber}.apk`;
        
        const apkRef = ref(storage, `apps/apks/${apkFileNameToUse}`);
        const apkTask = uploadBytesResumable(apkRef, this.apkFile);
        apkTask.on('state_changed', snap => {
          this.apkUploadProgress = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        });
        await apkTask;
        apkUrl = await getDownloadURL(apkRef);
        
        // Store the sanitized filename for downloads
        apkFileName = apkFileNameToUse;
      }

      if (this.isEdit && this.appId) {
        // Update existing app
        const appDoc = doc(db, 'apps', this.appId);
        await updateDoc(appDoc, {
          ...this.form.value,
          iconUrl,
          iconThumbUrl,
          screenshotUrls,
          screenshotThumbUrls,
          featuredImageUrls,
          featuredImageThumbUrls,
          apkUrl,
          apkFileName: apkFileName || undefined,
          downloads: this.existingDownloads, // Preserve existing downloads
          rating: this.existingRating, // Preserve existing rating
          reviewsCount: this.existingReviewsCount, // Preserve existing reviews count
          lastUpdated: new Date(),
          tags: [],
          isPublished: true
        });
        this.snackBar.open('App updated successfully!', 'Close', { duration: 3000 });
      } else {
        // Add new app
        await addDoc(collection(db, 'apps'), {
          ...this.form.value,
          iconUrl,
          iconThumbUrl,
          screenshotUrls,
          screenshotThumbUrls,
          featuredImageUrls,
          featuredImageThumbUrls,
          apkUrl,
          apkFileName: apkFileName || undefined,
          downloads: 0,
          rating: 0,
          reviewsCount: 0,
          releaseDate: new Date(),
          lastUpdated: new Date(),
          tags: [],
          isPublished: true
        });
        this.snackBar.open('App added successfully!', 'Close', { duration: 3000 });
      }
      this.form.reset();
      this.iconFile = null;
      this.screenshots = [];
      this.featuredImages = [];
      this.apkFile = null;
      this.iconUploadProgress = 0;
      this.screenshotsUploadProgress = [];
      this.featuredImagesUploadProgress = [];
      this.apkUploadProgress = 0;
      this.router.navigate(['/developer-dashboard']);
    } catch (err) {
      this.snackBar.open('Error uploading app. Please try again.', 'Close', { duration: 4000 });
    }
    this.uploading = false;
  }
}
