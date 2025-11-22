import styled from '@emotion/styled';
import { useCallback, useRef } from 'react';

import type { FC, ChangeEvent } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Text } from '@src/component/atoms/Text';

export type FileInputProps = {
  className?: string;
  accept?: string;
  onChange: (file: File | null) => void;
  buttonText?: string;
  disabled?: boolean;
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
};

const HiddenInput = styled.input`
  display: none;
`;

const Component: FC<FileInputProps> = ({
  className,
  accept,
  onChange,
  buttonText = 'Choose File',
  disabled = false,
  fontSize = 'base',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      onChange(file);
    },
    [onChange],
  );

  return (
    <div className={className}>
      <HiddenInput ref={inputRef} type="file" accept={accept} onChange={handleFileChange} disabled={disabled} />
      <Button scheme="surface" fontSize={fontSize} onClick={handleButtonClick} disabled={disabled}>
        <Text text={buttonText} />
      </Button>
    </div>
  );
};

export const FileInput = styled(Component)`
  display: flex;
  align-items: center;
  gap: 8px;
`;
