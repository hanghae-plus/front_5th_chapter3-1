import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { createHandlers } from '../__mocks__/handlers';
import { createMockHandlersUtils } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';
import { render, screen, within, waitFor, fireEvent, act } from './test-utils';

const createCurrentMonthEvent = (title = '테스트 일정', description = '테스트 일정 설명') => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  const newEvent = {
    title,
    date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`,
    startTime: '10:00',
    endTime: '11:00',
    description,
  };

  return newEvent;
};

const addOrUpdateEvent = async (
  user: ReturnType<typeof userEvent.setup>,
  event: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
  }
) => {
  const titleInput = screen.getByLabelText(/제목/i);
  const dateInput = screen.getByLabelText(/날짜/i);
  const startTimeInput = screen.getByLabelText(/시작 시간/i);
  const endTimeInput = screen.getByLabelText(/종료 시간/i);
  const descriptionInput = screen.getByLabelText(/설명/i);

  fireEvent.change(titleInput, { target: { value: event.title } });
  fireEvent.change(dateInput, { target: { value: event.date } });
  fireEvent.change(startTimeInput, { target: { value: event.startTime } });
  fireEvent.change(endTimeInput, { target: { value: event.endTime } });
  fireEvent.change(descriptionInput, { target: { value: event.description } });

  const saveButton = screen.getByTestId('event-submit-button');
  await user.click(saveButton);
};

describe('일정 CUD 기능', () => {
  it('새로운 일정을 등록하면 캘릭더와 일정 목록에서 확인할 수 있다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const user = userEvent.setup();

    render(<App />);

    const NEW_EVENT = createCurrentMonthEvent();

    await addOrUpdateEvent(user, NEW_EVENT);

    await waitFor(() => {
      // 캘린더 뷰에서 확인
      const monthView = screen.getByTestId('month-view');
      expect(within(monthView).getByText(NEW_EVENT.title)).toBeInTheDocument();

      // 이벤트 리스트에서 확인
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText(NEW_EVENT.title)).toBeInTheDocument();
    });
  });

  it('일정을 수정하면 캘린더와 일정 목록에서 확인할 수 있다.', async () => {
    const user = userEvent.setup();

    render(<App />);

    const NEW_EVENT = createCurrentMonthEvent();

    await addOrUpdateEvent(user, NEW_EVENT);

    // 이벤트 리스트에서 "테스트 일정"이 포함된 div를 찾음
    const eventList = screen.getByTestId('event-list');
    const eventItem = within(eventList).getByText(NEW_EVENT.title).closest('div');
    const parent = eventItem?.parentElement;
    const parentDiv = parent?.parentElement;

    // 해당 div 내의 edit 버튼을 찾고, data-testid에서 id 추출
    const editButton = within(parentDiv!).getByRole('button', { name: 'Edit event' });
    const editButtonTestId = editButton.getAttribute('data-testid');
    const id = editButtonTestId?.split('-').pop();

    const editButtonById = screen.getByTestId(`edit-event-button-${id}`);
    await user.click(editButtonById);

    await waitFor(() => {
      expect(screen.getByLabelText(/제목/i)).toHaveValue('테스트 일정');
    });

    const UPDATED_EVENT = {
      ...NEW_EVENT,
      title: '수정된 일정',
      description: '수정된 일정 설명',
    };

    // 각 input을 직접 비우고 type으로 입력
    const titleInput = screen.getByLabelText(/제목/i);
    const dateInput = screen.getByLabelText(/날짜/i);
    const startTimeInput = screen.getByLabelText(/시작 시간/i);
    const endTimeInput = screen.getByLabelText(/종료 시간/i);
    const descriptionInput = screen.getByLabelText(/설명/i);

    // 커스텀 컴포넌트에서는 jsdom 환경에서 focus/clear가 제대로 동작하지 않을 수 있다.
    // fireEvent로 강제로 값과 change 이벤트 발생시켜서 input을 비운다.
    fireEvent.change(titleInput, { target: { value: '' } });
    await user.type(titleInput, UPDATED_EVENT.title);

    fireEvent.change(dateInput, { target: { value: '' } });
    await user.type(dateInput, UPDATED_EVENT.date);

    fireEvent.change(startTimeInput, { target: { value: '' } });
    await user.type(startTimeInput, UPDATED_EVENT.startTime);

    fireEvent.change(endTimeInput, { target: { value: '' } });
    await user.type(endTimeInput, UPDATED_EVENT.endTime);

    fireEvent.change(descriptionInput, { target: { value: '' } });
    await user.type(descriptionInput, UPDATED_EVENT.description);

    const saveButton = screen.getByTestId('event-submit-button');
    await user.click(saveButton);

    await waitFor(() => {
      const monthView = screen.getByTestId('month-view');
      expect(within(monthView).getByText(UPDATED_EVENT.title)).toBeInTheDocument();

      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText(UPDATED_EVENT.title)).toBeInTheDocument();
    });
  });

  it('일정을 삭제하면 캘린더와 일정 목록에서 확인할 수 없다.', async () => {
    const user = userEvent.setup();

    render(<App />);

    const NEW_EVENT = createCurrentMonthEvent();

    await addOrUpdateEvent(user, NEW_EVENT);

    const eventList = screen.getByTestId('event-list');
    const eventItem = within(eventList).getByText(NEW_EVENT.title).closest('div');
    const parent = eventItem?.parentElement;
    const parentDiv = parent?.parentElement;
    const deleteButton = within(parentDiv!).getByRole('button', { name: 'Delete event' });
    await user.click(deleteButton);

    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).queryByText(NEW_EVENT.title)).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const user = userEvent.setup();

    // 1. 주간 뷰에 일정이 없는 경우 응답
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [],
        });
      })
    );

    render(<App />);

    // 2. 주간 뷰로 전환
    const viewSelect = screen.getByLabelText('view');
    await user.selectOptions(viewSelect, 'week');

    // 3. 주간 뷰가 나타나는지 확인
    const weekView = screen.getByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    // 4. 일정이 있는지 확인
    // 일정이 있는지 확인하는 방법....
    // 셀렉트가 변경될때 네트워크 요청되는것이 아님
    const allTds = weekView.querySelectorAll('td');

    allTds.forEach((td) => {
      expect(td.querySelector('div')).toBeNull();
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const user = userEvent.setup();

    render(<App />);

    const NEW_EVENT = createCurrentMonthEvent();

    await addOrUpdateEvent(user, NEW_EVENT);

    // 2. 주간 뷰로 전환
    const viewSelect = screen.getByLabelText('view');
    await user.selectOptions(viewSelect, 'week');

    const weekView = screen.getByTestId('week-view');
    expect(within(weekView).getByText(NEW_EVENT.title)).toBeInTheDocument();

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText(NEW_EVENT.title)).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [],
        });
      })
    );

    render(<App />);

    const NEW_EVENT = createCurrentMonthEvent();

    await addOrUpdateEvent(user, NEW_EVENT);

    const viewSelect = screen.getByLabelText('view');
    await user.selectOptions(viewSelect, 'month');

    const monthView = screen.getByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    const allTds = monthView.querySelectorAll('td');

    allTds.forEach((td) => {
      expect(td.querySelector('div')).toBeNull();
    });
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const user = userEvent.setup();

    render(<App />);

    const NEW_EVENT = createCurrentMonthEvent();

    await addOrUpdateEvent(user, NEW_EVENT);

    const viewSelect = screen.getByLabelText('view');
    await user.selectOptions(viewSelect, 'month');

    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).getByText(NEW_EVENT.title)).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    // 공휴일로 표시 -> 색상
    // 공휴일 색상 전역적으로 사용할 수 있게 수정할 수 있을까?
    // 다른 방법이 있을까?
    const holidayColor = 'css-19gpx6';

    // currentDate를 1월 1일로 설정
    const currentDate = new Date('2025-01-01');
    vi.spyOn(global, 'Date').mockImplementation(() => currentDate);

    render(<App />);

    const monthView = screen.getByTestId('month-view');
    const holidayElement = within(monthView).getByText('신정');

    expect(holidayElement.className).toContain(holidayColor);
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const user = userEvent.setup();

    render(<App />);

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, '트랄라레오트랄랄라.');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const user = userEvent.setup();

    render(<App />);

    // 이미 events에 있지만 날짜를 고려해서 생성
    const createEvent = createCurrentMonthEvent('팀 회의');
    await addOrUpdateEvent(user, createEvent);

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, '팀 회의');

    const items = screen.getAllByText('팀 회의');
    expect(items.length).toBeGreaterThan(0);
  });

  it('검색어를 지우면 모든 일정이 리스트에 다시 표시되어야 한다', async () => {
    // "모든일정"의 기준은?
    const user = userEvent.setup();

    render(<App />);

    const NEW_EVENT = createCurrentMonthEvent();
    await addOrUpdateEvent(user, NEW_EVENT);

    // 1. 초기 상태에서 일정 개수 저장
    const eventList = screen.getByTestId('event-list');
    const initialAllEvents = await waitFor(() => within(eventList).getAllByTestId('event-item'));
    const initialCount = initialAllEvents.length;

    // 2. 검색어 입력 후, 다시 지움
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, '아무 검색어');
    fireEvent.change(searchInput, { target: { value: '' } });

    // 3. 모든 일정이 다시 표시되는지 확인
    await screen.findByTestId('event-list');
    const allEvents = await waitFor(() => within(eventList).getAllByTestId('event-item'));
    expect(allEvents.length).toBe(initialCount);
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const user = userEvent.setup();

    render(<App />);

    const NEW_EVENT = createCurrentMonthEvent('새로운 일정', '새로운 일정 설명');

    await addOrUpdateEvent(user, NEW_EVENT);

    const items = screen.getAllByText('새로운 일정');
    expect(items.length).toBeGreaterThan(0);

    const OVERLAP_EVENT = createCurrentMonthEvent('겹치는 일정', '겹치는 일정 설명');

    // 각 input을 직접 비우고 type으로 입력
    const titleInput = screen.getByLabelText(/제목/i);
    const dateInput = screen.getByLabelText(/날짜/i);
    const startTimeInput = screen.getByLabelText(/시작 시간/i);
    const endTimeInput = screen.getByLabelText(/종료 시간/i);
    const descriptionInput = screen.getByLabelText(/설명/i);

    // 커스텀 컴포넌트에서는 jsdom 환경에서 focus/clear가 제대로 동작하지 않을 수 있다.
    // fireEvent로 강제로 값과 change 이벤트 발생시켜서 input을 비운다.
    fireEvent.change(titleInput, { target: { value: '' } });
    await user.type(titleInput, OVERLAP_EVENT.title);

    fireEvent.change(dateInput, { target: { value: '' } });
    await user.type(dateInput, OVERLAP_EVENT.date);

    fireEvent.change(startTimeInput, { target: { value: '' } });
    await user.type(startTimeInput, OVERLAP_EVENT.startTime);

    fireEvent.change(endTimeInput, { target: { value: '' } });
    await user.type(endTimeInput, OVERLAP_EVENT.endTime);

    fireEvent.change(descriptionInput, { target: { value: '' } });
    await user.type(descriptionInput, OVERLAP_EVENT.description);

    const saveButton = screen.getByTestId('event-submit-button');
    await user.click(saveButton);

    const overlapDialog = await waitFor(() => screen.getByTestId('overlap-dialog'));

    expect(overlapDialog).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const user = userEvent.setup();

    render(<App />);

    // 첫 번째 일정 등록
    const FIRST_EVENT = createCurrentMonthEvent('첫 번째 일정', '첫 번째 일정 설명');
    await addOrUpdateEvent(user, FIRST_EVENT);

    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).getByText(FIRST_EVENT.title)).toBeInTheDocument();

    // 두 번째 일정 등록
    const SECOND_EVENT = {
      title: '두 번째 일정',
      date: '2025-05-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '두 번째 일정 설명',
    };

    await addOrUpdateEvent(user, SECOND_EVENT);

    expect(within(monthView).getByText(SECOND_EVENT.title)).toBeInTheDocument();

    // 첫 번째 일정 수정 버튼 클릭
    const eventList = screen.getByTestId('event-list');
    const eventItem = within(eventList).getByText(FIRST_EVENT.title).closest('div');

    expect(eventItem).toBeInTheDocument();

    const parent = eventItem?.parentElement;
    const parentDiv = parent?.parentElement;

    expect(parentDiv).toBeInTheDocument();
    const editButton = within(parentDiv!).getByTestId(/^edit-event-button-/);

    const editButtonTestId = editButton.getAttribute('data-testid');
    const id = editButtonTestId?.split('-').pop();

    const editButtonById = screen.getByTestId(`edit-event-button-${id}`);
    await user.click(editButtonById);

    const titleInput = screen.getByLabelText(/제목/i);
    const dateInput = screen.getByLabelText(/날짜/i);
    const startTimeInput = screen.getByLabelText(/시작 시간/i);
    const endTimeInput = screen.getByLabelText(/종료 시간/i);
    const descriptionInput = screen.getByLabelText(/설명/i);

    fireEvent.change(titleInput, { target: { value: FIRST_EVENT.title } });

    fireEvent.change(dateInput, { target: { value: SECOND_EVENT.date } });

    fireEvent.change(startTimeInput, { target: { value: SECOND_EVENT.startTime } });

    fireEvent.change(endTimeInput, { target: { value: SECOND_EVENT.endTime } });

    fireEvent.change(descriptionInput, { target: { value: FIRST_EVENT.description } });

    const saveButton = screen.getByTestId('event-submit-button');
    expect(saveButton).toBeInTheDocument();
    await user.click(saveButton);

    await waitFor(() => {
      const overlapDialog = screen.getByTestId('overlap-dialog');
      expect(overlapDialog).toBeInTheDocument();
    });
  });
});

it('notificationTime을 10으로 하면 알림이 노출된다', async () => {
  const MOCK_EVENTS = [
    {
      id: '999',
      title: '알림 테스트',
      date: '2025-05-15',
      startTime: '09:00',
      endTime: '09:10',
      description: '알림 테스트 설명',
      notificationTime: 10,
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
    },
  ];

  act(() => {
    vi.setSystemTime('2025-05-15 08:50:00');
  });

  const mockUtils = createMockHandlersUtils(MOCK_EVENTS as Event[]);
  server.resetHandlers(...createHandlers(mockUtils));

  render(<App />);

  await waitFor(() => {
    const notification = screen.getByText(`10분 후 ${MOCK_EVENTS[0].title} 일정이 시작됩니다.`);
    expect(notification).toBeInTheDocument();
  });
});
