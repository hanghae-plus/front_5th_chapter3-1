// import { render, screen, within, act } from '@testing-library/react';
// import { http, HttpResponse } from 'msw';
// import { ReactElement } from 'react';

import { ChakraProvider } from '@chakra-ui/react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import eventJson from '../__mocks__/response/realEvents.json';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

// import { server } from '../setupTests';
// import { Event } from '../types';

describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-05-20T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const { handlers } = setupMockHandlerCreation();
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.

    // 1. 사용자 입력 시뮬레이션
    await userEvent.type(screen.getByLabelText(/제목/), '테스트 일정');
    await userEvent.type(screen.getByLabelText(/날짜/), '2025-05-20');
    await userEvent.type(screen.getByLabelText(/시작 시간/), '10:00');
    await userEvent.type(screen.getByLabelText(/종료 시간/), '11:00');
    await userEvent.type(screen.getByLabelText(/설명/), '통합 테스트 설명');
    await userEvent.type(screen.getByLabelText(/위치/), '회의실 B');

    // 2. 저장 버튼 클릭
    const submitButton = screen.getByTestId('event-submit-button');
    await userEvent.click(submitButton);

    // 3. 리스트에서 추가된 일정 확인
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList!).getByText('회의실 B')).toBeInTheDocument();
    expect(within(eventList!).getByText('통합 테스트 설명')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const mockEvent = eventJson.events as Event[];
    const { handlers } = setupMockHandlerUpdating(mockEvent);
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 기존 일정 선택
    const eventList = await screen.findByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText(mockEvent[0].title)).toBeInTheDocument();
    });

    // 수정 버튼 클릭

    const editButtons = screen.getAllByRole('button', { name: /Edit event/i });
    await userEvent.click(editButtons[0]);

    // 수정 입력
    const titleInput = screen.getByLabelText(/제목/);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, '수정된 제목');

    const endTimeInput = screen.getByLabelText(/종료 시간/);
    await userEvent.clear(endTimeInput);
    await userEvent.type(endTimeInput, '12:30');

    //  저장 버튼 클릭
    const submitButton = screen.getByTestId('event-submit-button');
    await userEvent.click(submitButton);

    // 수정된 내용이 반영됐는지 확인
    const matches = await screen.findAllByText('수정된 제목');
    expect(matches.length).toBeGreaterThan(0);

    const updatedEndTime = await screen.findByText(/10:00\s*-\s*12:30/);
    expect(updatedEndTime).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const mockEvent = eventJson.events as Event[];
    const { handlers } = setupMockHandlerDeletion(mockEvent);
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 초기 이벤트가 잘 보이는지 확인
    const eventList = await screen.findByTestId('event-list');
    const targetTitle = mockEvent[0].title;
    const existingEventItem = within(eventList).getByText((t) => t.includes(targetTitle));
    expect(existingEventItem).toBeInTheDocument();

    // 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole('button', { name: /Delete event/i });
    await userEvent.click(deleteButtons[0]);

    // 삭제 후 해당 이벤트가 리스트에서 사라졌는지 확인
    await screen.findByTestId('event-list');
    expect(screen.queryByText((t) => t.includes(targetTitle))).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-05-01'));

    const mockEvent = eventJson.events as Event[];
    const { handlers } = setupMockHandlerCreation(mockEvent);
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    //  주간 뷰 선택

    const viewSelect = screen.getByTestId('view-select');
    userEvent.selectOptions(viewSelect, 'week');

    // 주간 뷰에 아무 일정도 안 나오는지 확인

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).queryByText(mockEvent[0].title)).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime('2025-05-20');

    const mockEvent = eventJson.events as Event[];
    const { handlers } = setupMockHandlerCreation(mockEvent);
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const viewSelect = screen.getByTestId('view-select');
    userEvent.selectOptions(viewSelect, 'week');

    const eventList = await screen.findByTestId('event-list');
    await waitFor(() => {
      expect(
        within(eventList).getByText((text) => text.includes(mockEvent[0].title))
      ).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-02-01'));

    const mockEvent = eventJson.events as Event[];
    const { handlers } = setupMockHandlerCreation([]); // 이벤트 없음
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const viewSelector = screen.getByTestId('view-select');
    userEvent.selectOptions(viewSelector, 'month');

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).queryByText(mockEvent[0].title)).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-05-20');

    const mockEvent = eventJson.events as Event[];
    const { handlers } = setupMockHandlerCreation(mockEvent);
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const viewSelector = screen.getByTestId('view-select');
    userEvent.selectOptions(viewSelector, 'month');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(mockEvent[0].title)).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    const { handlers } = setupMockHandlerCreation([]); // 이벤트 없어도 휴일은 표시됨
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const viewSelector = screen.getByTestId('view-select');
    userEvent.selectOptions(viewSelector, 'month');

    const calendar = screen.getByTestId('month-view');
    expect(within(calendar).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { handlers } = setupMockHandlerCreation([]);
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const input = screen.getByPlaceholderText(/검색어를 입력하세요/i);
    await userEvent.type(input, '없는 일정');
    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const mockEvents = eventJson.events as Event[];
    const { handlers } = setupMockHandlerCreation(mockEvents);
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const searchInput = screen.getByLabelText('일정 검색');
    await userEvent.type(searchInput, '팀 회의');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const mockEvents = eventJson.events as Event[];
    const { handlers } = setupMockHandlerCreation(mockEvents);
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const input = screen.getByPlaceholderText(/검색어를 입력하세요/i);
    await userEvent.type(input, '팀 회의');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    await userEvent.clear(input);

    // 일정이 다시 표시되는지 확인

    await act(() => {
      mockEvents.forEach((event) => {
        expect(within(screen.getByTestId('event-list')).getByText(event.title)).toBeInTheDocument();
      });
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const mockEvents = eventJson.events as Event[];
    const { handlers } = setupMockHandlerCreation(mockEvents);
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 새로운 일정 입력 (시간 겹침)
    await userEvent.type(screen.getByLabelText(/제목/), '겹치는 일정');
    await userEvent.type(screen.getByLabelText(/날짜/), '2025-05-20');
    await userEvent.type(screen.getByLabelText(/시작 시간/), '10:30');
    await userEvent.type(screen.getByLabelText(/종료 시간/), '11:30');

    const submit = screen.getByTestId('event-submit-button');
    await userEvent.click(submit);

    // 충돌 경고 메시지 노출 확인
    await act(async () => {
      expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const mockEvents = eventJson.events as Event[];
    const { handlers } = setupMockHandlerCreation(mockEvents);
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 수정 버튼 클릭
    const eventList = await screen.findByTestId('event-list');
    const editButton = within(eventList).getByTestId(`edit-event-button-${mockEvents[0].id}`);

    await userEvent.click(editButton); // '점심 약속' 외 다른 일정

    // 날짜도 충돌나는 날로 강제 설정
    await userEvent.clear(screen.getByLabelText(/날짜/));
    await userEvent.type(screen.getByLabelText(/날짜/), '2025-05-21');

    // 기존 시간 → 충돌 시간으로 변경
    await userEvent.clear(screen.getByLabelText(/시작 시간/));
    await userEvent.type(screen.getByLabelText(/시작 시간/), '12:40');

    await userEvent.clear(screen.getByLabelText(/종료 시간/));
    await userEvent.type(screen.getByLabelText(/종료 시간/), '13:10');

    const submit = screen.getByTestId('event-submit-button');
    await userEvent.click(submit);

    // 충돌 경고 메시지 확인
    await act(async () => {
      expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const { handlers } = setupMockHandlerCreation(); // 초기 이벤트 없음
  server.use(...handlers);

  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );

  // 필수 필드 입력
  await userEvent.type(screen.getByLabelText(/제목/), '알람 테스트');
  await userEvent.type(screen.getByLabelText(/날짜/), '2025-05-20');
  await userEvent.type(screen.getByLabelText(/시작 시간/), '10:00');
  await userEvent.type(screen.getByLabelText(/종료 시간/), '11:00');

  // 알림 설정: 10분 전 선택
  const notificationSelect = screen.getByLabelText(/알림 설정/);
  await userEvent.selectOptions(notificationSelect, '10');

  // 저장 버튼 클릭
  const submitButton = screen.getByTestId('event-submit-button');
  await userEvent.click(submitButton);

  // 저장된 알림 텍스트 확인
  const eventList = await screen.findByTestId('event-list');
  expect(within(eventList).getByText(/알림:\s*10분 전/)).toBeInTheDocument();
});
