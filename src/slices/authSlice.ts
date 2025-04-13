import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { Env } from '@src/modeles/env';
import type { User } from '@src/modeles/user';

import { createClient } from '@src/modeles/qeury';
import { saveToken, saveUser } from '@src/utils/localstrage';

/**
 * Redux の state で管理する認証情報の型
 */
export interface AuthState {
  token: string | null;
  user: User | null;
  ready: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * 初期状態
 * ローカルストレージから既存のトークンとユーザー情報を取得
 */
export const initialState: AuthState = {
  token: null,
  user: null,
  ready: false,
  isLoading: false,
  error: null,
};

/**
 * ログイン時に使用するペイロードの型
 */
export interface LoginPayload {
  env: Env;
  email: string;
  password: string;
}

/**
 * createAsyncThunk を使ってログイン処理を非同期アクションとして定義
 */
export const login = createAsyncThunk('auth/login', async ({ env, email, password }: LoginPayload, { rejectWithValue }) => {
  if (!email || !password) {
    return rejectWithValue('メールアドレスとパスワードを入力してください');
  }
  const query = createClient(env);
  try {
    const res = await query.POST('/api/v0/login', {
      body: { email, password },
    });
    if (res.error) {
      // サーバーからのエラーがある場合は rejectWithValue を利用してエラーメッセージを返す
      return rejectWithValue(res.error.message);
    }
    // ローカルストレージに保存
    saveToken(res.data.accessToken);
    saveUser(res.data.user);
    // 成功時はレスポンスデータを返す
    return res.data;
  } catch {
    return rejectWithValue('ログインに失敗しました');
  }
});

/**
 * authSlice の定義
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.error = null;
      saveToken('');
      saveUser(null);
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setReady(state, action: PayloadAction<boolean>) {
      state.ready = action.payload;
    }
  },
  extraReducers: (builder) => {
    // ログイン開始時の処理
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    // ログイン成功時の処理
    builder.addCase(login.fulfilled, (state, action: PayloadAction<{ accessToken: string; user: User }>) => {
      state.isLoading = false;
      state.token = action.payload.accessToken;
      state.user = action.payload.user;
    });
    // ログイン失敗時の処理
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || action.error.message || 'エラーが発生しました';
    });
  },
});

// ログアウト用のアクションをエクスポート
export const { logout, setToken, setUser, setReady } = authSlice.actions;

// reducer をエクスポート（Redux store に登録してください）
export const authReducer = authSlice.reducer;
