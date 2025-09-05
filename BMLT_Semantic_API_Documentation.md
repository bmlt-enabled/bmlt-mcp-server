# BMLT Semantic API Documentation

## Overview

The BMLT (Basic Meeting List Tool) Semantic API provides a comprehensive interface for retrieving meeting data from BMLT root servers. This API uses a `switcher=` parameter to specify different operations and returns data in JSON or CSV format.

## Base URL Structure

All API calls follow this pattern:
```
{rootServerURL}client_interface/{format}/?switcher={operation}{parameters}
```

Where:
- `{rootServerURL}`: The base URL of the BMLT root server (e.g., `https://bmlt.wszf.org/main_server/`)
- `{format}`: Data format - `json`, `jsonp`, `tsml`, or `csv` (see format restrictions below)
- `{operation}`: The operation to perform (see endpoints below)
- `{parameters}`: Optional parameters specific to each operation

## Data Format Support

### JSON Format
Standard JSON response format. Available for all endpoints except GetNAWSDump.

### JSONP Format
JSON with Padding - wraps JSON response in a callback function. Available for all endpoints except GetNAWSDump.
- Add `&callback=yourCallbackFunction` parameter (defaults to 'callback' if not specified)

### TSML Format
TSML (The Semantic Meeting List) format. Only available for GetSearchResults endpoint.

### CSV Format
Comma-separated values format. Only available for GetNAWSDump endpoint.

## Available Endpoints

### 1. GetSearchResults
**Purpose**: Search for meetings based on various criteria
**Format**: JSON, JSONP, TSML
**Parameters**: Extensive filtering options (see detailed parameters below)

### 2. GetFormats
**Purpose**: Retrieve available meeting formats
**Format**: JSON, JSONP
**Parameters**:
- `lang_enum` (optional): Language code (e.g., 'en', 'de', 'fr')
- `show_all` (optional): Set to '1' to show all formats
- `format_ids` (optional): Array of format IDs to include/exclude (positive to include, negative to exclude)
- `key_strings` (optional): Array of format key strings to filter by

### 3. GetServiceBodies
**Purpose**: Get list of service bodies
**Format**: JSON, JSONP
**Parameters**:
- `services` (optional): Array of service body IDs to include/exclude (positive to include, negative to exclude)
- `recursive` (optional): Set to '1' to include child service bodies
- `parents` (optional): Set to '1' to include parent service bodies

### 4. GetChanges
**Purpose**: Retrieve meeting changes within a date range
**Format**: JSON, JSONP
**Parameters**:
- `start_date` (optional): Start date in YYYY-MM-DD format
- `end_date` (optional): End date in YYYY-MM-DD format
- `meeting_id` (optional): Specific meeting ID
- `service_body_id` (optional): Service body ID

### 5. GetFieldKeys
**Purpose**: Get list of available field keys
**Format**: JSON, JSONP
**Parameters**: None

### 6. GetFieldValues
**Purpose**: Get specific field values for a given field key
**Format**: JSON, JSONP
**Parameters**:
- `meeting_key` (required): The field key to get values for
- `specific_formats` (optional): Comma-separated list of format IDs to limit field values to
- `all_formats` (optional): Boolean to include all formats (not just specific ones)

### 7. GetNAWSDump
**Purpose**: Export meeting data in NAWS format
**Format**: CSV
**Parameters**:
- `sb_id` (required): Service body ID

### 8. GetServerInfo
**Purpose**: Get server information
**Format**: JSON, JSONP
**Parameters**: None

### 9. GetCoverageArea
**Purpose**: Get geographic coverage area information
**Format**: JSON, JSONP
**Parameters**: None

## Detailed Parameters for GetSearchResults

The GetSearchResults endpoint supports extensive filtering options:

### Meeting ID Filtering
- `meeting_ids={id}`: Include specific meeting IDs (positive values)
- `meeting_ids[]={id}`: Multiple meeting IDs (array format)
- `meeting_ids=-{id}`: Exclude specific meeting IDs (negative values)
- `meeting_ids[]=-{id}`: Exclude multiple meeting IDs (array format)

### Format Options
- `get_used_formats=1`: Include formats used in search results
- `get_formats_only=1`: Return only formats (requires get_used_formats=1)

### Day of Week Filtering
- `weekdays={day}`: Include meetings on specific days (1=Sunday, 2=Monday, ..., 7=Saturday)
- `weekdays[]={day}`: Multiple days (array format)
- `weekdays=-{day}`: Exclude meetings on specific days
- `weekdays[]=-{day}`: Exclude multiple days (array format)

### Venue Type Filtering
- `venue_types={type}`: Include meetings with specific venue types (1=In-person, 2=Virtual, 3=Hybrid)
- `venue_types[]={type}`: Multiple venue types (array format)
- `venue_types=-{type}`: Exclude meetings with specific venue types
- `venue_types[]=-{type}`: Exclude multiple venue types (array format)

### Format Filtering
- `formats={format_id}`: Include meetings with specific formats
- `formats[]={format_id}`: Multiple formats (array format)
- `formats=-{format_id}`: Exclude meetings with specific formats
- `formats[]=-{format_id}`: Exclude multiple formats (array format)
- `formats_comparison_operator=OR`: Use OR logic for format matching (default is AND)

### Service Body Filtering
- `services={service_body_id}`: Include meetings from specific service bodies
- `services[]={service_body_id}`: Multiple service bodies (array format)
- `services=-{service_body_id}`: Exclude meetings from specific service bodies
- `services[]=-{service_body_id}`: Exclude multiple service bodies (array format)
- `recursive=1`: Include child service bodies when filtering by services

### Text Search
- `SearchString={text}`: Search for specific text
- `StringSearchIsAnAddress=1`: Treat search string as an address
- `SearchStringRadius={radius}`: Search radius for address searches (miles/km, negative for auto-radius)

### Time Filtering
- `StartsAfterH={hour}`: Meetings starting after hour (0-23)
- `StartsAfterM={minute}`: Meetings starting after minute (0-59)
- `StartsBeforeH={hour}`: Meetings starting before hour (0-23)
- `StartsBeforeM={minute}`: Meetings starting before minute (0-59)
- `EndsBeforeH={hour}`: Meetings ending before hour (0-23)
- `EndsBeforeM={minute}`: Meetings ending before minute (0-59)

### Duration Filtering
- `MinDurationH={hours}`: Minimum duration in hours
- `MinDurationM={minutes}`: Minimum duration in minutes
- `MaxDurationH={hours}`: Maximum duration in hours
- `MaxDurationM={minutes}`: Maximum duration in minutes

### Geographic Search
- `lat_val={latitude}`: Latitude for geographic search
- `long_val={longitude}`: Longitude for geographic search
- `geo_width={radius}`: Search radius in miles
- `geo_width_km={radius}`: Search radius in kilometers
- `sort_results_by_distance=1`: Sort results by distance when using geographic search

### Field-Specific Search
- `meeting_key={field_key}`: Search for specific field value
- `meeting_key_value={value}`: The value to search for

### Response Customization
- `data_field_key={field1,field2}`: Return only specific fields (comma-separated)
- `sort_keys={field1,field2}`: Sort results by specific fields (comma-separated)
- `sort_key={alias}`: Use predefined sort aliases ('weekday', 'time', 'town', 'state', 'weekday_state')

### Pagination
- `page_size={number}`: Number of results per page
- `page_num={number}`: Page number (defaults to 1)

### Published Status
- No parameter: Show only published meetings (default behavior)
- `advanced_published=0`: Show all meetings (both published and unpublished)
- `advanced_published=-1`: Show only unpublished meetings

### Language
- `lang_enum={language_code}`: Language for format names (e.g., 'en', 'de', 'fr')

## Aggregator Mode Parameters

When the BMLT server is running in aggregator mode (combining data from multiple root servers), additional parameters are available:

### Root Server Filtering
- `root_server_ids={id}`: Include specific root server IDs (positive values)
- `root_server_ids[]={id}`: Multiple root server IDs (array format)
- `root_server_ids=-{id}`: Exclude specific root server IDs (negative values)
- `root_server_ids[]=-{id}`: Exclude multiple root server IDs (array format)

### Aggregator Mode Behavior
When in aggregator mode, some endpoints require at least one filter parameter to prevent overwhelming responses:
- GetSearchResults requires at least one of: meeting_ids, services, formats, root_server_ids, meeting_key, geographic coordinates, or pagination
- Different validation rules and response structures may apply
- Geographic search radius may be limited by server configuration

## Data Types and Values

### Weekdays
- 1: Sunday
- 2: Monday
- 3: Tuesday
- 4: Wednesday
- 5: Thursday
- 6: Friday
- 7: Saturday

### Venue Types
- 1: In-person
- 2: Virtual
- 3: Hybrid

### Time Format
- Hours: 0-23 (24-hour format)
- Minutes: 0-59
- Time strings: HH:MM format (e.g., "14:30" for 2:30 PM)

### Radius Values
- Positive values: Distance in miles or kilometers
- Negative values: Integer for auto-radius (number of meetings to find)

## Example API Calls

### Basic Meeting Search
```
https://bmlt.wszf.org/main_server/client_interface/json/?switcher=GetSearchResults
```

### Search for Virtual Meetings on Weekdays
```
https://bmlt.wszf.org/main_server/client_interface/json/?switcher=GetSearchResults&venue_types=2&weekdays[]=2&weekdays[]=3&weekdays[]=4&weekdays[]=5&weekdays[]=6
```

### Search with Geographic Radius
```
https://bmlt.wszf.org/main_server/client_interface/json/?switcher=GetSearchResults&lat_val=47.6062&long_val=-122.3321&geo_width_km=10
```

### Get Formats in German
```
https://bmlt.wszf.org/main_server/client_interface/json/?switcher=GetFormats&lang_enum=de
```

### Get Changes for Specific Date Range
```
https://bmlt.wszf.org/main_server/client_interface/json/?switcher=GetChanges&start_date=2024-01-01&end_date=2024-01-31
```

### Get NAWS Export for Service Body
```
https://bmlt.wszf.org/main_server/client_interface/csv/?switcher=GetNAWSDump&sb_id=123
```

### Search with Meeting ID Filtering
```
https://bmlt.wszf.org/main_server/client_interface/json/?switcher=GetSearchResults&meeting_ids=123,456,-789
```

### Search with Pagination
```
https://bmlt.wszf.org/main_server/client_interface/json/?switcher=GetSearchResults&page_size=10&page_num=2
```

### Search with Recursive Service Body Filtering
```
https://bmlt.wszf.org/main_server/client_interface/json/?switcher=GetSearchResults&services=5&recursive=1
```

### Get Formats with Filtering
```
https://bmlt.wszf.org/main_server/client_interface/json/?switcher=GetFormats&format_ids=1,2,-3&lang_enum=de
```

### Get Service Bodies with Parent/Child Relationships
```
https://bmlt.wszf.org/main_server/client_interface/json/?switcher=GetServiceBodies&services=5&recursive=1&parents=1
```

### JSONP Callback Example
```
https://bmlt.wszf.org/main_server/client_interface/jsonp/?switcher=GetSearchResults&callback=myCallback
```

### TSML Format Example
```
https://bmlt.wszf.org/main_server/client_interface/tsml/?switcher=GetSearchResults&venue_types=2
```

### Aggregator Mode Example
```
https://bmlt.wszf.org/main_server/client_interface/json/?switcher=GetSearchResults&root_server_ids=1,2&services=5
```

## Response Formats

### JSON Response
All endpoints except GetNAWSDump return JSON data with the following structure:
- Array of objects containing the requested data
- Each object represents a meeting, format, service body, etc.
- Field names correspond to the database schema

### JSONP Response
JSONP responses wrap the JSON data in a callback function:
```javascript
callbackFunction([{"id": 1, "name": "Meeting Name"}, ...]);
```
- Default callback name is 'callback' if not specified
- Useful for cross-origin requests from web browsers

### TSML Response
TSML (The Semantic Meeting List) format returns structured XML-like data optimized for meeting list applications:
- Only available for GetSearchResults endpoint
- Provides semantic markup for meeting data
- Includes format information and metadata

### CSV Response
GetNAWSDump returns CSV data suitable for import into NAWS (Narcotics Anonymous World Services) systems:
- Fixed column structure with specific field mappings
- Includes deleted meetings marked with 'D' in Delete column
- Optimized for NAWS database import requirements

## Error Handling

### Common Error Responses

#### Invalid Format/Endpoint Combinations
- **422 Unprocessable Entity**: "GetNAWSDump is only valid for csv format."
- **422 Unprocessable Entity**: "Invalid data format or endpoint name. Valid endpoint names for the json and jsonp data formats are: [list]. Valid endpoint names for the csv format are: GetNAWSDump. Valid endpoint names for the tsml format are: GetSearchResults."

#### Missing Required Parameters
- **400 Bad Request**: Missing required parameters for GetFieldValues (meeting_key)
- **400 Bad Request**: Missing required parameters for GetNAWSDump (sb_id)
- **400 Bad Request**: "A google api key must be configured to use StringSearchIsAnAddress."

#### Server Errors
- **500 Internal Server Error**: Geocoding failures when using StringSearchIsAnAddress
- **500 Internal Server Error**: "There was a problem geocoding the SearchString."
- **500 Internal Server Error**: "There was a problem parsing the geocoding response."

#### Aggregator Mode Restrictions
- **Empty Response**: When in aggregator mode, GetSearchResults requires at least one filter parameter
- **Empty Response**: When geographic search parameters are incomplete (missing lat/long or radius)

### Error Response Format
- JSON endpoints return error messages in the response body
- HTTP status codes indicate the type of error
- Invalid parameters typically result in empty arrays `[]` rather than error messages

## Best Practices

1. **URL Encoding**: Always URL-encode parameter values, especially for text searches
2. **Parameter Validation**: Validate numeric parameters (IDs, coordinates, times) before making requests
3. **Rate Limiting**: Be respectful of server resources when making multiple requests
4. **Caching**: Consider caching responses for frequently accessed data like formats and service bodies
5. **Error Handling**: Implement proper error handling for network issues and invalid responses

## Language Support

The API supports multiple languages:
- English (en)
- German (de)
- Danish (dk)
- Spanish (es)
- Persian/Farsi (fa)
- French (fr)
- Italian (it)
- Polish (pl)
- Portuguese (pt)
- Swedish (sv)

Language-specific format names and descriptions are available through the GetFormats endpoint with the `lang_enum` parameter.

## Integration Notes

- The API is designed for programmatic access and can be integrated into web applications, mobile apps, and other systems
- Responses are typically small and suitable for real-time applications
- The semantic workshop application (https://semantic.bmlt.app) provides an interactive interface for building and testing API calls
- All endpoints support CORS for web-based applications
