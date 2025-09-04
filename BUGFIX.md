# Bug Fix - September 4, 2025

## Issues Fixed

### 1. Invalid JSON in MCP Protocol Communication
**Problem**: The server was sending `console.log` messages to stdout, which corrupted the MCP protocol JSON communication.
**Solution**: Changed `console.log` to `console.error` in `src/client.ts` line 49 to ensure all non-protocol output goes to stderr.

### 2. BMLT Server Geocoding API Key Issues
**Problem**: The BMLT server at `bmlt.sezf.org` returns "API keys with referer restrictions cannot be used with this API" when performing address-based searches using `StringSearchIsAnAddress=1`.
**Solution**: Implemented automatic geocoding bypass:
- Added `src/geocoding.ts` with OpenStreetMap Nominatim geocoding (no API key required)
- Created `smartSearchResults()` method in `BmltApiClient` that automatically converts address searches to coordinate-based searches
- Updated tool handler to use the smart search method
- Enhanced error handling and fallback mechanisms

## Technical Details

When a user performs an address search (e.g., "Charleston, SC" with `StringSearchIsAnAddress=1`):
1. The system detects this is an address search
2. Checks the in-memory cache for previous geocoding results
3. If not cached, uses OpenStreetMap's Nominatim service to geocode the address to lat/long coordinates
4. Respects Nominatim's 1 request/second rate limit with automatic rate limiting
5. Includes retry logic with exponential backoff for rate limiting and network errors (up to 3 attempts)
6. Caches successful and failed results for 24 hours to avoid repeated API calls
7. Converts the search to use `lat_val`, `long_val`, and `geo_width` parameters instead
8. Removes the problematic `SearchString` and `StringSearchIsAnAddress` parameters
9. If geocoding fails, falls back to text search (`StringSearchIsAnAddress=0`)

## Rate Limiting and Caching Features

- **Rate Limiting**: Automatically enforces 1.1-second minimum intervals between Nominatim requests
- **Retry Logic**: Up to 3 attempts with exponential backoff for rate limiting (429) errors and network errors (5xx, connection issues)
- **Caching**: In-memory cache stores up to 100 geocoding results for 24 hours each
- **Cache Benefits**: Repeated searches for the same location are instant and don't consume API quota

## Files Modified
- `src/client.ts` - Fixed logging and added smart search functionality
- `src/tools.ts` - Updated to use smart search and improved descriptions
- `src/geocoding.ts` - New file for address geocoding functionality

## Testing
- Geocoding: Successfully converts "Charleston, SC" to coordinates (32.7884363, -79.9399309)
- BMLT API: Coordinate-based searches work perfectly with `bmlt.example.org`
- MCP Protocol: Server now responds with valid JSON only

The MCP server should now work reliably for both text searches and location-based searches without encountering the Google API key restrictions.
