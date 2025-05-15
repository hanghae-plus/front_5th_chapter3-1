import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WeekView } from '../../components/WeekView';
import { Event } from '../../types';
import { WEEK_DAYS } from '../../constants';

const renderWithChakraProvider = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('WeekView Component', () => {
  const mockCurrentDate = new Date(2024, 6, 8); // July 8, 2024 (A Monday)
  const mockWeekDates = [
    new Date(2024, 6, 7), // Sun
    new Date(2024, 6, 8), // Mon
    new Date(2024, 6, 9), // Tue
    new Date(2024, 6, 10), // Wed
    new Date(2024, 6, 11), // Thu
    new Date(2024, 6, 12), // Fri
    new Date(2024, 6, 13), // Sat
  ];

  const mockEvents: Event[] = [
    {
      id: 'event1',
      title: 'Weekly Sync',
      date: '2024-07-08', // Monday
      startTime: '10:00',
      endTime: '11:00',
      description: 'Team sync meeting',
      location: 'Online',
      category: 'Work',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: 'event2',
      title: 'Project Deadline',
      date: '2024-07-10', // Wednesday
      startTime: '17:00',
      endTime: '18:00',
      description: 'Final submission',
      location: 'N/A',
      category: 'Work',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    },
    {
      id: 'event3',
      title: 'Lunch with Client',
      date: '2024-07-10', // Wednesday
      startTime: '12:00',
      endTime: '13:00',
      description: 'Discussion over lunch',
      location: 'Restaurant X',
      category: 'Work',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    {
      id: 'event4',
      title: 'Gym Session',
      date: '2024-07-12', // Friday
      startTime: '18:00',
      endTime: '19:00',
      description: 'Workout',
      location: 'Gym',
      category: 'Personal',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
  ];
  const mockNotifiedEvents = ['event2']; // Project Deadline is notified

  // Mock functions
  const mockFormatWeek = vi.fn((date: Date) => `Week of ${date.toLocaleDateString()}`);
  const mockGetWeekDates = vi.fn((_date: Date) => mockWeekDates);

  const defaultProps = {
    currentDate: mockCurrentDate,
    filteredEvents: mockEvents,
    notifiedEvents: mockNotifiedEvents,
    WEEK_DAYS: WEEK_DAYS,
    formatWeek: mockFormatWeek,
    getWeekDates: mockGetWeekDates,
  };

  // Helper function to find a day cell (Td element) by the date number
  const findDayCellByDateText = (dateNumberText: string): HTMLElement | null => {
    const dayTextElements = screen.getAllByText(dateNumberText).filter(
      (el) =>
        el.tagName.toLowerCase() === 'p' && // Assuming date number is in a <p> tag
        el.parentElement?.tagName.toLowerCase() === 'td'
    );
    if (dayTextElements.length > 0) {
      return dayTextElements[0].parentElement as HTMLElement;
    }
    return null;
  };

  it('1. 올바른 주차 정보와 요일 헤더를 렌더링한다', () => {
    renderWithChakraProvider(<WeekView {...defaultProps} />);
    expect(screen.getByText(`Week of ${mockCurrentDate.toLocaleDateString()}`)).toBeInTheDocument();
    WEEK_DAYS.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('2. 해당 주의 날짜들을 올바르게 표시한다', () => {
    renderWithChakraProvider(<WeekView {...defaultProps} />);
    mockWeekDates.forEach((date) => {
      expect(screen.getByText(date.getDate().toString())).toBeInTheDocument();
    });
  });

  it('3. 일정이 있는 경우, 해당 날짜에 일정이 올바르게 표시된다', () => {
    renderWithChakraProvider(<WeekView {...defaultProps} />);
    // Check for 'Weekly Sync' on Monday (July 8th)
    const dayCell8 = findDayCellByDateText('8');
    expect(dayCell8).toBeInTheDocument();
    if (dayCell8) {
      expect(within(dayCell8).getByText('Weekly Sync')).toBeInTheDocument();
    }

    // Check for 'Project Deadline' and 'Lunch with Client' on Wednesday (July 10th)
    const dayCell10 = findDayCellByDateText('10');
    expect(dayCell10).toBeInTheDocument();
    if (dayCell10) {
      expect(within(dayCell10).getByText('Project Deadline')).toBeInTheDocument();
      expect(within(dayCell10).getByText('Lunch with Client')).toBeInTheDocument();
    }
  });

  it('4. 알림이 있는 일정이 시각적으로 구분되어 렌더링된다 (BellIcon)', () => {
    // First, ensure BellIcon in WeekView.tsx has aria-label
    // For now, we assume it will be added if test fails for this reason.
    renderWithChakraProvider(<WeekView {...defaultProps} />);
    const dayCell10 = findDayCellByDateText('10'); // Project Deadline is on 10th
    expect(dayCell10).toBeInTheDocument();

    if (dayCell10) {
      const eventTextElement = within(dayCell10).getByText('Project Deadline');
      expect(eventTextElement).toBeInTheDocument();

      const hStackElement = eventTextElement.parentElement;
      expect(hStackElement).toBeInstanceOf(HTMLElement);
      expect(hStackElement?.tagName.toLowerCase()).toBe('div'); // HStack renders as div

      const eventBoxElement = hStackElement?.parentElement;
      expect(eventBoxElement).toBeInstanceOf(HTMLElement);
      expect(eventBoxElement?.tagName.toLowerCase()).toBe('div'); // Box renders as div

      // Check for BellIcon
      expect(
        within(eventBoxElement as HTMLElement).getByLabelText('bell icon', { exact: false })
      ).toBeInTheDocument();

      // Check if the event box has the data-notified="true" attribute
      expect((eventBoxElement as HTMLElement).getAttribute('data-notified')).toBe('true');
    }
  });

  it('5. 일정이 없는 날짜에는 일정이 표시되지 않는다', () => {
    renderWithChakraProvider(<WeekView {...defaultProps} />);
    // July 9th (Tuesday) has no events in mockEvents
    const dayCell9 = findDayCellByDateText('9');
    expect(dayCell9).toBeInTheDocument();
    if (dayCell9) {
      // Check that none of the event titles are present in this cell
      mockEvents.forEach((event) => {
        expect(within(dayCell9).queryByText(event.title)).not.toBeInTheDocument();
      });
    }
  });
});
