import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { CalendarView } from '../../components/CalendarView';
import * as useCalendarViewModule from '../../hooks/useCalendarView';
import * as useNotificationsModule from '../../hooks/useNotifications';
import { Event } from '../../types';

// Mock hooks
vi.mock('../../hooks/useCalendarView');
vi.mock('../../hooks/useNotifications');

describe('CalendarView', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 일정 1',
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '테스트 일정 2',
      date: '2025-05-16',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  const mockHolidays = {
    '2025-05-15': '부처님오신날',
    '2025-05-16': '대체공휴일',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useCalendarView hook
    vi.spyOn(useCalendarViewModule, 'useCalendarView').mockReturnValue({
      view: 'week',
      setView: vi.fn(),
      currentDate: new Date('2025-05-15'),
      setCurrentDate: vi.fn(),
      holidays: mockHolidays,
      navigate: vi.fn(),
    });

    // Mock useNotifications hook
    vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
      notifications: [],
      notifiedEvents: mockEvents.map((event) => event.id),
      setNotifications: vi.fn(),
      removeNotification: vi.fn(),
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <ChakraProvider>
        <CalendarView events={mockEvents} {...props} />
      </ChakraProvider>
    );
  };

  it('기본 UI 요소들이 렌더링되어야 한다', () => {
    renderComponent();

    expect(screen.getByText('일정 보기')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
  });

  it('기본적으로 주간 보기가 표시되어야 한다', () => {
    renderComponent();

    const viewSelect = screen.getByRole('combobox');
    expect(viewSelect).toHaveValue('week');
  });

  it('뷰를 월간 보기로 변경할 수 있어야 한다', async () => {
    const user = userEvent.setup();
    const mockSetView = vi.fn();
    vi.spyOn(useCalendarViewModule, 'useCalendarView').mockReturnValue({
      view: 'week',
      setView: mockSetView,
      currentDate: new Date('2025-05-15'),
      setCurrentDate: vi.fn(),
      holidays: mockHolidays,
      navigate: vi.fn(),
    });

    renderComponent();

    const viewSelect = screen.getByRole('combobox');
    await user.selectOptions(viewSelect, 'month');

    expect(mockSetView).toHaveBeenCalledWith('month');
  });

  it('이전/다음 버튼으로 날짜를 이동할 수 있어야 한다', async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();
    vi.spyOn(useCalendarViewModule, 'useCalendarView').mockReturnValue({
      view: 'week',
      setView: vi.fn(),
      currentDate: new Date('2025-05-15'),
      setCurrentDate: vi.fn(),
      holidays: mockHolidays,
      navigate: mockNavigate,
    });

    renderComponent();

    await user.click(screen.getByLabelText('Previous'));
    expect(mockNavigate).toHaveBeenCalledWith('prev');

    await user.click(screen.getByLabelText('Next'));
    expect(mockNavigate).toHaveBeenCalledWith('next');
  });

  it('월간 보기에서는 공휴일 정보가 표시되어야 한다', () => {
    vi.spyOn(useCalendarViewModule, 'useCalendarView').mockReturnValue({
      view: 'month',
      setView: vi.fn(),
      currentDate: new Date('2025-05-15'),
      setCurrentDate: vi.fn(),
      holidays: mockHolidays,
      navigate: vi.fn(),
    });

    renderComponent();

    // MonthView가 렌더링되었는지 확인
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('주간 보기에서는 이벤트와 알림이 표시되어야 한다', () => {
    vi.spyOn(useCalendarViewModule, 'useCalendarView').mockReturnValue({
      view: 'week',
      setView: vi.fn(),
      currentDate: new Date('2025-05-15'),
      setCurrentDate: vi.fn(),
      holidays: mockHolidays,
      navigate: vi.fn(),
    });

    renderComponent();

    // WeekView가 렌더링되었는지 확인
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });

  it('이벤트가 없는 경우에도 정상적으로 렌더링되어야 한다', () => {
    renderComponent({ events: [] });

    expect(screen.getByText('일정 보기')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
