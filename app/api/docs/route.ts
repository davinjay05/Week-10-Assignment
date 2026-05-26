import { NextResponse } from 'next/server'

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'Clock App API',
    version: '1.0.0',
    description: 'Authentication, session management, timer, stopwatch, and world clock API for the Clock App.',
  },
  tags: [
    { name: 'Auth', description: 'Session and authentication endpoints' },
    { name: 'Alarms', description: 'Persistent alarm management (requires session cookie)' },
    { name: 'Timer', description: 'Countdown timer control' },
    { name: 'Stopwatch', description: 'Stopwatch control' },
    { name: 'World Clock', description: 'Timezone management for the world clock' },
  ],
  paths: {
    '/api/alarms': {
      get: {
        tags: ['Alarms'],
        summary: 'List alarms',
        description: 'Returns all alarms for the authenticated user, newest first.',
        responses: {
          '200': {
            description: 'List of alarms',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    alarms: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'clxyz123' },
                          userId: { type: 'string' },
                          time: { type: 'string', example: '2026-05-26T08:00' },
                          label: { type: 'string', example: 'Wake up' },
                          active: { type: 'boolean', example: true },
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Not authenticated' },
        },
      },
      post: {
        tags: ['Alarms'],
        summary: 'Create alarm',
        description: 'Creates a new alarm for the authenticated user.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['time', 'label'],
                properties: {
                  time: { type: 'string', description: 'datetime-local string', example: '2026-05-26T08:00' },
                  label: { type: 'string', example: 'Wake up' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Alarm created', content: { 'application/json': { schema: { type: 'object', properties: { alarm: { type: 'object' } } } } } },
          '400': { description: 'Missing time or label' },
          '401': { description: 'Not authenticated' },
        },
      },
      patch: {
        tags: ['Alarms'],
        summary: 'Toggle alarm active state',
        description: 'Flips the active field of the alarm (active ↔ paused).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['id'], properties: { id: { type: 'string', example: 'clxyz123' } } },
            },
          },
        },
        responses: {
          '200': { description: 'Alarm updated' },
          '401': { description: 'Not authenticated' },
          '404': { description: 'Alarm not found or not owned by user' },
        },
      },
      delete: {
        tags: ['Alarms'],
        summary: 'Delete alarm',
        description: 'Permanently deletes an alarm owned by the authenticated user.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['id'], properties: { id: { type: 'string', example: 'clxyz123' } } },
            },
          },
        },
        responses: {
          '200': { description: 'Alarm deleted', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' }, deleted: { type: 'string' } } } } } },
          '401': { description: 'Not authenticated' },
          '404': { description: 'Alarm not found or not owned by user' },
        },
      },
    },
    '/api/session': {
      post: {
        tags: ['Auth'],
        summary: 'Create session',
        description: 'Verifies a Firebase ID token and sets an httpOnly session cookie.',
        security: [],
        parameters: [
          {
            in: 'header',
            name: 'Authorization',
            required: true,
            schema: { type: 'string', example: 'Bearer <firebase_id_token>' },
            description: 'Firebase ID token prefixed with "Bearer "',
          },
        ],
        requestBody: { required: false, content: {} },
        responses: {
          '200': {
            description: 'Session created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'success' } },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid Authorization header',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { error: { type: 'string', example: 'Unauthorized' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out',
        description: "Clears the session cookie, ending the user's authenticated session.",
        security: [],
        responses: {
          '200': {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string', example: 'Logged out' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/timer': {
      post: {
        tags: ['Timer'],
        summary: 'Control the countdown timer',
        description:
          'Send an action to start, stop, or reset the countdown timer. When starting, you can optionally pass a `duration` in seconds to set the countdown length.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: {
                    type: 'string',
                    enum: ['start', 'stop', 'reset'],
                    description: 'The timer action to perform.',
                    example: 'start',
                  },
                  duration: {
                    type: 'number',
                    description: 'Duration in seconds (only used with action "start"). Must be a positive number.',
                    example: 300,
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Action accepted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    action: { type: 'string', example: 'start' },
                    duration: { type: 'number', example: 300 },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid action or duration',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { error: { type: 'string', example: 'Invalid action. Must be one of: start, stop, reset' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/stopwatch': {
      post: {
        tags: ['Stopwatch'],
        summary: 'Control the stopwatch',
        description: 'Send an action to start, stop, reset, or record a lap on the stopwatch.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: {
                    type: 'string',
                    enum: ['start', 'stop', 'reset', 'lap'],
                    description: 'The stopwatch action to perform.',
                    example: 'start',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Action accepted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    action: { type: 'string', example: 'start' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid action',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { error: { type: 'string', example: 'Invalid action. Must be one of: start, stop, reset, lap' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/worldclock': {
      get: {
        tags: ['World Clock'],
        summary: 'List all available timezones',
        description: 'Returns the full list of cities and their IANA timezone identifiers that can be added to the world clock.',
        security: [],
        responses: {
          '200': {
            description: 'List of available timezone entries',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    zones: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', example: 'Tokyo' },
                          country: { type: 'string', example: 'JP' },
                          tz: { type: 'string', example: 'Asia/Tokyo' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['World Clock'],
        summary: 'Add a timezone to the world clock',
        description: 'Validates a timezone identifier and returns the matching city entry. Use the `tz` values from GET /api/worldclock.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tz'],
                properties: {
                  tz: {
                    type: 'string',
                    description: 'IANA timezone identifier.',
                    example: 'Asia/Tokyo',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Timezone found and returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    zone: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', example: 'Tokyo' },
                        country: { type: 'string', example: 'JP' },
                        tz: { type: 'string', example: 'Asia/Tokyo' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing or invalid tz field',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { error: { type: 'string', example: 'tz is required (IANA timezone string)' } },
                },
              },
            },
          },
          '404': {
            description: 'Timezone not found in the supported list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { error: { type: 'string', example: 'Unknown timezone: Asia/Invalid' } },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['World Clock'],
        summary: 'Remove a timezone from the world clock',
        description: 'Validates and confirms removal of a timezone by its IANA identifier.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tz'],
                properties: {
                  tz: {
                    type: 'string',
                    description: 'IANA timezone identifier to remove.',
                    example: 'Asia/Tokyo',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Timezone removed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    removed: { type: 'string', example: 'Asia/Tokyo' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing tz field',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { error: { type: 'string', example: 'tz is required (IANA timezone string)' } },
                },
              },
            },
          },
          '404': {
            description: 'Timezone not in the supported list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { error: { type: 'string', example: 'Unknown timezone: Asia/Invalid' } },
                },
              },
            },
          },
        },
      },
    },
  },
}

export function GET() {
  return NextResponse.json(spec)
}
