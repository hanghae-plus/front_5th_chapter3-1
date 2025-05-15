import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor, cleanup } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { setupServer } from 'msw/node';

import { handlers } from '../__mocks__/handlers';
import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import App from '../App';
import { Event } from '../types';

const server = setupServer(...handlers);

beforeAll(() => {
  server.resetHandlers();
  vi.setSystemTime(new Date('2025-10-15T08:00:00'));
  server.listen();
});
afterAll(() => {
  vi.useRealTimers();
  server.close();
});
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

const renderApp = () =>
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );

describe('일정 CRUD 및 기본 기능', () => {
  const user: UserEvent = userEvent.setup();

  beforeEach(() => {
    setupMockHandlerCreation(events as Event[]);
    renderApp();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categorySelect = screen.getByLabelText('카테고리');
    const notificationSelect = screen.getByLabelText('알림 설정');

    await user.type(titleInput, 'Test Event');
    await user.type(dateInput, '2025-10-16');
    await user.type(startTimeInput, '10:00');
    await user.type(endTimeInput, '11:00');
    await user.type(descriptionInput, '테스트 설명');
    await user.type(locationInput, '테스트 위치');
    await user.selectOptions(categorySelect, '개인');
    await user.selectOptions(notificationSelect, '1시간 전');

    const addButton = screen.getByTestId('event-submit-button');
    await user.click(addButton);

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('Test Event')).toBeInTheDocument();
      expect(within(eventList).getByText('2025-10-16')).toBeInTheDocument();
      expect(within(eventList).getByText('10:00 - 11:00')).toBeInTheDocument();
      expect(within(eventList).getByText('테스트 설명')).toBeInTheDocument();
      expect(within(eventList).getByText('테스트 위치')).toBeInTheDocument();
      expect(within(eventList).getByText('카테고리: 개인')).toBeInTheDocument();
      expect(within(eventList).getByText('알림: 1시간 전')).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const eventList = screen.getByTestId('event-list');
    const editButton = await waitFor(() => screen.getByRole('button', { name: /Edit event/i }));

    await user.click(editButton);

    const titleInput = screen.getByLabelText('제목');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const submitButton = screen.getByTestId('event-submit-button');

    await user.clear(titleInput);
    await user.type(titleInput, '수정된 일정');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '12:00');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '13:00');

    await user.click(submitButton);

    await waitFor(() => {
      expect(within(eventList).getByText('수정된 일정')).toBeInTheDocument();
      expect(within(eventList).getByText('12:00 - 13:00')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const deleteButton = await waitFor(() => screen.getByRole('button', { name: /Delete event/i }));
    const eventList = screen.getByTestId('event-list');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(within(eventList).queryByText('기존 회의')).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    setupMockHandlerCreation(events as Event[]);
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    renderApp();

    const calendar = screen.getByTestId('month-view');

    expect(within(calendar).getByText('신정')).toBeInTheDocument();
  });

  describe('월별 뷰', () => {
    const user: UserEvent = userEvent.setup();

    it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
      vi.setSystemTime(new Date('2025-05-13'));

      renderApp();

      const calendarSelect = screen.getByLabelText('view');
      const eventList = screen.getByTestId('event-list');
      act(() => {
        user.selectOptions(calendarSelect, 'month');
      });
      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
      vi.setSystemTime(new Date('2025-10-15'));

      renderApp();

      const calendarSelect = screen.getByLabelText('view');
      const eventList = screen.getByTestId('event-list');

      await waitFor(() => {
        user.selectOptions(calendarSelect, 'month');
      });

      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(within(eventList).getByText('2025-10-15')).toBeInTheDocument();
    });
  });
});

describe('주별 뷰', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-15T08:00:00'));
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation(events as Event[]);

    renderApp();

    const calendarSelect = screen.getByLabelText('view');
    await act(async () => {
      await user.selectOptions(calendarSelect, 'week');
    });

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(within(eventList).getByText('2025-10-15')).toBeInTheDocument();
    });
  });
});

describe('검색 기능', () => {
  const user: UserEvent = userEvent.setup();

  beforeEach(async () => {
    vi.setSystemTime(new Date('2025-10-15T08:00:00'));
    setupMockHandlerCreation(events as Event[]);

    renderApp();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.type(searchInput, '검색어');
    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it("'기존 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    const eventList = screen.getByTestId('event-list');

    await user.type(searchInput, '기존 회의');
    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    const eventList = screen.getByTestId('event-list');
    await user.type(searchInput, '팀 회의');
    await user.clear(searchInput);
    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  const user: UserEvent = userEvent.setup();

  beforeEach(() => {
    setupMockHandlerCreation(events as Event[]);
    renderApp();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const scheduleButton = screen.getByTestId('event-submit-button');

    await user.type(titleInput, '기존 회의');
    await user.type(dateInput, '2025-10-15');
    await user.type(startTimeInput, '09:00');
    await user.type(endTimeInput, '10:00');
    await user.click(scheduleButton);

    const dialog = screen.getByTestId('overlap-dialog');
    expect(within(dialog).getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const scheduleButton = screen.getByTestId('event-submit-button');

    // 1. 팀 회의 일정 추가
    await user.type(titleInput, '팀 회의');
    await user.type(dateInput, '2025-10-15');
    await user.type(startTimeInput, '10:00');
    await user.type(endTimeInput, '11:00');
    await user.click(scheduleButton);

    // 해당 카드 내의 수정 버튼 클릭
    const editButton = screen.getAllByRole('button', { name: /Edit event/i })[1];

    await user.click(editButton);

    // 시간 변경 → 기존 일정(09:00~10:00)과 겹치게 수정
    const updatedStartTimeInput = screen.getByLabelText('시작 시간');
    const updatedEndTimeInput = screen.getByLabelText('종료 시간');

    await user.clear(updatedStartTimeInput);
    await user.type(updatedStartTimeInput, '09:00');

    await user.clear(updatedEndTimeInput);
    await user.type(updatedEndTimeInput, '10:00');

    // 수정 저장
    await user.click(scheduleButton);

    const dialog = screen.getByTestId('overlap-dialog');
    expect(within(dialog).getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

describe('알림 기능', () => {
  beforeEach(() => {
    setupMockHandlerCreation(events as Event[]);
    renderApp();
  });

  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    vi.setSystemTime(new Date('2025-10-15T08:50:00'));
    expect(await screen.findByText('10분 전')).toBeInTheDocument();
  });
});
