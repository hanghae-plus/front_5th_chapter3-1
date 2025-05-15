import App from '../App';
import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import { events } from '../__mocks__/response/events.json';
import { Event } from '../types';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

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

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation(events as Event[]);
    vi.setSystemTime(new Date('2025-10-01'));

    const { user } = setup(<App></App>);

    const newEvent = {
      title: '이벤트 1',
      date: '2025-10-12',
      startTime: '11:30',
      endTime: '13:30',
      description: '이벤트 1입니다',
      location: '회의실 1',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    const event = await screen.findByLabelText(`event-${events.length + 1}`);

    expect(within(event).getByText(newEvent.title)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating(events as Event[]);
    vi.setSystemTime(new Date('2025-10-11T12:00'));

    const { user } = setup(<App></App>);
    const targetId = events[0].id;

    const event = await screen.findByLabelText(`event-${targetId}`);
    await user.click(within(event).getByLabelText('Edit event'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 일정');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '수정된 설명');
    await user.clear(screen.getByLabelText('위치'));
    await user.type(screen.getByLabelText('위치'), '수정된 위치');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(within(event).getByText('수정된 일정')).toBeInTheDocument();
    expect(within(event).getByText('수정된 설명')).toBeInTheDocument();
    expect(within(event).getByText('수정된 위치')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion(events as Event[]);
    vi.setSystemTime(new Date('2025-10-11T12:00'));

    const { user } = setup(<App></App>);
    const targetId = events[0].id;

    const event = await screen.findByLabelText(`event-${targetId}`);
    await user.click(within(event).getByLabelText('Delete event'));

    expect(screen.queryByLabelText(`event-${targetId}`)).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation(events as Event[]);
    vi.setSystemTime(new Date('2025-08-13T12:00'));
    const { user } = setup(<App></App>);

    await user.selectOptions(screen.getByLabelText('view'), 'week');

    const eventList = await screen.findByTestId('event-list');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation(events as Event[]);
    vi.setSystemTime(new Date('2025-10-13T12:00'));
    const { user } = setup(<App></App>);

    await user.selectOptions(screen.getByLabelText('view'), 'week');

    const event = await screen.findByLabelText(`event-${events[0].id}`);

    expect(within(event).getByText(events[0].title)).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation(events as Event[]);
    vi.setSystemTime(new Date('2025-08-13T12:00'));
    setup(<App></App>);

    const eventList = await screen.findByTestId('event-list');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation(events as Event[]);
    vi.setSystemTime(new Date('2025-10-13T12:00'));
    setup(<App></App>);

    const event = await screen.findByLabelText(`event-${events[0].id}`);

    expect(within(event).getByText(events[0].title)).toBeInTheDocument();
  });

  it('선택된 날짜가 1월일 때 달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    setupMockHandlerCreation(events as Event[]);
    vi.setSystemTime(new Date('2025-01-01T12:00'));
    setup(<App></App>);

    const event = screen.getByTestId('month-view');
    const target = within(event).getByText('신정');

    expect(target).toBeInTheDocument();
    expect(target).toHaveClass('css-19gpx6');
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation(events as Event[]);
    vi.setSystemTime(new Date('2025-10-13T12:00'));
    const { user } = setup(<App></App>);

    const eventList = await screen.findByTestId('event-list');

    await user.type(within(eventList).getByRole('textbox'), '이상한 제목');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'기존 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerCreation(events as Event[]);
    vi.setSystemTime(new Date('2025-10-13T12:00'));
    const { user } = setup(<App></App>);

    const { id, title } = events[0];
    const eventList = await screen.findByTestId('event-list');

    await user.type(within(eventList).getByRole('textbox'), '기존 회의');

    const event = await screen.findByLabelText(`event-${id}`);

    expect(within(event).getByText(title)).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation(events as Event[]);
    vi.setSystemTime(new Date('2025-10-13T12:00'));
    const { user } = setup(<App></App>);

    const { id, title } = events[0];
    const eventList = await screen.findByTestId('event-list');

    await user.type(within(eventList).getByRole('textbox'), '기존 회의');

    const event = await screen.findByLabelText(`event-${id}`);

    expect(within(event).getByText(title)).toBeInTheDocument();

    await user.clear(within(eventList).getByRole('textbox'));

    events.forEach(({ title }) => {
      expect(within(eventList).getByText(title)).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation(events as Event[]);
    vi.setSystemTime(new Date('2025-10-01'));

    const { user } = setup(<App></App>);

    const newEvent = {
      title: '이벤트 1',
      date: '2025-10-15',
      startTime: '08:30',
      endTime: '13:30',
      description: '이벤트 1입니다',
      location: '회의실 1',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating(events as Event[]);
    vi.setSystemTime(new Date('2025-10-11T12:00'));

    const { user } = setup(<App></App>);
    const { id, startTime, endTime } = events[0];

    const event = await screen.findByLabelText(`event-${id}`);
    await user.click(within(event).getByLabelText('Edit event'));

    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), endTime);
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), startTime);

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('시간 설정을 확인해주세요.')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  setupMockHandlerCreation(events as Event[]);
  vi.setSystemTime(new Date('2025-10-15T08:49'));
  setup(<App></App>);

  const { id, notificationTime, title } = events[0];
  await screen.findByLabelText(`event-${id}`);

  act(() => {
    vi.advanceTimersByTime(60 * 1_000);
  });

  expect(
    screen.getByText(`${notificationTime}분 후 ${title} 일정이 시작됩니다.`)
  ).toBeInTheDocument();
});
