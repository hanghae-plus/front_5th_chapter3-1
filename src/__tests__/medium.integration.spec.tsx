import { screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { setup } from '../libs/testSetup';
import { server } from '../setupTests';
import { Event } from '../types';

const triggerScheduleEvent = async (
  user: UserEvent,
  form: Partial<Omit<Event, 'id' | 'repeat' | 'notificationTime'>>,
  action: 'create' | 'edit'
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  if (title !== undefined) {
    const input = screen.getByLabelText('제목');
    if (action === 'edit') await user.clear(input);
    await user.type(input, title);
  }
  if (date !== undefined) {
    const input = screen.getByLabelText('날짜');
    if (action === 'edit') await user.clear(input);
    await user.type(input, date);
  }
  if (startTime !== undefined) {
    const input = screen.getByLabelText('시작 시간');
    if (action === 'edit') await user.clear(input);
    await user.type(input, startTime);
  }
  if (endTime !== undefined) {
    const input = screen.getByLabelText('종료 시간');
    if (action === 'edit') await user.clear(input);
    await user.type(input, endTime);
  }
  if (description !== undefined) {
    const input = screen.getByLabelText('설명');
    if (action === 'edit') await user.clear(input);
    await user.type(input, description);
  }
  if (location !== undefined) {
    const input = screen.getByLabelText('위치');
    if (action === 'edit') await user.clear(input);
    await user.type(input, location);
  }
  if (category !== undefined) {
    await user.selectOptions(screen.getByLabelText('카테고리'), category);
  }

  const submitButtonLabel = action === 'create' ? '일정 추가' : '일정 수정';
  // !! 의문1: getByTestId vs getByRole
  await user.click(screen.getByRole('button', { name: submitButtonLabel }));
};

beforeAll(() => server.listen());
beforeEach(() => {
  vi.useFakeTimers();
  server.resetHandlers();
});
afterAll(() => {
  server.close();
  vi.useRealTimers();
  vi.clearAllTimers();
});

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    vi.setSystemTime(new Date('2025-10-15T00:00:00Z'));
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);
    const newEventData = {
      title: '새로운 팀 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      location: '회의실 새곳',
      description: '새로운 주간 정기 회의',
      category: '업무',
    };

    await triggerScheduleEvent(user, newEventData, 'create');

    const eventListContainer = screen.getByTestId('event-list');

    // !! 메모: findByText로 변경하여 UI 업데이트 기다림
    const eventCardTitle = await within(eventListContainer).findByText(newEventData.title);
    const eventCard = eventCardTitle.closest('[data-testid="event-card"]');
    expect(eventCard).toBeInTheDocument();

    expect(within(eventCard!).getByText(newEventData.description)).toBeInTheDocument();
    expect(within(eventCard!).getByText(newEventData.location)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    vi.setSystemTime(new Date('2025-10-15T00:00:00Z'));
    setupMockHandlerUpdating();

    const { user } = setup(<App />);
    const originalTitle = '기존 회의';
    const updatedEventData = {
      title: '수정된 회의 제목',
      startTime: '08:30',
      endTime: '09:30',
      location: '변경된 회의실',
      description: '수정된 회의 설명입니다.',
    };

    const eventListContainer = screen.getByTestId('event-list');

    //  findByText + await로 UI 업데이트 기다림
    const originalCardTitleElement = await within(eventListContainer).findByText(originalTitle);
    const eventCard = originalCardTitleElement.closest('[data-testid="event-card"]');
    expect(eventCard).toBeInTheDocument();

    const editButton = within(eventCard!).getByRole('button', { name: /edit event/i });
    await user.click(editButton);

    expect(screen.getByLabelText('제목')).toHaveValue(originalTitle);
    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();

    await triggerScheduleEvent(user, updatedEventData, 'edit');

    const updatedEventTitleElement = await within(eventListContainer).findByText(
      updatedEventData.title
    );
    const updatedEventCard = updatedEventTitleElement.closest('[data-testid="event-card"]');
    expect(updatedEventCard).toBeInTheDocument();

    expect(within(updatedEventCard!).getByText(updatedEventData.description)).toBeInTheDocument();
    expect(within(updatedEventCard!).getByText(updatedEventData.location)).toBeInTheDocument();
    expect(
      within(updatedEventCard!).getByText(
        `${updatedEventData.startTime} - ${updatedEventData.endTime}`
      )
    ).toBeInTheDocument();
    expect(within(eventListContainer).queryByText(originalTitle)).not.toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-10-15T00:00:00Z'));
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const eventListContainer = screen.getByTestId('event-list');
    const titleToDelete = '삭제할 이벤트';

    const originalCardTitleElement = await within(eventListContainer).findByText(titleToDelete);
    const eventCard = originalCardTitleElement.closest('[data-testid="event-card"]');
    expect(eventCard).toBeInTheDocument();

    const deleteButton = within(eventCard!).getByRole('button', { name: /delete event/i });
    await user.click(deleteButton);

    expect(within(eventListContainer).queryByText(titleToDelete)).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime(new Date('2025-05-13T00:00:00Z'));
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    await user.selectOptions(screen.getByLabelText('view'), 'week');

    const weekViewContainer = await screen.findByTestId('week-view');
    const eventTextsInWeekView = within(weekViewContainer).queryAllByText(/회의|약속|일정/i);
    expect(eventTextsInWeekView.length).toBe(0);
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const targetDate = '2025-05-15';
    vi.setSystemTime(new Date(targetDate + 'T00:00:00Z'));
    const initialEvents: Event[] = [
      {
        id: '1',
        title: '주간 뷰 테스트 회의',
        date: targetDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(initialEvents);
    const { user } = setup(<App />);

    await user.selectOptions(screen.getByLabelText('view'), 'week');

    const weekViewContainer = await screen.findByTestId('week-view');
    const eventInWeekView = await within(weekViewContainer).findByText(initialEvents[0].title);
    expect(eventInWeekView).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-05-13T00:00:00Z'));
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    await user.selectOptions(screen.getByLabelText('view'), 'month');

    const monthViewContainer = await screen.findByTestId('month-view');
    const eventTextsInMonthView = within(monthViewContainer).queryAllByText(/회의|약속|일정/i);
    expect(eventTextsInMonthView.length).toBe(0);
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const targetDate = '2025-05-13';
    vi.setSystemTime(new Date(targetDate + 'T00:00:00Z'));
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const newEventData = {
      title: '월간 뷰 테스트 회의',
      date: targetDate,
      startTime: '09:00',
      endTime: '10:00',
      location: '월간회의실',
      description: '월간회의설명',
      category: '업무',
    };
    await triggerScheduleEvent(user, newEventData, 'create');

    await user.selectOptions(screen.getByLabelText('view'), 'month');

    const monthViewContainer = await screen.findByTestId('month-view');
    const eventInMonthView = await within(monthViewContainer).findByText(newEventData.title);
    expect(eventInMonthView).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    const { user } = setup(<App />);
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    const monthViewContainer = await screen.findByTestId('month-view');
    const holidayText = await within(monthViewContainer).findByText('신정');
    expect(holidayText).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    vi.setSystemTime(new Date('2025-05-21T00:00:00Z'));
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '이 검색어는 절대 없을거야');

    const eventListContainer = screen.getByTestId('event-list');
    const noResultsText = await within(eventListContainer).findByText('검색 결과가 없습니다.');
    expect(noResultsText).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    vi.setSystemTime(new Date('2025-05-21T00:00:00Z'));
    const initialEventsWithTeamMeeting: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-05-21',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '다른 회의',
        date: '2025-05-21',
        startTime: '14:00',
        endTime: '15:00',
        description: '다른 업무 회의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(initialEventsWithTeamMeeting);
    const { user } = setup(<App />);
    const eventListContainer = screen.getByTestId('event-list');

    // 초기 데이터 로드 기다림
    await within(eventListContainer).findByText('다른 회의');

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventCardTitle = await within(eventListContainer).findByText('팀 회의');
    const eventCard = eventCardTitle.closest('[data-testid="event-card"]');
    expect(eventCard).toBeInTheDocument();
    expect(within(eventListContainer).queryByText('다른 회의')).not.toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    vi.setSystemTime(new Date('2025-05-21T00:00:00Z'));
    const initialEventsForClearSearch: Event[] = [
      {
        id: '1',
        title: '팀 회의 검색용',
        date: '2025-05-21',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
        description: '',
        location: '',
        startTime: '09:00',
        endTime: '10:00',
      },
      {
        id: '2',
        title: '개인 약속 검색용',
        date: '2025-05-21',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
        description: '',
        location: '',
        startTime: '11:00',
        endTime: '12:00',
      },
    ];
    setupMockHandlerCreation(initialEventsForClearSearch);
    const { user } = setup(<App />);
    const eventListContainer = screen.getByTestId('event-list');

    // 초기 데이터 로드 기다림
    await within(eventListContainer).findByText('팀 회의 검색용');
    await within(eventListContainer).findByText('개인 약속 검색용');

    let allEventCards = within(eventListContainer).getAllByTestId('event-card');
    expect(allEventCards.length).toBe(initialEventsForClearSearch.length);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const searchedCards = within(eventListContainer).getAllByTestId('event-card');
    expect(searchedCards.length).toBe(1);
    expect(within(searchedCards[0]).getByText('팀 회의 검색용')).toBeInTheDocument();

    await user.clear(searchInput);

    const restoredCards = within(eventListContainer).getAllByTestId('event-card');
    expect(restoredCards.length).toBe(initialEventsForClearSearch.length);
    expect(within(eventListContainer).getByText('팀 회의 검색용')).toBeInTheDocument();
    expect(within(eventListContainer).getByText('개인 약속 검색용')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-15T00:00:00Z'));
  });
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const initialEvents: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(initialEvents);

    const { user } = setup(<App />);
    const newEvent = {
      title: '겹치는 일정',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      location: '회의실 A',
      description: '겹치는 일정 설명',
      category: '업무',
    };

    await triggerScheduleEvent(user, newEvent, 'create');

    const alertDialog = await screen.findByRole('alertdialog');
    const alertTitle = alertDialog.querySelector('header');
    expect(alertTitle).toHaveTextContent('일정 겹침 경고');
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);
    const eventListContainer = screen.getByTestId('event-list');

    const titleToEdit = '기존 회의';
    const conflictingEventTitle = '기존 회의2';

    const originalCardTitleElement = await within(eventListContainer).findByText(titleToEdit);
    const eventCard = originalCardTitleElement.closest('[data-testid="event-card"]');
    expect(eventCard).toBeInTheDocument();

    await within(eventListContainer).findByText(conflictingEventTitle);

    const editButton = within(eventCard!).getByRole('button', { name: /edit event/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText('제목')).toHaveValue(titleToEdit);
      expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    });

    const updatedEventDataForOverlap = {
      startTime: '11:30',
      endTime: '12:30',
    };

    await triggerScheduleEvent(user, updatedEventDataForOverlap, 'edit');

    const alertDialog = await screen.findByRole('alertdialog');
    const alertHeader = alertDialog.querySelector('header');

    expect(alertHeader).toBeInTheDocument();
    expect(alertHeader).toHaveTextContent('일정 겹침 경고');
    expect(within(alertDialog).getByText(new RegExp(conflictingEventTitle))).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15T00:00:00Z'));

  const initialEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '00:10',
      endTime: '00:30',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  setupMockHandlerCreation(initialEvents);

  setup(<App />);
  const eventListContainer = screen.getByTestId('event-list');

  const originalCardTitleElement = await within(eventListContainer).findByText(
    initialEvents[0].title
  );
  const eventCard = originalCardTitleElement.closest('[data-testid="event-card"]');
  expect(eventCard).toBeInTheDocument();

  await act(() => vi.advanceTimersByTime(1000));

  const alertBox = await screen.findByRole('alert');
  expect(alertBox.textContent).toContain('10분 후 기존 회의 일정이 시작됩니다.');
});
