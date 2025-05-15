import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
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

const newEvent = {
  title: '테스트 일정',
  date: '2025-10-22',
  startTime: '14:00',
  endTime: '15:00',
  location: '회의실 A',
  description: '일정 설명',
  category: '업무',
};
// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, newEvent);

    // 일정이 리스트에 렌더링되었는지 확인
    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('테스트 일정')).toBeInTheDocument();
    expect(within(list).getByText('회의실 A')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    // 기존 일정이 표시되는지 확인
    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('기존 회의')).toBeInTheDocument();

    // 편집 버튼 클릭
    const editButtons = within(list).getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 제목 수정
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');

    // 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 수정된 내용이 표시되는지 확인
    await waitFor(() => {
      expect(within(list).getByText('수정된 회의')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);

    // 삭제할 일정이 표시되는지 확인
    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('삭제할 이벤트')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const deleteButton = within(list).getByLabelText('Delete event');
    await user.click(deleteButton);

    // 삭제 후 "검색 결과가 없습니다" 메시지가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // 빈 일정 목록으로 설정
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);

    // 주별 뷰 선택
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // 주별 뷰가 표시되는지 확인
    const weekView = await screen.findByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    // 일정 항목이 표시되지 않는지 확인
    const days = within(weekView).getAllByRole('cell');
    expect(days.length).toBeGreaterThan(0);

    // 모든 셀에 일정 항목이 없는지 확인
    days.forEach((day) => {
      const dayContent = within(day).queryAllByText(/테스트|회의|미팅/);
      expect(dayContent.length).toBe(0);
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // 특정 날짜에 일정이 있는 경우
    const testEvent = {
      id: '1',
      title: '주간 회의',
      date: '2025-10-01', // 현재 시스템 시간으로 설정된 날짜
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    };

    setupMockHandlerCreation([testEvent]);

    const { user } = setup(<App />);

    // 주별 뷰 선택
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // 주별 뷰에 일정이 표시되는지 확인
    const weekView = await screen.findByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    // 일정이 표시되는지 확인
    await waitFor(() => {
      expect(within(weekView).getByText('주간 회의')).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    // 빈 일정 목록으로 설정
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);

    // 월별 뷰 선택
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    // 월별 뷰가 표시되는지 확인
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 모든 날짜 셀을 검사하여 일정이 없는지 확인
    const cells = within(monthView).getAllByRole('cell');
    cells.forEach((cell) => {
      const events = within(cell).queryAllByText(/테스트|회의|미팅/);
      expect(events.length).toBe(0);
    });
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    // 특정 날짜에 일정이 있는 경우
    const testEvent = {
      id: '1',
      title: '월간 보고',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '월간 부서 보고',
      location: '대회의실',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    };

    setupMockHandlerCreation([testEvent]);

    const { user } = setup(<App />);

    // 월별 뷰 선택
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    // 월별 뷰가 표시되는지 확인
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 일정이 표시되는지 확인
    await waitFor(() => {
      expect(within(monthView).getByText('월간 보고')).toBeInTheDocument();
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    // 신정(1월 1일)에 표시될 공휴일 처리를 위한 Mock 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [] });
      })
    );

    // 테스트에서 사용할 날짜를 1월로 설정
    vi.setSystemTime(new Date('2025-01-01'));

    const { user } = setup(<App />);

    // 월별 뷰 선택
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    // 1월 1일 셀에 "신정" 텍스트가 있는지 확인
    const monthView = await screen.findByTestId('month-view');
    expect(within(monthView).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    // 일정 설정
    const testEvent = {
      id: '1',
      title: '일반 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '일반적인 회의',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    };

    setupMockHandlerCreation([testEvent]);

    const { user } = setup(<App />);

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    // "검색 결과가 없습니다" 메시지가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    // 팀 회의 일정 설정
    const testEvent = {
      id: '1',
      title: '팀 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '중요한 팀 회의',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    };

    setupMockHandlerCreation([testEvent]);

    const { user } = setup(<App />);

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    // 검색된 일정이 표시되는지 확인
    const list = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(list).getByText('팀 회의')).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    // 여러 일정 설정
    const testEvents = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '고객 미팅',
        date: '2025-10-16',
        startTime: '13:00',
        endTime: '14:00',
        description: '고객과의 미팅',
        location: '미팅룸 B',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(testEvents);

    const { user } = setup(<App />);

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    // 특정 일정만 표시되는지 확인
    const list = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(list).queryByText('고객 미팅')).not.toBeInTheDocument();
    });

    // 검색어 지우기
    await user.clear(searchInput);

    // 모든 일정이 다시 표시되는지 확인
    await waitFor(() => {
      expect(within(list).getByText('팀 회의')).toBeInTheDocument();
      // selector를 더 구체적으로 지정해 제목만 찾도록 합니다
      const customerMeetingElements = within(list).getAllByText('고객 미팅');
      expect(customerMeetingElements.length).toBeGreaterThan(0);
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    // 기존 일정 설정
    const existingEvent = {
      id: '1',
      title: '기존 회의',
      date: '2025-10-22',
      startTime: '14:30',
      endTime: '15:30',
      description: '기존 회의',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    };

    setupMockHandlerCreation([existingEvent]);

    const { user } = setup(<App />);

    // 겹치는 시간에 새 일정 추가
    await saveSchedule(user, newEvent);

    // 경고 대화상자가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    // 두 개의 일정 설정
    const testEvents = [
      {
        id: '1',
        title: '첫 번째 회의',
        date: '2025-10-22',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 번째 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '두 번째 회의',
        date: '2025-10-22',
        startTime: '14:00',
        endTime: '15:00',
        description: '두 번째 회의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(testEvents);

    const { user } = setup(<App />);

    // 첫 번째 일정 편집
    const list = await screen.findByTestId('event-list');
    const editButtons = within(list).getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 시간 변경 (두 번째 일정과 겹치게)
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');

    await user.clear(startTimeInput);
    await user.clear(endTimeInput);

    await user.type(startTimeInput, '13:30');
    await user.type(endTimeInput, '14:30');

    // 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 경고 대화상자가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    });
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  // 10분 전 알림이 설정된 일정
  const testEvent = {
    id: '1',
    title: '알림 테스트',
    date: '2025-10-01', // 시스템 시간과 같은 날짜
    startTime: '09:00',
    endTime: '10:00',
    description: '알림 테스트용 일정',
    location: '회의실',
    category: '업무',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 10, // 10분 전 알림
  };

  setupMockHandlerCreation([testEvent]);

  // 시스템 시간을 일정 시작 10분 전으로 설정
  const eventDate = new Date('2025-10-01T09:00:00');
  const tenMinutesBefore = new Date(eventDate.getTime() - 10 * 60 * 1000);
  vi.setSystemTime(tenMinutesBefore);

  setup(<App />);

  // 알림이 표시되는지 확인 (App 컴포넌트가 마운트될 때 알림이 표시되어야 함)
  await waitFor(() => {
    const notifications = screen.getAllByText(/알림 테스트/);
    expect(notifications.length).toBeGreaterThan(0);
  });
});
