import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
  setupMockHandlerDeletion,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

describe('일정 CRUD 및 기본 기능', () => {
  const mockEvent: Event[] = [
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
    {
      id: '2',
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  beforeEach(() => {
    vi.setSystemTime('2025-10-15');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation();
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categorySelect = screen.getByLabelText('카테고리');

    await user.type(titleInput, '테스트 이벤트 1');
    await user.type(dateInput, '2025-10-15');
    await user.type(startTimeInput, '12:00');
    await user.type(endTimeInput, '13:00');
    await user.type(descriptionInput, '테스트 이벤트 설명');
    await user.type(locationInput, '테스트 이벤트 장소');
    await user.selectOptions(categorySelect, '업무');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);
    const eventList = await screen.findByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('테스트 이벤트 1')).toBeInTheDocument();
      expect(within(eventList).getByText('2025-10-15')).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating(mockEvent);
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(mockEvent[0].title)).toBeInTheDocument();

    const editButton = within(eventList).getByTestId(`edit-event-button-${mockEvent[0].id}`);
    await user.click(editButton);

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categoryInput = screen.getByLabelText('카테고리');

    const editedEvent = {
      title: '이벤트 수정',
      date: '2025-10-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 수정 설명',
      location: '회의실 수정',
      category: '기타',
    };
    // 수정
    await user.clear(titleInput);
    await user.type(titleInput, editedEvent.title);

    await user.clear(dateInput);
    await user.type(dateInput, editedEvent.date);

    await user.clear(startTimeInput);
    await user.type(startTimeInput, editedEvent.startTime);

    await user.clear(endTimeInput);
    await user.type(endTimeInput, editedEvent.endTime);

    await user.clear(descriptionInput);
    await user.type(descriptionInput, editedEvent.description);

    await user.clear(locationInput);
    await user.type(locationInput, editedEvent.location);

    await user.selectOptions(categoryInput, editedEvent.category);

    // 저장
    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    const newEventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(newEventList).getByText('이벤트 수정')).toBeInTheDocument();
      expect(within(newEventList).getByText('2025-10-20')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const user = userEvent.setup();
    setupMockHandlerDeletion(mockEvent);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(mockEvent[0].title)).toBeInTheDocument();

    const deleteButton = within(eventList).getByTestId(`delete-event-button-${mockEvent[0].id}`);
    await user.click(deleteButton);

    await waitFor(() => {
      expect(within(eventList).queryByText(mockEvent[0].title)).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {});

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockEvent = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '이벤트 1 설명',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
    },
  ];

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation(mockEvent as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const selectView = screen.getByLabelText('view');
    await userEvent.selectOptions(selectView, 'week');

    const weekView = screen.getByTestId('week-view');
    // 해당 주의 모든 날짜 셀에 이벤트가 없는지 확인
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    weekDays.forEach((day) => {
      const dateCell = within(weekView).getByText(day);
      const eventBoxes = within(dateCell.parentElement!).queryAllByTestId('event-item');
      expect(eventBoxes).toHaveLength(0);
    });

    // 이벤트 리스트에서 "검색 결과가 없습니다." 텍스트가 표시되는지 확인
    const noResultsText = screen.getByText('검색 결과가 없습니다.');
    expect(noResultsText).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const mockEvent = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-05-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '이벤트 1 설명',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
      },
    ];
    const user = userEvent.setup();
    setupMockHandlerCreation(mockEvent as Event[]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 주별 뷰로 전환
    const selectView = screen.getByLabelText('view');
    await user.selectOptions(selectView, 'week');

    const weekView = screen.getByTestId('week-view');
    const dateCell = within(weekView).getByText(mockEvent[0].date.split('-')[2]);

    // 해당 셀에 이벤트가 정확히 표시되는지 확인
    const eventBox = within(dateCell.parentElement!).getByTestId('event-view-item');
    expect(eventBox).toHaveTextContent(mockEvent[0].title);

    // 이벤트 리스트에서도 동일한 이벤트가 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    const eventItems = within(eventList).getAllByTestId('event-item');
    expect(eventItems).toHaveLength(1);
    expect(eventItems[0]).toHaveTextContent(mockEvent[0].title);
    expect(eventItems[0]).toHaveTextContent(mockEvent[0].date);
    expect(eventItems[0]).toHaveTextContent(mockEvent[0].startTime);
    expect(eventItems[0]).toHaveTextContent(mockEvent[0].endTime);
    expect(eventItems[0]).toHaveTextContent(mockEvent[0].description);
    expect(eventItems[0]).toHaveTextContent(mockEvent[0].location);
    expect(eventItems[0]).toHaveTextContent(mockEvent[0].category);
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime('2025-12-01');
    const user = userEvent.setup();
    setupMockHandlerCreation(mockEvent as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const selectView = screen.getByLabelText('view');
    await user.selectOptions(selectView, 'month');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-07-01');
    const user = userEvent.setup();
    setupMockHandlerCreation(mockEvent as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const selectView = screen.getByLabelText('view');
    await user.selectOptions(selectView, 'month');

    const eventList = await screen.findByTestId('event-list');
    console.log(mockEvent[0].title);
    expect(within(eventList).getByText(mockEvent[0].title)).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');
    const user = userEvent.setup();
    setupMockHandlerCreation(mockEvent as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const selectView = screen.getByLabelText('view');
    await user.selectOptions(selectView, 'month');

    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  const mockEvent: Event[] = [
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
    {
      id: '2',
      title: '팀 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  beforeEach(() => {
    vi.setSystemTime('2025-10-15');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const user = userEvent.setup();
    setupMockHandlerCreation(mockEvent as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '아무거나');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const user = userEvent.setup();
    setupMockHandlerCreation(mockEvent as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '팀 회의');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const user = userEvent.setup();
    setupMockHandlerCreation(mockEvent as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '팀 회의');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();

    // 검색어 지우기
    await user.clear(searchInput);
    const updatedEventList = await screen.findByTestId('event-list');
    expect(within(updatedEventList).getByText('기존 회의')).toBeInTheDocument();
    expect(within(updatedEventList).getByText('팀 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  const mockEvent: Event[] = [
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
    {
      id: '2',
      title: '팀 회의',
      date: '2025-10-16',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  beforeEach(() => {
    vi.setSystemTime('2025-10-15');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const user = userEvent.setup();
    setupMockHandlerCreation(mockEvent as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const newEvent = {
      title: '중복된 이벤트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '중복된 이벤트 설명',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await user.type(screen.getByLabelText('제목'), newEvent.title);
    await user.type(screen.getByLabelText('날짜'), newEvent.date);
    await user.type(screen.getByLabelText('시작 시간'), newEvent.startTime);
    await user.type(screen.getByLabelText('종료 시간'), newEvent.endTime);
    await user.type(screen.getByLabelText('설명'), newEvent.description);
    await user.type(screen.getByLabelText('위치'), newEvent.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), newEvent.category);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const user = userEvent.setup();
    setupMockHandlerCreation(mockEvent as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const eventList = await screen.findByTestId('event-list');
    const editButton = within(eventList).getByTestId(`edit-event-button-${mockEvent[0].id}`);
    await user.click(editButton);

    const date = screen.getByLabelText('날짜');
    await user.clear(date);
    await user.type(date, '2025-10-16');

    const startTime = screen.getByLabelText('시작 시간');
    await user.clear(startTime);
    await user.type(startTime, '10:00');

    const endTime = screen.getByLabelText('종료 시간');
    await user.clear(endTime);
    await user.type(endTime, '11:00');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    vi.setSystemTime('2025-10-15 08:50:00');
    setupMockHandlerCreation(mockEvent as Event[]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const notification = await screen.findByText(
      `10분 후 ${mockEvent[0].title} 일정이 시작됩니다.`
    );
    expect(notification).toBeInTheDocument();
  });
});
