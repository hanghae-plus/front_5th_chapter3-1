import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';
import { beforeEach } from 'vitest';

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
    setupMockHandlerCreation([]);
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '팀 회의',
      date: '2025-10-16',
      startTime: '20:00',
      endTime: '21:00',
      location: '회의실 A',
      description: '주간 팀 미팅',
      category: '업무',
    });

    // 추가된 일정이 목록에 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(screen.getByText('회의실 A')).toBeInTheDocument();
      expect(screen.getByText('20:00 - 21:00')).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '팀 회의',
      date: '2025-10-16',
      startTime: '20:00',
      endTime: '21:00',
      location: '회의실 A',
      description: '주간 팀 미팅',
      category: '업무',
    });

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('20:00 - 21:00')).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '회식');
    await user.clear(screen.getByLabelText('날짜'));
    await user.type(screen.getByLabelText('날짜'), '2025-10-17');
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '19:00');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '22:00');
    await user.clear(screen.getByLabelText('위치'));
    await user.type(screen.getByLabelText('위치'), '음식점 B');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '팀 회식');
    await user.selectOptions(screen.getByLabelText('카테고리'), '개인');
    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(within(eventList).getByText('19:00 - 22:00')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '팀 회의',
      date: '2025-10-16',
      startTime: '20:00',
      endTime: '21:00',
      location: '회의실 A',
      description: '주간 팀 미팅',
      category: '업무',
    });

    const eventList = screen.getByTestId('event-list');
    const deleteButton = within(eventList).getByLabelText('Delete event');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(within(eventList).queryByText('팀 회의')).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const testEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' },
        notificationTime: 30,
      },
      {
        id: '2',
        title: '고객 미팅',
        date: '2025-10-20', // 다른 주
        startTime: '14:00',
        endTime: '15:00',
        description: '신규 고객 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none' },
        notificationTime: 30,
      },
    ];
    setupMockHandlerCreation(testEvents);
    const { user } = setup(<App />);
    // 주별 뷰로 변경
    const viewSelect = screen.getByRole('combobox', { name: 'view' });

    // 주별 뷰로 변경
    await user.selectOptions(viewSelect, 'week');

    // 다음 주로 이동 버튼 클릭
    const nextButton = screen.getByRole('button', { name: 'Next' });
    await user.click(nextButton);

    // 일정이 표시되지 않는지 확인
    await waitFor(() => {
      expect(screen.queryByText('팀 회의')).not.toBeInTheDocument();
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const testEvents = [
      {
        id: '1',
        title: '팀 회의',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' },
        notificationTime: 30,
      },
    ];

    setupMockHandlerCreation(testEvents);
    const { user } = setup(<App />);
    const viewSelect = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(viewSelect, 'week');

    // 일정 항목이 있는지 확인
    await waitFor(() => {
      const eventElements = screen.queryAllByTestId('event-item');

      if (eventElements.length === 0) {
        const timeString = screen.queryByText('10:00 - 11:00');
        expect(timeString).toBeInTheDocument();
      } else {
        expect(eventElements.length).toBeGreaterThan(0);
      }
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const viewSelect = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(viewSelect, 'month');

    const eventItems = screen.queryAllByTestId('event-item');

    expect(eventItems.length).toBe(0);
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const testEvents = [
      {
        id: '1',
        title: '팀 회의',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' },
        notificationTime: 30,
      },
    ];

    setupMockHandlerCreation(testEvents);
    const { user } = setup(<App />);

    const viewSelect = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(viewSelect, 'month');

    await waitFor(() => {
      const eventElements = screen.queryAllByTestId('event-item');

      if (eventElements.length === 0) {
        const timeString = screen.queryByText('10:00 - 11:00');
        expect(timeString).toBeInTheDocument();
      } else {
        expect(eventElements.length).toBeGreaterThan(0);
      }
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);
    // 10월에서 1월로 이동
    const prevButton = screen.getByRole('button', { name: 'Previous' });
    for (let i = 0; i < 9; i++) {
      await user.click(prevButton);
    }
    const calendar = screen.getByTestId('month-view');
    expect(within(calendar).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  const testEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '고객 미팅',
      date: '2025-10-20', // 다른 주
      startTime: '14:00',
      endTime: '15:00',
      description: '신규 고객 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    },
  ];
  beforeEach(() => {
    setupMockHandlerCreation(testEvents);
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');
    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    const eventList = screen.getByTestId('event-list');

    await act(async () => {
      await user.clear(searchInput);
    });

    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  const testEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '고객 미팅',
      date: '2025-10-20', // 다른 주
      startTime: '14:00',
      endTime: '15:00',
      description: '신규 고객 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    },
  ];
  beforeEach(() => {
    setupMockHandlerCreation(testEvents);
  });
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const { user } = setup(<App />);
    await saveSchedule(user, {
      id: '3',
      title: '팀 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 30,
    });

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.getAllByText(/기존 회의/i).length).toBeGreaterThan(0);
    });

    const eventList = screen.getByTestId('event-list');
    const editButtons = within(eventList).getAllByLabelText('Edit event');
    await act(async () => {
      await user.click(editButtons[0]);
    });

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정');
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '11:00');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '12:00');

    const submitButton = screen.getByTestId('event-submit-button');

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const testEvents = [
    {
      id: '1',
      title: '알림 테스트',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '알림 테스트 설명',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none' },
      notificationTime: 10,
    },
  ];
  setupMockHandlerCreation(testEvents);
  const { user } = setup(<App />);
  console.log('user:', user);
  vi.setSystemTime('2025-10-15T08:50:00');
  expect(await screen.findByText('10분 전')).toBeInTheDocument();
});
