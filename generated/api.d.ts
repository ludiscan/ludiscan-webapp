/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['AppController_getHello'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/robots.txt': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['AppController_getRobots'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/users': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** すべてのユーザーを取得 */
    get: operations['UsersController_findAll'];
    put?: never;
    /** ユーザーを作成 */
    post: operations['UsersController_create'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/users/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 特定のユーザーを取得 */
    get: operations['UsersController_findOne'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/login': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['LoginController_login'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/login/profile': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['LoginController_getProfile'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/projects': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get all projects */
    get: operations['ProjectsController_findAll'];
    put?: never;
    /** Create a project */
    post: operations['ProjectsController_create'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/projects/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete a project */
    delete: operations['ProjectsController_delete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/projects/{id}/meta_fields': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List meta data keys */
    get: operations['ProjectsController_getMetaDataKeys'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/projects/{id}/meta_fields/{key}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get meta data */
    get: operations['ProjectsController_getMetaData'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/projects/{project_id}/play_session': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get all play sessions */
    get: operations['PlaySessionController_findAll'];
    put?: never;
    /** Create a play session */
    post: operations['PlaySessionController_create'];
    /** Delete all play sessions */
    delete: operations['PlaySessionController_deleteAll'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/projects/{project_id}/play_session/{session_id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a play session */
    get: operations['PlaySessionController_findOne'];
    /** Update a play session */
    put: operations['PlaySessionController_update'];
    post?: never;
    /** Delete a play session */
    delete: operations['PlaySessionController_delete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/projects/{project_id}/play_session/{session_id}/finish': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Finish a play session */
    post: operations['PlaySessionController_finish'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/projects/{project_id}/play_session/calc_number_field': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Calculate number field */
    post: operations['PlaySessionController_calcNumberField'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/projects/{project_id}/play_session/{session_id}/player_position_log': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get player position logs */
    get: operations['PlayerPositionLogController_get'];
    put?: never;
    /** Upload binary player data */
    post: operations['PlayerPositionLogController_post'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/heatmap/projects/{project_id}/play_session/{session_id}/tasks': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create heatmap calculation task */
    post: operations['HeatmapController_createSessionTask'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/heatmap/projects/{project_id}/tasks': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create heatmap calculation task for project */
    post: operations['HeatmapController_createProjectTask'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/heatmap/tasks/{task_id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get heatmap calculation task */
    get: operations['HeatmapController_getTask'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/heatmap/tasks/{task_id}/maps': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get heatmap map names */
    get: operations['HeatmapController_getTaskMapNames'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/heatmap/map_data/{map_name}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get heatmap map data */
    get: operations['HeatmapController_getMapData'];
    put?: never;
    /** ファイルアップロードエンドポイント */
    post: operations['HeatmapController_postMapData'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v0/database/backup': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['BackupController_backup'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    UserResponseDto: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    CreateUserDto: {
      /** @example name */
      name?: string;
      /** @example password */
      password: string;
      email: string;
    };
    LoginUserDto: {
      /** @example password */
      password: string;
      email: string;
    };
    LoginResponseDto: {
      accessToken: string;
      user: components['schemas']['UserResponseDto'];
    };
    ProjectResponseDto: {
      id: number;
      name: string;
      description: string;
      /** Format: date-time */
      createdAt: string;
      user?: components['schemas']['UserResponseDto'] | null;
    };
    CreateProjectDto: {
      /** @example name */
      name: string;
      /** @example description */
      description: string;
    };
    DefaultSuccessResponse: {
      /** @example true */
      success: boolean;
      /** @example message */
      message: string | null;
    };
    CalcFieldResponseDto: {
      /** @example field */
      fields: string[];
    };
    GetMetaDataDto: {
      values: string[];
    };
    PlaySessionResponseDto: {
      sessionId: number;
      projectId: number;
      name: string;
      deviceId: string | null;
      /** @example platform */
      platform: string | null;
      /** @example app_version */
      appVersion: string | null;
      /** @example meta_data */
      metaData: Record<string, never> | null;
      /**
       * Format: date-time
       * @example start_time
       */
      startTime: string;
      /**
       * Format: date-time
       * @example end_time
       */
      endTime: string | null;
      /** @example is_playing */
      isPlaying: boolean;
    };
    CreatePlaySessionDto: {
      name: string;
      deviceId?: string | null;
      platform?: string | null;
      appVersion?: string | null;
      metaData?: Record<string, never> | null;
    };
    UpdatePlaySessionDto: {
      name?: string;
      deviceId?: string | null;
      platform?: string | null;
      appVersion?: string | null;
      metaData?: Record<string, never> | null;
    };
    CalcFieldRequestDto: {
      /** @example field */
      field: string;
    };
    CalcNumberFieldDto: {
      min: number;
      max: number;
      avg: number;
    };
    PlayPositionLogDto: {
      /**
       * @description Player identifier
       * @example 1
       */
      player: number;
      x: number;
      y: number;
      z?: number | null;
      offset_timestamp: number;
      location?: string | null;
    };
    CreateHeatmapDto: {
      /**
       * @description Heatmap width
       * @example 300
       */
      stepSize?: number;
      /**
       * @description Whether to display the Z-axis
       * @example false
       */
      zVisible?: boolean;
    };
    HeatMapTaskResultListItem: {
      /**
       * @description X
       * @example 0
       */
      x: number;
      /**
       * @description Y
       * @example 0
       */
      y: number;
      /**
       * @description Z
       * @example 0
       */
      z?: number;
      /**
       * @description Density
       * @example 0
       */
      density: number;
    };
    HeatmapTaskDto: {
      /**
       * @description Task ID
       * @example 1
       */
      taskId: number;
      /**
       * @description Project
       * @example {
       *       "id": 1,
       *       "name": "Project 1",
       *       "description": "Project 1 description",
       *       "createdAt": "2021-01-01T00:00:00.000Z"
       *     }
       */
      project: components['schemas']['ProjectResponseDto'];
      /**
       * @description Session
       * @example {
       *       "sessionId": 0,
       *       "projectId": 0,
       *       "name": "string",
       *       "deviceId": "string",
       *       "platform": "platform",
       *       "appVersion": "app_version",
       *       "metaData": "meta_data",
       *       "startTime": "2021-01-01T00:00:00.000Z",
       *       "endTime": "2021-01-01T00:00:00.000Z",
       *       "isPlaying": true
       *     }
       */
      session?: components['schemas']['PlaySessionResponseDto'];
      /**
       * @description Step size
       * @example 200
       */
      stepSize: number;
      /**
       * @description Z visible
       * @example true
       */
      zVisible: boolean;
      /**
       * @description Status
       * @example completed
       * @enum {string}
       */
      status: 'pending' | 'processing' | 'completed' | 'failed';
      /**
       * @description Result list
       * @example [
       *       {
       *         "x": 0,
       *         "y": 0,
       *         "z": 0,
       *         "density": 0
       *       }
       *     ]
       */
      result?: components['schemas']['HeatMapTaskResultListItem'][] | null;
      /**
       * Format: date-time
       * @description Created at
       * @example 2021-01-01T00:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @description Updated at
       * @example 2021-01-01T00:00:00.000Z
       */
      updatedAt: string;
    };
    GetMapsDto: {
      maps: string[];
    };
    DefaultErrorResponse: {
      /** @example 400 */
      code: number;
      /** @example Bad Request */
      message: string;
      /** @example Invalid input data */
      error?: string | null;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  AppController_getHello: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  AppController_getRobots: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  UsersController_findAll: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description 成功 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['UserResponseDto'][];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  UsersController_create: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateUserDto'];
      };
    };
    responses: {
      /** @description 成功 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['UserResponseDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  UsersController_findOne: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description 成功 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['UserResponseDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  LoginController_login: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['LoginUserDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['LoginResponseDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  LoginController_getProfile: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['UserResponseDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  ProjectsController_findAll: {
    parameters: {
      query?: {
        limit?: number;
        offset?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProjectResponseDto'][];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  ProjectsController_create: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateProjectDto'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultSuccessResponse'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  ProjectsController_delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultSuccessResponse'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  ProjectsController_getMetaDataKeys: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CalcFieldResponseDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  ProjectsController_getMetaData: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: number;
        key: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['GetMetaDataDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  PlaySessionController_findAll: {
    parameters: {
      query?: {
        limit?: number;
        offset?: number;
        isFinished?: boolean;
      };
      header?: never;
      path: {
        project_id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PlaySessionResponseDto'][];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  PlaySessionController_create: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        project_id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreatePlaySessionDto'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PlaySessionResponseDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  PlaySessionController_deleteAll: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        project_id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PlaySessionResponseDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  PlaySessionController_findOne: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        project_id: number;
        session_id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PlaySessionResponseDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  PlaySessionController_update: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        project_id: number;
        session_id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdatePlaySessionDto'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PlaySessionResponseDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  PlaySessionController_delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        project_id: number;
        session_id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  PlaySessionController_finish: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        project_id: number;
        session_id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PlaySessionResponseDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  PlaySessionController_calcNumberField: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        project_id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CalcFieldRequestDto'];
      };
    };
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CalcNumberFieldDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  PlayerPositionLogController_get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        project_id: number;
        session_id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Success */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PlayPositionLogDto'][];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  PlayerPositionLogController_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        project_id: number;
        session_id: number;
      };
      cookie?: never;
    };
    /** @description Binary data containing meta information and player positions */
    requestBody: {
      content: {
        'multipart/form-data': {
          /** Format: binary */
          file?: string;
        };
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultSuccessResponse'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  HeatmapController_createSessionTask: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        project_id: number;
        session_id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateHeatmapDto'];
      };
    };
    responses: {
      /** @description Task created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['HeatmapTaskDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  HeatmapController_createProjectTask: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        project_id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateHeatmapDto'];
      };
    };
    responses: {
      /** @description Task created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['HeatmapTaskDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  HeatmapController_getTask: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        task_id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Task details */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['HeatmapTaskDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  HeatmapController_getTaskMapNames: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        task_id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Map names */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['GetMapsDto'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  HeatmapController_getMapData: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        map_name: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Map data */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/octet-stream': string;
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  HeatmapController_postMapData: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        map_name: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'multipart/form-data': {
          /** Format: binary */
          file?: string;
        };
      };
    };
    responses: {
      /** @description Map data uploaded */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultSuccessResponse'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
  BackupController_backup: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DefaultErrorResponse'];
        };
      };
    };
  };
}
