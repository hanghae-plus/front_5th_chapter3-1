import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import { weekDays } from '../../../base/lib/day.constants';
import MonthCalendar from '../../../modules/calendar/MonthCalendar';
import { Event } from '../../../types';

describe('월간 캘린더 (MonthCalendar)', () => {
  const renderMonthCalendar = (props: {
    currentDate: Date;
    filteredEvents: Event[];
    notifiedEvents: string[];
    holidays: Record<string, string>;
  }) => {
    return render(
      <ChakraProvider>
        <MonthCalendar
          currentDate={props.currentDate}
          filteredEvents={props.filteredEvents}
          notifiedEvents={props.notifiedEvents}
          holidays={props.holidays}
        />
      </ChakraProvider>
    );
  };

  it('월간 달력이 올바르게 렌더링된다', () => {
    const currentDate = new Date('2025-10-15');
    renderMonthCalendar({
      currentDate,
      filteredEvents: [],
      notifiedEvents: [],
      holidays: {},
    });

    const monthView = screen.getByTestId('month-view');

    expect(monthView).toBeInTheDocument();
    weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('월간 캘린더에서 2025-10 월간의 날짜들이 표시된다.', () => {
    const currentDate = new Date('2025-10-15');
    renderMonthCalendar({
      currentDate,
      filteredEvents: [],
      notifiedEvents: [],
      holidays: {},
    });

    const expectedDates = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

    expectedDates.forEach((date) => {
      expect(screen.getByText(date)).toBeInTheDocument();
    });
    expect(screen.getByText('2025년 10월')).toBeInTheDocument();
  });
});
