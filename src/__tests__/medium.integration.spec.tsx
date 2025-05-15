import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '@/__mocks__/handlersUtils';
import App from '@/App';
import { EventProvider } from '@/entities/event/model/EventProvider';
import { Event } from '@/entities/event/model/types';
// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
// ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
// ! Medium: ChakraProvider로 묶어주는 동작은 의미있음. element 로 들어올 App 컴포넌트에서 Chakra UI 를 사용하는데 이 컴포넌트는 ChakraProvider 안에서 사용되어야 하기 때문
beforeEach(() => {
  vi.clearAllMocks();
});

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ChakraProvider>
        <EventProvider>{element}</EventProvider>
      </ChakraProvider>
    ),
    user,
  };
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

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation();
    const { user } = setup(<App />); // setup 함수에서 render 가 즉시 실행되기 때문에 실제 DOM 에서 컴포넌트가 마운트되고 user 객체 반환

    const newEvent = {
      title: '과제하기!',
      date: '2025-10-14',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 코드 작성',
      location: '도서관',
      category: '업무',
    };
    await saveSchedule(user, newEvent);

    const eventList = await screen.findByTestId('event-list');
    expect(await within(eventList).findByText(newEvent.title)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    // 초기 타이틀 상태 확인
    const addTitle = screen.getAllByText('일정 추가');
    expect(addTitle[0]).toBeInTheDocument();

    const eventList = await screen.findByTestId('event-list');

    const updatedTitle = '기존 회의, 자료 프린트';
    const updatedDescription = '기획팀도 들어옴.';
    const updatedLocation = '회의실 A';
    const eventTitle = '기존 회의';

    // 수정 버튼 쿼링
    const eventElement = await within(eventList).findByText(eventTitle);
    const eventContainer = eventElement.closest('.chakra-stack.css-1y3f6ad') as HTMLElement; // 해당 이벤트 버튼을 포함한 상위 요소 찾기
    const editButton = await within(eventContainer!).findByRole('button', {
      name: 'Edit event',
    });

    // 수정 버튼 클릭 후 타이틀 상태 확인
    act(() => {
      user.click(editButton);
    });
    const updateTitle = await screen.findAllByText('일정 수정');
    expect(updateTitle[0]).toBeInTheDocument();

    const titleInput = screen.getByLabelText('제목');
    const DescriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');

    /**
     * title: '기존 회의' -> '기존 회의, 자료 프린트'
     * description: '기존 팀 미팅' -> '기획팀도 들어옴.'
     * location: '회의실 B' -> '회의실 A'
     */
    await user.clear(titleInput);
    await user.type(titleInput, '기존 회의, 자료 프린트');
    await user.clear(DescriptionInput);
    await user.type(DescriptionInput, updatedDescription);
    await user.type(locationInput, '{Backspace}');
    await user.type(locationInput, 'A');

    act(() => {
      user.click(screen.getByTestId('event-submit-button'));
    });

    waitFor(async () => {
      expect(await within(eventList).findByText(updatedTitle)).toBeInTheDocument();
      expect(await within(eventList).findByText(updatedDescription)).toBeInTheDocument();
      expect(await within(eventList).findByText(updatedLocation)).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    const eventTitle = '삭제할 이벤트';
    const eventList = await screen.findByTestId('event-list');
    const eventElement = await within(eventList).findByText(eventTitle);
    expect(eventElement).toBeInTheDocument();

    // 삭제 버튼 쿼링
    const eventContainer = eventElement.closest('.chakra-stack.css-1y3f6ad') as HTMLElement; // 해당 이벤트 버튼을 포함한 상위 요소 찾기
    const deleteButton = await within(eventContainer!).findByRole('button', {
      name: 'Delete event',
    });

    await user.click(deleteButton);
    waitFor(async () => {
      expect(await within(eventList).findByText(eventTitle)).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // 월별 뷰에서는 일정이 있지만 주별 뷰에서는 일정이 없는 경우
    vi.setSystemTime(new Date('2025-10-22'));
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    expect(screen.queryAllByText('기존 회의').length).toBeGreaterThan(0);
    expect(within(eventList).queryAllByText('기존 회의').length).toBeGreaterThan(0);

    act(() => {
      user.selectOptions(screen.getByLabelText('view'), 'week');
    });

    waitFor(() => {
      expect(screen.queryAllByText('기존 회의').length).toBe(0);
      expect(within(eventList).queryAllByText('기존 회의').length).toBe(0);
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // 월별 뷰, 주별 뷰 모두 일정이 있는 경우
    vi.setSystemTime(new Date('2025-10-15'));
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    expect(screen.queryAllByText('기존 회의').length).toBeGreaterThan(0);
    expect(within(eventList).queryAllByText('기존 회의').length).toBeGreaterThan(0);

    act(() => {
      user.selectOptions(screen.getByLabelText('view'), 'week');
    });

    waitFor(() => {
      expect(screen.queryByText('15')).toBeInTheDocument();
      expect(screen.queryAllByText('기존 회의').length).toBeGreaterThan(0);
      expect(within(eventList).queryAllByText('기존 회의').length).toBeGreaterThan(0);
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-05-15'));
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    act(() => {
      user.selectOptions(screen.getByLabelText('view'), 'month'); // 굳이 안해도 되나?
    });

    const eventList = await screen.findByTestId('event-list');
    expect(screen.queryAllByText('기존 회의').length).toBe(0);
    expect(within(eventList).queryAllByText('기존 회의').length).toBe(0);
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    act(() => {
      user.selectOptions(screen.getByLabelText('view'), 'month');
    });

    const eventList = await screen.findByTestId('event-list');

    waitFor(() => {
      expect(screen.queryAllByText('기존 회의').length).toBeGreaterThan(0);
      expect(within(eventList).queryAllByText('기존 회의').length).toBeGreaterThan(0);
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    act(() => {
      user.selectOptions(screen.getByLabelText('view'), 'month');
    });

    waitFor(() => {
      expect(screen.getByText('신정')).toBeInTheDocument();
    });
    vi.useRealTimers();
  });
});

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '생존 신고');
    await user.keyboard('{Enter}');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 미팅 2'을 검색하면 해당 키워드를 가진 일정만 리스트에 노출된다", async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 미팅 2');
    await user.keyboard('{Enter}');
    expect(searchInput).toHaveValue('팀 미팅 2');

    const eventList = screen.getByTestId('event-list');
    expect(await within(eventList).findByDisplayValue('팀 미팅 2')).toBeInTheDocument();
    expect(within(eventList).queryByText('회의실 B')).not.toBeInTheDocument();
    expect(within(eventList).queryByText('회의실 C')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 미팅 2');
    await user.keyboard('{Enter}');

    await user.clear(searchInput);
    await user.keyboard('{Enter}');
    expect(searchInput).toHaveValue('');

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).queryByText('회의실 B')).toBeInTheDocument();
    expect(within(eventList).queryByText('회의실 C')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation();
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const newEvent = {
      title: '은행 가기',
      date: '2025-10-15',
      startTime: '10:30',
      endTime: '11:30',
      description: '카드, 신분증 챙기기',
      location: '신한은행',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    await saveSchedule(user, newEvent);

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    const eventTitle = '기존 회의';

    // 수정 버튼 쿼링
    const eventElement = await within(eventList).findByText(eventTitle);
    const eventContainer = eventElement.closest('.chakra-stack.css-1y3f6ad') as HTMLElement;
    const editButton = await within(eventContainer!).findByRole('button', {
      name: 'Edit event',
    });

    // 수정 버튼 클릭 후 타이틀 상태 확인
    act(() => {
      user.click(editButton);
    });
    const updateTitle = await screen.findAllByText('일정 수정');
    expect(updateTitle[0]).toBeInTheDocument();

    const endTimeInput = screen.getByLabelText('종료 시간');

    await user.clear(endTimeInput);
    await user.type(endTimeInput, '12:30');

    act(() => {
      user.click(screen.getByTestId('event-submit-button'));
    });

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime('2025-10-15T08:50:00');
  setupMockHandlerUpdating();
  setup(<App />);

  expect(await screen.findByText('10분 전')).toBeInTheDocument();
});
