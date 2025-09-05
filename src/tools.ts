import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { BmltApiClient } from './client.js';

export function createBmltTools(_client: BmltApiClient): Tool[] {
  return [
    // GetSearchResults tool
    {
      name: 'bmlt_search_meetings',
      description: 'Search for meetings in the BMLT database with various filtering options including published status filtering. For location-based searches, you can use either address strings (which will be automatically geocoded) or specific lat/long coordinates for more reliable results.',
      inputSchema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['json', 'jsonp', 'tsml'],
            default: 'json',
            description: 'Response format'
          },
          meeting_ids: {
            oneOf: [
              { type: 'number' },
              { type: 'array', items: { type: 'number' } }
            ],
            description: 'Specific meeting IDs to include/exclude (negative values exclude)'
          },
          weekdays: {
            oneOf: [
              { type: 'number', minimum: 1, maximum: 7 },
              { type: 'array', items: { type: 'number', minimum: 1, maximum: 7 } }
            ],
            description: 'Days of week (1=Sunday, 2=Monday, ..., 7=Saturday)'
          },
          venue_types: {
            oneOf: [
              { type: 'number', minimum: 1, maximum: 3 },
              { type: 'array', items: { type: 'number', minimum: 1, maximum: 3 } }
            ],
            description: 'Venue types (1=In-person, 2=Virtual, 3=Hybrid)'
          },
          formats: {
            oneOf: [
              { type: 'number' },
              { type: 'array', items: { type: 'number' } }
            ],
            description: 'Format IDs to include/exclude'
          },
          services: {
            oneOf: [
              { type: 'number' },
              { type: 'array', items: { type: 'number' } }
            ],
            description: 'Service body IDs to include/exclude'
          },
          recursive: {
            type: 'number',
            enum: [0, 1],
            description: 'Include child service bodies (1) or not (0)'
          },
          SearchString: {
            type: 'string',
            description: 'Text to search for in meeting data, or an address for location searches'
          },
          StringSearchIsAnAddress: {
            type: 'number',
            enum: [0, 1],
            description: 'Treat search string as address (1) or text (0). Address searches are automatically geocoded for reliability.'
          },
          SearchStringRadius: {
            type: 'number',
            description: 'Search radius in miles for address searches (default: 25)'
          },
          lat_val: {
            type: 'number',
            description: 'Latitude for geographic search'
          },
          long_val: {
            type: 'number',
            description: 'Longitude for geographic search'
          },
          geo_width: {
            type: 'number',
            description: 'Search radius in miles'
          },
          geo_width_km: {
            type: 'number',
            description: 'Search radius in kilometers'
          },
          sort_results_by_distance: {
            type: 'number',
            enum: [0, 1],
            description: 'Sort results by distance from coordinates'
          },
          StartsAfterH: {
            type: 'number',
            minimum: 0,
            maximum: 23,
            description: 'Meetings starting after hour (0-23)'
          },
          StartsAfterM: {
            type: 'number',
            minimum: 0,
            maximum: 59,
            description: 'Meetings starting after minute (0-59)'
          },
          StartsBeforeH: {
            type: 'number',
            minimum: 0,
            maximum: 23,
            description: 'Meetings starting before hour (0-23)'
          },
          StartsBeforeM: {
            type: 'number',
            minimum: 0,
            maximum: 59,
            description: 'Meetings starting before minute (0-59)'
          },
          page_size: {
            type: 'number',
            minimum: 1,
            description: 'Number of results per page'
          },
          page_num: {
            type: 'number',
            minimum: 1,
            description: 'Page number (starts at 1)'
          },
          lang_enum: {
            type: 'string',
            description: 'Language code for format names'
          },
          advanced_published: {
            oneOf: [
              { type: 'number', enum: [0, -1] },
              { type: 'string' }
            ],
            description: 'Published status filtering: no parameter = show only published meetings (default), 0 = show all meetings, -1 = show only unpublished meetings'
          }
        }
      }
    },

    // GetFormats tool
    {
      name: 'bmlt_get_formats',
      description: 'Retrieve available meeting formats from BMLT server',
      inputSchema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['json', 'jsonp'],
            default: 'json',
            description: 'Response format'
          },
          lang_enum: {
            type: 'string',
            description: 'Language code (e.g., "en", "de", "fr")'
          },
          show_all: {
            type: 'number',
            enum: [0, 1],
            description: 'Show all formats (1) or just used ones (0)'
          },
          format_ids: {
            oneOf: [
              { type: 'number' },
              { type: 'array', items: { type: 'number' } }
            ],
            description: 'Specific format IDs to include/exclude'
          },
          key_strings: {
            oneOf: [
              { type: 'string' },
              { type: 'array', items: { type: 'string' } }
            ],
            description: 'Format key strings to filter by'
          }
        }
      }
    },

    // GetServiceBodies tool
    {
      name: 'bmlt_get_service_bodies',
      description: 'Get list of service bodies from BMLT server',
      inputSchema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['json', 'jsonp'],
            default: 'json',
            description: 'Response format'
          },
          services: {
            oneOf: [
              { type: 'number' },
              { type: 'array', items: { type: 'number' } }
            ],
            description: 'Service body IDs to include/exclude'
          },
          recursive: {
            type: 'number',
            enum: [0, 1],
            description: 'Include child service bodies (1) or not (0)'
          },
          parents: {
            type: 'number',
            enum: [0, 1],
            description: 'Include parent service bodies (1) or not (0)'
          }
        }
      }
    },

    // GetChanges tool
    {
      name: 'bmlt_get_changes',
      description: 'Retrieve meeting changes within a date range',
      inputSchema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['json', 'jsonp'],
            default: 'json',
            description: 'Response format'
          },
          start_date: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            description: 'Start date in YYYY-MM-DD format'
          },
          end_date: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            description: 'End date in YYYY-MM-DD format'
          },
          meeting_id: {
            type: 'number',
            description: 'Specific meeting ID'
          },
          service_body_id: {
            type: 'number',
            description: 'Service body ID'
          }
        }
      }
    },

    // GetFieldKeys tool
    {
      name: 'bmlt_get_field_keys',
      description: 'Get list of available field keys',
      inputSchema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['json', 'jsonp'],
            default: 'json',
            description: 'Response format'
          }
        }
      }
    },

    // GetFieldValues tool
    {
      name: 'bmlt_get_field_values',
      description: 'Get specific field values for a given field key',
      inputSchema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['json', 'jsonp'],
            default: 'json',
            description: 'Response format'
          },
          meeting_key: {
            type: 'string',
            description: 'The field key to get values for (required)'
          },
          specific_formats: {
            type: 'string',
            description: 'Comma-separated list of format IDs to limit field values to'
          },
          all_formats: {
            type: 'boolean',
            description: 'Include all formats (not just specific ones)'
          }
        },
        required: ['meeting_key']
      }
    },

    // GetNAWSDump tool
    {
      name: 'bmlt_get_naws_dump',
      description: 'Export meeting data in NAWS format (CSV)',
      inputSchema: {
        type: 'object',
        properties: {
          sb_id: {
            type: 'number',
            description: 'Service body ID (required)'
          }
        },
        required: ['sb_id']
      }
    },

    // GetServerInfo tool
    {
      name: 'bmlt_get_server_info',
      description: 'Get server information including version and configuration',
      inputSchema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['json', 'jsonp'],
            default: 'json',
            description: 'Response format'
          }
        }
      }
    },

    // GetCoverageArea tool
    {
      name: 'bmlt_get_coverage_area',
      description: 'Get geographic coverage area information',
      inputSchema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['json', 'jsonp'],
            default: 'json',
            description: 'Response format'
          }
        }
      }
    }
  ];
}

export async function handleToolCall(
  client: BmltApiClient,
  name: string,
  args: any
): Promise<any> {
  const { format = 'json', ...params } = args;

  try {
    switch (name) {
      case 'bmlt_search_meetings':
        return await client.smartSearchResults(params, format);

      case 'bmlt_get_formats':
        return await client.getFormats(params, format);

      case 'bmlt_get_service_bodies':
        return await client.getServiceBodies(params, format);

      case 'bmlt_get_changes':
        return await client.getChanges(params, format);

      case 'bmlt_get_field_keys':
        return await client.getFieldKeys(params, format);

      case 'bmlt_get_field_values':
        return await client.getFieldValues(params, format);

      case 'bmlt_get_naws_dump':
        return await client.getNAWSDump(params);

      case 'bmlt_get_server_info':
        return await client.getServerInfo(params, format);

      case 'bmlt_get_coverage_area':
        return await client.getCoverageArea(params, format);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`Error handling tool call ${name}:`, error);
    throw error;
  }
}
