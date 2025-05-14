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
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

const editSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, startTime, endTime, location, description } = form;

  if (title) {
    const input = screen.getByLabelText('제목');
    await user.clear(input);
    await user.type(input, title);
  }
  if (description) {
    const input = screen.getByLabelText('설명');
    await user.clear(input);
    await user.type(input, title);
  }
  if (location) {
    const input = screen.getByLabelText('위치');
    await user.clear(input);
    await user.type(input, location);
  }
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.click(screen.getByTestId('event-submit-button'));
};

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
// A) 테스트를 시작하기 전에, 날짜를 모킹하여, 일정이 있는 상태로 만들었습니다.
// 그러면, "검색 결과가 없습니다"라는 문구는 노출되지 않은 상태에서, 일정 수정, 삭제 등을 일관성있게 검증할 수 있습니다.
describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    server.resetHandlers();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-10-15T00:00:00Z'));
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);
    const newEvent = {
      title: '팀 회의',
      date: '2025-10-15',
      startTime: '9:00',
      endTime: '10:00',
      location: '회의실 A',
      description: '주간 정기 회의',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    const eventList = screen.getByTestId('event-list');
    const eventCard = within(eventList).getByText(newEvent.title).closest('div');
    expect(eventCard).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
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

    const originalCardTitleElement = await within(eventListContainer).findByText(originalTitle);
    const eventCard = originalCardTitleElement.closest('[data-testid="event-card"]');
    expect(eventCard).toBeInTheDocument();

    const editButton = within(eventCard!).getByRole('button', { name: /edit event/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText('제목')).toHaveValue(originalTitle);
      expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    });

    await editSchedule(user, updatedEventData);

    waitFor(async () => {
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
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);
    const eventListContainer = screen.getByTestId('event-list');

    const originalTitle = '삭제할 이벤트';
    const originalCardTitleElement = await within(eventListContainer).findByText(originalTitle);
    const eventCard = originalCardTitleElement.closest('[data-testid="event-card"]');
    expect(eventCard).toBeInTheDocument();

    const deleteButton = within(eventCard!).getByRole('button', { name: /delete event/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText(originalTitle)).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    server.resetHandlers();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-05-13T00:00:00Z'));
  });
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const { user } = setup(<App />);
    const viewButton = screen.getByLabelText('view');

    await user.click(viewButton);
    const weekButton = screen.getByRole('option', { name: /Week/i });
    await user.click(weekButton);

    const noEventText = screen.getByText('검색 결과가 없습니다.');
    expect(noEventText).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const initialEvents: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-05-15',
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

    const viewButton = screen.getByLabelText('view');
    const weekButton = screen.getByRole('option', { name: /Week/i });

    await user.click(viewButton);
    await user.click(weekButton);

    const eventList = screen.getByTestId('event-list');
    const eventCard = within(eventList).getByText(initialEvents[0].title).closest('div');
    expect(eventCard).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const { user } = setup(<App />);
    const viewButton = screen.getByLabelText('view');
    await user.click(viewButton);
    const monthButton = screen.getByRole('option', { name: /Month/i });
    await user.click(monthButton);

    const noEventText = screen.getByText('검색 결과가 없습니다.');
    expect(noEventText).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);
    const newEvent = {
      title: '팀 회의',
      date: '2025-05-13',
      startTime: '9:00',
      endTime: '10:00',
      location: '회의실 A',
      description: '주간 정기 회의',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    const viewButton = screen.getByLabelText('view');
    const monthButton = screen.getByRole('option', { name: /Month/i });

    await user.click(viewButton);
    await user.click(monthButton);

    const noEventText = screen.queryByText('검색 결과가 없습니다.');
    expect(noEventText).not.toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    const { user } = setup(<App />);
    const viewButton = screen.getByLabelText('view');
    const monthButton = screen.getByRole('option', { name: /Month/i });

    await user.click(viewButton);
    await user.click(monthButton);

    const holidayText = screen.getByText('신정');
    expect(holidayText).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    server.resetHandlers();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-05-21T00:00:00Z'));
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '없는 이벤트지롱');

    const noEventText = screen.getByText('검색 결과가 없습니다.');
    expect(noEventText).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
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

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    const eventCardTitle = await within(eventList).findByText('팀 회의');
    const eventCard = eventCardTitle.closest('div');
    expect(eventCard).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
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

    // within, findByXXX + await를 이용해 비동기적인 UI 업데이트를 기다리기
    await within(eventListContainer).findByText('팀 회의 검색용');
    await within(eventListContainer).findByText('개인 약속 검색용');

    let allEventCards = within(eventListContainer).getAllByTestId('event-card');
    expect(allEventCards.length).toBe(initialEventsForClearSearch.length);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    await waitFor(() => {
      const searchedCards = within(eventListContainer).getAllByTestId('event-card');
      expect(searchedCards.length).toBe(1);
      expect(within(searchedCards[0]).getByText('팀 회의 검색용')).toBeInTheDocument();
    });

    await user.clear(searchInput);

    const restoredCards = within(eventListContainer).getAllByTestId('event-card');
    expect(restoredCards.length).toBe(initialEventsForClearSearch.length);
  });
});

// describe('일정 충돌', () => {
//   it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {});

//   it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {});
// });

// it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});
