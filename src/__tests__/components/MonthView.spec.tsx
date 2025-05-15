import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MonthView } from '../../components/MonthView'; // 경로 수정
import { Event } from '../../types';
import { WEEK_DAYS } from '../../constants'; // 실제_WEEK_DAYS를 WEEK_DAYS로 변경 (일반적인 사용 가정)

const renderWithChakraProvider = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('MonthView Component', () => {
  const mockCurrentDate = new Date(2024, 6, 1); // July 2024
  const mockHolidays = {
    '2024-07-04': 'Independence Day',
  };
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Team Meeting',
      date: '2024-07-03',
      startTime: '10:00',
      endTime: '11:00',
      description: 'Weekly team sync',
      location: 'Room A',
      category: 'Work',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: 'Doctor Appointment',
      date: '2024-07-04',
      startTime: '14:00',
      endTime: '15:00',
      description: 'Checkup',
      location: 'Clinic B',
      category: 'Personal',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
  ];
  const mockNotifiedEvents = ['2'];

  const mockFormatMonth = vi.fn((_date: Date) => `Month of July`);
  const mockGetWeeksAtMonth = vi.fn((_date: Date) => [
    [null, null, null, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, 31, null],
  ]);
  const mockFormatDate = vi.fn(
    (currentDate: Date, day: number) =>
      `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`
  );
  const mockGetEventsForDay = vi.fn((events: Event[], day: number) => {
    const dateStr = mockFormatDate(mockCurrentDate, day);
    return events.filter((event) => event.date === dateStr);
  });

  const defaultProps = {
    currentDate: mockCurrentDate,
    holidays: mockHolidays,
    filteredEvents: mockEvents,
    notifiedEvents: mockNotifiedEvents,
    WEEK_DAYS: WEEK_DAYS, // 실제_WEEK_DAYS를 WEEK_DAYS로 변경
    formatMonth: mockFormatMonth,
    getWeeksAtMonth: mockGetWeeksAtMonth,
    formatDate: mockFormatDate,
    getEventsForDay: mockGetEventsForDay,
  };

  // Helper function to find a day cell (Td element)
  const findDayCell = (dayNumberText: string): HTMLElement | null => {
    const dayTextElements = screen
      .getAllByText(dayNumberText)
      .filter(
        (el) => el.tagName.toLowerCase() === 'p' && el.parentElement?.tagName.toLowerCase() === 'td'
      );
    if (dayTextElements.length > 0) {
      return dayTextElements[0].parentElement as HTMLElement;
    }
    return null;
  };

  it('올바른 월 이름과 요일 헤더를 렌더링한다', () => {
    renderWithChakraProvider(<MonthView {...defaultProps} />);
    expect(screen.getByText(`Month of July`)).toBeInTheDocument();
    WEEK_DAYS.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('해당 월의 날짜들을 올바르게 표시한다', () => {
    renderWithChakraProvider(<MonthView {...defaultProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('31')).toBeInTheDocument();
  });

  it('공휴일이 있는 경우, 해당 날짜에 공휴일 이름을 올바르게 표시한다', () => {
    renderWithChakraProvider(<MonthView {...defaultProps} />);
    const dayCell4 = findDayCell('4');
    expect(dayCell4).toBeInTheDocument(); // Td 요소가 존재하는지 확인
    if (dayCell4) {
      expect(within(dayCell4).getByText('Independence Day')).toBeInTheDocument();
    }
  });

  it('일정이 있는 경우, 해당 날짜에 일정이 올바르게 표시된다', () => {
    renderWithChakraProvider(<MonthView {...defaultProps} />);
    const dayCell3 = findDayCell('3');
    expect(dayCell3).toBeInTheDocument();
    if (dayCell3) {
      expect(within(dayCell3).getByText('Team Meeting')).toBeInTheDocument();
    }
  });

  it('알림이 있는 일정이 시각적으로 구분되어 렌더링된다 (BellIcon)', () => {
    renderWithChakraProvider(<MonthView {...defaultProps} />);
    const dayCell4 = findDayCell('4');
    expect(dayCell4).toBeInTheDocument();

    if (dayCell4) {
      const eventTextElement = within(dayCell4).getByText('Doctor Appointment');
      expect(eventTextElement).toBeInTheDocument(); // 이벤트 텍스트가 있는지 확인

      const hStackElement = eventTextElement.parentElement;
      // hStackElement가 실제로 HTMLElement이고 div인지 확인 (HStack은 div로 렌더링됨)
      expect(hStackElement).toBeInstanceOf(HTMLElement);
      expect(hStackElement?.tagName.toLowerCase()).toBe('div');

      const eventBoxElement = hStackElement?.parentElement;
      // eventBoxElement가 실제로 HTMLElement이고 div인지 확인 (Box는 div로 렌더링됨)
      expect(eventBoxElement).toBeInstanceOf(HTMLElement);
      expect(eventBoxElement?.tagName.toLowerCase()).toBe('div');

      // eventBoxElement 내에서 BellIcon 찾기
      // 이전의 eventBoxElement instanceof HTMLElement 와 유사한 역할을 위의 expect들이 수행
      expect(
        within(eventBoxElement as HTMLElement).getByLabelText('bell icon', { exact: false })
      ).toBeInTheDocument();
    }
  });
});
