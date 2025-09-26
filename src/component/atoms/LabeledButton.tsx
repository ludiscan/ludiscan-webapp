import styled from '@emotion/styled';

import type { ButtonProps } from '@src/component/atoms/Button';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';

export type LabeledButtonProps = ButtonProps & {
  label?: string;
  labelAlign?: 'left' | 'center' | 'right';
};

const LabeledButtonBase: FC<LabeledButtonProps> = (props) => {
  const { label, labelAlign = 'left', className } = props;
  if (!label) {
    return <Button {...props} className={className} />;
  }

  return (
    <div className={className} data-align={labelAlign}>
      <span className={`${className}__label`}>{label}</span>
      <Button {...props} className={`${className}__btn`} />
    </div>
  );
};
export const LabeledButton = styled(LabeledButtonBase)`
  & {
    position: relative;
    display: inline-block;
  }

  /* 実ボタン */
  &__btn {
    /* 必要なら余白調整（デフォルトのままで良ければ削除） */
  }

  /* ラベル（ボーダー上に被せる） */
  &__label {
    position: absolute;
    top: 0; /* 上ボーダーの上に乗せる */
    left: 12px; /* 位置はお好みで */
    padding: 0 6px;
    font-size: 12px;
    line-height: 1;
    color: ${({ theme }) => theme.colors.text};
    pointer-events: none; /* クリックはボタンに通す */
    background: ${({ theme }) => theme.colors.surface.main};
    border-radius: 6px; /* 角を少し丸めると自然 */
    transform: translateY(-50%);
  }

  /* ラベルの配置バリエーション */
  &[data-align='center'] &__label {
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &[data-align='right'] &__label {
    right: 12px;
    left: auto;
    transform: translateY(-50%);
  }
`;
