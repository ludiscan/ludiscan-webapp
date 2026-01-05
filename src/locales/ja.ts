/**
 * Japanese translations
 */

export const ja = {
  // Common
  common: {
    loading: '読み込み中...',
    processing: '処理中...',
    cancel: 'キャンセル',
    close: '閉じる',
    delete: '削除',
    create: '作成',
    update: '更新',
    edit: '編集',
    save: '保存',
    done: '完了',
    or: 'または',
    never: '未使用',
    email: 'メールアドレス',
    password: 'パスワード',
    name: '名前',
    description: '説明',
  },

  // Login page
  login: {
    title: 'Ludiscanアカウント',
    description: 'すべてのLudiscanサービスとヒートマップツールを管理するためにサインインしてください。',
    continueWithGoogle: 'Googleで続ける',
    signIn: 'サインイン',
    emailPlaceholder: 'example@email.com',
    passwordPlaceholder: 'パスワード',
    success: 'ログインしました',
    errorEmptyFields: 'メールアドレスとパスワードを入力してください',
  },

  // Home/Dashboard page
  home: {
    title: 'ホーム',
    projects: 'プロジェクト',
    createProject: '新規プロジェクト作成',
    searchPlaceholder: 'プロジェクト名で検索...',
    sortOptions: {
      createdDesc: '作成日 (新しい順)',
      createdAsc: '作成日 (古い順)',
      nameAsc: 'プロジェクト名 (A-Z)',
      nameDesc: 'プロジェクト名 (Z-A)',
      updatedDesc: '更新日 (新しい順)',
      updatedAsc: '更新日 (古い順)',
    },
    listView: 'リストビュー',
    cardView: 'カードビュー',
    loadingProjects: 'プロジェクトを読み込み中...',
    fetchError: 'プロジェクト一覧の取得に失敗しました。リトライしてください。',
    noProjects: 'プロジェクトがありません',
    listUpdated: 'プロジェクト一覧を更新しました',
  },

  // Profile page
  profile: {
    title: 'プロフィール',
    basicInfo: '基本情報',
    loadingUser: 'ユーザー情報を読み込み中...',
    userNotAvailable: 'ユーザー情報が利用できません',
    userId: 'ユーザーID',
  },

  // Security page
  security: {
    title: 'セキュリティ設定',
    passwordManagement: 'パスワード管理',
    twoFactorAuth: '2段階認証',
    sessionManagement: 'セッション管理',
    loginHistory: 'ログイン履歴',
    securityInfo: 'セキュリティ情報',
    futureUpdate: 'この機能は今後のアップデートで利用可能になります。',
    apiKeySecurity: 'API-keyは安全に保管してください',
    suspiciousActivity: '不審なアクティビティがあった場合は、すぐにパスワードを変更してください',
  },

  // API Keys page
  apiKeys: {
    title: 'API-key',
    createKey: '+ API-keyを作成',
    loading: 'API-keyを読み込み中...',
    fetchError: 'API-key一覧の取得に失敗しました',
    noApiKeys: 'API-keyがありません',
    enterName: 'API-keyの名前を入力してください',
    created: 'API-keyを作成しました',
    deleted: 'API-keyを削除しました',
    projectAccessUpdated: 'プロジェクトアクセスを更新しました',
  },

  // Project Details
  projectDetails: {
    title: 'プロジェクト詳細',
    sessions: 'セッション',
    members: 'メンバー',
    apiKeys: 'API-key',
    notFound: 'プロジェクトが見つかりません',
  },

  // Sessions Tab
  sessions: {
    searchPlaceholder: 'セッション名、デバイスID、プラットフォームで検索...',
    loading: 'セッションを読み込み中...',
    fetchError: 'セッション一覧の取得に失敗しました',
    noSessions: 'セッションがありません',
  },

  // Members Tab
  members: {
    addMember: '+ メンバーを追加',
    emailAddress: 'メールアドレス',
    role: 'ロール',
    emailPlaceholder: 'member@example.com',
    loading: 'メンバーを読み込み中...',
    fetchError: 'メンバー一覧の取得に失敗しました',
    noMembers: 'メンバーがありません',
    enterEmail: 'メールアドレスを入力してください',
    added: 'メンバーを追加しました',
    deleted: 'メンバーを削除しました',
  },

  // Project Form Modal
  projectForm: {
    createTitle: '新規プロジェクト作成',
    editTitle: 'プロジェクトを編集',
    projectName: 'プロジェクト名',
    namePlaceholder: 'プロジェクト名を入力...',
    descriptionPlaceholder: 'プロジェクトの説明を入力...',
    mode2D: '2Dモード',
    enterName: 'プロジェクト名を入力してください',
    enterDescription: '説明を入力してください',
    projectCreated: 'プロジェクトを作成しました',
    projectUpdated: 'プロジェクトを更新しました',
  },

  // API Key Modals
  apiKeyCreate: {
    title: 'API-keyを作成',
    keyName: 'Key名',
    namePlaceholder: '例: 本番環境用API-key',
    creating: '作成中...',
    successMessage: 'API-keyが作成されました！',
    warning: '今すぐAPI-keyをコピーしてください。再度表示することはできません！',
    yourApiKey: 'あなたのAPI-key',
    copyTooltip: 'クリップボードにコピー',
  },

  apiKeyDetail: {
    title: 'API-key詳細',
    keyId: 'Key ID',
    created: '作成日',
    lastUsed: '最終使用日',
    projects: 'プロジェクト',
    noProjects: 'プロジェクトが割り当てられていません',
  },

  apiKeyDelete: {
    title: 'API-keyを削除',
    confirmMessage: 'API-key "{name}" を削除してよろしいですか？',
    warning: '削除されたAPI-keyは二度と使用できなくなります。',
    deleting: '削除中...',
  },

  // Heatmap Viewer
  heatmap: {
    general: {
      heatmap: 'Heatmap',
      notSelected: '未選択',
      select: '選択',
      view: 'ビュー',
      resetToInitial: '初期位置にリセット',
      sessionFilter: 'セッションフィルター',
      clearFilter: 'フィルター解除',
      filterBySession: 'Session #{id} でフィルター',
      filteringBySession: 'Session {id} でフィルター中',
      backgroundImage: '背景画像',
      change: '変更',
      remove: '削除',
      backgroundScale: '背景スケール',
      backgroundXPosition: '背景X位置',
      backgroundYPosition: '背景Y位置',
      displayOptions: '表示オプション',
      upVector: '上向ベクトル',
      scale: 'スケール',
      showHeatmap: 'ヒートマップを表示',
      opacity: '不透明度',
      type: 'タイプ',
      minThreshold: '最低密度',
      colorScale: 'カラースケール',
      reload: '再読み込み',
    },

    info: {
      projectId: 'project_id:',
      name: 'name:',
      mode: 'mode:',
      export: 'エクスポート',
    },

    map: {
      disabledMessage: 'マップの可視化は3Dモードでのみ利用可能です。',
      switchMessage: 'ツールバーのトグルボタンで3Dモードに切り替えてください。',
      visualizeMap: 'マップを表示',
      addWaypoint: 'ウェイポイントを追加',
    },

    routeCoach: {
      title: 'Route Coach v2',
      generate: '改善ルート生成',
      generating: '生成中…',
      generateTooltip: 'プロジェクトの改善ルートを生成',
      forceTooltip: '既存のタスクを削除して強制的に再生成',
      generatingStatus: '改善ルート生成中…',
      completedStatus: '改善ルート生成完了 (クラスター: {clusters}, 改善案: {routes})',
      failedStatus: '生成失敗: {error}',
      statusPending: '未処理',
      statusProcessing: '処理中',
      statusCompleted: '完了',
      statusFailed: '失敗',
    },

    quickToolbar: {
      fit: 'フィット (0)',
      oneToOne: '1:1',
      zoomIn: 'ズームイン',
      zoomOut: 'ズームアウト',
    },

    settings: {
      title: '設定',
      language: '言語',
      theme: 'テーマ',
      themeMode: 'モード',
      light: 'ライト',
      dark: 'ダーク',
    },
  },

  // Pagination
  pagination: {
    first: '最初のページへ',
    previous: '前のページへ',
    next: '次のページへ',
    last: '最後のページへ',
  },

  // Menu names (display text)
  menus: {
    info: '情報',
    general: '一般',
    map: 'マップ',
    hotspot: 'ホットスポット',
    eventlog: 'イベントログ',
    fieldObject: 'オブジェクト',
    timeline: 'タイムライン',
    routecoach: 'ルートコーチ',
    aggregation: '集計',
    more: 'その他',
    eventDetail: 'イベント詳細',
    aiSummary: 'AI要約',
  },
};

export type TranslationKeys = typeof ja;
