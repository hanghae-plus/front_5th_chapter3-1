import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { SearchView } from '../../components/SearchView';
import * as useCalendarViewModule from '../../hooks/useCalendarView';
import * as useNotificationsModule from '../../hooks/useNotifications';
import * as useSearchModule from '../../hooks/useSearch';
import { Event } from '../../types';

// Mock hooks
vi.mock('../../hooks/useCalendarView');
vi.mock('../../hooks/useNotifications');
vi.mock('../../hooks/useSearch');

describe('SearchView', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 일정 1',
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명 1',
      location: '테스트 장소 1',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '테스트 일정 2',
      date: '2025-05-16',
      startTime: '14:00',
      endTime: '15:00',
      description: '테스트 설명 2',
      location: '테스트 장소 2',
      category: '개인',
      repeat: { type: 'daily', interval: 1, endDate: '2025-05-20' },
      notificationTime: 30,
    },
  ];

  const mockEditEvent = vi.fn();
  const mockDeleteEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useCalendarView hook
    vi.spyOn(useCalendarViewModule, 'useCalendarView').mockReturnValue({
      view: 'week',
      setView: vi.fn(),
      currentDate: new Date('2025-05-15'),
      setCurrentDate: vi.fn(),
      holidays: {},
      navigate: vi.fn(),
    });

    // Mock useNotifications hook
    vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
      notifications: [],
      notifiedEvents: ['1'],
      setNotifications: vi.fn(),
      removeNotification: vi.fn(),
    });

    // Mock useSearch hook
    vi.spyOn(useSearchModule, 'useSearch').mockReturnValue({
      searchTerm: '',
      filteredEvents: mockEvents,
      setSearchTerm: vi.fn(),
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <ChakraProvider>
        <SearchView
          events={mockEvents}
          editEvent={mockEditEvent}
          deleteEvent={mockDeleteEvent}
          {...props}
        />
      </ChakraProvider>
    );
  };

  it('기본 UI 요소들이 렌더링되어야 한다', () => {
    renderComponent();

    expect(screen.getByText('일정 검색')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
    expect(screen.getByTestId('event-list')).toBeInTheDocument();
  });

  it('이벤트 목록이 정상적으로 표시되어야 한다', () => {
    renderComponent();

    expect(screen.getAllByTestId('event-item')).toHaveLength(2);
    expect(screen.getByText('테스트 일정 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 일정 2')).toBeInTheDocument();
  });

  it('이벤트 편집 버튼이 정상적으로 동작해야 한다', async () => {
    const user = userEvent.setup();
    renderComponent();

    const editButton = screen.getByTestId('edit-event-button-1');
    await user.click(editButton);

    expect(mockEditEvent).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('이벤트 삭제 버튼이 정상적으로 동작해야 한다', async () => {
    const user = userEvent.setup();
    renderComponent();

    const deleteButton = screen.getByTestId('delete-event-button-1');
    await user.click(deleteButton);

    expect(mockDeleteEvent).toHaveBeenCalledWith('1');
  });

  it('검색 결과가 없을 때 메시지가 표시되어야 한다', () => {
    vi.spyOn(useSearchModule, 'useSearch').mockReturnValue({
      searchTerm: '',
      filteredEvents: [],
      setSearchTerm: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('검색 결과와 일치하는 이벤트만 렌더링되어야 한다', () => {
    vi.spyOn(useSearchModule, 'useSearch').mockReturnValue({
      searchTerm: '테스트 일정 1',
      filteredEvents: mockEvents,
      setSearchTerm: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('테스트 일정 1')).toBeInTheDocument();
  });
});
