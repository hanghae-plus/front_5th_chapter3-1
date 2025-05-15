import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';

import { setupMockHandlers } from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

const renderApp = () => {
  return render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

let user: UserEvent; //userEvent를 정의

const newEvent: Event = {
  id: '1',
  title: '일정1',
  date: '2025-05-16',
  startTime: '22:00',
  endTime: '23:00',
  description: '일정1_설명',
  location: '회의실',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 1,
} as const;

beforeEach(() => {
  user = userEvent.setup();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlers([]);
    renderApp();

    await user.type(screen.getByLabelText('제목'), newEvent.title);
    await user.type(screen.getByLabelText('날짜'), newEvent.date);
    await user.type(screen.getByLabelText('시작 시간'), newEvent.startTime);
    await user.type(screen.getByLabelText('종료 시간'), newEvent.endTime);
    await user.type(screen.getByLabelText('설명'), newEvent.description);
    await user.type(screen.getByLabelText('위치'), newEvent.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), newEvent.category);

    await user.click(screen.getByTestId('event-submit-button'));

    const events = await screen.findByTestId('event-list');
    await waitFor(() => {
      expect(within(events).getByText('일정1')).toBeInTheDocument();
      expect(within(events).getByText('2025-05-16')).toBeInTheDocument();
      expect(screen.getByText('일정1_설명')).toBeInTheDocument();
      expect(screen.getByText('회의실')).toBeInTheDocument();
      expect(screen.getByText('업무')).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlers([newEvent]);
    renderApp();

    const events = await screen.findByTestId('event-list');
    expect(await within(events).findByText('일정1')).toBeInTheDocument();
    expect(await within(events).findByText('일정1_설명')).toBeInTheDocument();

    await user.click(await within(events).findByRole('button', { name: 'Edit event' }));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된_일정_제목');

    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '수정된_일정_설명');

    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    expect(await within(events).findByText('수정된_일정_제목')).toBeInTheDocument();
    expect(await within(events).findByText('수정된_일정_설명')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlers([newEvent]);
    renderApp();

    const events = await screen.findByTestId('event-list');
    expect(await within(events).findByText(newEvent.title)).toBeInTheDocument();

    await user.click(await within(events).findByRole('button', { name: 'Delete event' }));

    expect(within(events).queryByText(newEvent.title)).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '일정1',
      date: '2025-05-05',
      startTime: '10:00',
      endTime: '11:00',
      description: '일정1 설명',
      location: '집',
      category: '저녁',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '일정2',
      date: '2025-05-16',
      startTime: '10:00',
      endTime: '11:00',
      description: '일정2 설명',
      location: '집',
      category: '저녁',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ] as const;

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime('2025-05-01');
    setupMockHandlers(events);
    renderApp();

    await user.selectOptions(screen.getByLabelText('view'), 'week');
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime('2025-05-05');
    setupMockHandlers(events);
    renderApp();

    await user.selectOptions(screen.getByLabelText('view'), 'week');
    const eventList = await screen.findByTestId('event-list');

    expect(within(eventList).queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument(); //결과가 있다면 '검색 결과가 없습니다.' 표시 안됨
    expect(within(eventList).getByText('일정1')).toBeInTheDocument();
    expect(within(eventList).getByText('일정1 설명')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime('2025-04-01');
    setupMockHandlers(events);
    renderApp();

    await user.selectOptions(screen.getByLabelText('view'), 'month');
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-05-05');
    setupMockHandlers(events);
    renderApp();

    await user.selectOptions(screen.getByLabelText('view'), 'month');
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();
    expect(within(eventList).getByText('일정1')).toBeInTheDocument();
    expect(within(eventList).getByText('일정1 설명')).toBeInTheDocument();
    expect(within(eventList).getByText('일정2')).toBeInTheDocument();
    expect(within(eventList).getByText('일정2 설명')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');
    setupMockHandlers(events);
    renderApp();

    await user.selectOptions(screen.getByLabelText('view'), 'month');
    expect(screen.getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  const newSearchevents: Event[] = [
    {
      id: '1',
      title: '일정1',
      date: '2025-05-05',
      startTime: '10:00',
      endTime: '11:00',
      description: '일정1 설명',
      location: '집',
      category: '저녁',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '일정2',
      date: '2025-05-16',
      startTime: '10:00',
      endTime: '11:00',
      description: '일정2 설명',
      location: '집',
      category: '저녁',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlers(newSearchevents);
    renderApp();

    const eventList = await screen.findByTestId('event-list');

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '노기훈 탄생일');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'일정1'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlers(newSearchevents);
    renderApp();

    const eventList = await screen.findByTestId('event-list');

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '일정1');
    expect(within(eventList).getByText('일정1')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlers(newSearchevents);
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('일정1')).toBeInTheDocument();
    });

    await user.clear(screen.getByPlaceholderText('검색어를 입력하세요'));
    expect(within(eventList).getByText('일정1')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '일정1',
      date: '2025-05-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '일정1_설명',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '일정2',
      date: '2025-05-16',
      startTime: '10:00',
      endTime: '11:00',
      description: '일정2 팀 회의',
      location: '회의실 2',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  beforeEach(() => {
    setupMockHandlers(events);
    renderApp();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    await user.type(screen.getByLabelText('제목'), 'new title');
    await user.type(screen.getByLabelText('날짜'), '2025-05-16');
    await user.type(screen.getByLabelText('시작 시간'), '10:30');
    await user.type(screen.getByLabelText('종료 시간'), '11:30');
    await user.type(screen.getByLabelText('설명'), 'new describe');
    await user.type(screen.getByLabelText('위치'), '회의실');
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const eventList = screen.getByTestId('event-list');

    const editButton = await within(eventList).findAllByRole('button', { name: 'Edit event' });
    await user.click(editButton[0]);

    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '09:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime('2025-05-15 22:30');

  setupMockHandlers([newEvent]);
  renderApp();
  const eventList = screen.getByTestId('event-list');

  await waitFor(() => {
    expect(within(eventList).getByText('일정1')).toBeInTheDocument();
  });

  vi.setSystemTime('2025-05-15 21:50');
  expect(await screen.findByText('10분 전')).toBeInTheDocument();
});
