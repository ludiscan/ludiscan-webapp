import { useCallback } from 'react';

import type { Document, ViewContext, ViewStyle } from '@src/utils/vql';

import { compileHVQL } from '@src/utils/vql';

const compileCache = new Map<string, (ctx: ViewContext) => ViewStyle>();
let doc: Document = {};
export function useHVQL() {
  const setDocument = useCallback((document: Document) => {
    doc = document;
  }, []);

  const compile = useCallback((query: string, ctx: ViewContext) => {
    const style = compileCache.get(query) ?? compileHVQL(query, doc);
    compileCache.set(query, style);
    return style(ctx);
  }, []);
  return {
    compile,
    setDocument,
  };
}
