import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Event } from '../../types';
import { SearchView } from '../../components/SearchView';

describe('SearchView 컴포넌트 테스트', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '기획 회의',
      date: '2024-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 기획! 우와 뭘까?',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 0 },
    },
    {
      id: '2',
      title: '팀 회의',
      date: '2024-10-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '팀 회의 상세설명',
      location: '회의실 B',
      category: '업무',
      notificationTime: 0,
      repeat: { type: 'none', interval: 0 },
    },
  ];

  const currentDate = new Date('2024-10-15');
  const view: 'month' | 'week' = 'month';
  const editEvent = vi.fn();
  const deleteEvent = vi.fn();
  const notifiedEvents = ['1']; // 알림 대상: '기획 회의' 이벤트

  const setup = () => {
    const user = userEvent.setup();
    return {
      ...render(
        <ChakraProvider>
          <SearchView
            events={events}
            currentDate={currentDate}
            view={view}
            editEvent={editEvent}
            deleteEvent={deleteEvent}
            notifiedEvents={notifiedEvents}
          />
        </ChakraProvider>
      ),
      user,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('검색어가 없으면 모든 이벤트가 렌더링된다', () => {
    setup();

    expect(screen.getByText('기획 회의')).toBeInTheDocument();
    expect(screen.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어 입력 시 검색어에 일치하는 이벤트만 렌더링된다', async () => {
    const { user } = setup();
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.clear(searchInput);
    await user.type(searchInput, '기획 회의');

    expect(screen.getByText('기획 회의')).toBeInTheDocument();
    expect(screen.queryByText('팀 회의')).not.toBeInTheDocument();
  });

  it('검색어와 일치하는 이벤트가 없으면 "검색 결과가 없습니다." 문구가 렌더링된다', async () => {
    const { user } = setup();
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.clear(searchInput);
    await user.type(searchInput, '없는 이벤트');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 editEvent 콜백이 호출된다', async () => {
    const { user } = setup();
    const editButtons = screen.getAllByRole('button', { name: 'Edit event' });

    await user.click(editButtons[0]);

    expect(editEvent).toHaveBeenCalledTimes(1);
    expect(editEvent).toHaveBeenCalledWith(events[0]);
  });

  it('삭제 버튼 클릭 시 deleteEvent 콜백이 호출된다', async () => {
    const { user } = setup();
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete event' });

    await user.click(deleteButtons[1]);

    expect(deleteEvent).toHaveBeenCalledTimes(1);
    expect(deleteEvent).toHaveBeenCalledWith(events[1].id);
  });
});
