import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import type { User } from '@/modeles/user.ts';
import type { PayloadAction } from '@reduxjs/toolkit';

import { query } from '@/modeles/qeury.ts';
import { getToken, getUser, saveToken, saveUser } from '@/utils/localstrage.ts';

/**
 * Redux の state で管理する認証情報の型
 */
export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * 初期状態
 * ローカルストレージから既存のトークンとユーザー情報を取得
 */
export const initialState: AuthState = {
  token: getToken() || null,
  user: getUser() || null,
  isLoading: false,
  error: null,
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
 */
export const login = createAsyncThunk('auth/login', async ({ email, password }: LoginPayload, { rejectWithValue }) => {
  if (!email || !password) {
    return rejectWithValue('メールアドレスとパスワードを入力してください');
  }
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
export const { logout } = authSlice.actions;

// reducer をエクスポート（Redux store に登録してください）
export const authReducer = authSlice.reducer;
