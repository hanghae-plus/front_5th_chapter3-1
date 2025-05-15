import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import CalendarNavigation from '../../components/calendar/CalendarNavigation';

const renderComponent = (children: React.ReactElement) => {
  return render(<ChakraProvider>{children}</ChakraProvider>);
};

describe('CalendarNavigation 컴포넌트', () => {
  it('기본 렌더링이 되어야 한다', () => {
    const props = {
      view: 'month' as const,
      setView: vi.fn(),
      navigate: vi.fn(),
    };

    renderComponent(<CalendarNavigation {...props} />);

    expect(screen.getByLabelText('Previous')).toBeInTheDocument();

    expect(screen.getByLabelText('view')).toBeInTheDocument();

    expect(screen.getByLabelText('Next')).toBeInTheDocument();
  });

  it('month 뷰 선택이 올바르게 반영되어야 한다', () => {
    const props = {
      view: 'month' as const,
      setView: vi.fn(),
      navigate: vi.fn(),
    };

    renderComponent(<CalendarNavigation {...props} />);

    const select = screen.getByLabelText('view');
    expect(select).toHaveValue('month');
  });

  it('week 뷰 선택이 올바르게 반영되어야 한다', () => {
    const props = {
      view: 'week' as const,
      setView: vi.fn(),
      navigate: vi.fn(),
    };

    renderComponent(<CalendarNavigation {...props} />);

    const select = screen.getByLabelText('view');
    expect(select).toHaveValue('week');
  });

  it('이전 버튼 클릭 시 navigate 함수가 "prev" 인자와 함께 호출되어야 한다', async () => {
    const navigate = vi.fn();
    const props = {
      view: 'month' as const,
      setView: vi.fn(),
      navigate,
    };

    renderComponent(<CalendarNavigation {...props} />);

    const prevButton = screen.getByLabelText('Previous');
    await userEvent.click(prevButton);

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('prev');
  });

  it('다음 버튼 클릭 시 navigate 함수가 "next" 인자와 함께 호출되어야 한다', async () => {
    const navigate = vi.fn();
    const props = {
      view: 'month' as const,
      setView: vi.fn(),
      navigate,
    };

    renderComponent(<CalendarNavigation {...props} />);

    const nextButton = screen.getByLabelText('Next');
    await userEvent.click(nextButton);

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('next');
  });

  it('뷰 선택 변경 시 setView 함수가 새 뷰 값과 함께 호출되어야 한다', async () => {
    const setView = vi.fn();
    const props = {
      view: 'month' as const,
      setView,
      navigate: vi.fn(),
    };

    renderComponent(<CalendarNavigation {...props} />);

    const select = screen.getByLabelText('view');

    await userEvent.selectOptions(select, ['week']);

    expect(setView).toHaveBeenCalledTimes(1);
    expect(setView).toHaveBeenCalledWith('week');

    setView.mockReset();

    await userEvent.selectOptions(select, ['month']);

    expect(setView).toHaveBeenCalledTimes(1);
    expect(setView).toHaveBeenCalledWith('month');
  });

  it('두 버튼이 모두 활성화되어 있어야 한다', () => {
    const props = {
      view: 'month' as const,
      setView: vi.fn(),
      navigate: vi.fn(),
    };

    renderComponent(<CalendarNavigation {...props} />);

    const prevButton = screen.getByLabelText('Previous');
    const nextButton = screen.getByLabelText('Next');

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('Select 컴포넌트에 week와 month 옵션이 포함되어 있어야 한다', () => {
    const props = {
      view: 'month' as const,
      setView: vi.fn(),
      navigate: vi.fn(),
    };

    renderComponent(<CalendarNavigation {...props} />);

    const weekOption = screen.getByRole('option', { name: 'Week' });
    const monthOption = screen.getByRole('option', { name: 'Month' });

    expect(weekOption).toBeInTheDocument();
    expect(monthOption).toBeInTheDocument();

    expect(weekOption).toHaveValue('week');
    expect(monthOption).toHaveValue('month');
  });
});
