import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요? = 테스트 환경에서도 실제 앱과 동일하게 context를 제공하기 위함.
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
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    const newEvent = {
      title: '새로운 일정 추가',
      date: '2025-07-07',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      description: '새로운 일정 설명',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    const eventList = await screen.findByTestId('event-list');

    expect(within(eventList).getByText('새로운 일정 추가')).toBeInTheDocument();
    expect(within(eventList).getByText('2025-07-07')).toBeInTheDocument();
    expect(within(eventList).getByText(/10:00/)).toBeInTheDocument();
    expect(within(eventList).getByText(/11:00/)).toBeInTheDocument();
    expect(within(eventList).getByText('회의실 A')).toBeInTheDocument();
    expect(within(eventList).getByText('새로운 일정 설명')).toBeInTheDocument();
    expect(within(eventList).getByText(/업무/)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    const eventItems = within(eventList).getAllByTestId('event-item');
    const editButton = within(eventItems[0]).getByLabelText('Edit event');

    await user.click(editButton);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');

    await user.clear(screen.getByLabelText('위치'));
    await user.type(screen.getByLabelText('위치'), '회의실 Z');

    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(within(eventList).getByText('수정된 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('회의실 Z')).toBeInTheDocument();
      expect(within(eventList).queryByText('기존 회의')).not.toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    const eventItems = within(eventList).getAllByTestId('event-item');
    const deleteButton = within(eventItems[0]).getByLabelText('Delete event');

    await user.click(deleteButton);

    await waitFor(() => {
      expect(within(eventList).queryByText('기존 회의')).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);

    const select = await screen.findByLabelText('view');

    await user.selectOptions(select, 'week');

    const weekView = await screen.findByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    const weekDates = within(weekView).getAllByRole('cell');

    for (const dateCell of weekDates) {
      const dateText = within(dateCell).getByText(/\d+/);
      expect(dateText).toBeInTheDocument();

      const eventBoxes = within(dateCell).queryAllByRole('box');
      expect(eventBoxes.length).toBe(0);
    }
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime(new Date('2025-05-21'));

    setupMockHandlerCreation([
      {
        id: '529',
        title: '점심 약속',
        date: '2025-05-21',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);

    const { user } = setup(<App />);
    const select = await screen.findByLabelText('view');

    await user.selectOptions(select, 'week');

    const weekView = await screen.findByTestId('week-view');
    const found = await within(weekView).findByText((text) => text.includes('점심 약속'));

    expect(found).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);

    const viewSelector = await screen.findByLabelText('view');
    await user.selectOptions(viewSelector, 'month');

    const monthView = await screen.findByTestId('month-view');

    const allDateCells = within(monthView).getAllByRole('cell');

    for (const cell of allDateCells) {
      const boxes = within(cell).queryAllByText((_, node) => {
        return node?.nodeName === 'DIV' || node?.nodeName === 'SECTION';
      });

      expect(boxes.length).toBe(0);
    }
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([
      {
        id: '529',
        title: '점심 약속',
        date: '2025-05-21',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);

    const { user } = setup(<App />);

    const viewSelector = await screen.findByLabelText('view');
    await user.selectOptions(viewSelector, 'month');

    const monthView = await screen.findByTestId('month-view');
    const found = await within(monthView).findByText((text) => text.includes('점심 약속'));

    expect(found).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    const { user } = setup(<App />);

    const viewSelector = await screen.findByLabelText('view');
    await user.selectOptions(viewSelector, 'month');

    const monthViewContainer = await screen.findByTestId('month-view');
    const holidayText = await within(monthViewContainer).findByText('신정');

    expect(holidayText).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);

    const inputEl = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(inputEl, '없는 일정');

    const eventList = await screen.findByTestId('event-list');
    const noResult = await within(eventList).findByText('검색 결과가 없습니다.');

    expect(noResult).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerCreation([
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-10-10',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);

    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    const inputEl = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.type(inputEl, '팀 회의');

    const matched = await within(eventList).findByText((text) => text.includes('팀 회의'));

    expect(matched).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation([
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-10-10',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '주간 회의',
        date: '2025-10-11',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);

    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    const inputEl = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.type(inputEl, '팀 회의');
    await within(eventList).findByText((text) => text.includes('팀 회의'));

    await user.clear(inputEl);

    const matched = await within(eventList).findByText((text) => text.includes('주간 회의'));

    expect(matched).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-10-10',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);

    const { user } = setup(<App />);
    const newEvent = {
      title: '중복 일정',
      date: '2025-10-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '리더 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    await saveSchedule(user, newEvent);

    const warningAlert = await screen.findByRole('alertdialog');

    expect(warningAlert).toHaveTextContent('일정 겹침 경고');
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);
    const eventList = await screen.findByTestId('event-list');

    const eventItems = within(eventList).getAllByTestId('event-item');
    const editButton = within(eventItems[1]).getByLabelText('Edit event');

    await user.click(editButton);

    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '09:30');

    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    const warningAlert = await screen.findByRole('alertdialog');

    expect(warningAlert).toHaveTextContent('일정 겹침 경고');
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  setupMockHandlerCreation([
    {
      id: '529',
      title: '회의 알림 테스트',
      date: '2025-10-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '알림 테스트 설명',
      location: '회의실 X',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);

  setup(<App />);

  const eventList = await screen.findByTestId('event-list');
  const eventCard = await within(eventList).findByText((text) => text.includes('회의 알림 테스트'));
  const cardContainer = eventCard.closest('[data-testid="event-item"]');

  expect(cardContainer).toHaveTextContent('알림: 10분 전');
});
