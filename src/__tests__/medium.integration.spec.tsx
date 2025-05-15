import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';

import { setupMockHandlers } from '../__mocks__/handlersUtils';
import { events } from '../__mocks__/response/mockEvents.json' assert { type: 'json' };
import App from '../App';
import { Event } from '../types';
import { parseHM } from './utils';
import { formatDate } from '../utils/dateUtils';

const MOCK_EVENTS = events as Event[];

let user: UserEvent;

beforeEach(() => {
  vi.setSystemTime(new Date('2025-07-01'));
  user = userEvent.setup();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlers([]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const form = {
      title: '기존 회의2',
      date: '2025-07-10',
      startTime: '23:00',
      endTime: '23:58',
      description: '테스트입니다',
      location: '회의실',
      category: '업무',
    };

    await user.type(screen.getByLabelText('제목'), form.title);
    await user.type(screen.getByLabelText('날짜'), form.date);
    await user.type(screen.getByLabelText('시작 시간'), form.startTime);
    await user.type(screen.getByLabelText('종료 시간'), form.endTime);
    await user.type(screen.getByLabelText('설명'), form.description);
    await user.type(screen.getByLabelText('위치'), form.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), form.category);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);
    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText(form.title)).toBeInTheDocument();
      expect(within(eventList).getByText(form.date)).toBeInTheDocument();
      expect(
        within(eventList).getByText(`${form.startTime} - ${form.endTime}`)
      ).toBeInTheDocument();
      expect(within(eventList).getByText(form.description)).toBeInTheDocument();
      expect(within(eventList).getByText(form.location)).toBeInTheDocument();
      expect(within(eventList).getByText(`카테고리: ${form.category}`)).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlers(MOCK_EVENTS);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();

    const editButton = within(eventList).getByTestId(`edit-event-button-${MOCK_EVENTS[0].id}`);
    await user.click(editButton);

    const title = screen.getByLabelText('제목');
    await user.clear(title);
    await user.type(title, '기존희의 수정');

    const date = screen.getByLabelText('날짜');
    await user.clear(date);
    await user.type(date, '2025-07-14');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    const newEventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(newEventList).getByText('기존희의 수정')).toBeInTheDocument();
      expect(within(newEventList).getByText('2025-07-14')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlers(MOCK_EVENTS);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

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
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlers([{ ...MOCK_EVENTS[0], date: '2025-12-31' }]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    await user.selectOptions(screen.getByLabelText('view'), 'week');

    const eventList = await screen.findByTestId('event-list');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlers([MOCK_EVENTS[0]]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    await user.selectOptions(screen.getByLabelText('view'), 'week');
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlers([{ ...MOCK_EVENTS[0], date: '2025-12-31' }]);
    2;
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    await user.selectOptions(screen.getByLabelText('view'), 'month');

    const eventList = await screen.findByTestId('event-list');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlers([MOCK_EVENTS[0]]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const viewSelector = screen.getByTestId('view-selector');
    await user.selectOptions(viewSelector, 'month');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const date = new Date('2025-01-01');
    vi.setSystemTime(date);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    await user.selectOptions(screen.getByLabelText('view'), 'month');

    const monthView = await screen.findByTestId('month-view');

    expect(within(monthView).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlers(MOCK_EVENTS);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    await user.type(screen.getByLabelText('일정 검색'), '항해 화이팅....');

    const eventList = await screen.findByTestId('event-list');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'기존 팀 미팅'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlers(MOCK_EVENTS);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const eventList = await screen.findByTestId('event-list');

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '기존 팀 미팅');

    expect(within(eventList).getByText('기존 팀 미팅')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlers(MOCK_EVENTS);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    const eventList = await screen.findByTestId('event-list');

    await user.type(searchInput, '기존 팀 미팅');
    expect(within(eventList).getByText('기존 팀 미팅')).toBeInTheDocument();

    await user.clear(searchInput);

    await waitFor(() => {
      expect(within(eventList).getByText(MOCK_EVENTS[1].title)).toBeInTheDocument();
      expect(within(eventList).getByText(MOCK_EVENTS[2].title)).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlers(MOCK_EVENTS);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    await user.type(screen.getByLabelText('제목'), '기존 회늬');
    await user.type(screen.getByLabelText('날짜'), formatDate(new Date()));
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');

    await user.click(screen.getByRole('button', { name: '일정 추가' }));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlers(MOCK_EVENTS);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();

    const editButton = within(eventList).getByTestId(`edit-event-button-${MOCK_EVENTS[0].id}`);
    await user.click(editButton);

    const title = screen.getByLabelText('제목');
    await user.clear(title);
    await user.type(title, '테스트회의 수정');

    const date = screen.getByLabelText('날짜');
    await user.clear(date);
    await user.type(date, '2025-07-15');

    const startTime = screen.getByLabelText('시작 시간');
    await user.clear(startTime);
    await user.type(startTime, '09:10');

    const endTime = screen.getByLabelText('종료 시간');
    await user.clear(endTime);
    await user.type(endTime, '10:10');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const now = new Date();
  const startTime = parseHM(now.getTime() + 10 * 60 * 1000);

  setupMockHandlers([{ ...MOCK_EVENTS[0], startTime }]);

  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('10분 전')).toBeInTheDocument();
  });
});
