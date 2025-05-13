import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { wait } from '@testing-library/user-event/dist/cjs/utils/index.js';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
  setupMockHandlerDeletion,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event, EventForm } from '../types';
import { formatDate } from '../utils/dateUtils';

const MOCK_EVENTS: Event[] = [
  {
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '팀 회의',
    date: '2025-05-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
    title: '점심 약속',
    date: '2025-05-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
    title: '프로젝트 마감',
    date: '2025-05-25',
    startTime: '09:00',
    endTime: '18:00',
    description: '분기별 프로젝트 마감',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'dac62941-69e5-4ec0-98cc-24c2a79a7f81',
    title: '생일 파티',
    date: '2025-05-28',
    startTime: '19:00',
    endTime: '22:00',
    description: '친구 생일 축하',
    location: '친구 집',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '80d85368-b4a4-47b3-b959-25171d49371f',
    title: '운동',
    date: '2025-05-22',
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

const renderApp = () => {
  const utils = render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
  return utils;
};

describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    vi.setSystemTime('2025-05-01');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation());
    renderApp();

    const NEW_EVENT_FORM = {
      title: '테스트 이벤트 1',
      date: '2025-05-13',
      startTime: '12:00',
      endTime: '14:30',
      description: '테스트 이벤트 설명',
      location: '테스트 이벤트 장소',
      category: '업무',
    };

    await user.type(screen.getByLabelText('제목'), NEW_EVENT_FORM.title);
    await user.type(screen.getByLabelText('날짜'), NEW_EVENT_FORM.date);
    await user.type(screen.getByLabelText('시작 시간'), NEW_EVENT_FORM.startTime);
    await user.type(screen.getByLabelText('종료 시간'), NEW_EVENT_FORM.endTime);
    await user.type(screen.getByLabelText('설명'), NEW_EVENT_FORM.description);
    await user.type(screen.getByLabelText('위치'), NEW_EVENT_FORM.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), NEW_EVENT_FORM.category);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);
    const eventList = await screen.findByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText(NEW_EVENT_FORM.title)).toBeInTheDocument();
      expect(within(eventList).getByText(NEW_EVENT_FORM.date)).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const user = userEvent.setup();
    server.use(...setupMockHandlerUpdating(MOCK_EVENTS));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();

    const editButton = within(eventList).getByTestId(`edit-event-button-${MOCK_EVENTS[0].id}`);
    await user.click(editButton);

    const title = screen.getByLabelText('제목');
    await user.clear(title);
    await user.type(title, '수정된 제목');

    const date = screen.getByLabelText('날짜');
    await user.clear(date);
    await user.type(date, '2025-05-14');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    const newEventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(newEventList).getByText('수정된 제목')).toBeInTheDocument();
      expect(within(newEventList).getByText('2025-05-14')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const user = userEvent.setup();
    server.use(...setupMockHandlerDeletion(MOCK_EVENTS));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();

    const deleteButton = within(eventList).getByTestId(`delete-event-button-${MOCK_EVENTS[0].id}`);
    await user.click(deleteButton);

    await waitFor(() => {
      expect(within(eventList).queryByText(MOCK_EVENTS[0].title)).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime('2025-05-01');
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    // 월별 뷰에서는 일정이 표시됨
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).queryByText(MOCK_EVENTS[0].title)).toBeInTheDocument();

    const viewSelector = screen.getByTestId('view-selector');
    await user.selectOptions(viewSelector, 'week');

    // 주별 뷰로 바꾸면 일정이 표시되지 않음
    const newEventList = await screen.findByTestId('event-list');
    expect(within(newEventList).queryByText(MOCK_EVENTS[0].title)).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime('2025-05-20');
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    const viewSelector = screen.getByTestId('view-selector');
    await user.selectOptions(viewSelector, 'week');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime('2025-04-01');
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    const viewSelector = screen.getByTestId('view-selector');
    await user.selectOptions(viewSelector, 'month');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-05-01');
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    const viewSelector = screen.getByTestId('view-selector');
    await user.selectOptions(viewSelector, 'month');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    const viewSelector = screen.getByTestId('view-selector');
    await user.selectOptions(viewSelector, 'month');

    const calendar = await screen.findByTestId('month-view');
    expect(within(calendar).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    vi.setSystemTime('2025-05-01');
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '입력된 검색어');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    vi.setSystemTime('2025-05-01');
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '팀 회의');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    vi.setSystemTime('2025-05-01');
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '팀 회의');

    // 검색어에 해당하는 일정만 표시. 나머지는 안나옴
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();
    expect(within(eventList).queryByText(MOCK_EVENTS[1].title)).not.toBeInTheDocument();
    expect(within(eventList).queryByText(MOCK_EVENTS[2].title)).not.toBeInTheDocument();
    expect(within(eventList).queryByText(MOCK_EVENTS[3].title)).not.toBeInTheDocument();
    expect(within(eventList).queryByText(MOCK_EVENTS[4].title)).not.toBeInTheDocument();

    await user.clear(searchInput);

    // 검색어를 지우면 모든 일정이 다시 표시됨
    const newEventList = await screen.findByTestId('event-list');
    expect(within(newEventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();
    expect(within(newEventList).getByText(MOCK_EVENTS[1].title)).toBeInTheDocument();
    expect(within(newEventList).getByText(MOCK_EVENTS[2].title)).toBeInTheDocument();
    expect(within(newEventList).getByText(MOCK_EVENTS[3].title)).toBeInTheDocument();
    expect(within(newEventList).getByText(MOCK_EVENTS[4].title)).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    vi.setSystemTime('2025-05-01');
    const user = userEvent.setup();
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    // mock data 첫번째 이벤트와 겹침
    const NEW_EVENT_FORM = {
      title: '중복 테스트 이벤트',
      date: '2025-05-20',
      startTime: '10:10',
      endTime: '10:50',
      description: '중복 테스트',
      location: '테스트 이벤트 장소',
      category: '업무',
    };

    await user.type(screen.getByLabelText('제목'), NEW_EVENT_FORM.title);
    await user.type(screen.getByLabelText('날짜'), NEW_EVENT_FORM.date);
    await user.type(screen.getByLabelText('시작 시간'), NEW_EVENT_FORM.startTime);
    await user.type(screen.getByLabelText('종료 시간'), NEW_EVENT_FORM.endTime);
    await user.type(screen.getByLabelText('설명'), NEW_EVENT_FORM.description);
    await user.type(screen.getByLabelText('위치'), NEW_EVENT_FORM.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), NEW_EVENT_FORM.category);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const user = userEvent.setup();
    server.use(...setupMockHandlerUpdating(MOCK_EVENTS));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();

    const editButton = within(eventList).getByTestId(`edit-event-button-${MOCK_EVENTS[0].id}`);
    await user.click(editButton);

    const title = screen.getByLabelText('제목');
    await user.clear(title);
    await user.type(title, '수정된 제목');

    const date = screen.getByLabelText('날짜');
    await user.clear(date);
    await user.type(date, '2025-05-21');

    const startTime = screen.getByLabelText('시작 시간');
    await user.clear(startTime);
    await user.type(startTime, '12:40');

    const endTime = screen.getByLabelText('종료 시간');
    await user.clear(endTime);
    await user.type(endTime, '13:20');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});
