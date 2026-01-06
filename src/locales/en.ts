/**
 * English translations
 */

export const en = {
  // Common
  common: {
    loading: 'Loading...',
    processing: 'Processing...',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    create: 'Create',
    update: 'Update',
    edit: 'Edit',
    save: 'Save',
    done: 'Done',
    or: 'or',
    never: 'Never',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    description: 'Description',
  },

  // Login page
  login: {
    title: 'Ludiscan Account',
    description: 'Sign in to manage all Ludiscan services and heatmap tools.',
    continueWithGoogle: 'Continue with Google',
    signIn: 'Sign in',
    emailPlaceholder: 'example@email.com',
    passwordPlaceholder: 'password',
    success: 'Login success',
    errorEmptyFields: 'Please enter email and password',
  },

  // Home/Dashboard page
  home: {
    title: 'Home',
    projects: 'Projects',
    createProject: 'Create New Project',
    searchPlaceholder: 'Search by project name...',
    sortOptions: {
      createdDesc: 'Created date (newest)',
      createdAsc: 'Created date (oldest)',
      nameAsc: 'Project name (A-Z)',
      nameDesc: 'Project name (Z-A)',
      updatedDesc: 'Updated (newest)',
      updatedAsc: 'Updated (oldest)',
    },
    listView: 'List View',
    cardView: 'Card View',
    loadingProjects: 'Loading projects...',
    fetchError: 'Failed to fetch projects. Please retry.',
    noProjects: 'No projects',
    listUpdated: 'Project list updated',
  },

  // Profile page
  profile: {
    title: 'Profile',
    basicInfo: 'Basic Information',
    loadingUser: 'Loading user information...',
    userNotAvailable: 'User information not available',
    userId: 'User ID',
  },

  // Security page
  security: {
    title: 'Security Settings',
    passwordManagement: 'Password Management',
    twoFactorAuth: 'Two-Factor Authentication',
    sessionManagement: 'Session Management',
    loginHistory: 'Login History',
    securityInfo: 'Security Information',
    futureUpdate: 'This feature will be available in a future update.',
    apiKeySecurity: 'Keep your API keys secure',
    suspiciousActivity: 'If you notice suspicious activity, change your password immediately',
  },

  // API Keys page
  apiKeys: {
    title: 'API Keys',
    createKey: '+ Create Key',
    loading: 'Loading API keys...',
    fetchError: 'Failed to fetch API keys',
    noApiKeys: 'No API keys',
    enterName: 'Please enter API key name',
    created: 'API key created',
    deleted: 'API key deleted',
    projectAccessUpdated: 'Project access updated',
  },

  // Project Details
  projectDetails: {
    title: 'Project Details',
    sessions: 'Sessions',
    members: 'Members',
    apiKeys: 'API Keys',
    notFound: 'Project not found',
  },

  // Sessions Tab
  sessions: {
    searchPlaceholder: 'Search by session name, device ID, platform...',
    loading: 'Loading sessions...',
    fetchError: 'Failed to fetch sessions',
    noSessions: 'No sessions',
  },

  // Members Tab
  members: {
    addMember: '+ Add Member',
    emailAddress: 'Email Address',
    role: 'Role',
    emailPlaceholder: 'member@example.com',
    loading: 'Loading members...',
    fetchError: 'Failed to fetch members',
    noMembers: 'No members',
    enterEmail: 'Please enter email address',
    added: 'Member added',
    deleted: 'Member deleted',
  },

  // Project Form Modal
  projectForm: {
    createTitle: 'Create New Project',
    editTitle: 'Edit Project',
    projectName: 'Project Name',
    namePlaceholder: 'Enter project name...',
    descriptionPlaceholder: 'Enter project description...',
    mode2D: '2D Mode',
    enterName: 'Please enter project name',
    enterDescription: 'Please enter description',
    projectCreated: 'Project created',
    projectUpdated: 'Project updated',
  },

  // API Key Modals
  apiKeyCreate: {
    title: 'Create API Key',
    keyName: 'Key Name',
    namePlaceholder: 'e.g., Production API Key',
    creating: 'Creating...',
    successMessage: 'API Key created successfully!',
    warning: "Make sure to copy your API key now. You won't be able to see it again!",
    yourApiKey: 'Your API Key',
    copyTooltip: 'Copy to clipboard',
  },

  apiKeyDetail: {
    title: 'API Key Details',
    keyId: 'Key ID',
    created: 'Created',
    lastUsed: 'Last Used',
    projects: 'Projects',
    noProjects: 'No projects assigned',
  },

  apiKeyDelete: {
    title: 'Delete API Key',
    confirmMessage: 'Are you sure you want to delete API key "{name}"?',
    warning: 'Deleted API keys cannot be used again.',
    deleting: 'Deleting...',
  },

  // Heatmap Viewer
  heatmap: {
    general: {
      heatmap: 'Heatmap',
      notSelected: 'Not selected',
      select: 'Select',
      view: 'View',
      resetToInitial: 'Reset to initial',
      sessionFilter: 'Select',
      clearFilter: 'Clear Filter',
      filterBySession: 'by Session #{id}',
      filteringBySession: 'by Session {id}',
      backgroundImage: 'Background',
      change: 'Change',
      remove: 'Remove',
      backgroundScale: 'Background Scale',
      backgroundXPosition: 'Background X Position',
      backgroundYPosition: 'Background Y Position',
      displayOptions: 'Display Options',
      upVector: 'Up Vector',
      scale: 'Scale',
      showHeatmap: 'Heatmap',
      opacity: 'Opacity',
      type: 'Type',
      minThreshold: 'Min Density',
      colorScale: 'Color Scale',
      reload: 'Reload',
    },

    info: {
      projectId: 'Project ID',
      name: 'Name',
      mode: 'Mode',
      description: 'Description',
      export: 'Export',
      projectSection: 'Project Info',
      productSection: 'Application Info',
      version: 'Version',
      author: 'Author',
      documentation: 'Documentation',
      sourceCode: 'Source Code',
      viewOrg: 'GitHub Org',
      viewSource: 'View on GitHub',
      noDescription: 'No description',
    },

    map: {
      disabledMessage: 'Map visualization is only available in 3D mode.',
      switchMessage: 'Switch to 3D mode using the toggle button in the toolbar.',
      visualizeMap: 'Visualize Map',
      addWaypoint: 'Add Waypoint',
    },

    routeCoach: {
      title: 'Route Coach v2',
      generate: 'Generate Improvement Routes',
      generating: 'Generating…',
      generateTooltip: 'Generate improvement routes for project',
      forceTooltip: 'Force regenerate by deleting existing task',
      generatingStatus: 'Generating improvement routes…',
      completedStatus: 'Route generation completed (Clusters: {clusters}, Routes: {routes})',
      failedStatus: 'Generation failed: {error}',
      statusPending: 'Pending',
      statusProcessing: 'Processing',
      statusCompleted: 'Completed',
      statusFailed: 'Failed',
    },

    quickToolbar: {
      fit: 'Fit (0)',
      oneToOne: '1:1',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
    },

    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      themeMode: 'Mode',
      light: 'Light',
      dark: 'Dark',
    },

    hotspot: {
      visible: 'Visible',
      cellRadius: 'Cell Radius',
      displayCount: 'Display Count',
      duplication: 'Duplication',
    },

    eventLog: {
      title: 'Event Log',
      filter: 'Filter',
      player: 'Player',
      keys: 'Event Log Keys',
    },

    fieldObject: {
      title: 'Field Objects',
      visible: 'Visible',
      hvqlQuery: 'HVQL Query',
      types: 'Object Types',
    },

    timeline: {
      visibility: 'Visibility',
      session: 'Session',
      player: 'Player',
      viewSessionDetails: 'View Session Details',
      selectProjectAndSession: 'Please select project and session',
      filterQuery: 'Filter Query',
      search: 'Search',
      vqlGuideTitle: 'VQL Guide (Heatmap View Query Language)',
    },

    aggregation: {
      title: 'Aggregation',
      filter: 'Filter',
      clearFilter: 'Clear Filter',
      platform: 'Platform',
      all: 'All',
      appVersion: 'App Version',
      status: 'Status',
      playing: 'Playing',
      finished: 'Finished',
      showAdvancedFilters: 'Show Advanced Filters',
      hideAdvancedFilters: 'Hide Advanced Filters',
      startDateFrom: 'Start Date (From)',
      startDateTo: 'Start Date (To)',
      metadataKey: 'Metadata Key',
      selectPlaceholder: 'Select...',
      metadataValue: 'Metadata Value',
      valuePlaceholder: 'Enter value...',
      queryFilter: 'Query Filter',
      queryExample: 'e.g., platform:Android is:finished',
      selectNumericField: 'Select numeric field to aggregate',
      selectFieldPlaceholder: 'Select field...',
      add: 'Add',
      noNumericFields: 'No numeric fields available',
      selectedFields: 'Selected Fields',
      clear: 'Clear',
      removeField: 'Remove',
      aggregating: 'Aggregating...',
      runAggregation: 'Run Aggregation',
      filterApplied: '* Filter conditions will be applied',
      results: 'Results',
      total: 'Total',
      fieldAggregation: 'Field Aggregation',
      field: 'Field',
      count: 'Count',
      sum: 'Sum',
      avg: 'Average',
      min: 'Min',
      max: 'Max',
    },

    more: {
      allFeatures: 'All Features',
    },
  },

  // Pagination
  pagination: {
    first: 'Go to first page',
    previous: 'Go to previous page',
    next: 'Go to next page',
    last: 'Go to last page',
  },

  // Menu names (display text)
  menus: {
    info: 'Info',
    general: 'General',
    map: 'Map',
    hotspot: 'Hotspot',
    eventlog: 'Event Log',
    fieldObject: 'Objects',
    timeline: 'Timeline',
    routecoach: 'Route Coach',
    aggregation: 'Aggregation',
    more: 'More',
    eventDetail: 'Event Detail',
    aiSummary: 'AI Summary',
  },
};
