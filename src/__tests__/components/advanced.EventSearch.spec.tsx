import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import EventSearch from '../../components/event/EventSearch';

const renderComponent = (children: React.ReactElement) => {
  return render(<ChakraProvider>{children}</ChakraProvider>);
};

describe('EventSearch 컴포넌트', () => {
  it('기본 렌더링이 되어야 한다', () => {
    const props = {
      searchTerm: '',
      setSearchTerm: vi.fn(),
    };

    renderComponent(<EventSearch {...props} />);

    expect(screen.getByText('일정 검색')).toBeInTheDocument();

    const inputField = screen.getByPlaceholderText('검색어를 입력하세요');
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveValue('');
  });

  it('searchTerm 값이 입력 필드에 표시되어야 한다', () => {
    const props = {
      searchTerm: '테스트 검색어',
      setSearchTerm: vi.fn(),
    };

    renderComponent(<EventSearch {...props} />);

    const inputField = screen.getByPlaceholderText('검색어를 입력하세요');
    expect(inputField).toHaveValue('테스트 검색어');
  });

  it('입력 필드 값 변경 시 setSearchTerm 함수가 호출되어야 한다', async () => {
    const setSearchTerm = vi.fn();
    const props = {
      searchTerm: '',
      setSearchTerm,
    };

    renderComponent(<EventSearch {...props} />);

    const inputField = screen.getByPlaceholderText('검색어를 입력하세요');

    await userEvent.type(inputField, '새 검색어');

    expect(setSearchTerm).toHaveBeenCalledTimes('새 검색어'.length);

    const lastCallIndex = setSearchTerm.mock.calls.length - 1;
    expect(setSearchTerm.mock.calls[lastCallIndex][0]).toBe('새 검색어'.charAt(lastCallIndex));
  });

  it('입력 필드에 직접 값을 설정하면 setSearchTerm이 호출되어야 한다', () => {
    const setSearchTerm = vi.fn();
    const props = {
      searchTerm: '',
      setSearchTerm,
    };

    renderComponent(<EventSearch {...props} />);

    const inputField = screen.getByPlaceholderText('검색어를 입력하세요');

    fireEvent.change(inputField, { target: { value: '테스트 입력' } });

    expect(setSearchTerm).toHaveBeenCalledTimes(1);
    expect(setSearchTerm).toHaveBeenCalledWith('테스트 입력');
  });

  it('FormControl과 FormLabel이 올바르게 연결되어 있어야 한다', () => {
    const props = {
      searchTerm: '',
      setSearchTerm: vi.fn(),
    };

    renderComponent(<EventSearch {...props} />);

    const label = screen.getByText('일정 검색');
    const inputField = screen.getByPlaceholderText('검색어를 입력하세요');

    const labelElement = label.closest('label');
    const forAttribute = labelElement?.getAttribute('for');
    expect(forAttribute).toBeTruthy();
    expect(inputField.id).toBe(forAttribute);
  });
});
