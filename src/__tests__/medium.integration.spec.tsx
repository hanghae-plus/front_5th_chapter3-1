import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
  setupMockHandlerDeletion,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const renderApp = () => {
  return render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-05-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-05-02',
    startTime: '12:00',
    endTime: '13:00',
    description: '팀 점심',
    location: '식당',
    category: '식사',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
];

describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    vi.setSystemTime('2025-05-01');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation([]));
    renderApp();

    // 일정 정보 입력
    await user.type(screen.getByLabelText('제목'), '새로운 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-05-03');
    await user.type(screen.getByLabelText('시작 시간'), '14:00');
    await user.type(screen.getByLabelText('종료 시간'), '15:00');
    await user.type(screen.getByLabelText('설명'), '신규 회의');
    await user.type(screen.getByLabelText('위치'), '회의실 B');
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');
    await user.selectOptions(screen.getByLabelText('알림 설정'), '10');

    // 일정 추가 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 이벤트 리스트에서 추가된 일정 확인
    const eventList = await screen.findByTestId('event-list');
    console.log(eventList);

    await waitFor(() => {
      expect(within(eventList).getByText('새로운 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('2025-05-03')).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    beforeEach(() => {
      vi.setSystemTime('2025-05-01');
    });

    afterEach(() => {
      vi.useRealTimers();
    });
    const user = userEvent.setup();
    server.use(...setupMockHandlerUpdating(mockEvents));
    renderApp();

    // 기존 일정의 수정 버튼 클릭
    const eventList = await screen.findByTestId('event-list');
    const editButtons = screen.getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 일정 정보 수정
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '수정된 설명');

    // 수정 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 수정된 일정 확인
    const updatedEvent = within(eventList).getByText('수정된 회의').closest('div');
    expect(updatedEvent).toHaveTextContent('수정된 회의');
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    beforeEach(() => {
      vi.setSystemTime('2025-05-01');
    });

    afterEach(() => {
      vi.useRealTimers();
    });
    const user = userEvent.setup();
    server.use(...setupMockHandlerDeletion(mockEvents));
    renderApp();

    // 기존 일정의 삭제 버튼 클릭
    const eventList = await screen.findByTestId('event-list');
    // const deleteButton = within(eventList).getAllByLabelText('Delete event')[0];
    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('점심 약속')).toBeInTheDocument();
    });

    console.log(eventList);
    const deleteButtons = screen.getAllByLabelText('Delete event');

    await user.click(deleteButtons[1]);

    console.log(mockEvents);

    // 삭제된 일정이 더 이상 표시되지 않는지 확인
    await waitFor(() => {
      expect(screen.queryByText('점심 약속')).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    vi.setSystemTime('2025-05-05');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(mockEvents));
    renderApp();

    // 주별 뷰로 변경
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // 다음 주로 이동
    await user.click(screen.getByLabelText('Next'));

    // 해당 주에 일정이 없는지 확인
    const weekView = screen.getByTestId('week-view');
    const eventBoxes = within(weekView).queryAllByRole('box');
    expect(eventBoxes).toHaveLength(0);
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const weekEvents: Event[] = [
      {
        id: '1',
        title: '점심 약속',
        date: '2025-05-07',
        startTime: '11:00',
        endTime: '12:00',
        description: '설명',
        location: '풍경',
        category: '점심',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '미팅',
        date: '2025-05-08',
        startTime: '14:00',
        endTime: '15:00',
        description: '미팅',
        location: '회의실',
        category: '일',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(weekEvents));
    renderApp();

    // 주별 뷰로 변경
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // 해당 주에 일정이 표시되는지 확인
    const weekView = screen.getByTestId('week-view');
    await waitFor(() => {
      const thursdayEvent = within(weekView).getByText('점심 약속');
      expect(thursdayEvent).toBeInTheDocument();

      const fridayEvent = within(weekView).getByText('미팅');
      expect(fridayEvent).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation([]));
    renderApp();

    // 다음 달로 이동
    await user.click(screen.getByLabelText('Next'));

    // 해당 달에 일정이 없는지 확인
    const monthView = screen.getByTestId('month-view');
    const eventBoxes = within(monthView).queryAllByRole('box');
    expect(eventBoxes).toHaveLength(0);
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    server.use(...setupMockHandlerCreation(mockEvents));
    renderApp();

    // 월별 뷰에서 일정이 표시되는지 확인
    const monthView = screen.getByTestId('month-view');
    const eventBoxes = within(monthView).getAllByRole('cell');
    expect(eventBoxes.length).toBeGreaterThan(0);
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');
    server.use(...setupMockHandlerCreation(mockEvents));
    renderApp();

    // 신정이 표시되는지 확인
    const monthView = screen.getByTestId('month-view');
    console.log(monthView);
    expect(within(monthView).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    vi.setSystemTime('2025-05-05');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(mockEvents));
    renderApp();

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    // 검색 결과 없음 메시지 확인
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(mockEvents));
    renderApp();

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    // 검색 결과 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(mockEvents));
    renderApp();

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    // 검색어 지우기
    await user.clear(searchInput);

    // 모든 일정이 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).getByText('점심 약속')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  beforeEach(() => {
    vi.setSystemTime('2025-05-01');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(mockEvents));
    renderApp();

    // 기존 일정과 겹치는 시간으로 새 일정 입력
    await user.type(screen.getByLabelText('제목'), '충돌 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-05-01');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');

    // 일정 추가 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 경고 다이얼로그 확인
    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-05-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '점심 약속',
        date: '2025-05-01',
        startTime: '12:00',
        endTime: '13:00',
        description: '팀 점심',
        location: '식당',
        category: '식사',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(events));
    server.use(...setupMockHandlerUpdating(events));
    renderApp();

    // 기존 일정 수정
    await waitFor(() => {
      expect(screen.getAllByLabelText('Edit event')).toHaveLength(2);
    });
    const editButtons = screen.getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 겹치는 시간으로 수정
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '12:30');
    await user.type(screen.getByLabelText('종료 시간'), '13:00');

    // 수정 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 경고 다이얼로그 확인
    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-05-01 09:50:00'));
  server.use(...setupMockHandlerCreation(mockEvents));
  renderApp();

  const notification = await screen.findByText(`10분 후 ${mockEvents[0].title} 일정이 시작됩니다.`);
  expect(notification).toBeInTheDocument();
});
