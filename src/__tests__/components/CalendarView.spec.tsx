import { render, screen } from '@testing-library/react';

import CalendarView from '@/features/calendarView/ui/CalendarView';
import { Event } from '@/types';

vi.mock('@/features/calendarView/ui/MonthView', () => ({
  __esModule: true,
  default: () => <div data-testid="month-view">MonthView 컴포넌트</div>,
}));

vi.mock('@/features/calendarView/ui/WeekView', () => ({
  __esModule: true,
  default: () => <div data-testid="week-view">WeekView 컴포넌트</div>,
}));

describe('CalendarView 컴포넌트', () => {
  const baseProps = {
    currentDate: new Date('2025-05-15'),
    holidays: { '2025-05-05': '어린이날' },
    filteredEvents: [
      {
        id: '1',
        title: '이벤트',
        date: '2025-05-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: undefined,
        notificationTime: 0,
      },
    ] as Event[],
    notifiedEvents: ['1'],
  };

  it('view가 week이면 WeekView를 렌더링한다', () => {
    render(<CalendarView {...baseProps} view="week" />);
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });

  it('view가 month이면 MonthView를 렌더링한다', () => {
    render(<CalendarView {...baseProps} view="month" />);
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });
});
