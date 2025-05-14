import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import { weekDays } from '../../../base/lib/day.constants';
import WeekCalendar from '../../../modules/calendar/ui/WeekCalendar';
import { Event } from '../../../types';

describe('주간 캘린더 (WeekCalendar)', () => {
  const renderWeekCalendar = (props: {
    currentDate: Date;
    filteredEvents: Event[];
    notifiedEvents: string[];
  }) => {
    return render(
      <ChakraProvider>
        <WeekCalendar
          currentDate={props.currentDate}
          filteredEvents={props.filteredEvents}
          notifiedEvents={props.notifiedEvents}
        />
      </ChakraProvider>
    );
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('주간 달력이 올바르게 렌더링된다', () => {
    const currentDate = new Date('2025-10-15');
    renderWeekCalendar({
      currentDate,
      filteredEvents: [],
      notifiedEvents: [],
    });

    const weekView = screen.getByTestId('week-view');

    expect(weekView).toBeInTheDocument();
    weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('주간 캘린더에서 2025-10-15 주간의 날짜들이 표시된다.', () => {
    const currentDate = new Date('2025-10-15');
    renderWeekCalendar({
      currentDate,
      filteredEvents: [],
      notifiedEvents: [],
    });

    const expectedDates = ['12', '13', '14', '15', '16', '17', '18'];

    expectedDates.forEach((date) => {
      expect(screen.getByText(date)).toBeInTheDocument();
    });
    expect(screen.getByText('2025년 10월 3주')).toBeInTheDocument();
  });
});
