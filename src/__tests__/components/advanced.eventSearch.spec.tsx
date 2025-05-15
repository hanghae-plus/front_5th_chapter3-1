import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EventSearch } from '../../components/event/search/EventSearch';
import { Event } from '../../types';

describe('EventSearch', () => {
  const defaultProps = {
    searchTerm: '',
    setSearchTerm: vi.fn(),
    filteredEvents: [] as Event[],
    notifiedEvents: [] as string[],
    editEvent: vi.fn(),
    deleteEvent: vi.fn(),
  };

  const renderEventSearch = (props = {}) => {
    return render(
      <ChakraProvider>
        <EventSearch {...defaultProps} {...props} />
      </ChakraProvider>
    );
  };

  it('기본 렌더링이 정상적으로 되어야 함', () => {
    renderEventSearch();

    expect(screen.getByText('일정 검색')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
    expect(screen.getByTestId('event-list')).toBeInTheDocument();
  });

  it('검색어 입력이 정상적으로 동작해야 함', () => {
    const setSearchTerm = vi.fn();
    renderEventSearch({ setSearchTerm });

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    fireEvent.change(searchInput, { target: { value: '테스트' } });

    expect(setSearchTerm).toHaveBeenCalledWith('테스트');
  });

  it('검색 결과가 없을 때 메시지가 표시되어야 함', () => {
    renderEventSearch({ filteredEvents: [] });

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('검색 결과가 있을 때 이벤트 목록이 표시되어야 함', () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '테스트 일정 1',
        date: '2025-05-16',
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
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    renderEventSearch({ filteredEvents: mockEvents });

    expect(screen.getByText('테스트 일정 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 일정 2')).toBeInTheDocument();
  });

  it('알림이 설정된 이벤트가 표시되어야 함', () => {
    vi.setSystemTime(new Date('2025-05-16T09:50:00'));

    const mockEvents: Event[] = [
      {
        id: '1',
        title: '알림이 있는 일정',
        date: '2025-05-16',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    renderEventSearch({
      filteredEvents: mockEvents,
      notifiedEvents: ['1'],
    });

    expect(screen.getByTestId('notification-icon')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('이벤트 수정/삭제 기능이 정상적으로 동작해야 함', () => {
    const mockEvent: Event = {
      id: '1',
      title: '테스트 일정',
      date: '2025-05-16',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const editEvent = vi.fn();
    const deleteEvent = vi.fn();

    renderEventSearch({
      filteredEvents: [mockEvent],
      editEvent,
      deleteEvent,
    });

    // 수정 버튼 클릭
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    expect(editEvent).toHaveBeenCalledWith(mockEvent);

    // 삭제 버튼 클릭
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);
    expect(deleteEvent).toHaveBeenCalledWith(mockEvent.id);
  });
});
