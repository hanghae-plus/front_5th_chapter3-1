import { cleanup, screen, within } from '@testing-library/react';
import App from '../App';
import { Event } from '../types';
import render from '../utils/test/render';
import { UserEvent } from '@testing-library/user-event';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { setupMockHandlerCreation } from '@/__mocks__/handlersUtils';

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: '새 일정 123',
    date: '2025-05-12',
    startTime: '10:00',
    endTime: '11:00',
    description: '새 일정 설명',
    location: '새 위치',
    category: '개인',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '새 일정 456',
    date: '2025-10-15',
    startTime: '11:00',
    endTime: '12:00',
    description: '새 일정 설명',
    location: '새 위치',
    category: '개인',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 10,
  },
];

const typeEvent = async (user: UserEvent, event: Event) => {
  const { title, date, startTime, endTime, location, description, category } = event;

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 CRUD 및 기본 기능', () => {
  let user: UserEvent;
  beforeEach(async () => {
    setupMockHandlerCreation(events as Event[]);
    const { user: userEvent } = await render(<App />);
    user = userEvent;
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    await typeEvent(user, MOCK_EVENTS[0]);

    const [firstEvent] = await screen.findAllByTestId('event-item', {}, { timeout: 10000 });

    expect(within(firstEvent).getByRole('button', { name: 'Edit event' })).toBeInTheDocument();

    await user.click(within(firstEvent).getByRole('button', { name: 'Edit event' }));

    await user.clear(screen.getByLabelText('위치'));
    expect(screen.getByLabelText('위치')).toHaveValue('');
    await user.type(screen.getByLabelText('위치'), '회의실 C');
    expect(screen.getByLabelText('위치')).toHaveValue('회의실 C');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = await screen.findByTestId('event-list', {}, { timeout: 10000 });

    expect(within(eventList).queryByText('회의실 B')).not.toBeInTheDocument();
    expect(
      await within(eventList).findByText('회의실 C', {}, { timeout: 10000 })
    ).toBeInTheDocument();
  }, 15000);

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    await typeEvent(user, MOCK_EVENTS[0]);

    const [firstEvent] = await screen.findAllByTestId('event-item', {}, { timeout: 10000 });

    expect(within(firstEvent).getByRole('button', { name: 'Edit event' })).toBeInTheDocument();

    await user.click(within(firstEvent).getByRole('button', { name: 'Edit event' }));

    await user.clear(screen.getByLabelText('위치'));
    expect(screen.getByLabelText('위치')).toHaveValue('');
    await user.type(screen.getByLabelText('위치'), '회의실');
    expect(screen.getByLabelText('위치')).toHaveValue('회의실');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = await screen.findByTestId('event-list', {}, { timeout: 10000 });

    expect(within(eventList).queryByText('새 위치')).not.toBeInTheDocument();
    expect(
      await within(eventList).findByText('회의실', {}, { timeout: 10000 })
    ).toBeInTheDocument();
  }, 15000);

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    await typeEvent(user, MOCK_EVENTS[0]);

    const [firstEvent] = screen.getAllByTestId('event-item');

    await user.click(within(firstEvent).getByRole('button', { name: 'Delete event' }));

    expect(within(firstEvent).queryByText('새 일정 123')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  beforeEach(async () => {
    setupMockHandlerCreation(events as Event[]);
  });
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime('2025-05-15');
    const { user } = await render(<App />);
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime('2025-10-15');
    const { user } = await render(<App />);
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime('2025-05-15');
    const { user } = await render(<App />);
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-10-15');
    const { user } = await render(<App />);
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');
    const { user } = await render(<App />);
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    expect(screen.getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(async () => {
    vi.setSystemTime('2025-10-01');
    setupMockHandlerCreation(events as Event[]);
  });
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = await render(<App />);

    await typeEvent(user, MOCK_EVENTS[0]);

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '아무거나');

    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toHaveValue('아무거나');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'새 위치'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = await render(<App />);

    await typeEvent(user, MOCK_EVENTS[0]);

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '회의실');

    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByText('회의실 B')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = await render(<App />);

    await user.clear(screen.getByPlaceholderText('검색어를 입력하세요'));

    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toHaveValue('');

    expect(await screen.findByText('회의실 B')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const { user } = await render(<App />);

    await typeEvent(user, MOCK_EVENTS[0]);

    await typeEvent(user, MOCK_EVENTS[0]);

    expect(await screen.findByText('일정 겹침 경고', {}, { timeout: 10000 })).toBeInTheDocument();
  }, 15000);

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    vi.setSystemTime('2025-10-15');
    const { user } = await render(<App />);

    await typeEvent(user, MOCK_EVENTS[1]);

    const [_, secondEvent] = screen.getAllByTestId('event-item');

    expect(within(secondEvent).getByRole('button', { name: 'Edit event' })).toBeInTheDocument();

    await user.click(within(secondEvent).getByRole('button', { name: 'Edit event' }));

    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    expect(screen.getByLabelText('시작 시간')).toHaveValue('09:00');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(await screen.findByText('일정 겹침 경고', {}, { timeout: 10000 })).toBeInTheDocument();
  }, 15000);
});

describe('알림 기능', () => {
  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    vi.setSystemTime('2025-10-15T08:50:00');

    await render(<App />);

    expect(await screen.findByText(/10분 전/)).toBeInTheDocument();
  });
});

afterEach(() => {
  cleanup();
});
