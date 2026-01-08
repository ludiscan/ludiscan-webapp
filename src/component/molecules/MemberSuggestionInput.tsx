import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';

import type { User } from '@src/modeles/user';
import type { FC } from 'react';

import { Text } from '@src/component/atoms/Text';
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
    if (!showSuggestions) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    // Add listener only when suggestions are shown
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSuggestions]);

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
    <div className={className} ref={wrapperRef} data-font-size={fontSize}>
      <input
        type='email'
        className={`${className}__input`}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (e.target.value.length >= 2) {
            setShowSuggestions(true);
          } else {
            setShowSuggestions(false);
          }
        }}
        onFocus={() => {
          if (value.length >= 2) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        autoComplete='email'
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className={`${className}__suggestions`}>
          {suggestions.map((user) => (
            <button
              type='button'
              key={user.id}
              className={`${className}__suggestionItem`}
              onClick={() => handleSelect(user)}
              onMouseDown={(e) => {
                // Prevent input from losing focus when clicking suggestions
                e.preventDefault();
              }}
            >
              <Text text={user.name} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.primary} fontWeight={theme.typography.fontWeight.bold} />
              <Text text={user.email} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const MemberSuggestionInput = styled(Component)`
  position: relative;
  width: 100%;

  &__input {
    display: block;
    width: 100%;
    padding: 10px 12px;
    font-size: ${({ fontSize, theme }) => fontSize || theme.typography.fontSize.base};
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.text.primary};
    outline: none;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.strong};
    border-radius: 4px;
    transition: all 0.2s ease;

    &::placeholder {
      color: ${({ theme }) => theme.colors.text.tertiary};
      opacity: 1;
    }

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary.main};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}1a;
    }
  }

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
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: flex-start;
    width: 100%;
    padding: 8px 12px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.primary};
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: none;
    transition: background-color 0.2s;

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.sunken};
    }

    &:not(:last-child) {
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
    }
  }
`;
