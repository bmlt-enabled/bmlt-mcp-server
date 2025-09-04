# BMLT MCP Server

A Model Context Protocol (MCP) server that provides comprehensive access to BMLT (Basic Meeting List Tool) APIs for Narcotics Anonymous meetings data.

## Overview

This MCP server exposes all BMLT Semantic API endpoints as tools, allowing AI assistants to query meeting data, formats, service bodies, changes, and more from any BMLT root server.

## Features

- **Complete API Coverage**: All 9 BMLT Semantic API endpoints
- **Multiple Format Support**: JSON, JSONP, CSV, and TSML formats
- **Type Safety**: Full TypeScript implementation with comprehensive types
- **Error Handling**: Robust error handling with meaningful error messages
- **Validation**: Parameter validation and endpoint compatibility checking
- **Flexible Configuration**: Environment variable configuration

## Available Tools

### 1. `bmlt_search_meetings`
Search for meetings with extensive filtering options.

**Parameters:**
- `format`: Response format (`json`, `jsonp`, `tsml`)
- `meeting_ids`: Specific meeting IDs to include/exclude
- `weekdays`: Days of week (1=Sunday, 2=Monday, ..., 7=Saturday)
- `venue_types`: Venue types (1=In-person, 2=Virtual, 3=Hybrid)
- `formats`: Format IDs to include/exclude
- `services`: Service body IDs to include/exclude
- `recursive`: Include child service bodies
- `SearchString`: Text to search for
- `StringSearchIsAnAddress`: Treat search string as address
- `lat_val`, `long_val`: Geographic coordinates
- `geo_width`, `geo_width_km`: Search radius
- `StartsAfterH`, `StartsAfterM`: Time filtering
- `page_size`, `page_num`: Pagination
- And many more...

### 2. `bmlt_get_formats`
Retrieve available meeting formats.

**Parameters:**
- `format`: Response format (`json`, `jsonp`)
- `lang_enum`: Language code
- `show_all`: Show all formats or just used ones
- `format_ids`: Specific format IDs to filter
- `key_strings`: Format key strings to filter by

### 3. `bmlt_get_service_bodies`
Get list of service bodies.

**Parameters:**
- `format`: Response format (`json`, `jsonp`)
- `services`: Service body IDs to include/exclude
- `recursive`: Include child service bodies
- `parents`: Include parent service bodies

### 4. `bmlt_get_changes`
Retrieve meeting changes within a date range.

**Parameters:**
- `format`: Response format (`json`, `jsonp`)
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `meeting_id`: Specific meeting ID
- `service_body_id`: Service body ID

### 5. `bmlt_get_field_keys`
Get list of available field keys.

**Parameters:**
- `format`: Response format (`json`, `jsonp`)

### 6. `bmlt_get_field_values`
Get specific field values for a given field key.

**Parameters:**
- `format`: Response format (`json`, `jsonp`)
- `meeting_key`: Field key to get values for (required)
- `specific_formats`: Comma-separated format IDs
- `all_formats`: Include all formats

### 7. `bmlt_get_naws_dump`
Export meeting data in NAWS format (CSV only).

**Parameters:**
- `sb_id`: Service body ID (required)

### 8. `bmlt_get_server_info`
Get server information including version and configuration.

**Parameters:**
- `format`: Response format (`json`, `jsonp`)

### 9. `bmlt_get_coverage_area`
Get geographic coverage area information.

**Parameters:**
- `format`: Response format (`json`, `jsonp`)

## Installation

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Install from npm (when published)

```bash
npm install -g bmlt-mcp-server
```

### Install from source

```bash
git clone <repository-url>
cd bmlt-mcp-server
npm install
npm run build
npm install -g .
```

## Configuration

### Environment Variables

- `BMLT_ROOT_SERVER_URL` (required): The base URL of your BMLT root server
- `BMLT_TIMEOUT`: Request timeout in milliseconds (default: 30000)
- `BMLT_USER_AGENT`: Custom user agent string

### Example Configuration

```bash
export BMLT_ROOT_SERVER_URL=https://bmlt.example.org/main_server/
export BMLT_TIMEOUT=60000
export BMLT_USER_AGENT=MyApp-BMLT-MCP/1.0.0
```

## Usage

### Running the Server

```bash
# Using environment variables
BMLT_ROOT_SERVER_URL=https://bmlt.example.org/main_server/ bmlt-mcp-server

# Or if installed from source
BMLT_ROOT_SERVER_URL=https://bmlt.example.org/main_server/ node dist/index.js
```

### Using with Claude Desktop

Add this to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "bmlt": {
      "command": "bmlt-mcp-server",
      "env": {
        "BMLT_ROOT_SERVER_URL": "https://your-bmlt-server.org/main_server/"
      }
    }
  }
}
```

### Using with other MCP clients

The server follows the standard MCP protocol and can be used with any MCP-compatible client.

## Examples

### Search for Virtual Meetings on Weekends

```typescript
// Tool call
{
  "name": "bmlt_search_meetings",
  "arguments": {
    "venue_types": [2], // Virtual only
    "weekdays": [1, 7], // Sunday and Saturday
    "page_size": 10
  }
}
```

### Get All Formats in German

```typescript
// Tool call
{
  "name": "bmlt_get_formats",
  "arguments": {
    "lang_enum": "de",
    "show_all": 1
  }
}
```

### Search Near Geographic Location

```typescript
// Tool call
{
  "name": "bmlt_search_meetings",
  "arguments": {
    "lat_val": 47.6062,
    "long_val": -122.3321,
    "geo_width_km": 10,
    "sort_results_by_distance": 1
  }
}
```

### Get Changes for Last Month

```typescript
// Tool call
{
  "name": "bmlt_get_changes",
  "arguments": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  }
}
```

### Export NAWS Data

```typescript
// Tool call
{
  "name": "bmlt_get_naws_dump",
  "arguments": {
    "sb_id": 123
  }
}
```

## Development

### Setup

```bash
git clone <repository-url>
cd bmlt-mcp-server
npm install
```

### Available Scripts

- `npm run dev`: Run in development mode with hot reload
- `npm run build`: Build for production
- `npm run watch`: Build and watch for changes
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues
- `./build.sh`: Build script with helpful output

### Project Structure

```
src/
├── index.ts          # Main server implementation
├── client.ts         # BMLT API client
├── tools.ts          # MCP tool definitions and handlers
└── types.ts          # TypeScript type definitions
```

## API Reference

### BMLT Semantic API

This server implements all endpoints from the BMLT Semantic API:

- **GetSearchResults**: Meeting search with extensive filtering
- **GetFormats**: Available meeting formats
- **GetServiceBodies**: Service body hierarchy
- **GetChanges**: Meeting change history
- **GetFieldKeys**: Available database fields
- **GetFieldValues**: Field value enumeration
- **GetNAWSDump**: NAWS-compatible CSV export
- **GetServerInfo**: Server configuration and capabilities
- **GetCoverageArea**: Geographic coverage bounds

### Format Support

- **JSON**: Default format for most endpoints
- **JSONP**: JSON with callback for cross-origin requests
- **CSV**: For NAWS export only
- **TSML**: The Semantic Meeting List format for GetSearchResults

### Error Handling

The server provides comprehensive error handling:

- Parameter validation errors
- HTTP request failures
- API-specific errors (missing required parameters, etc.)
- Network timeouts and connectivity issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and ensure builds pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: Report bugs and request features on GitHub
- **Documentation**: BMLT API documentation at https://semantic.bmlt.app
- **Community**: BMLT community forums and Discord

## Related Projects

- [BMLT Root Server](https://github.com/bmlt-enabled/bmlt-root-server)
- [BMLT Semantic Workshop](https://semantic.bmlt.app)
- [Model Context Protocol](https://modelcontextprotocol.io)

## Changelog

### v1.0.0
- Initial release
- Complete BMLT Semantic API coverage
- TypeScript implementation
- Comprehensive error handling
- Full parameter validation
