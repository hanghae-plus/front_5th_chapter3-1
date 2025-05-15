import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
  setupMockHandlerDeletion,
} from '../__mocks__/handlersUtils.ts';
import App from '../App';
import { Event } from '../types';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-06-01',
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
    title: '점심 약속',
    date: '2025-06-01',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심 식사',
    location: '수원역',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const newEvent = {
  title: '새로운 이벤트',
  date: '2025-06-02',
  startTime: '10:00',
  endTime: '15:00',
  description: '새로운 이벤트 설명',
  location: '새로운 이벤트 장소',
  category: '업무',
};

describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    setupMockHandlerCreation(mockEvents);
    vi.setSystemTime('2025-06-01');
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  const renderApp = () => {
    return render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  };

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const user = userEvent.setup();
    renderApp();
    // 기존 이벤트와 겹치지 않는 고유 ID 생성

    await user.type(screen.getByLabelText('제목'), newEvent.title);
    await user.type(screen.getByLabelText('날짜'), newEvent.date);
    await user.type(screen.getByLabelText('시작 시간'), newEvent.startTime);
    await user.type(screen.getByLabelText('종료 시간'), newEvent.endTime);
    await user.type(screen.getByLabelText('설명'), newEvent.description);
    await user.type(screen.getByLabelText('위치'), newEvent.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), newEvent.category);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(newEvent.title)).toBeInTheDocument();
    expect(within(eventList).getByText(newEvent.date)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating(mockEvents);
    const user = userEvent.setup();
    renderApp();

    const updateEvent = {
      title: '수정된 이벤트',
      date: '2025-06-03',
    };

    const eventItem = await screen.findByTestId(`event-item-${mockEvents[0].id}`);
    const editButton = within(eventItem).getByLabelText('Edit event');
    expect(editButton).toBeInTheDocument();
    await user.click(editButton);

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const submitButton = screen.getByTestId('event-submit-button');

    await user.clear(titleInput);
    await user.clear(dateInput);

    await user.type(titleInput, updateEvent.title);
    await user.type(dateInput, updateEvent.date);
    await user.click(submitButton);

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(updateEvent.title)).toBeInTheDocument();
    expect(within(eventList).getByText(updateEvent.date)).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion(mockEvents);
    const user = userEvent.setup();
    renderApp();

    const eventItem = await screen.findByTestId(`event-item-${mockEvents[0].id}`);
    const deleteButton = within(eventItem).getByLabelText('Delete event');
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).queryByText(mockEvents[0].title)).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    setupMockHandlerCreation(mockEvents);
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  const renderApp = () => {
    return render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  };
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const user = userEvent.setup();
    vi.setSystemTime('2025-06-20');
    renderApp();

    const viewSelector = screen.getByLabelText('view');
    await user.selectOptions(viewSelector, 'week');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).queryByText(mockEvents[0].title)).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const user = userEvent.setup();
    vi.setSystemTime('2025-06-01');
    renderApp();

    const viewSelector = screen.getByLabelText('view');
    await user.selectOptions(viewSelector, 'week');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const user = userEvent.setup();
    vi.setSystemTime('2025-07-01');
    renderApp();

    const viewSelector = screen.getByLabelText('view');
    await user.selectOptions(viewSelector, 'month');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).queryByText(mockEvents[0].title)).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const user = userEvent.setup();
    vi.setSystemTime('2025-06-01');
    renderApp();

    const viewSelector = screen.getByLabelText('view');
    await user.selectOptions(viewSelector, 'month');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();
    expect(within(eventList).getByText(mockEvents[1].title)).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');
    renderApp();

    expect(screen.getByTestId('month-view')).toBeInTheDocument();

    expect(screen.getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    setupMockHandlerCreation(mockEvents);
    vi.setSystemTime('2025-06-01');
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  const renderApp = () => {
    return render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  };
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const user = userEvent.setup();
    renderApp();

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, 'non-existent-event');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const user = userEvent.setup();
    renderApp();

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '팀 회의');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const user = userEvent.setup();
    renderApp();

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, mockEvents[0].title);

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();

    await user.clear(searchInput);

    expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();
    expect(within(eventList).getByText(mockEvents[1].title)).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  beforeEach(() => {
    setupMockHandlerCreation(mockEvents);
    vi.setSystemTime('2025-06-01');
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  const renderApp = () => {
    return render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  };
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const user = userEvent.setup();
    renderApp();

    const duplicateEvent = {
      ...newEvent,
      date: mockEvents[0].date,
      startTime: mockEvents[0].startTime,
      endTime: mockEvents[0].endTime,
    };

    await user.type(screen.getByLabelText('제목'), duplicateEvent.title);
    await user.type(screen.getByLabelText('날짜'), duplicateEvent.date);
    await user.type(screen.getByLabelText('시작 시간'), duplicateEvent.startTime);
    await user.type(screen.getByLabelText('종료 시간'), duplicateEvent.endTime);
    await user.type(screen.getByLabelText('설명'), duplicateEvent.description);
    await user.type(screen.getByLabelText('위치'), duplicateEvent.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), duplicateEvent.category);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    const alertText = await screen.findByText('일정 겹침 경고');
    const alertDialog = await screen.findByRole('alertdialog');

    expect(alertText).toBeInTheDocument();
    expect(alertDialog).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const user = userEvent.setup();
    renderApp();

    const eventItem = await screen.findByTestId(`event-item-${mockEvents[0].id}`);
    const editButton = within(eventItem).getByLabelText('Edit event');
    expect(editButton).toBeInTheDocument();
    await user.click(editButton);

    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const submitButton = screen.getByTestId('event-submit-button');

    await user.clear(dateInput);
    await user.clear(startTimeInput);
    await user.clear(endTimeInput);

    await user.type(dateInput, mockEvents[1].date);
    await user.type(startTimeInput, mockEvents[1].startTime);
    await user.type(endTimeInput, mockEvents[1].endTime);

    await user.click(submitButton);

    const alertText = await screen.findByText('일정 겹침 경고');
    const alertDialog = await screen.findByRole('alertdialog');

    expect(alertText).toBeInTheDocument();
    expect(alertDialog).toBeInTheDocument();
  });
});

describe('알림 기능', () => {
  beforeEach(() => {
    setupMockHandlerUpdating(mockEvents);
    vi.setSystemTime('2025-06-01');
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  const renderApp = () => {
    return render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  };
  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    const user = userEvent.setup();
    renderApp();

    const eventItem = await screen.findByTestId(`event-item-${mockEvents[0].id}`);

    const editButton = within(eventItem).getByLabelText('Edit event');
    expect(editButton).toBeInTheDocument();
    await user.click(editButton);

    const notificationTimeSelect = screen.getByLabelText('알림 설정');
    await user.selectOptions(notificationTimeSelect, '10');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    vi.setSystemTime(new Date('2025-06-01T09:50:00'));

    const alertText = await screen.findByText(`10분 후 ${mockEvents[0].title} 일정이 시작됩니다.`);
    expect(alertText).toBeInTheDocument();
  });
});
