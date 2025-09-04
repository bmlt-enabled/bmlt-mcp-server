import { z } from 'zod';

// Base types
export type BmltFormat = 'json' | 'jsonp' | 'csv' | 'tsml';
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7; // Sunday=1, Monday=2, etc.
export type VenueType = 1 | 2 | 3; // In-person=1, Virtual=2, Hybrid=3

// Zod schemas for validation
export const BmltFormatSchema = z.enum(['json', 'jsonp', 'csv', 'tsml']);
export const WeekdaySchema = z.number().int().min(1).max(7);
export const VenueTypeSchema = z.number().int().min(1).max(3);

// Base meeting interface
export interface Meeting {
  id_bigint: string;
  worldid_mixed: string;
  meeting_name: string;
  location_text: string;
  location_info: string;
  location_street: string;
  location_city_subsection: string;
  location_neighborhood: string;
  location_municipality: string;
  location_sub_province: string;
  location_province: string;
  location_postal_code_1: string;
  location_nation: string;
  comments: string;
  train_lines: string;
  bus_lines: string;
  contact_phone_1: string;
  contact_phone_2: string;
  contact_email_1: string;
  contact_email_2: string;
  contact_name_1: string;
  contact_name_2: string;
  custom_key: string;
  phone_meeting_number: string;
  virtual_meeting_link: string;
  virtual_meeting_additional_info: string;
  time_zone: string;
  start_time: string;
  duration_time: string;
  time_zone_abbreviation: string;
  weekday_tinyint: Weekday;
  venue_type: VenueType;
  longitude: number;
  latitude: number;
  published: '0' | '1';
  email_contact: string;
  meeting_key: string;
  meeting_key_value: string;
  distance_in_miles?: number;
  distance_in_km?: number;
  formats: Format[];
}

export interface Format {
  id: string;
  key_string: string;
  name_string: string;
  description_string: string;
  lang: string;
  format_type_enum: 'FC1' | 'FC2' | 'FC3' | 'O' | 'C';
}

export interface ServiceBody {
  id: string;
  parent_id: string;
  name: string;
  description: string;
  type: string;
  admin_user_id: string;
  assigned_user_id_array: string;
  contact_user_id_array: string;
  uri_string: string;
  kml_file_uri_string: string;
  main_user_bigint: string;
  world_id: string;
  sb_type: string;
  sb_owner: string;
  sb_owner_2: string;
  sb_description: string;
  editors_string: string;
}

export interface Change {
  date_int: string;
  change_type: string;
  meeting_id: string;
  meeting_name: string;
  user_id: string;
  user_name: string;
  service_body_id: string;
  service_body_name: string;
  meeting_exists: '0' | '1';
  details: string;
}

export interface FieldKey {
  key: string;
  name: string;
  description: string;
}

export interface FieldValue {
  key: string;
  value: string;
  name: string;
  description: string;
}

export interface ServerInfo {
  version: string;
  versionInt: number;
  lang_enum: string;
  nativeLang: string;
  centerLongitude: number;
  centerLatitude: number;
  centerZoom: number;
  defaultDuration: string;
  changeMeeting: boolean;
  changeFormat: boolean;
  changeServiceBody: boolean;
  aggregatorEnabled: boolean;
  autoGeocodingEnabled: boolean;
  semanticAdmin: boolean;
  available_keys: string[];
}

export interface CoverageArea {
  neLat: number;
  neLng: number;
  swLat: number;
  swLng: number;
}

// Parameter interfaces for each endpoint
export interface GetSearchResultsParams {
  // Meeting ID filtering
  meeting_ids?: number | number[];
  
  // Format options
  get_used_formats?: 0 | 1;
  get_formats_only?: 0 | 1;
  
  // Day filtering
  weekdays?: Weekday | Weekday[];
  
  // Venue type filtering
  venue_types?: VenueType | VenueType[];
  
  // Format filtering
  formats?: number | number[];
  formats_comparison_operator?: 'OR' | 'AND';
  
  // Service body filtering
  services?: number | number[];
  recursive?: 0 | 1;
  
  // Text search
  SearchString?: string;
  StringSearchIsAnAddress?: 0 | 1;
  SearchStringRadius?: number;
  
  // Time filtering
  StartsAfterH?: number;
  StartsAfterM?: number;
  StartsBeforeH?: number;
  StartsBeforeM?: number;
  EndsBeforeH?: number;
  EndsBeforeM?: number;
  
  // Duration filtering
  MinDurationH?: number;
  MinDurationM?: number;
  MaxDurationH?: number;
  MaxDurationM?: number;
  
  // Geographic search
  lat_val?: number;
  long_val?: number;
  geo_width?: number;
  geo_width_km?: number;
  sort_results_by_distance?: 0 | 1;
  
  // Field-specific search
  meeting_key?: string;
  meeting_key_value?: string;
  
  // Response customization
  data_field_key?: string;
  sort_keys?: string;
  sort_key?: 'weekday' | 'time' | 'town' | 'state' | 'weekday_state';
  
  // Pagination
  page_size?: number;
  page_num?: number;
  
  // Published status
  advanced_published?: 0 | 1 | string;
  
  // Language
  lang_enum?: string;
  
  // Aggregator mode
  root_server_ids?: number | number[];
  
  // JSONP callback
  callback?: string;
}

export interface GetFormatsParams {
  lang_enum?: string;
  show_all?: 0 | 1;
  format_ids?: number | number[];
  key_strings?: string | string[];
  callback?: string;
}

export interface GetServiceBodiesParams {
  services?: number | number[];
  recursive?: 0 | 1;
  parents?: 0 | 1;
  callback?: string;
}

export interface GetChangesParams {
  start_date?: string; // YYYY-MM-DD format
  end_date?: string;   // YYYY-MM-DD format
  meeting_id?: number;
  service_body_id?: number;
  callback?: string;
}

export interface GetFieldKeysParams {
  callback?: string;
}

export interface GetFieldValuesParams {
  meeting_key: string;
  specific_formats?: string; // comma-separated format IDs
  all_formats?: boolean;
  callback?: string;
}

export interface GetNAWSDumpParams {
  sb_id: number;
}

export interface GetServerInfoParams {
  callback?: string;
}

export interface GetCoverageAreaParams {
  callback?: string;
}

// API Response types
export type GetSearchResultsResponse = Meeting[];
export type GetFormatsResponse = Format[];
export type GetServiceBodiesResponse = ServiceBody[];
export type GetChangesResponse = Change[];
export type GetFieldKeysResponse = FieldKey[];
export type GetFieldValuesResponse = FieldValue[];
export type GetNAWSDumpResponse = string; // CSV format
export type GetServerInfoResponse = ServerInfo;
export type GetCoverageAreaResponse = CoverageArea;

// Endpoint configuration
export interface BmltEndpoint {
  name: string;
  operation: string;
  supportedFormats: BmltFormat[];
  requiredParams?: string[];
  description: string;
}

export const BMLT_ENDPOINTS: BmltEndpoint[] = [
  {
    name: 'GetSearchResults',
    operation: 'GetSearchResults',
    supportedFormats: ['json', 'jsonp', 'tsml'],
    description: 'Search for meetings based on various criteria'
  },
  {
    name: 'GetFormats',
    operation: 'GetFormats',
    supportedFormats: ['json', 'jsonp'],
    description: 'Retrieve available meeting formats'
  },
  {
    name: 'GetServiceBodies',
    operation: 'GetServiceBodies',
    supportedFormats: ['json', 'jsonp'],
    description: 'Get list of service bodies'
  },
  {
    name: 'GetChanges',
    operation: 'GetChanges',
    supportedFormats: ['json', 'jsonp'],
    description: 'Retrieve meeting changes within a date range'
  },
  {
    name: 'GetFieldKeys',
    operation: 'GetFieldKeys',
    supportedFormats: ['json', 'jsonp'],
    description: 'Get list of available field keys'
  },
  {
    name: 'GetFieldValues',
    operation: 'GetFieldValues',
    supportedFormats: ['json', 'jsonp'],
    requiredParams: ['meeting_key'],
    description: 'Get specific field values for a given field key'
  },
  {
    name: 'GetNAWSDump',
    operation: 'GetNAWSDump',
    supportedFormats: ['csv'],
    requiredParams: ['sb_id'],
    description: 'Export meeting data in NAWS format'
  },
  {
    name: 'GetServerInfo',
    operation: 'GetServerInfo',
    supportedFormats: ['json', 'jsonp'],
    description: 'Get server information'
  },
  {
    name: 'GetCoverageArea',
    operation: 'GetCoverageArea',
    supportedFormats: ['json', 'jsonp'],
    description: 'Get geographic coverage area information'
  }
];

// Error types
export interface BmltApiError extends Error {
  status?: number;
  response?: {
    data: any;
    status: number;
    statusText: string;
  };
}

// Configuration type
export interface BmltServerConfig {
  rootServerUrl: string;
  defaultFormat?: BmltFormat;
  timeout?: number;
  userAgent?: string;
}
