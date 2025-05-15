import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { type UserEvent, userEvent } from '@testing-library/user-event';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '@/__mocks__/handlersUtils';
import App from '@/App';
import { Providers } from '@/components/providers';
import { server } from '@/setupTests';
import type { Event } from '@/types';

const renderApp = () => {
  return render(
    <ChakraProvider>
      <Providers>
        <App />
      </Providers>
    </ChakraProvider>
  );
};

let user: UserEvent;
beforeEach(() => {
  vi.setSystemTime(new Date('2025-05-01'));
  user = userEvent.setup();
});

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const handler = setupMockHandlerCreation([]);
    server.use(...handler);
    renderApp();

    await user.type(screen.getByLabelText('제목'), '이벤트 1');
    await user.type(screen.getByLabelText('날짜'), '2025-05-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '이벤트 설명');
    await user.type(screen.getByLabelText('위치'), '회의실');
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = await screen.findByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('이벤트 1')).toBeInTheDocument();
      expect(within(eventList).getByText('2025-05-15')).toBeInTheDocument();
      expect(screen.getByText('이벤트 설명')).toBeInTheDocument();
      expect(screen.getByText('회의실')).toBeInTheDocument();
      expect(screen.getByText('업무')).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const forUpdateEvent: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 설명',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const handler = setupMockHandlerUpdating([forUpdateEvent]);
    server.use(...handler);
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(await within(eventList).findByText('이벤트 1')).toBeInTheDocument();
    expect(await within(eventList).findByText('이벤트 설명')).toBeInTheDocument();

    await user.click(await within(eventList).findByRole('button', { name: 'Edit event' }));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '이벤트 1-1');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '이벤트 설명 2');

    await user.click(screen.getByRole('button', { name: '일정 수정' }));

    expect(await within(eventList).findByText('이벤트 1-1')).toBeInTheDocument();
    expect(await within(eventList).findByText('이벤트 설명 2')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const forDeleteEvent: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 설명',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };
    const handler = setupMockHandlerDeletion([forDeleteEvent]);
    server.use(...handler);
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(await within(eventList).findByText('이벤트 1')).toBeInTheDocument();

    await user.click(await within(eventList).findByRole('button', { name: 'Delete event' })); //

    expect(within(eventList).queryByText('이벤트 1')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 설명',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-05-17',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 설명 2',
      location: '회의실 2',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime('2025-05-01');

    const handler = setupMockHandlerUpdating(events);
    server.use(...handler);
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('이벤트 1')).toBeInTheDocument();
    expect(within(eventList).getByText('이벤트 2')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('view'), 'week');

    const newEventList = await screen.findByTestId('event-list');
    expect(within(newEventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime('2025-05-15');

    const handler = setupMockHandlerUpdating(events);
    server.use(...handler);
    renderApp();

    await user.selectOptions(screen.getByLabelText('view'), 'week');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('이벤트 1')).toBeInTheDocument();
    expect(within(eventList).getByText('이벤트 2')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime('2025-05-15');

    const handler = setupMockHandlerUpdating([]);
    server.use(...handler);
    renderApp();

    await user.selectOptions(screen.getByLabelText('view'), 'month'); // default가 month

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-05-15');

    const handler = setupMockHandlerUpdating(events);
    server.use(...handler);
    renderApp();

    await user.selectOptions(screen.getByLabelText('view'), 'month'); // default가 month

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('이벤트 1')).toBeInTheDocument();
    expect(within(eventList).getByText('이벤트 2')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');
    renderApp();

    await user.selectOptions(screen.getByLabelText('view'), 'month'); // default가 month

    const target = screen.getByText('신정');
    expect(target).toBeInTheDocument();
    expect(target).toHaveStyle('color: red.500'); // <Text color="red.500" fontSize="sm">
    expect(target).toHaveStyle('fontSize: sm');
  });
});

describe('검색 기능', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 설명',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-05-17',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 설명 2 팀 회의',
      location: '회의실 2',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  beforeEach(() => {
    const handler = setupMockHandlerUpdating(events);
    server.use(...handler);
    renderApp();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('이벤트 1')).toBeInTheDocument();
      expect(within(eventList).getByText('이벤트 2')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '없는이벤트');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  // 설명이나 위치도 가능..
  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('이벤트 1')).toBeInTheDocument();
      expect(within(eventList).getByText('이벤트 2')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '팀 회의');

    expect(within(eventList).queryByText('이벤트 1')).not.toBeInTheDocument();
    expect(within(eventList).getByText('이벤트 2')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('이벤트 1')).toBeInTheDocument();
      expect(within(eventList).getByText('이벤트 2')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '없는이벤트');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText('검색어를 입력하세요'));

    expect(within(eventList).getByText('이벤트 1')).toBeInTheDocument();
    expect(within(eventList).getByText('이벤트 2')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-05-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '이벤트 설명',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 설명 2 팀 회의',
      location: '회의실 2',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  beforeEach(() => {
    const handler = setupMockHandlerUpdating(events);
    server.use(...handler);
    renderApp();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    await user.type(screen.getByLabelText('제목'), '이벤트 3');
    await user.type(screen.getByLabelText('날짜'), '2025-05-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:30');
    await user.type(screen.getByLabelText('종료 시간'), '11:30');
    await user.type(screen.getByLabelText('설명'), '이벤트 설명');
    await user.type(screen.getByLabelText('위치'), '회의실');
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('이벤트 1')).toBeInTheDocument();
      expect(within(eventList).getByText('이벤트 2')).toBeInTheDocument();
    });

    const editButton = await within(eventList).findAllByRole('button', { name: 'Edit event' });
    await user.click(editButton[0]);

    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '09:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime('2025-05-15 09:30');
  const event: Event = {
    id: '1',
    title: '이벤트 1',
    date: '2025-05-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트 설명',
    location: '회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  const handler = setupMockHandlerUpdating([event]);
  server.use(...handler);
  renderApp();

  const eventList = screen.getByTestId('event-list');

  await waitFor(() => {
    expect(within(eventList).getByText('이벤트 1')).toBeInTheDocument();
  });

  vi.setSystemTime('2025-05-15 09:50');
  expect(await screen.findByText('10분 전')).toBeInTheDocument();
});
