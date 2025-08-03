/**
 * Performance Optimization Utilities
 * Functions for improving application performance
 */

/**
 * Lazy loading utility for images
 * @param {HTMLImageElement} img - Image element
 * @param {string} src - Image source URL
 * @param {string} placeholder - Placeholder image URL
 */
export const lazyLoadImage = (img, src, placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+') => {
  // Set placeholder initially
  img.src = placeholder;
  
  // Create intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target;
        image.src = src;
        image.classList.remove('lazy');
        observer.unobserve(image);
      }
    });
  });
  
  observer.observe(img);
};

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Memoization utility for expensive computations
 * @param {Function} fn - Function to memoize
 * @param {Function} keyGenerator - Function to generate cache key
 * @returns {Function} - Memoized function
 */
export const memoize = (fn, keyGenerator = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return function memoizedFunction(...args) {
    const key = keyGenerator(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
};

/**
 * Virtual scrolling utility for large lists
 */
export class VirtualScroller {
  constructor(container, itemHeight, renderItem, totalItems) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.totalItems = totalItems;
    this.visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2;
    this.scrollTop = 0;
    this.startIndex = 0;
    
    this.init();
  }
  
  init() {
    // Set container height
    this.container.style.height = `${this.totalItems * this.itemHeight}px`;
    this.container.style.position = 'relative';
    this.container.style.overflow = 'auto';
    
    // Add scroll listener
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
    
    // Initial render
    this.render();
  }
  
  handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.startIndex = Math.floor(this.scrollTop / this.itemHeight);
    this.render();
  }
  
  render() {
    // Clear container
    this.container.innerHTML = '';
    
    // Calculate visible range
    const endIndex = Math.min(
      this.startIndex + this.visibleItems,
      this.totalItems
    );
    
    // Create wrapper for positioning
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.top = `${this.startIndex * this.itemHeight}px`;
    wrapper.style.width = '100%';
    
    // Render visible items
    for (let i = this.startIndex; i < endIndex; i++) {
      const item = this.renderItem(i);
      item.style.height = `${this.itemHeight}px`;
      wrapper.appendChild(item);
    }
    
    this.container.appendChild(wrapper);
  }
}

/**
 * Image compression utility
 * @param {File} file - Image file to compress
 * @param {object} options - Compression options
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    type = 'image/jpeg'
  } = options;
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, type, quality);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Preload resources
 * @param {Array} urls - Array of resource URLs
 * @param {string} type - Resource type ('image', 'script', 'style')
 * @returns {Promise} - Promise that resolves when all resources are loaded
 */
export const preloadResources = (urls, type = 'image') => {
  const promises = urls.map(url => {
    return new Promise((resolve, reject) => {
      let element;
      
      switch (type) {
        case 'image':
          element = new Image();
          break;
        case 'script':
          element = document.createElement('script');
          element.async = true;
          break;
        case 'style':
          element = document.createElement('link');
          element.rel = 'stylesheet';
          break;
        default:
          element = new Image();
      }
      
      element.onload = resolve;
      element.onerror = reject;
      element.src = url;
      
      if (type === 'script' || type === 'style') {
        document.head.appendChild(element);
      }
    });
  });
  
  return Promise.all(promises);
};

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
  }
  
  /**
   * Start timing a operation
   * @param {string} name - Operation name
   */
  startTiming(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }
  
  /**
   * End timing a operation
   * @param {string} name - Operation name
   */
  endTiming(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
    }
  }
  
  /**
   * Get timing for an operation
   * @param {string} name - Operation name
   * @returns {number} - Duration in milliseconds
   */
  getTiming(name) {
    const metric = this.metrics.get(name);
    return metric ? metric.duration : null;
  }
  
  /**
   * Monitor Core Web Vitals
   */
  monitorWebVitals() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
      
      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
      
      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        console.log('CLS:', clsValue);
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }
  }
  
  /**
   * Clean up observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Bundle size analyzer (development only)
 */
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]');
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    
    console.group('Bundle Analysis');
    console.log('Scripts:', scripts.length);
    console.log('Stylesheets:', styles.length);
    
    // Estimate bundle size (rough approximation)
    let totalSize = 0;
    scripts.forEach(script => {
      if (script.src.includes('localhost')) {
        totalSize += 100; // Rough estimate in KB
      }
    });
    
    console.log('Estimated bundle size:', totalSize, 'KB');
    console.groupEnd();
  }
};

export default {
  lazyLoadImage,
  debounce,
  throttle,
  memoize,
  VirtualScroller,
  compressImage,
  preloadResources,
  PerformanceMonitor,
  analyzeBundleSize
};
