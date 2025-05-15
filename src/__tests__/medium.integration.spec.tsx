import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import { events } from '../__mocks__/response/realEvents.json' assert { type: 'json' };
import App from '../App';
import { EventFormProvider } from '../contexts/event-form-context';
import { server } from '../setupTests';
import { Event } from '../types';

const renderApp = () => {
  return render(
    <EventFormProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </EventFormProvider>
  );
};

describe('일정 CRUD 및 기본 기능', () => {
  let user: UserEvent;
  beforeEach(() => {
    vi.setSystemTime('2025-05-19');
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    server.use(...setupMockHandlerCreation(events as Event[]));
    renderApp();

    const newEvent = {
      id: '1',
      title: '테스트 일정',
      date: '2025-05-22',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 일정 설명',
      location: '테스트 일정 장소',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    await user.type(screen.getByLabelText('제목'), newEvent.title);
    await user.type(screen.getByLabelText('날짜'), newEvent.date);
    await user.type(screen.getByLabelText('시작 시간'), newEvent.startTime);
    await user.type(screen.getByLabelText('종료 시간'), newEvent.endTime);
    await user.type(screen.getByLabelText('설명'), newEvent.description);
    await user.type(screen.getByLabelText('위치'), newEvent.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), newEvent.category);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText(newEvent.title)).toBeInTheDocument();
      expect(within(eventList).getByText(newEvent.date)).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    server.use(...setupMockHandlerUpdating(events as Event[]));
    renderApp();

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText(events[0].title)).toBeInTheDocument();
    });

    const editButton = within(eventList).getByTestId(`edit-button-${events[0].id}`);
    await user.click(editButton);

    const title = screen.getByLabelText('제목');
    await user.clear(title);
    await user.type(title, '수정된 제목');

    const date = screen.getByLabelText('날짜');
    await user.clear(date);
    await user.type(date, '2025-05-23');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    const newEventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(newEventList).getByText('수정된 제목')).toBeInTheDocument();
      expect(within(newEventList).getByText('2025-05-23')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    server.use(...setupMockHandlerDeletion(events as Event[]));
    renderApp();

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText(events[0].title)).toBeInTheDocument();
    });

    const deleteButton = within(eventList).getByTestId(`delete-button-${events[0].id}`);
    await user.click(deleteButton);

    await waitFor(() => {
      expect(within(eventList).queryByText(events[0].title)).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  let user: UserEvent;
  beforeEach(() => {
    vi.setSystemTime('2025-05-19');
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime('2025-05-01');
    server.use(...setupMockHandlerCreation(events as Event[]));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(events[0].title)).toBeInTheDocument();

    const viewSelector = screen.getByTestId('view-selector');
    await user.selectOptions(viewSelector, 'week');

    const eventList2 = await screen.findByTestId('event-list');
    expect(within(eventList2).queryByText(events[0].title)).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime('2025-05-20');
    server.use(...setupMockHandlerCreation(events as Event[]));
    renderApp();

    const viewSelector = screen.getByTestId('view-selector');
    await user.selectOptions(viewSelector, 'week');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(events[0].title)).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime('2025-04-01');
    server.use(...setupMockHandlerCreation(events as Event[]));
    renderApp();

    const viewSelector = screen.getByTestId('view-selector');
    await user.selectOptions(viewSelector, 'month');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).queryByText(events[0].title)).not.toBeInTheDocument();
    expect(within(eventList).queryByText(events[1].title)).not.toBeInTheDocument();
    expect(within(eventList).queryByText(events[2].title)).not.toBeInTheDocument();
    expect(within(eventList).queryByText(events[3].title)).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-05-01');
    server.use(...setupMockHandlerCreation(events as Event[]));
    renderApp();

    const viewSelector = screen.getByTestId('view-selector');
    await user.selectOptions(viewSelector, 'month');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(events[0].title)).toBeInTheDocument();
    expect(within(eventList).getByText(events[1].title)).toBeInTheDocument();
    expect(within(eventList).getByText(events[3].title)).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');
    server.use(...setupMockHandlerCreation(events as Event[]));
    renderApp();

    expect(await screen.findByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  let user: UserEvent;
  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    vi.setSystemTime('2025-05-20');
    server.use(...setupMockHandlerCreation(events as Event[]));
    renderApp();

    const searchKeyword = screen.getByLabelText('일정 검색');
    await user.type(searchKeyword, '검색어');

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    vi.setSystemTime('2025-05-20');
    server.use(...setupMockHandlerCreation(events as Event[]));
    renderApp();

    const searchKeyword = screen.getByLabelText('일정 검색');
    await user.type(searchKeyword, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    vi.setSystemTime('2025-05-01');
    server.use(...setupMockHandlerCreation(events as Event[]));
    renderApp();

    const searchKeyword = screen.getByLabelText('일정 검색');
    await user.type(searchKeyword, '팀 회의');

    const eventList1 = screen.getByTestId('event-list');
    expect(within(eventList1).getByText(events[0].title)).toBeInTheDocument();
    expect(within(eventList1).queryByText(events[1].title)).not.toBeInTheDocument();
    expect(within(eventList1).queryByText(events[3].title)).not.toBeInTheDocument();

    await user.clear(searchKeyword);

    const eventList2 = await screen.findByTestId('event-list');
    expect(within(eventList2).getByText(events[0].title)).toBeInTheDocument();
    expect(within(eventList2).getByText(events[1].title)).toBeInTheDocument();
    expect(within(eventList2).getByText(events[3].title)).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  let user: UserEvent;
  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    vi.setSystemTime('2025-05-01');
    server.use(...setupMockHandlerCreation(events as Event[]));
    renderApp();

    const newEvent = {
      id: '1',
      title: '팀 회의 중복 테스트',
      date: '2025-05-20',
      startTime: '10:10',
      endTime: '10:50',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    await user.type(screen.getByLabelText('제목'), newEvent.title);
    await user.type(screen.getByLabelText('날짜'), newEvent.date);
    await user.type(screen.getByLabelText('시작 시간'), newEvent.startTime);
    await user.type(screen.getByLabelText('종료 시간'), newEvent.endTime);
    await user.type(screen.getByLabelText('설명'), newEvent.description);
    await user.type(screen.getByLabelText('위치'), newEvent.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), newEvent.category);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    vi.setSystemTime('2025-05-01');
    server.use(...setupMockHandlerUpdating(events as Event[]));
    renderApp();

    const eventList1 = await screen.findByTestId('event-list');
    expect(within(eventList1).getByText(events[0].title)).toBeInTheDocument();

    const editButton = within(eventList1).getByTestId(`edit-button-${events[0].id}`);
    await user.click(editButton);

    const date = screen.getByLabelText('날짜');
    await user.clear(date);
    await user.type(date, '2025-05-21');

    const startTime = screen.getByLabelText('시작 시간');
    await user.clear(startTime);
    await user.type(startTime, '18:30');

    const endTime = screen.getByLabelText('종료 시간');
    await user.clear(endTime);
    await user.type(endTime, '18:40');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const user = userEvent.setup();
  vi.setSystemTime('2025-05-01');
  server.use(...setupMockHandlerCreation(events as Event[]));
  renderApp();

  const newEvent = {
    id: '1',
    title: '우리집 강아지 생일 파티',
    date: '2025-05-28',
    startTime: '19:00',
    endTime: '22:00',
    description: '생일 축하',
    location: '우리집',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: '10',
  };

  await user.type(screen.getByLabelText('제목'), newEvent.title);
  await user.type(screen.getByLabelText('날짜'), newEvent.date);
  await user.type(screen.getByLabelText('시작 시간'), newEvent.startTime);
  await user.type(screen.getByLabelText('종료 시간'), newEvent.endTime);
  await user.type(screen.getByLabelText('설명'), newEvent.description);
  await user.type(screen.getByLabelText('위치'), newEvent.location);
  await user.selectOptions(screen.getByLabelText('카테고리'), newEvent.category);
  await user.selectOptions(screen.getByLabelText('알림 설정'), newEvent.notificationTime);

  const submitButton = screen.getByTestId('event-submit-button');
  await user.click(submitButton);

  const eventList = await screen.findByTestId('event-list');
  expect(within(eventList).getByText(newEvent.title)).toBeInTheDocument();

  vi.setSystemTime('2025-05-28 18:50');
  expect(await screen.findByText('10분 전')).toBeInTheDocument();
});
