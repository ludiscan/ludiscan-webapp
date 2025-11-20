import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';

import type { User } from '@src/modeles/user';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Text } from '@src/component/atoms/Text';
import { OutlinedTextField } from '@src/component/molecules/OutlinedTextField';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';
import { DefaultStaleTime } from '@src/modeles/qeury';

type MemberSuggestionInputProps = {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fontSize?: string;
};

const Component: FC<MemberSuggestionInputProps> = ({ className, value, onChange, placeholder, fontSize }) => {
  const { theme } = useSharedTheme();
  const apiClient = useApiClient();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { data: suggestions = [] } = useQuery({
    queryKey: ['users', 'search', value],
    queryFn: async () => {
      if (!value || value.length < 2) return [];
      const { data, error } = await apiClient.GET('/api/v0/users/search', {
        params: {
          query: {
            q: value,
          },
        },
      });
      if (error) return [];
      return data as User[];
    },
    enabled: value.length >= 2,
    staleTime: DefaultStaleTime,
  });

  const handleSelect = (user: User) => {
    onChange(user.email);
    setShowSuggestions(false);
  };

  return (
    <div className={className} ref={wrapperRef}>
      <OutlinedTextField
        value={value}
        onChange={(val) => {
          onChange(val);
          setShowSuggestions(true);
        }}
        placeholder={placeholder}
        fontSize={fontSize}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className={`${className}__suggestions`}>
          {suggestions.map((user) => (
            <Button scheme={'none'} fontSize={'sm'} key={user.id} className={`${className}__suggestionItem`} onClick={() => handleSelect(user)}>
              <Text text={user.name} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.primary} fontWeight={theme.typography.fontWeight.bold} />
              <Text text={user.email} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export const MemberSuggestionInput = styled(Component)`
  position: relative;
  width: 100%;

  &__suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 10;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    background-color: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 4px;
    box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
  }

  &__suggestionItem {
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.sunken};
    }

    &:not(:last-child) {
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
    }
  }
`;
