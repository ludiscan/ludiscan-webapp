import { Navigate, NavLink } from 'react-router-dom';

import type { PagePathWithParams } from '@/modeles/paths.ts';
import type { FC } from 'react';
import type { NavLinkProps } from 'react-router-dom';

// --------------------------
// 1. ヘルパー型: params 配列からオブジェクト型を生成
// --------------------------
export type ExtractParams<T extends readonly string[]> = {
  [K in T[number]]: string;
};

// --------------------------
// 2. RouterNavigate の Props 型定義
// --------------------------
// 「to」に指定されたパスに対応するルート定義を抽出して、
// もしそのルート定義に params プロパティが存在するなら必須、
// 存在しなければ params は不要とする。
export type RouterNavigateProps<Path extends PagePathWithParams['path']> =
  // Extract<...> により、「to === Path」のルート定義を取り出す。
  Extract<PagePathWithParams, { path: Path }> extends { params: readonly string[] }
    ? {
        to: Path;
        // ルート定義の params 配列から必要なパラメータを抽出した型を要求する
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        params: ExtractParams<Extract<PagePathWithParams, { path: Path }>['params']>;
      }
    : {
        to: Path;
      };

// --------------------------
// 3. RouterNavigate コンポーネントの実装
// --------------------------
export function RouterNavigate<Path extends PagePathWithParams['path']>(props: RouterNavigateProps<Path>) {
  const { to } = props;
  // params プロパティが存在する場合は URL の :○○ を置換する
  const params = 'params' in props ? (props.params as Record<string, string> | undefined) : undefined;
  const resolvedPath = params ? Object.keys(params).reduce((path, key) => path.replace(`:${key}`, params[key]), to) : to;
  return <Navigate to={resolvedPath} />;
}

export const RouterNavLink: FC<NavLinkProps & RouterNavigateProps<PagePathWithParams['path']>> = (props) => {
  const { to } = props;
  // params プロパティが存在する場合は URL の :○○ を置換する
  const params = 'params' in props ? (props.params as Record<string, string> | undefined) : undefined;
  const resolvedPath = params ? Object.keys(params).reduce((path, key) => path.replace(`:${key}`, params[key]), to) : to;
  return <NavLink {...props} to={resolvedPath} />;
};
