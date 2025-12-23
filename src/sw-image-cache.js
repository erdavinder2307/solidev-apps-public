// Service Worker for Image Caching
// This service worker will cache images for offline access and better performance

const CACHE_NAME = 'solidev-images-v1';
const IMAGE_CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// URLs to cache on installation
const CRITICAL_IMAGES = [
  // Add critical image URLs here - these will be populated dynamically
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // We'll cache images as they're requested rather than pre-caching
        return Promise.resolve();
      })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.includes('solidev-images')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - cache images
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Only cache image requests
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  }
});

// Check if request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();
  
  // Check for image file extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
  const isImageExtension = imageExtensions.some(ext => pathname.includes(ext));
  
  // Check for Firebase Storage images
  const isFirebaseImage = url.hostname.includes('firebasestorage.googleapis.com');
  
  // Check for other image services
  const isImageService = url.hostname.includes('images.unsplash.com') || 
                         url.hostname.includes('cdn.') ||
                         request.destination === 'image';
  
  return isImageExtension || isFirebaseImage || isImageService;
}

// Handle image requests with caching strategy
async function handleImageRequest(request) {
  const cacheName = CACHE_NAME;
  
  try {
    // Try to get from cache first
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is still fresh
      const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || 0);
      const now = new Date();
      
      if (now - cacheDate < IMAGE_CACHE_EXPIRATION) {
        return cachedResponse;
      } else {
        // Cache expired, fetch fresh copy in background
        fetchAndCache(request, cache);
        return cachedResponse; // Return stale content while refreshing
      }
    }
    
    // Not in cache, fetch from network
    // For Firebase Storage, use no-cors mode to avoid CORS preflight
    const url = new URL(request.url);
    const fetchOptions = {};
    
    if (url.hostname.includes('firebasestorage.googleapis.com')) {
      fetchOptions.mode = 'no-cors';
    }
    
    const networkResponse = await fetch(request, fetchOptions);
    
    if (networkResponse.ok || networkResponse.type === 'opaque') {
      // Clone the response before caching
      const responseToCache = networkResponse.clone();
      
      // Add cache timestamp
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      // Cache the response
      cache.put(request, cachedResponse);
    }
    
    return networkResponse;
    
  } catch (error) {
    // Try to serve from cache as fallback
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a placeholder image or error response
    return new Response('Image not available', { 
      status: 404, 
      statusText: 'Image not found' 
    });
  }
}

// Helper function to fetch and cache in background
async function fetchAndCache(request, cache) {
  try {
    // Use appropriate fetch options for Firebase Storage
    const url = new URL(request.url);
    const fetchOptions = {};
    
    if (url.hostname.includes('firebasestorage.googleapis.com')) {
      fetchOptions.mode = 'no-cors';
    }
    
    const response = await fetch(request, fetchOptions);
    if (response.ok || response.type === 'opaque') {
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponse);
    }
  } catch (error) {
    // Silent error handling
  }
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'CACHE_IMAGES':
      cacheImages(data.urls);
      break;
    case 'CLEAR_CACHE':
      clearImageCache();
      break;
    case 'GET_CACHE_INFO':
      getCacheInfo().then(info => {
        event.ports[0].postMessage(info);
      });
      break;
  }
});

// Cache specific images
async function cacheImages(urls) {
  const cache = await caches.open(CACHE_NAME);
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const headers = new Headers(response.headers);
        headers.set('sw-cache-date', new Date().toISOString());
        
        const cachedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers
        });
        
        await cache.put(url, cachedResponse);
      }
    } catch (error) {
      // Silent error handling
    }
  }
}

// Clear image cache
async function clearImageCache() {
  const deleted = await caches.delete(CACHE_NAME);
}

// Get cache information
async function getCacheInfo() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    return {
      cacheSize: keys.length,
      urls: keys.map(request => request.url)
    };
  } catch (error) {
    return { cacheSize: 0, urls: [], error: error.message };
  }
}
