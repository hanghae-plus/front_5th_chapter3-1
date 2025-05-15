import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import { App } from '../app';
import { Event } from '../types';

describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-13'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
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
    const addButton = screen.getByRole('button', { name: '일정 추가' });

    await user.type(titleInput, '새로운 회의');
    await user.type(dateInput, '2025-10-14');
    await user.type(startTimeInput, '09:00');
    await user.type(endTimeInput, '10:00');
    await user.type(descriptionInput, '새로운 팀 미팅');
    await user.type(locationInput, '회의실 A');
    await user.selectOptions(categorySelect, '업무');
    await user.click(addButton);

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('새로운 회의')).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const eventList = screen.getByTestId('event-list');

    const editButtons = await within(eventList).findAllByRole('button', { name: 'Edit event' });

    await user.click(editButtons[0]);

    const titleInput = screen.getByLabelText('제목');

    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');
    const saveButton = screen.getByRole('button', { name: '일정 수정' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(within(eventList).getByText('수정된 회의')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const eventList = screen.getByTestId('event-list');

    const deleteButtons = await within(eventList).findAllByRole('button', { name: 'Delete event' });

    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(within(eventList).queryByText('기존 회의')).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-13'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime(new Date('2025-05-13'));

    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const viewSelect = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(viewSelect, 'Week');

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const viewSelect = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(viewSelect, 'Week');

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('2025-10-15')).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-05-13'));

    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const viewSelect = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(viewSelect, 'Month');

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const viewSelect = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(viewSelect, 'Month');

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('2025-10-15')).toBeInTheDocument();
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const dayCell = screen.getByText('1').parentElement;
    expect(within(dayCell!).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-13'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '없음');

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '팀 회의1',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의2',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(events);

    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의1')).toBeInTheDocument();
      expect(within(eventList).getByText('팀 회의2')).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '없음');

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    await user.clear(searchInput);

    const eventListAfterClear = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventListAfterClear).getByText('기존 회의')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-13'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
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
    const addButton = screen.getByRole('button', { name: '일정 추가' });

    await user.type(titleInput, '새로운 회의');
    await user.type(dateInput, '2025-10-15');
    await user.type(startTimeInput, '09:00');
    await user.type(endTimeInput, '10:00');
    await user.type(descriptionInput, '새로운 팀 미팅');
    await user.type(locationInput, '회의실 A');
    await user.selectOptions(categorySelect, '업무');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '팀 회의1',
        date: '2025-10-14',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의2',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(events);

    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const eventList = screen.getByTestId('event-list');
    const editButtons = await within(eventList).findAllByRole('button', { name: 'Edit event' });

    await user.click(editButtons[0]);

    const dateInput = screen.getByLabelText('날짜');
    await user.clear(dateInput);
    await user.type(dateInput, '2025-10-15');

    const saveButton = screen.getByRole('button', { name: '일정 수정' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });
});

describe('알림 기능', () => {
  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    vi.setSystemTime(new Date('2025-10-15T08:49:00'));

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    vi.setSystemTime(new Date('2025-10-15T08:50:00'));

    expect(await screen.findByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
  });
});
