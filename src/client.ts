import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  BmltServerConfig,
  BmltFormat,
  BmltApiError,
  GetSearchResultsParams,
  GetFormatsParams,
  GetServiceBodiesParams,
  GetChangesParams,
  GetFieldKeysParams,
  GetFieldValuesParams,
  GetNAWSDumpParams,
  GetServerInfoParams,
  GetCoverageAreaParams,
  GetSearchResultsResponse,
  GetFormatsResponse,
  GetServiceBodiesResponse,
  GetChangesResponse,
  GetFieldKeysResponse,
  GetFieldValuesResponse,
  GetNAWSDumpResponse,
  GetServerInfoResponse,
  GetCoverageAreaResponse,
  BMLT_ENDPOINTS
} from './types.js';
import { smartGeocode, looksLikeAddress } from './geocoding.js';

export class BmltApiClient {
  private axiosInstance: AxiosInstance;
  private config: BmltServerConfig;

  constructor(config: BmltServerConfig) {
    this.config = {
      defaultFormat: 'json',
      timeout: 30000,
      userAgent: 'BMLT-MCP-Server/1.0.0',
      ...config
    };

    this.axiosInstance = axios.create({
      timeout: this.config.timeout,
      headers: {
        'User-Agent': this.config.userAgent
      }
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.error(`Making request to: ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const bmltError: BmltApiError = new Error(
          error.response?.data?.message || error.message || 'API request failed'
        );
        bmltError.status = error.response?.status;
        bmltError.response = error.response;
        return Promise.reject(bmltError);
      }
    );
  }

  private buildUrl(format: BmltFormat, operation: string, params: Record<string, any> = {}): string {
    const baseUrl = this.config.rootServerUrl.replace(/\/$/, '');
    const queryParams = new URLSearchParams();
    
    queryParams.append('switcher', operation);
    
    // Handle array parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      if (Array.isArray(value)) {
        value.forEach(item => {
          queryParams.append(`${key}[]`, item.toString());
        });
      } else {
        queryParams.append(key, value.toString());
      }
    });

    return `${baseUrl}/client_interface/${format}/?${queryParams.toString()}`;
  }

  private async makeRequest<T>(
    format: BmltFormat,
    operation: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    const url = this.buildUrl(format, operation, params);
    
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error making request to ${operation}:`, error);
      throw error;
    }
  }

  // Validate endpoint and format combination
  private validateEndpoint(operation: string, format: BmltFormat): void {
    const endpoint = BMLT_ENDPOINTS.find(ep => ep.operation === operation);
    if (!endpoint) {
      throw new Error(`Unknown endpoint: ${operation}`);
    }

    if (!endpoint.supportedFormats.includes(format)) {
      throw new Error(
        `Format '${format}' is not supported for endpoint '${operation}'. ` +
        `Supported formats: ${endpoint.supportedFormats.join(', ')}`
      );
    }
  }

  // Search for meetings
  async getSearchResults(
    params: GetSearchResultsParams = {},
    format: BmltFormat = this.config.defaultFormat!
  ): Promise<GetSearchResultsResponse> {
    this.validateEndpoint('GetSearchResults', format);
    return this.makeRequest<GetSearchResultsResponse>(format, 'GetSearchResults', params);
  }

  // Smart search that handles address geocoding automatically
  // Features: rate limiting, caching, retry logic, and fallback handling
  async smartSearchResults(
    params: GetSearchResultsParams = {},
    format: BmltFormat = this.config.defaultFormat!
  ): Promise<GetSearchResultsResponse> {
    this.validateEndpoint('GetSearchResults', format);
    
    // Check if we have an address-based search that might cause geocoding issues
    if (params.SearchString && params.StringSearchIsAnAddress === 1) {
      console.error(`Address search detected: "${params.SearchString}", converting to coordinate search`);
      
      try {
        const geocodeResult = await smartGeocode(params.SearchString);
        
        if (geocodeResult.success && geocodeResult.result) {
          console.error(`Successfully geocoded "${params.SearchString}" to coordinates: ${geocodeResult.result.lat}, ${geocodeResult.result.lon}`);
          
          // Convert to coordinate-based search
          const newParams = {
            ...params,
            lat_val: geocodeResult.result.lat,
            long_val: geocodeResult.result.lon,
            geo_width: params.SearchStringRadius || 25, // Default radius if not specified
            sort_results_by_distance: 1 // Sort by distance for location searches
          };
          
          // Remove the problematic address search parameters
          delete newParams.SearchString;
          delete newParams.StringSearchIsAnAddress;
          delete newParams.SearchStringRadius;
          
          return this.makeRequest<GetSearchResultsResponse>(format, 'GetSearchResults', newParams);
        } else {
          console.error(`Geocoding failed for "${params.SearchString}": ${geocodeResult.error}`);
          // Fall back to text search instead of address search
          const newParams = {
            ...params,
            StringSearchIsAnAddress: 0 // Change to text search
          };
          
          return this.makeRequest<GetSearchResultsResponse>(format, 'GetSearchResults', newParams);
        }
      } catch (error) {
        console.error(`Error during geocoding, falling back to text search:`, error);
        // Fall back to text search
        const newParams = {
          ...params,
          StringSearchIsAnAddress: 0 // Change to text search
        };
        
        return this.makeRequest<GetSearchResultsResponse>(format, 'GetSearchResults', newParams);
      }
    }
    
    // For non-address searches, proceed normally
    return this.makeRequest<GetSearchResultsResponse>(format, 'GetSearchResults', params);
  }

  // Get available meeting formats
  async getFormats(
    params: GetFormatsParams = {},
    format: BmltFormat = this.config.defaultFormat!
  ): Promise<GetFormatsResponse> {
    this.validateEndpoint('GetFormats', format);
    return this.makeRequest<GetFormatsResponse>(format, 'GetFormats', params);
  }

  // Get service bodies
  async getServiceBodies(
    params: GetServiceBodiesParams = {},
    format: BmltFormat = this.config.defaultFormat!
  ): Promise<GetServiceBodiesResponse> {
    this.validateEndpoint('GetServiceBodies', format);
    return this.makeRequest<GetServiceBodiesResponse>(format, 'GetServiceBodies', params);
  }

  // Get meeting changes
  async getChanges(
    params: GetChangesParams = {},
    format: BmltFormat = this.config.defaultFormat!
  ): Promise<GetChangesResponse> {
    this.validateEndpoint('GetChanges', format);
    return this.makeRequest<GetChangesResponse>(format, 'GetChanges', params);
  }

  // Get available field keys
  async getFieldKeys(
    params: GetFieldKeysParams = {},
    format: BmltFormat = this.config.defaultFormat!
  ): Promise<GetFieldKeysResponse> {
    this.validateEndpoint('GetFieldKeys', format);
    return this.makeRequest<GetFieldKeysResponse>(format, 'GetFieldKeys', params);
  }

  // Get field values for a specific key
  async getFieldValues(
    params: GetFieldValuesParams,
    format: BmltFormat = this.config.defaultFormat!
  ): Promise<GetFieldValuesResponse> {
    this.validateEndpoint('GetFieldValues', format);
    if (!params.meeting_key) {
      throw new Error('meeting_key parameter is required for GetFieldValues');
    }
    return this.makeRequest<GetFieldValuesResponse>(format, 'GetFieldValues', params);
  }

  // Get NAWS export (CSV format only)
  async getNAWSDump(params: GetNAWSDumpParams): Promise<GetNAWSDumpResponse> {
    this.validateEndpoint('GetNAWSDump', 'csv');
    if (!params.sb_id) {
      throw new Error('sb_id parameter is required for GetNAWSDump');
    }
    return this.makeRequest<GetNAWSDumpResponse>('csv', 'GetNAWSDump', params);
  }

  // Get server information
  async getServerInfo(
    params: GetServerInfoParams = {},
    format: BmltFormat = this.config.defaultFormat!
  ): Promise<GetServerInfoResponse> {
    this.validateEndpoint('GetServerInfo', format);
    return this.makeRequest<GetServerInfoResponse>(format, 'GetServerInfo', params);
  }

  // Get coverage area
  async getCoverageArea(
    params: GetCoverageAreaParams = {},
    format: BmltFormat = this.config.defaultFormat!
  ): Promise<GetCoverageAreaResponse> {
    this.validateEndpoint('GetCoverageArea', format);
    return this.makeRequest<GetCoverageAreaResponse>(format, 'GetCoverageArea', params);
  }

  // Generic method for any endpoint
  async callEndpoint<T = any>(
    operation: string,
    params: Record<string, any> = {},
    format: BmltFormat = this.config.defaultFormat!
  ): Promise<T> {
    this.validateEndpoint(operation, format);
    return this.makeRequest<T>(format, operation, params);
  }

  // Get server configuration
  getConfig(): BmltServerConfig {
    return { ...this.config };
  }

  // Update server configuration
  updateConfig(newConfig: Partial<BmltServerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
