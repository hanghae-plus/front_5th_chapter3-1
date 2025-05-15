import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';

import { EventList } from '../../../components/EventList/EventList';
import { Event } from '../../../types';

describe('EventList Component', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '5월 정기 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '프로젝트 미팅',
      date: '2025-05-16',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행상황 공유',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    },
  ];

  const defaultProps = {
    events: mockEvents,
    notifiedEvents: ['1'],
    searchTerm: '',
    onSearchChange: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  const renderEventList = (props = {}) => {
    return render(
      <ChakraProvider>
        <EventList {...defaultProps} {...props} />
      </ChakraProvider>
    );
  };

  it('이벤트 리스트가 올바르게 렌더링되는지 확인', () => {
    renderEventList();
    expect(screen.getByTestId('event-list')).toBeInTheDocument();
  });

  it('검색 입력창이 올바르게 렌더링되는지 확인', () => {
    renderEventList();
    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
    expect(screen.getByText('일정 검색')).toBeInTheDocument();
  });

  it('모든 이벤트가 표시되는지 확인', () => {
    renderEventList();
    expect(screen.getByText('팀 회의')).toBeInTheDocument();
    expect(screen.getByText('프로젝트 미팅')).toBeInTheDocument();
  });

  it('검색어 입력 시 onSearchChange가 호출되는지 확인', () => {
    renderEventList();
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    fireEvent.change(searchInput, { target: { value: '팀' } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('팀');
  });

  it('이벤트가 없을 때 메시지가 표시되는지 확인', () => {
    renderEventList({ events: [] });
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('스크롤이 가능한 컨테이너인지 확인', () => {
    renderEventList();
    const container = screen.getByTestId('event-list');
    expect(container).toHaveStyle({ overflowY: 'auto' });
  });
});
