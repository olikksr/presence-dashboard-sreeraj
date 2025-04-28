import { toast } from 'sonner';

// In-memory cache for API responses
const apiCache = new Map();

// Function to clear the API cache
export const clearApiCache = () => {
  apiCache.clear();
  console.log("Cleared entire API cache");
};

// Clear specific API cache entry
export const clearApiCacheEntry = (url: string, headers?: Record<string, string>) => {
  const cacheKey = headers && Object.keys(headers).length > 0 
    ? `${url}:${JSON.stringify(headers)}`
    : url;

  const removed = apiCache.delete(cacheKey);
  console.log(`Cleared API cache for ${cacheKey}: ${removed ? 'success' : 'not in cache'}`);
};

// Add to window object for global access
declare global {
  interface Window {
    clearApiCache: (url: string) => void;
  }
}

// Expose cache clearing function globally
if (typeof window !== 'undefined') {
  window.clearApiCache = clearApiCacheEntry;
}

// Generic function to fetch data from an API with caching
// export const fetchWithCache = async <T>(
//   url: string,
//   options: { cacheTTL?: number } = {}
// ): Promise<T> => {
//   const { cacheTTL = 300000 } = options; // Default cache TTL is 5 minutes

//   // Check if the data is already in the cache
//   const cachedData = apiCache.get(url);
//   if (cachedData) {
//     console.log(`Cache hit for ${url}`);
//     return cachedData;
//   }

//   try {
//     console.log(`Fetching ${url} from API`);
//     const response = await fetch(url);

//     if (!response.ok) {
//       throw new Error(`API request failed with status ${response.status}`);
//     }

//     const data: T = await response.json();

//     // Store the data in the cache
//     apiCache.set(url, data);

//     // Set a timeout to remove the data from the cache after the TTL
//     setTimeout(() => {
//       apiCache.delete(url);
//       console.log(`Cache expired for ${url}`);
//     }, cacheTTL);

//     return data;
//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     throw error;
//   }
// };
// export const fetchWithCache = async <T>(
//   url: string,
//   options: { cacheTTL?: number; headers?: Record<string, string> } = {}  // ✅ Accept headers too
// ): Promise<T> => {
//   const { cacheTTL = 300000, headers = {} } = options; // Default cache TTL is 5 minutes

//   // Check if the data is already in the cache
//   const cachedData = apiCache.get(url);
//   if (cachedData) {
//     console.log(`Cache hit for ${url}`);
//     return cachedData;
//   }

//   try {
//     console.log(`Fetching ${url} from API`);
//     const response = await fetch(url, { headers });  // ✅ Pass headers if any

//     if (!response.ok) {
//       throw new Error(`API request failed with status ${response.status}`);
//     }

//     const data: T = await response.json();

//     // Store the data in the cache
//     apiCache.set(url, data);

//     // Set a timeout to remove the data from the cache after the TTL
//     setTimeout(() => {
//       apiCache.delete(url);
//       console.log(`Cache expired for ${url}`);
//     }, cacheTTL);

//     return data;
//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     throw error;
//   }
// };

export const fetchWithCache = async <T>(
  url: string,
  options: { cacheTTL?: number; headers?: Record<string, string> } = {}
): Promise<T> => {
  const { cacheTTL = 300000, headers = {} } = options;

  const cacheKey = headers && Object.keys(headers).length > 0 
    ? `${url}:${JSON.stringify(headers)}`
    : url;

  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for ${cacheKey}`);
    return cachedData;
  }

  try {
    console.log(`Fetching ${url} from API`);
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: T = await response.json();

    apiCache.set(cacheKey, data);

    setTimeout(() => {
      apiCache.delete(cacheKey);
      console.log(`Cache expired for ${cacheKey}`);
    }, cacheTTL);

    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};



// Generic function to handle API errors
export const handleApiError = (error: any, message: string) => {
  console.error(message, error);
  toast.error(`${message}: ${error.message || error}`);
  throw new Error(`${message}: ${error.message || error}`);
};

// API base URLs
export const EMPLOYEE_API_BASE_URL = 'http://localhost:5002';
export const ATTENDANCE_API_BASE_URL = 'http://localhost:5003';

// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Reset API cache functionality
export const resetApiCache = () => {
  clearApiCache();
};

