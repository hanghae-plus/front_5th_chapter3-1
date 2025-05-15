import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';
import { af } from 'vitest/dist/chunks/reporters.C4ZHgdxQ.js';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-05-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-05-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
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
  const user = userEvent.setup();
  beforeEach(() => {
    vi.setSystemTime('2025-05-01');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    server.use(...setupMockHandlerCreation(events as Event[]));
    renderApp();

    const form = {
      title: '테스트 일정',
      date: '2025-05-22',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 일정 설명',
      location: '테스트 일정 장소',
      category: '업무',
    };

    // 입력
    await user.type(screen.getByLabelText('제목'), form.title);
    await user.type(screen.getByLabelText('날짜'), form.date);
    await user.type(screen.getByLabelText('시작 시간'), form.startTime);
    await user.type(screen.getByLabelText('종료 시간'), form.endTime);
    await user.type(screen.getByLabelText('설명'), form.description);
    await user.type(screen.getByLabelText('위치'), form.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), form.category);

    // 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 리스트 확인
    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText(form.title)).toBeInTheDocument();
      expect(within(eventList).getByText(form.date)).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    server.use(...setupMockHandlerUpdating(MOCK_EVENTS));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();

    // 수정버튼 클릭
    const editButton = within(eventList).getByTestId(`event-edit-button-${MOCK_EVENTS[0].id}`);
    await user.click(editButton);

    // 입력
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 제목');
    await user.clear(screen.getByLabelText('날짜'));
    await user.type(screen.getByLabelText('날짜'), '2025-05-23');

    // 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 리스트 확인
    const updatedEventList = await screen.findByTestId('event-list');
    screen.debug(updatedEventList);
    await waitFor(() => {
      expect(within(updatedEventList).getByText('수정된 제목')).toBeInTheDocument();
      expect(within(updatedEventList).getByText('2025-05-23')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    server.use(...setupMockHandlerDeletion(MOCK_EVENTS));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();

    // 삭제버튼 클릭
    const deleteButton = within(eventList).getByTestId(`event-delete-button-${MOCK_EVENTS[0].id}`);
    await user.click(deleteButton);

    // 리스트 확인
    await waitFor(() => {
      expect(within(eventList).queryByText(MOCK_EVENTS[0].title)).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  const user = userEvent.setup();

  afterEach(() => {
    vi.useRealTimers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime('2025-05-01');
    server.use(...setupMockHandlerUpdating(MOCK_EVENTS));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();

    // 주별 뷰 선택
    const weekViewSelector = screen.getByTestId('view-select');
    await user.selectOptions(weekViewSelector, 'week');

    // 일정 확인 X
    const changeEventList = await screen.findByTestId('event-list');
    await waitFor(() => {
      expect(within(changeEventList).queryByText(MOCK_EVENTS[0].title)).not.toBeInTheDocument();
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime('2025-05-19');
    server.use(...setupMockHandlerUpdating(MOCK_EVENTS));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();

    // 주별 뷰 선택
    const weekViewSelector = screen.getByTestId('view-select');
    await user.selectOptions(weekViewSelector, 'week');

    // 일정 확인
    const changeEventList = await screen.findByTestId('event-list');
    await waitFor(() => {
      expect(within(changeEventList).queryByText(MOCK_EVENTS[0].title)).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime('2025-04-01');
    server.use(...setupMockHandlerUpdating(MOCK_EVENTS));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).queryByText(MOCK_EVENTS[0].title)).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-05-01');
    server.use(...setupMockHandlerUpdating(MOCK_EVENTS));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).queryByText(MOCK_EVENTS[0].title)).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    const viewSelector = screen.getByTestId('view-select');
    await user.selectOptions(viewSelector, 'month');

    const calender = await screen.findByTestId('month-view');
    expect(within(calender).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  const user = userEvent.setup();
  // beforeEach(() => {
  //   vi.setSystemTime('2025-05-01');
  // });

  // afterEach(() => {
  //   vi.useRealTimers();
  // });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();

    // 검색어 입력
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, '검색어 없어요');

    // 검색 결과 확인
    await waitFor(() => {
      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it('MOCK_EVENTS[0].title를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다', async () => {
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();

    // 검색어 입력
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, MOCK_EVENTS[0].title);

    // 검색 결과 확인
    await waitFor(() => {
      expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();

    const searchInput = screen.getByTestId('search-input');
    await user.clear(searchInput);

    // 모든 일정 확인
    const updatedEventList = await screen.findByTestId('event-list');
    await waitFor(() => {
      expect(within(updatedEventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();
      expect(within(updatedEventList).getByText(MOCK_EVENTS[1].title)).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.setSystemTime('2025-05-01');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    server.use(...setupMockHandlerCreation(MOCK_EVENTS));
    renderApp();

    const NEW_EVENT = {
      title: '겹치는 일정',
      date: '2025-05-20',
      startTime: '10:30',
      endTime: '11:30',
      description: '겹치는 일정 설명',
      location: '겹치는 일정 장소',
      category: '업무',
    };

    // 입력
    await user.type(screen.getByLabelText('제목'), NEW_EVENT.title);
    await user.type(screen.getByLabelText('날짜'), NEW_EVENT.date);
    await user.type(screen.getByLabelText('시작 시간'), NEW_EVENT.startTime);
    await user.type(screen.getByLabelText('종료 시간'), NEW_EVENT.endTime);
    await user.type(screen.getByLabelText('설명'), NEW_EVENT.description);
    await user.type(screen.getByLabelText('위치'), NEW_EVENT.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), NEW_EVENT.category);

    // 저장
    await user.click(screen.getByTestId('event-submit-button'));

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    server.use(...setupMockHandlerUpdating(MOCK_EVENTS));
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();

    // 수정버튼 클릭
    const editButton = within(eventList).getByTestId(`event-edit-button-${MOCK_EVENTS[0].id}`);
    await user.click(editButton);

    // 입력
    await user.clear(screen.getByLabelText('날짜'));
    await user.type(screen.getByLabelText('날짜'), '2025-05-21');
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '13:00');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '14:30');

    // 저장
    await user.click(screen.getByTestId('event-submit-button'));

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime('2025-05-20');

  server.use(...setupMockHandlerCreation(MOCK_EVENTS));
  renderApp();

  const eventList = await screen.findByTestId('event-list');
  expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();

  vi.setSystemTime('2025-05-20 09:50:00');
  const notification = await screen.findByText('10분 전');
  expect(notification).toBeInTheDocument();

  vi.useRealTimers();
});
