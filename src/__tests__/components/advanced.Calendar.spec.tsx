import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, RenderOptions } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import { Calendar } from '../../components/calendar/Calendar';
import { Event } from '../../types';

// MonthView와 WeekView를 모킹
vi.mock('../../components/calendar/MonthView', () => ({
  default: ({ currentDate, holidays, filteredEvents, notifiedEvents }: any) => (
    <div data-testid="month-view">
      <span data-testid="month-view-currentDate">{currentDate.toISOString()}</span>
      <span data-testid="month-view-holidays">{JSON.stringify(holidays)}</span>
      <span data-testid="month-view-filteredEvents">{JSON.stringify(filteredEvents)}</span>
      <span data-testid="month-view-notifiedEvents">{JSON.stringify(notifiedEvents)}</span>
    </div>
  ),
}));

vi.mock('../../components/calendar/WeekView', () => ({
  default: ({ currentDate, filteredEvents, notifiedEvents }: any) => (
    <div data-testid="week-view">
      <span data-testid="week-view-currentDate">{currentDate.toISOString()}</span>
      <span data-testid="week-view-filteredEvents">{JSON.stringify(filteredEvents)}</span>
      <span data-testid="week-view-notifiedEvents">{JSON.stringify(notifiedEvents)}</span>
    </div>
  ),
}));

const renderCalendar = (ui: React.ReactNode, options?: RenderOptions) => {
  return {
    ...render(ui, { wrapper: ChakraProvider, ...options }),
  };
};

describe('Calendar Component Test', () => {
  const mockNavigate = vi.fn();
  const mockSetView = vi.fn();
  const mockCurrentDate = new Date(2024, 6, 15);
  const mockFilteredEvents: Event[] = [
    {
      id: '1',
      title: 'Event 1',
      date: '2024-07-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: 'Default Location',
      category: 'Default Category',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
  ];
  const mockNotifiedEvents: string[] = ['1'];
  const mockHolidays: Record<string, string> = { '2024-07-17': '제헌절' };

  const defaultProps = {
    filteredEvents: mockFilteredEvents,
    notifiedEvents: mockNotifiedEvents,
    view: 'month' as 'week' | 'month',
    setView: mockSetView,
    currentDate: mockCurrentDate,
    holidays: mockHolidays,
    navigate: mockNavigate,
  };
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
    mockNavigate.mockClear();
    mockSetView.mockClear();
  });

  describe('렌더링', () => {
    test('초기 렌더링 시 "일정 보기" 헤딩과 컨트롤들을 올바르게 표시해야 한다.', () => {
      renderCalendar(<Calendar {...defaultProps} />);

      expect(screen.getByText('일정 보기')).toBeInTheDocument();
      expect(screen.getByTestId('previous-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
      expect(screen.getByTestId('view-selector')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Month')).toBeInTheDocument();
    });

    test('view prop이 "month"일 때 MonthView를 렌더링하고 올바른 props를 전달해야 한다.', () => {
      renderCalendar(<Calendar {...defaultProps} view="month" />);

      expect(screen.getByTestId('month-view')).toBeInTheDocument();
      expect(screen.queryByTestId('week-view')).not.toBeInTheDocument();
      expect(screen.getByTestId('month-view-currentDate').textContent).toBe(
        mockCurrentDate.toISOString()
      );
      expect(screen.getByTestId('month-view-holidays').textContent).toBe(
        JSON.stringify(mockHolidays)
      );
      expect(screen.getByTestId('month-view-filteredEvents').textContent).toBe(
        JSON.stringify(mockFilteredEvents)
      );
      expect(screen.getByTestId('month-view-notifiedEvents').textContent).toBe(
        JSON.stringify(mockNotifiedEvents)
      );
    });

    test('view prop이 "week"일 때 WeekView를 렌더링하고 올바른 props를 전달해야 한다.', () => {
      renderCalendar(<Calendar {...defaultProps} view="week" />);

      expect(screen.getByTestId('week-view')).toBeInTheDocument();
      expect(screen.queryByTestId('month-view')).not.toBeInTheDocument();
      expect(screen.getByTestId('week-view-currentDate').textContent).toBe(
        mockCurrentDate.toISOString()
      );
      expect(screen.getByTestId('week-view-filteredEvents').textContent).toBe(
        JSON.stringify(mockFilteredEvents)
      );
      expect(screen.getByTestId('week-view-notifiedEvents').textContent).toBe(
        JSON.stringify(mockNotifiedEvents)
      );
    });
  });

  describe('사용자 상호작용', () => {
    test('Previous 버튼 클릭 시 navigate("prev")를 호출하고 이전 달로 이동한다.', async () => {
      renderCalendar(<Calendar {...defaultProps} />);
      const prevButton = screen.getByTestId('previous-button');
      await user.click(prevButton);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('prev');
    });

    test('Next 버튼 클릭 시 navigate("next")를 호출하고 다음 달로 이동한다.', async () => {
      renderCalendar(<Calendar {...defaultProps} />);
      const nextButton = screen.getByTestId('next-button');
      await user.click(nextButton);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('next');
    });

    test('View 셀렉터 변경 시 setView를 올바른 값으로 호출해야 한다.', async () => {
      renderCalendar(<Calendar {...defaultProps} view="month" />);
      const selector = screen.getByTestId('view-selector');

      await user.selectOptions(selector, 'week');
      expect(mockSetView).toHaveBeenCalledTimes(1);
      expect(mockSetView).toHaveBeenCalledWith('week');

      mockSetView.mockClear();

      await user.selectOptions(selector, 'month');
      expect(mockSetView).toHaveBeenCalledTimes(1);
      expect(mockSetView).toHaveBeenCalledWith('month');
    });
  });

  describe('Props 변경 테스트', () => {
    test('view-selector가 props.view 값에 따라 올바른 옵션을 표시해야 한다.', () => {
      const { rerender } = renderCalendar(<Calendar {...defaultProps} view="month" />);
      expect(screen.getByDisplayValue('Month')).toBeInTheDocument();

      rerender(<Calendar {...defaultProps} view="week" />);
      expect(screen.getByDisplayValue('Week')).toBeInTheDocument();
    });
  });
});
