import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
};

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
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
  await user.click(screen.getByRole('button', { name: submitButtonLabel }));
};

const mockEvents = {
  teamMeeting: {
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
  otherMeeting: {
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
  existingMeeting: {
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
  notificationMeeting: {
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
} as const;


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


// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
// ANSWER. 테스트 시작 전 날짜를 mocking 해서 일정이 있는 상태로 시작한다. 

describe('일정 CRUD 및 기본 기능', () => {
  
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-05-01T00:00:00Z'));
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    vi.setSystemTime(new Date('2025-10-15T00:00:00Z'));
    setupMockHandlerCreation([]);
    
    const { user } = setup(<App/>);

    const newEvent =  {
      id: "1",
      title: "기존 회의",
      date: "2025-10-15",
      startTime: "09:00",
      endTime: "10:00",
      description: "기존 팀 미팅",
      location: "회의실 B",
      category: "업무",
      repeat: { "type": "none", "interval": 0 },
      notificationTime: 10
    };

    await saveSchedule(user, newEvent, 'create');

    const eventListContainer = screen.getByTestId('event-list');
    const eventCardTitle = await within(eventListContainer).findByText(newEvent.title);
    const eventCard = eventCardTitle.closest('[data-testid="event-card"]') as HTMLElement;

    expect(eventCard).toBeInTheDocument();
    expect(within(eventCard!).getByText(newEvent.description)).toBeInTheDocument();
    expect(within(eventCard!).getByText(newEvent.location)).toBeInTheDocument();
  });
  

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    vi.setSystemTime(new Date('2025-10-15T00:00:00Z'));
    setupMockHandlerUpdating();

    const { user } = setup(<App/>);
    const prevTitle = '기존 회의';
    const updateData = {
      title: '수정된 회의 제목',
      startTime: '08:30',
      endTime: '09:30',
      location: '변경된 회의실',
      description: '수정된 회의 설명입니다.',
    };
    

    const eventListContainer = screen.getByTestId('event-list');
    const originalCardTitleElement = await within(eventListContainer).findByText(prevTitle);
    const eventCard = originalCardTitleElement.closest('[data-testid="event-card"]') as HTMLElement;

    const editButton = within(eventCard!).getByRole('button', { name: /edit event/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText('제목')).toHaveValue(prevTitle);
      expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    });

    await saveSchedule(user, updateData, 'edit');

    const updatedEventTitleElement = await within(eventListContainer).findByText(
      updateData.title
    );
    const updatedEventCard = updatedEventTitleElement.closest(
      '[data-testid="event-card"]'
    ) as HTMLElement;

    expect(updatedEventCard).toBeInTheDocument();
    expect(within(updatedEventCard!).getByText(updateData.description)).toBeInTheDocument();
    expect(within(updatedEventCard!).getByText(updateData.location)).toBeInTheDocument();
    expect(
      within(updatedEventCard!).getByText(
        `${updateData.startTime} - ${updateData.endTime}`
      )
    ).toBeInTheDocument();
    expect(within(eventListContainer).queryByText(prevTitle)).not.toBeInTheDocument();


  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-10-15T00:00:00Z'));
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const eventListContainer = screen.getByTestId('event-list');
    const titleToDelete = '삭제할 이벤트';

    const originalCardTitleElement = await within(eventListContainer).findByText(titleToDelete);
    const eventCard = originalCardTitleElement.closest('[data-testid="event-card"]') as HTMLElement;

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
        ...mockEvents.teamMeeting,
        date: targetDate,
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
    await saveSchedule(user, newEventData, 'create');

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
    const initialEvents: Event[] = [mockEvents.existingMeeting];
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

    await saveSchedule(user, newEvent, 'create');

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
    const eventCard = originalCardTitleElement.closest('[data-testid="event-card"]') as HTMLElement;

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

    await saveSchedule(user, updatedEventDataForOverlap, 'edit');

    const alertDialog = await screen.findByRole('alertdialog');
    const alertHeader = alertDialog.querySelector('header');

    expect(alertHeader).toBeInTheDocument();
    expect(alertHeader).toHaveTextContent('일정 겹침 경고');
    expect(within(alertDialog).getByText(new RegExp(conflictingEventTitle))).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15T00:00:00Z'));

  const initialEvents: Event[] = [mockEvents.notificationMeeting];
  setupMockHandlerCreation(initialEvents);

  setup(<App />);
  const eventListContainer = screen.getByTestId('event-list');

  const originalCardTitleElement = await within(eventListContainer).findByText(
    initialEvents[0].title
  );
  const eventCard = originalCardTitleElement.closest('[data-testid="event-card"]') as HTMLElement;
  expect(eventCard).toBeInTheDocument();

  await act(() => vi.advanceTimersByTime(1000));

  const alertBox = await screen.findByRole('alert');
  expect(alertBox.textContent).toContain('10분 후 기존 회의 일정이 시작됩니다.');
});