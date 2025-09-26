import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { FC } from 'react';

export type MarkDownTextProps = {
  className?: string | undefined;
  markdown: string;
};

export const MarkDownText: FC<MarkDownTextProps> = ({ className, markdown }) => {
  return (
    <span className={className}>
      <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
    </span>
  );
};
