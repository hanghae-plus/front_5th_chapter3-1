import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';

import { handlers } from '../__mocks__/handlers';
import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';
// ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.

describe('일정 CRUD 및 기본 기능', () => {
  const userSetup: UserEvent = userEvent.setup();

  beforeEach(() => {
    setupMockHandlerCreation(events as Event[]);

    server.use(handlers[0], handlers[1], handlers[2], handlers[3]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const scheduleButton = screen.getByTestId('event-submit-button');
    const eventList = screen.getByTestId('event-list');

    await userSetup.type(titleInput, '팀 회의');
    await userSetup.type(dateInput, new Date().toISOString().split('T')[0]);
    await userSetup.type(startTimeInput, '10:00');
    await userSetup.type(endTimeInput, '11:00');

    await userSetup.click(scheduleButton);

    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const scheduleButton = screen.getByTestId('event-submit-button');
    const eventList = screen.getByTestId('event-list');

    await userSetup.type(titleInput, '팀 회의');
    await userSetup.type(dateInput, new Date().toISOString().split('T')[0]);
    await userSetup.type(startTimeInput, '10:00');
    await userSetup.type(endTimeInput, '11:00');

    await userSetup.click(scheduleButton);

    await userSetup.clear(titleInput);
    await userSetup.type(titleInput, '팀 회의 수정');
    await userSetup.clear(dateInput);
    await userSetup.type(dateInput, new Date().toISOString().split('T')[0]);
    await userSetup.clear(startTimeInput);
    await userSetup.type(startTimeInput, '08:00');
    await userSetup.clear(endTimeInput);
    await userSetup.type(endTimeInput, '09:00');

    await userSetup.click(scheduleButton);

    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의 수정')).toBeInTheDocument();
      expect(within(eventList).getByText('08:00 - 09:00')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const scheduleButton = screen.getByTestId('event-submit-button');
    const eventList = screen.getByTestId('event-list');

    await userSetup.type(titleInput, '팀 회의');
    await userSetup.type(dateInput, new Date().toISOString().split('T')[0]);
    await userSetup.type(startTimeInput, '10:00');
    await userSetup.type(endTimeInput, '11:00');

    await userSetup.click(scheduleButton);

    const deleteButton = within(eventList).getByLabelText('Delete event');

    await userSetup.click(deleteButton);

    await waitFor(() => {
      expect(within(eventList).queryByText('팀 회의')).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const currentDate = new Date('2025-01-01');
    vi.setSystemTime(currentDate);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const calendar = screen.getByTestId('month-view');

    expect(within(calendar).getByText('신정')).toBeInTheDocument();
  });

  describe('주별 뷰', () => {
    const userSetup: UserEvent = userEvent.setup();

    afterEach(() => {
      vi.useRealTimers();
    });

    it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
      const currentDate = new Date('2025-05-13');
      vi.setSystemTime(currentDate);

      render(
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );

      const calendarSelect = screen.getByLabelText('view');
      const eventList = screen.getByTestId('event-list');

      await act(() => {
        userSetup.selectOptions(calendarSelect, 'week');
      });

      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
      const currentDate = new Date('2025-10-15');
      vi.setSystemTime(currentDate);

      render(
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );

      const calendarSelect = screen.getByLabelText('view');
      const eventList = screen.getByTestId('event-list');

      await act(() => {
        userSetup.selectOptions(calendarSelect, 'week');
      });

      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(within(eventList).getByText('2025-10-15')).toBeInTheDocument();
    });
  });

  describe('월별 뷰', () => {
    const userSetup: UserEvent = userEvent.setup();

    afterEach(() => {
      vi.useRealTimers();
    });

    it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
      const currentDate = new Date('2025-05-13');
      vi.setSystemTime(currentDate);

      render(
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );

      const calendarSelect = screen.getByLabelText('view');
      const eventList = screen.getByTestId('event-list');

      await act(() => {
        userSetup.selectOptions(calendarSelect, 'month');
      });

      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
    it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
      const currentDate = new Date('2025-10-15');
      vi.setSystemTime(currentDate);

      render(
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );

      const calendarSelect = screen.getByLabelText('view');
      const eventList = screen.getByTestId('event-list');

      await act(() => {
        userSetup.selectOptions(calendarSelect, 'month');
      });

      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(within(eventList).getByText('2025-10-15')).toBeInTheDocument();
    });
  });
});

describe('검색 기능', () => {
  const userSetup: UserEvent = userEvent.setup();

  beforeEach(() => {
    setupMockHandlerCreation(events as Event[]);

    server.use(handlers[0], handlers[1]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    await userSetup.type(searchInput, '검색어');

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const scheduleButton = screen.getByTestId('event-submit-button');
    const eventList = screen.getByTestId('event-list');

    await userSetup.type(titleInput, '팀 회의');
    await userSetup.type(dateInput, '2025-05-13');
    await userSetup.type(startTimeInput, '10:00');
    await userSetup.type(endTimeInput, '11:00');

    await act(async () => {
      await userSetup.click(scheduleButton);
    });

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    await userSetup.type(searchInput, '팀 회의');

    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const scheduleButton = screen.getByTestId('event-submit-button');

    await userSetup.type(titleInput, '팀 회의');
    await userSetup.type(dateInput, new Date().toISOString().split('T')[0]);
    await userSetup.type(startTimeInput, '10:00');
    await userSetup.type(endTimeInput, '11:00');

    await act(async () => {
      await userSetup.click(scheduleButton);
    });

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    const eventList = screen.getByTestId('event-list');

    await act(async () => {
      await userSetup.clear(searchInput);
    });

    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  const userSetup: UserEvent = userEvent.setup();

  beforeEach(() => {
    setupMockHandlerCreation(events as Event[]);

    server.use(handlers[0], handlers[1], handlers[2], handlers[3]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const scheduleButton = screen.getByTestId('event-submit-button');

    await userSetup.type(titleInput, '기존 회의');
    await userSetup.type(dateInput, '2025-10-15');
    await userSetup.type(startTimeInput, '09:00');
    await userSetup.type(endTimeInput, '10:00');

    await userSetup.click(scheduleButton);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    vi.setSystemTime(new Date('2025-10-15'));

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const scheduleButton = screen.getByTestId('event-submit-button');
    const eventList = screen.getByTestId('event-list');

    await userSetup.type(titleInput, '팀 회의');
    await userSetup.type(dateInput, new Date().toISOString().split('T')[0]);
    await userSetup.type(startTimeInput, '10:00');
    await userSetup.type(endTimeInput, '11:00');

    await act(async () => {
      await userSetup.click(scheduleButton);
    });

    const editButtons = within(eventList).getAllByLabelText('Edit event');

    await act(async () => {
      await userSetup.click(editButtons[1]);
    });

    await userSetup.clear(titleInput);
    await userSetup.type(titleInput, '팀 회의 수정');
    await userSetup.clear(startTimeInput);
    await userSetup.type(startTimeInput, '09:00');
    await userSetup.clear(endTimeInput);
    await userSetup.type(endTimeInput, '10:00');

    const submitButton = screen.getByTestId('event-submit-button');

    await act(async () => {
      await userSetup.click(submitButton);
    });

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

describe('알림 기능', () => {
  beforeEach(() => {
    setupMockHandlerCreation(events as Event[]);
    server.use(handlers[0]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    vi.setSystemTime('2025-10-15T08:50:00');

    expect(await screen.findByText('10분 전')).toBeInTheDocument();
  });
});
