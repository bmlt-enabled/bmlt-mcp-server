import axios from 'axios';

export interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
}

export interface GeocodeResponse {
  success: boolean;
  result?: GeocodeResult;
  error?: string;
}

// Rate limiting for Nominatim (1 request per second)
class RateLimiter {
  private lastRequestTime = 0;
  private readonly minInterval = 1100; // 1.1 seconds to be safe

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      console.error(`Rate limiting: waiting ${waitTime}ms before next geocoding request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

const rateLimiter = new RateLimiter();

/**
 * Sleep helper function
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simple in-memory cache for geocoding results
 * Helps avoid repeated API calls for the same addresses
 */
class GeocodeCache {
  private cache = new Map<string, { result: GeocodeResponse; timestamp: number }>();
  private readonly maxAge = 24 * 60 * 60 * 1000; // 24 hours
  private readonly maxSize = 100; // Keep only 100 entries

  get(address: string): GeocodeResponse | null {
    const key = address.toLowerCase().trim();
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache entry is expired
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    console.error(`Using cached geocoding result for: "${address}"`);
    return cached.result;
  }
  
  set(address: string, result: GeocodeResponse): void {
    const key = address.toLowerCase().trim();
    
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }
}

const geocodeCache = new GeocodeCache();

/**
 * Geocode an address using OpenStreetMap's Nominatim service with rate limiting and retry
 * This is a free service that doesn't require API keys but has a 1 req/sec limit
 */
export async function geocodeAddress(address: string, maxRetries = 3): Promise<GeocodeResponse> {
  // Clean up the address
  const cleanAddress = address.trim();
  
  if (!cleanAddress) {
    return {
      success: false,
      error: 'Address cannot be empty'
    };
  }

  // Check cache first
  const cached = geocodeCache.get(cleanAddress);
  if (cached) {
    return cached;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Respect rate limiting
      await rateLimiter.waitIfNeeded();
      
      console.error(`Geocoding attempt ${attempt}/${maxRetries} for: "${cleanAddress}"`);
      
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: cleanAddress,
          format: 'json',
          limit: 1,
          countrycodes: 'us,ca', // Restrict to North America where BMLT is primarily used
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'BMLT-MCP-Server/1.0.0 (https://github.com/bmlt-enabled/bmlt-mcp-server)'
        },
        timeout: 15000
      });

      if (!response.data || response.data.length === 0) {
        const noResultsResponse: GeocodeResponse = {
          success: false,
          error: `No geocoding results found for address: ${address}`
        };
        
        // Cache the no-results response to avoid repeated requests
        geocodeCache.set(cleanAddress, noResultsResponse);
        
        return noResultsResponse;
      }

      const result = response.data[0];
      
      console.error(`Successfully geocoded "${cleanAddress}" to: ${result.lat}, ${result.lon}`);
      
      const geocodeResponse: GeocodeResponse = {
        success: true,
        result: {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          display_name: result.display_name
        }
      };
      
      // Cache the successful result
      geocodeCache.set(cleanAddress, geocodeResponse);
      
      return geocodeResponse;

    } catch (error) {
      console.error(`Geocoding attempt ${attempt} failed:`, error);
      
      // Check if it's a rate limiting error
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        if (attempt < maxRetries) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
          console.error(`Rate limited, waiting ${backoffDelay}ms before retry ${attempt + 1}/${maxRetries}`);
          await sleep(backoffDelay);
          continue;
        }
      }
      
      // Check if it's a temporary network error
      if (axios.isAxiosError(error) && (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || (error.response?.status && error.response.status >= 500))) {
        if (attempt < maxRetries) {
          const retryDelay = 2000 * attempt; // Linear backoff for network errors
          console.error(`Network error, retrying in ${retryDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await sleep(retryDelay);
          continue;
        }
      }
      
      // For the final attempt or non-retryable errors, return the error
      if (attempt === maxRetries) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown geocoding error'
        };
      }
    }
  }
  
  return {
    success: false,
    error: 'All geocoding attempts failed'
  };
}

/**
 * Check if a string looks like it might be an address
 * (contains common address indicators)
 */
export function looksLikeAddress(searchString: string): boolean {
  const addressPatterns = [
    /\d+\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|blvd|boulevard|way|court|ct|place|pl)/i,
    /\w+,\s*\w{2}\s*\d{5}/i, // City, ST ZIP
    /\w+,\s*\w+/i, // City, State or City, Country
    /\d{5}(-\d{4})?$/i // ZIP code at end
  ];
  
  return addressPatterns.some(pattern => pattern.test(searchString.trim()));
}

/**
 * Enhanced geocoding with fallback strategies
 */
export async function smartGeocode(searchString: string): Promise<GeocodeResponse> {
  // First try direct geocoding
  let result = await geocodeAddress(searchString);
  
  if (result.success) {
    return result;
  }
  
  // If that fails and it looks like it might have unnecessary details, try simplifying
  if (searchString.includes(',')) {
    const simplified = searchString.split(',').slice(-2).join(',').trim();
    if (simplified !== searchString) {
      console.error(`Geocoding failed for "${searchString}", trying simplified: "${simplified}"`);
      result = await geocodeAddress(simplified);
      
      if (result.success) {
        return result;
      }
    }
  }
  
  return result;
}
