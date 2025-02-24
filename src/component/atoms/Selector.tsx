import styled from '@emotion/styled';

import type { FC } from 'react';

export type SelectorProps = {
  className?: string;
  options: { value: string; label: string }[] | string[];
  value?: string;
  onChange: (value: string) => void | Promise<void>;
  disabled?: boolean;
};

const Component: FC<SelectorProps> = ({ className, options, value, onChange, disabled }) => {
  return (
    <select className={className} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      {options.map((option, index) => {
        const value = typeof option === 'object' ? option.value : option;
        const label = typeof option === 'object' ? option.label : option;
        return (
          <option key={index} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
};

export const Selector = styled(Component)`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.surface.light};

  &:disabled {
    opacity: 0.5;
  }

  & option {
    padding: 8px;
  }
`;
