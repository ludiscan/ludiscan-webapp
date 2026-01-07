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
      minThreshold: '表示しきい値',
      colorScale: 'カラースケール',
      reload: '再読み込み',
    },

    info: {
      projectId: 'プロジェクトID',
      name: '名前',
      mode: 'モード',
      description: '説明',
      export: 'エクスポート',
      projectSection: 'プロジェクト情報',
      productSection: 'アプリケーション情報',
      version: 'バージョン',
      author: '開発者',
      documentation: 'ドキュメント',
      sourceCode: 'ソースコード',
      viewOrg: 'GitHub Org',
      viewSource: 'GitHubで見る',
      noDescription: '説明なし',
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

    hotspot: {
      visible: '表示',
      cellRadius: 'セルサイズ',
      displayCount: '表示数',
      duplication: '重複',
    },

    eventLog: {
      title: 'イベントログ',
      filter: 'フィルター',
      player: 'プレイヤー',
      keys: 'イベントログキー',
    },

    fieldObject: {
      title: 'フィールドオブジェクト',
      visible: '表示',
      hvqlQuery: 'HVQLクエリ',
      types: 'オブジェクトタイプ',
    },

    timeline: {
      visibility: '表示',
      session: 'セッション',
      player: 'プレイヤー',
      viewSessionDetails: 'セッション詳細を表示',
      selectProjectAndSession: 'プロジェクトとセッションを選択してください',
      filterQuery: 'フィルタークエリ',
      search: '検索',
      vqlGuideTitle: 'VQLガイド (Heatmap View Query Language)',
    },

    aggregation: {
      title: '集計',
      filter: 'フィルター',
      clearFilter: 'フィルターをクリア',
      platform: 'プラットフォーム',
      all: 'すべて',
      appVersion: 'アプリバージョン',
      status: 'ステータス',
      playing: 'プレイ中',
      finished: '終了',
      showAdvancedFilters: '詳細フィルターを表示',
      hideAdvancedFilters: '詳細フィルターを隠す',
      startDateFrom: '開始日（From）',
      startDateTo: '開始日（To）',
      metadataKey: 'メタデータキー',
      selectPlaceholder: '選択してください',
      metadataValue: 'メタデータ値',
      valuePlaceholder: '値を入力...',
      queryFilter: 'クエリフィルター',
      queryExample: '例: platform:Android is:finished',
      selectNumericField: '数値フィールドを選択して集計',
      selectFieldPlaceholder: 'フィールドを選択...',
      add: '追加',
      noNumericFields: '集計可能な数値フィールドがありません',
      selectedFields: '集計対象フィールド',
      clear: 'クリア',
      removeField: '削除',
      aggregating: '集計中...',
      runAggregation: '集計を実行',
      filterApplied: '※ フィルター条件が適用されます',
      results: '集計結果',
      total: '合計',
      fieldAggregation: 'フィールド別集計',
      field: 'フィールド',
      count: '件数',
      sum: '合計',
      avg: '平均',
      min: '最小',
      max: '最大',
    },

    more: {
      allFeatures: 'すべての機能',
    },
  },

  // Pagination
  pagination: {
    first: '最初のページへ',
    previous: '前のページへ',
    next: '次のページへ',
    last: '最後のページへ',
  },

  // Hints
  hints: {
    welcome: {
      title: 'Heatmapビューワーへようこそ',
      selectLanguage: '言語を選択してください',
      description: 'このツールでは、ゲームプレイデータをヒートマップとして可視化できます。左側のメニューから各機能にアクセスできます。',
      tips: [
        'マウスドラッグでカメラを回転、スクロールでズームできます',
        '左側のアイコンからメニューを開いて設定を変更できます',
        'ツールバーで2D/3Dモードを切り替えられます',
      ],
    },
    menuHeatmap: {
      title: 'ヒートマップ設定',
      description: 'ヒートマップの表示設定を調整できます。',
      tips: ['表示しきい値で低密度のセルを非表示にできます', '不透明度スライダーでヒートマップの透過度を調整', 'カラースケールで色の範囲を変更'],
    },
    menuHotspot: {
      title: 'ホットスポット',
      description: 'プレイヤーの集中エリアをホットスポットとして表示します。',
      tips: ['セルサイズでホットスポットの大きさを調整', '表示数で上位何件を表示するか設定', '重複スキップで近い位置のホットスポットを除外'],
    },
    menuEventlog: {
      title: 'イベントログ',
      description: 'ゲーム内のイベントをマップ上にマーカーとして表示します。',
      tips: ['各イベントタイプごとに色やアイコンをカスタマイズ', 'HVQLスクリプトで詳細なフィルタリングが可能', 'マーカーをクリックして詳細情報を表示'],
    },
    menuRoutecoach: {
      title: 'Route Coach',
      description: 'AIがプレイヤーの動線を分析し、改善ルートを提案します。',
      tips: ['生成ボタンでAI分析を開始', 'クラスターごとに改善ポイントを確認', '提案されたルートはマップ上に表示されます'],
    },
    menuTimeline: {
      title: 'リプレイ',
      description: 'プレイヤーの移動軌跡を時系列で再生できます。',
      tips: ['セッションを選択してプレイヤーを追加', '再生ボタンで移動をアニメーション表示', '複数プレイヤーを同時に表示して比較'],
    },
    menuMap: {
      title: 'マップ設定',
      description: '3Dモデルやマップの表示設定を管理します。',
      tips: ['GLB/GLTF/OBJフォーマットのモデルをアップロード可能', 'モデルの位置や回転を調整', 'ウェイポイントを追加してマップに目印を設置'],
    },
    menuFieldObject: {
      title: 'フィールドオブジェクト',
      description: 'ゲーム内のオブジェクトをマップ上に表示します。',
      tips: ['オブジェクトタイプごとに表示/非表示を切り替え', '色やアイコンをカスタマイズ', 'HVQLでフィルタリング条件を指定'],
    },
    menuAggregation: {
      title: '集計',
      description: 'セッションデータを集計して統計情報を表示します。',
      tips: ['プラットフォームやバージョンでフィルタリング', '数値フィールドの合計・平均・最大・最小を計算', 'クエリフィルターで詳細な条件を指定'],
    },
    dontShowAgain: '次回から表示しない',
    gotIt: 'OK',
  },

  // Menu names (display text)
  menus: {
    info: '情報',
    general: 'ヒートマップ',
    map: 'マップ',
    hotspot: 'ホットスポット',
    eventlog: 'イベントログ',
    fieldObject: 'オブジェクト',
    timeline: 'リプレイ',
    routecoach: 'ルートコーチ',
    aggregation: '集計',
    more: 'その他',
    eventDetail: 'イベント詳細',
    aiSummary: 'AI要約',
  },

  // Accessibility
  accessibility: {
    skipToMainContent: 'メインコンテンツへスキップ',
    mainNavigation: 'メインナビゲーション',
    siteHeader: 'サイトヘッダー',
    mainContent: 'メインコンテンツ',
    closeDialog: 'ダイアログを閉じる',
    loadingComplete: '読み込み完了',
    errorOccurred: 'エラーが発生しました',
    openMenu: 'メニューを開く',
    heatmapCanvas: '3Dヒートマップビジュアライゼーション。マウスで回転、スクロールでズーム、ドラッグで移動。',
    heatmapCanvas2D: '2Dヒートマップビジュアライゼーション。スクロールでズーム、ドラッグで移動。',
    heatmapKeyboardShortcuts: 'キーボードショートカット: 矢印キーでウェイポイント移動、Escで選択解除。',
    dataLoaded: 'ヒートマップデータを読み込みました',
    modeChanged: '表示モードを{mode}に変更しました',
  },
};

export type TranslationKeys = typeof ja;
