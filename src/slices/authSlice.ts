import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@src/modeles/user';

import { saveUser } from '@src/utils/localstrage';

/**
 * Redux の state で管理する認証情報の型
 *
 * NOTE: トークンはhttpOnly cookieに保存されるため、クライアント側では管理しません（XSS保護）
 */
export interface AuthState {
  user: User | null;
  ready: boolean;
  isLoading: boolean;
  error: string | null;
  csrfToken: string | null; // CSRF保護用トークン（httpOnlyではない）
}

/**
 * 初期状態
 * ユーザー情報はlocalStorageから取得可能だが、トークンはhttpOnly cookieで管理
 */
export const initialState: AuthState = {
  user: null,
  ready: false,
  isLoading: false,
  error: null,
  csrfToken: null,
};

/**
 * ログイン時に使用するペイロードの型
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * createAsyncThunk を使ってログイン処理を非同期アクションとして定義
 *
 * 新しい実装：
 * - Next.js API route (/api/auth/login) 経由で認証
 * - トークンはhttpOnly cookieとして安全に保存される
 * - クライアント側ではユーザー情報とCSRFトークンのみを受け取る
 */
export const login = createAsyncThunk('auth/login', async ({ email, password }: LoginPayload, { rejectWithValue }) => {
  if (!email || !password) {
    return rejectWithValue('メールアドレスとパスワードを入力してください');
  }

  try {
    // Next.js API route経由で認証（httpOnly cookieを設定してくれる）
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // cookieを含める
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'ログインに失敗しました' }));
      return rejectWithValue(errorData.error || 'ログインに失敗しました');
    }

    const data = await res.json();

    // ユーザー情報をlocalStorageに保存（トークンは保存しない）
    saveUser(data.user);

    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Auth] Login error:', error);
    return rejectWithValue('ログインに失敗しました');
  }
});

/**
 * セッション確認用の非同期アクション
 *
 * httpOnly cookieからセッション情報を取得し、ユーザーが認証されているかを確認
 */
export const checkSession = createAsyncThunk('auth/checkSession', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include', // cookieを含める
    });

    if (!res.ok) {
      return rejectWithValue('セッションの確認に失敗しました');
    }

    const data = await res.json();

    if (!data.authenticated) {
      return rejectWithValue('認証されていません');
    }

    // ユーザー情報をlocalStorageに保存
    saveUser(data.user);

    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Auth] Session check error:', error);
    return rejectWithValue('セッションの確認に失敗しました');
  }
});

/**
 * ログアウト用の非同期アクション
 *
 * httpOnly cookieをクリアし、ユーザーをログアウト
 */
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // cookieを含める
    });

    if (!res.ok) {
      return rejectWithValue('ログアウトに失敗しました');
    }

    // localStorageからユーザー情報を削除
    saveUser(null);

    return { success: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Auth] Logout error:', error);
    return rejectWithValue('ログアウトに失敗しました');
  }
});

/**
 * authSlice の定義
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    setReady(state, action: PayloadAction<boolean>) {
      state.ready = action.payload;
    },
    setCsrfToken(state, action: PayloadAction<string>) {
      state.csrfToken = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ログイン開始時の処理
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    // ログイン成功時の処理
    builder.addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; csrfToken: string }>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.csrfToken = action.payload.csrfToken;
      state.error = null;
    });
    // ログイン失敗時の処理
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || action.error.message || 'エラーが発生しました';
    });

    // セッション確認開始時の処理
    builder.addCase(checkSession.pending, (state) => {
      state.isLoading = true;
    });
    // セッション確認成功時の処理
    builder.addCase(checkSession.fulfilled, (state, action: PayloadAction<{ user: User; authenticated: boolean }>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.ready = true;
      state.error = null;
    });
    // セッション確認失敗時の処理
    builder.addCase(checkSession.rejected, (state) => {
      state.isLoading = false;
      state.user = null;
      state.ready = true;
      // セッションチェックの失敗はエラーとして表示しない（ログインしていないだけ）
    });

    // ログアウト開始時の処理
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    // ログアウト成功時の処理
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.user = null;
      state.csrfToken = null;
      state.error = null;
    });
    // ログアウト失敗時の処理
    builder.addCase(logout.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || action.error.message || 'ログアウトに失敗しました';
    });
  },
});

// アクションをエクスポート
export const { setUser, setReady, setCsrfToken, clearError } = authSlice.actions;

// reducer をエクスポート（Redux store に登録してください）
export const authReducer = authSlice.reducer;
