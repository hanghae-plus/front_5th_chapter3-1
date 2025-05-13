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

const mockEvents: Event[] = [
  {
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '팀 회의',
    date: '2025-05-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
    title: '점심 약속',
    date: '2025-05-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
    title: '프로젝트 마감',
    date: '2025-05-25',
    startTime: '09:00',
    endTime: '18:00',
    description: '분기별 프로젝트 마감',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'dac62941-69e5-4ec0-98cc-24c2a79a7f81',
    title: '생일 파티',
    date: '2025-05-28',
    startTime: '19:00',
    endTime: '22:00',
    description: '친구 생일 축하',
    location: '친구 집',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '80d85368-b4a4-47b3-b959-25171d49371f',
    title: '운동',
    date: '2025-05-22',
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

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
  beforeEach(() => {
    vi.setSystemTime('2025-05-01');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation([...mockEvents]);
    const { user } = setup(<App />);

    const form = {
      title: '디자인 리뷰 회의',
      date: '2025-05-30',
      startTime: '12:00',
      endTime: '14:30',
      description: '디자인 팀과의 리뷰 미팅',
      location: '회의실 D',
      category: '업무',
    };

    await saveSchedule(user, form);

    // 렌더링 안정화 (검색 결과 없음 메시지 제거 기다리기)
    await waitFor(() => expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument());

    const list = await screen.getByTestId('event-list');

    expect(within(list).getByText(form.title)).toBeInTheDocument();
    expect(within(list).getByText(form.date)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating([...mockEvents]);
    const { user } = setup(<App />);

    const list = await screen.findByTestId('event-list');
    const eventId = mockEvents[0].id;

    // edit 버튼 클릭 (test-id 기반)
    const editButton = within(list).getByTestId(`event-edit-button-${eventId}`);
    await user.click(editButton);

    // 수정 입력
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 팀 회의');

    const submit = screen.getByTestId('event-submit-button');
    await user.click(submit);

    // 수정 결과 확인
    await waitFor(() => {
      expect(within(list).getByText('수정된 팀 회의')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion([...mockEvents]);
    const { user } = setup(<App />);

    const list = await screen.findByTestId('event-list');
    const eventId = mockEvents[0].id;

    // delete 버튼 클릭 (test-id 기반)
    const deleteButton = within(list).getByTestId(`event-delete-button-${eventId}`);
    await user.click(deleteButton);

    // 삭제 결과 확인
    await waitFor(() => {
      expect(within(list).queryByText(mockEvents[0].title)).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime('2025-05-01');
    setupMockHandlerCreation([...mockEvents]);
    const { user } = setup(<App />);

    const monthView = await screen.findByTestId('month-view');
    expect(within(monthView).queryByText(mockEvents[0].title)).toBeInTheDocument();

    const viewSelector = screen.getByTestId('view-select');
    await user.selectOptions(viewSelector, 'week');

    const weekView = await screen.findByTestId('week-view');
    expect(within(weekView).queryByText(mockEvents[0].title)).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime('2025-05-25');
    setupMockHandlerCreation([...mockEvents]);
    const { user } = setup(<App />);
    const form = {
      title: '디자인 리뷰 회의',
      date: '2025-05-30',
      startTime: '14:00',
      endTime: '15:30',
      description: '디자인 팀과의 리뷰 미팅',
      location: '회의실 D',
      category: '업무',
    };

    await saveSchedule(user, form);

    const viewSelector = screen.getByTestId('view-select');
    await user.selectOptions(viewSelector, 'week');

    const weekView = await screen.findByTestId('week-view');
    expect(within(weekView).getByText('디자인 리뷰 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime('2025-05-01');
    setupMockHandlerCreation([...mockEvents]);
    const { user } = setup(<App />);

    const viewSelector = screen.getByTestId('view-select');
    await user.selectOptions(viewSelector, 'month');

    const monthView = await screen.findByTestId('month-view');
    expect(within(monthView).queryByText('기존 회의')).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-05-01');
    setupMockHandlerCreation([...mockEvents]);
    const { user } = setup(<App />);
    const form = {
      title: '디자인 리뷰 회의',
      date: '2025-05-30',
      startTime: '14:00',
      endTime: '15:30',
      description: '디자인 팀과의 리뷰 미팅',
      location: '회의실 D',
      category: '업무',
    };

    await saveSchedule(user, form);

    const viewSelector = screen.getByTestId('view-select');
    await user.selectOptions(viewSelector, 'month');

    const monthView = await screen.findByTestId('month-view');
    expect(within(monthView).getByText('디자인 리뷰 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');
    setupMockHandlerCreation([...mockEvents]);
    const { user } = setup(<App />);

    const viewSelector = screen.getByTestId('view-select');
    await user.selectOptions(viewSelector, 'month');

    const calendar = await screen.findByTestId('month-view');

    // 모든 <td> 중에서 날짜 "1"과 공휴일 텍스트 "신정"이 모두 있는 셀을 찾음
    const tdElements = calendar.querySelectorAll('td');
    const targetCell = Array.from(tdElements).find((td) => {
      const textContent = td.textContent || '';
      return textContent.includes('1') && textContent.includes('신정');
    });

    expect(targetCell).toBeDefined();
  });
});

describe('검색 기능', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    vi.setSystemTime('2025-06-01');
    setupMockHandlerCreation([...mockEvents]);
    const { user } = setup(<App />);

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '없는 일정');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    vi.setSystemTime('2025-05-01');
    setupMockHandlerCreation([...mockEvents]);
    const { user } = setup(<App />);

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '팀 회의');

    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    vi.setSystemTime('2025-05-01');
    setupMockHandlerCreation([...mockEvents]);
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    await user.clear(searchInput);

    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('팀 회의')).toBeInTheDocument();
    expect(within(list).getByText('점심 약속')).toBeInTheDocument();
    expect(within(list).getByText('프로젝트 마감')).toBeInTheDocument();
    expect(within(list).getByText('생일 파티')).toBeInTheDocument();
    expect(within(list).getByText('운동')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  beforeEach(() => {
    vi.setSystemTime('2025-05-01');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([...mockEvents]);
    const { user } = setup(<App />);

    const form = {
      title: '디자인 리뷰 회의',
      date: '2025-05-22',
      startTime: '18:00',
      endTime: '19:30',
      description: '디자인 팀과의 리뷰 미팅',
      location: '회의실 D',
      category: '업무',
    };

    await saveSchedule(user, form);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating([...mockEvents]);
    const { user } = setup(<App />);

    const list = await screen.findByTestId('event-list');
    const eventId = mockEvents[0].id;

    // edit 버튼 클릭 (test-id 기반)
    const editButton = within(list).getByTestId(`event-edit-button-${eventId}`);
    await user.click(editButton);

    // 날짜 겹치도록 수정
    await user.clear(screen.getByLabelText('날짜'));
    await user.type(screen.getByLabelText('날짜'), mockEvents[1].date);

    // 제목은 그대로 두고, 시간만 겹치게 수정
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), mockEvents[1].startTime);

    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), mockEvents[1].endTime);

    const submit = screen.getByTestId('event-submit-button');
    await user.click(submit);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-05-30T13:50:00'));
  const { user } = setup(<App />);
  const form = {
    title: '디자인 리뷰 회의',
    date: '2025-05-30',
    startTime: '14:00',
    endTime: '15:30',
    description: '디자인 팀과의 리뷰 미팅',
    location: '회의실 D',
    category: '업무',
    notificationTime: 10,
  };

  await saveSchedule(user, form);

  // 정확한 메시지 확인
  const alertMessage = '10분 전';
  const alert = await screen.findByText(alertMessage);

  expect(alert).toBeInTheDocument();
});
