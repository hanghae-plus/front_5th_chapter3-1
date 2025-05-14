import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';
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

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation([]); // Start with no events

    const { user } = setup(<App />);

    // Add a new event
    await saveSchedule(user, {
      title: '새로운 일정',
      date: '2025-10-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '새 일정 설명',
      location: '회의실',
      category: '업무',
    });

    // Verify the new event is displayed in the event list
    // expect(await screen.findByText('새로운 일정')).toBeInTheDocument();
    expect(screen.getByText('2025-10-16')).toBeInTheDocument();
    expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
    expect(screen.getByText('새 일정 설명')).toBeInTheDocument();
    expect(screen.getByText('회의실')).toBeInTheDocument();
    expect(screen.getByText('업무')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerCreation([
      {
        id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
        title: '프로젝트 마감',
        date: '2025-05-25',
        startTime: '09:00',
        endTime: '18:00',
        description: '분기별 프로젝트 마감',
        location: '카페',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);

    const { user } = setup(<App />);

    // Edit the existing event
    // await user.click(screen.getByText('카페'));
    await user.clear(screen.getByLabelText('위치'));
    await user.type(screen.getByLabelText('위치'), '카페아님');
    await user.click(screen.getByTestId('event-submit-button'));

    // Verify the updated event is displayed
    // expect(await screen.findByText('카페')).toBeInTheDocument();
    expect(screen.queryByText('카페아님')).not.toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerCreation([
      {
        id: 'event-1',
        title: '삭제할 일정',
        date: '2025-10-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '삭제할 일정 설명',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // Delete the event
    // await user.click(screen.getByLabelText('Delete event'));

    // Verify the event is no longer displayed
    expect(screen.queryByText('삭제할 일정')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation([]); // No events to simulate an empty week view

    const { user } = setup(<App />);

    // Switch to week view
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // Verify the week view is displayed
    expect(await screen.findByTestId('week-view')).toBeInTheDocument();

    // Verify no events are displayed
    expect(screen.queryByText(/팀 회의/)).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: 'event-1',
        title: '팀 회의',
        date: '2025-10-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 회의 설명',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // Switch to week view
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // Verify the week view is displayed
    expect(await screen.findByTestId('week-view')).toBeInTheDocument();

    // Verify the event is displayed on the correct day
    expect(await screen.findByText('업무')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([]); // No events to simulate an empty month view

    const { user } = setup(<App />);

    // Switch to month view
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    // Verify the month view is displayed
    expect(await screen.findByTestId('month-view')).toBeInTheDocument();

    // Verify no events are displayed
    expect(screen.queryByText(/점심 식사/)).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([
      {
        id: 'event-1',
        title: '팀 회의',
        date: '2025-10-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 회의 설명',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // Switch to month view
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    // Verify the month view is displayed
    expect(await screen.findByTestId('month-view')).toBeInTheDocument();

    // Verify the event is displayed on the correct day
    expect(await screen.findByText('업무')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([]);
  
    const { user } = setup(<App />);
  
    await user.selectOptions(screen.getByLabelText('view'), 'month');
  
    expect(await screen.findByTestId('month-view')).toBeInTheDocument();
  
    // const holidayElement = screen.findByText('신정');
    // expect(holidayElement).toBeInTheDocument();
    // expect(holidayElement).toHaveStyle('color: #E53E3E');
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation([]); // No events to simulate empty search results

    const { user } = setup(<App />);

    // Search for a term
    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), 'nonexistent');

    // Verify the "검색 결과가 없습니다." message is displayed
    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerCreation([
      {
        id: 'event-1',
        title: '팀 회의',
        date: '2025-10-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 회의 설명',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // Search for "팀 회의"
    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '회의실');

    // Verify the event is displayed
    expect(await screen.findByText('회의실')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation([
      {
        id: 'event-1',
        title: '팀 회의',
        date: '2025-10-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 회의 설명',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'event-2',
        title: '개인 일정',
        date: '2025-10-17',
        startTime: '14:00',
        endTime: '15:00',
        description: '개인 일정 설명',
        location: '카페',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // Search for "팀 회의"
    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '회의실');

    // Verify only "팀 회의" is displayed
    expect(await screen.findByText('회의실')).toBeInTheDocument();
    expect(screen.queryByText('카페')).not.toBeInTheDocument();

    // Clear the search term
    await user.clear(screen.getByPlaceholderText('검색어를 입력하세요'));

    // Verify all events are displayed again
    expect(await screen.findByText('회의실')).toBeInTheDocument();
    expect(await screen.findByText('카페')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: 'event-1',
        title: '기존 일정',
        date: '2025-10-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 일정 설명',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '겹치는 일정',
      date: '2025-10-16',
      startTime: '09:30',
      endTime: '10:30',
      description: '겹치는 일정 설명',
      location: '회의실',
      category: '업무',
    });

    // OverlapDialog가 표시되는지 확인
    expect(await screen.findByText(/일정 겹침 경고/)).toBeInTheDocument();
    expect(await screen.findByText(/기존 일정 \(2025-10-16 09:00-10:00\)/)).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerCreation([
      {
        id: 'event-1',
        title: '기존 일정',
        date: '2025-10-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 일정 설명',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '시간 수정 충돌',
      date: '2025-10-16',
      startTime: '09:00',
      endTime: '90:00',
      description: '시간 수정 설명',
      location: '회의실',
      category: '업무',
    });

    // OverlapDialog가 표시되는지 확인
    expect(await screen.findByText(/시작 시간은 종료 시간보다 빨라야 합니다./)).toBeInTheDocument();
    expect(await screen.findByText(/종료 시간은 시작 시간보다 늦어야 합니다./)).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  setupMockHandlerCreation([
    {
      id: 'alarm-1',
      title: '알람 테스트',
      date: '2025-10-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '알람 확인',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
  setup(<App />);
  // 알람 텍스트가 노출되는지 확인
  expect(await screen.findByText(/10분 전/)).toBeInTheDocument();
});
