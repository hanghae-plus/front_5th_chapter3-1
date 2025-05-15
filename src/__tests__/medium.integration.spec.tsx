import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor, cleanup } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  cleanupMockHandler,
  setupMockHandlerAppend,
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerFetch,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const renderWithChakra = (ui: ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('일정 CRUD 및 기본 기능', () => {
  let user: UserEvent;
  // 각 테스트에서 사용할 메모리 내 이벤트 목록
  let testId: string;

  beforeEach(async () => {
    user = userEvent.setup();
    vi.setSystemTime(new Date('2025-05-20'));

    // 독립된 테스트 환경 생성
    testId = setupMockHandlerCreation([]);

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: setupMockHandlerFetch() });
      }),
      http.post('/api/events', async ({ request }) => {
        const event = (await request.json()) as Event;
        const newEvent = {
          ...event,
          id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        };
        setupMockHandlerAppend(newEvent);
        return HttpResponse.json(newEvent);
      })
    );

    renderWithChakra(<App />);

    await waitFor(() => expect(screen.queryByText('일정 로딩 완료!')).not.toBeInTheDocument());
    expect(
      await screen.findByText(/검색 결과가 없습니다.|일정이 없습니다./i, {})
    ).toBeInTheDocument();
  });

  afterEach(() => {
    if (testId) {
      cleanupMockHandler(testId);
    }
    vi.useRealTimers();
    cleanup();
    server.resetHandlers();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const newEventDetails: Omit<Event, 'id'> = {
      title: '테스트 회의',
      date: '2025-05-25',
      startTime: '14:00',
      endTime: '15:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await user.type(screen.getByLabelText('제목'), newEventDetails.title);
    await user.type(screen.getByLabelText('날짜'), newEventDetails.date);
    await user.type(screen.getByLabelText('시작 시간'), newEventDetails.startTime);
    await user.type(screen.getByLabelText('종료 시간'), newEventDetails.endTime);
    await user.type(screen.getByLabelText('설명'), newEventDetails.description);
    await user.type(screen.getByLabelText('위치'), newEventDetails.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), newEventDetails.category);

    // 일정 추가 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 성공 토스트 메시지 확인
    expect(await screen.findByText('일정이 추가되었습니다.')).toBeInTheDocument();

    // UI에 최종적으로 반영되었는지 확인
    await waitFor(async () => {
      const eventList = screen.getByTestId('event-list');
      expect(await within(eventList).findByText(newEventDetails.title)).toBeInTheDocument();
      expect(within(eventList).getByText(newEventDetails.date)).toBeInTheDocument();
      expect(
        within(eventList).getByText(`${newEventDetails.startTime} - ${newEventDetails.endTime}`)
      ).toBeInTheDocument();
      expect(within(eventList).getByText(newEventDetails.description)).toBeInTheDocument();
      expect(within(eventList).getByText(newEventDetails.location)).toBeInTheDocument();
      expect(
        within(eventList).getByText(`카테고리: ${newEventDetails.category}`)
      ).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // 초기 이벤트 생성 및 메모리에 추가
    const initialEvent: Event = {
      id: 'initial-event-1',
      title: '원래 회의',
      date: '2025-05-25',
      startTime: '10:00',
      endTime: '11:00',
      description: '원래 설명',
      location: '원래 위치',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    setupMockHandlerAppend(initialEvent);

    // PUT 핸들러 수정
    server.use(
      http.put('/api/events/:id', async ({ params, request }) => {
        const id = params.id as string;
        const updatedData = (await request.json()) as Event;

        const currentEvents = setupMockHandlerFetch();

        const updatedEvents = currentEvents.map((event) =>
          event.id === id ? { ...event, ...updatedData } : event
        );

        setupMockHandlerUpdating(updatedEvents);

        const updatedEvent = updatedEvents.find((event) => event.id === id);
        return HttpResponse.json(updatedEvent || { ...updatedData, id }, { status: 200 });
      })
    );

    // App 리렌더링하여 초기 데이터 로드
    cleanup();
    renderWithChakra(<App />);

    // 로딩 완료 및 초기 이벤트 표시 대기
    await waitFor(() => expect(screen.queryByText('일정 로딩 완료!')).not.toBeInTheDocument());

    // 이벤트 리스트에서 원래 회의 찾기
    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText('원래 회의');

    // 수정 버튼 클릭
    const editButton = within(eventList).getByLabelText('Edit event');
    await user.click(editButton);

    // 폼에 수정할 내용 입력 (폼이 표시되고 제목이 '일정 수정'으로 변경되었는지 확인)
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: '일정 수정' });
      expect(heading).toBeInTheDocument();
    });

    // 제목과 종료 시간 수정 (폼 컨테이너를 사용하지 않고 직접 요소 접근)
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');

    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '12:00');

    // 수정 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 수정 성공 메시지 확인
    await screen.findByText('일정이 수정되었습니다.');

    // UI에 수정된 내용 확인
    await waitFor(async () => {
      expect(await within(eventList).findByText('수정된 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('10:00 - 12:00')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    // 삭제할 이벤트 생성 및 메모리에 추가
    const eventToDelete: Event = {
      id: 'event-to-delete',
      title: '삭제할 회의',
      date: '2025-05-25',
      startTime: '10:00',
      endTime: '11:00',
      description: '삭제할 설명',
      location: '삭제할 위치',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    setupMockHandlerAppend(eventToDelete);

    // DELETE 핸들러 수정
    server.use(
      http.delete('/api/events/:id', ({ params }) => {
        const id = params.id as string;
        setupMockHandlerDeletion(id);
        return new HttpResponse(null, { status: 204 });
      })
    );

    // App 리렌더링하여 초기 데이터 로드
    cleanup();
    renderWithChakra(<App />);

    // 로딩 완료 및 초기 이벤트 표시 대기
    await waitFor(() => expect(screen.queryByText('일정 로딩 완료!')).not.toBeInTheDocument());

    // 이벤트 리스트에서 삭제할 회의 찾기
    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText('삭제할 회의');

    // 삭제 버튼 클릭
    const deleteButton = within(eventList).getByLabelText('Delete event');
    await user.click(deleteButton);

    // 삭제 성공 메시지 확인
    await screen.findByText('일정이 삭제되었습니다.');

    // 삭제된 일정이 더 이상 표시되지 않는지 확인
    await waitFor(() => {
      expect(screen.queryByText('삭제할 회의')).not.toBeInTheDocument();
    });

    // 이벤트 리스트에 '검색 결과가 없습니다' 메시지가 표시되는지 확인 (모든 이벤트가 삭제된 경우)
    await waitFor(() => {
      expect(screen.getByText(/검색 결과가 없습니다.|일정이 없습니다./i)).toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  let user: UserEvent;
  let inMemoryEvents: Event[];

  beforeEach(async () => {
    user = userEvent.setup();
    inMemoryEvents = [];
    vi.setSystemTime(new Date('2025-05-20')); // 기본 시스템 시간을 5월 20일로 설정

    // MSW 핸들러 설정
    server.use(
      http.get('/api/events', async () => {
        return HttpResponse.json({ events: [...inMemoryEvents] });
      })
    );

    renderWithChakra(<App />);
    await waitFor(() => expect(screen.queryByText('일정 로딩 완료!')).not.toBeInTheDocument());
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    server.resetHandlers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // 주별 뷰로 전환
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // 주별 뷰 컨테이너 확인
    const weekView = screen.getByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // 테이블에서 이벤트가 표시되는 Box 요소가 없는지 확인
    const eventBoxes = within(table).queryAllByText(/회의|약속|프로젝트|생일|운동/);
    expect(eventBoxes.length).toBe(0);
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // 테스트 이벤트 추가 (5월 20일 - 현재 날짜)
    const testEvent: Event = {
      id: 'test-event-1',
      title: '주간 테스트 회의',
      date: '2025-05-20', // 현재 날짜
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 테스트 설명',
      location: '테스트 위치',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    inMemoryEvents.push(testEvent);

    // 페이지 리렌더링
    cleanup();
    renderWithChakra(<App />);
    await waitFor(() => expect(screen.queryByText('일정 로딩 완료!')).not.toBeInTheDocument());

    // 주별 뷰로 변경
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // 주별 뷰가 표시되었는지 확인
    await waitFor(() => {
      expect(screen.getByText(/2025년 5월.*주$/)).toBeInTheDocument();
    });

    // 테이블 요소 찾기 (주별 뷰 내의 테이블)
    const weekTable = screen.getByRole('table');

    // 주별 뷰의 테이블 내에서 이벤트 확인
    expect(within(weekTable).getByText('주간 테스트 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    expect(screen.getByText('2025년 5월')).toBeInTheDocument();

    // 월별 뷰 테이블 확인
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // 테이블에서 이벤트가 표시되는 Box 요소가 없는지 확인
    const eventBoxes = within(table).queryAllByText(/회의|약속|프로젝트|생일|운동/);
    expect(eventBoxes.length).toBe(0);
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const testEvent: Event = {
      id: 'test-event-1',
      title: '월간 테스트 회의',
      date: '2025-05-15', // 현재 월 내 날짜
      startTime: '10:00',
      endTime: '11:00',
      description: '월간 테스트 설명',
      location: '테스트 위치',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    inMemoryEvents.push(testEvent);

    // 페이지 리렌더링
    cleanup();
    renderWithChakra(<App />);
    await waitFor(() => expect(screen.queryByText('일정 로딩 완료!')).not.toBeInTheDocument());

    // 월별 뷰 제목이 표시되었는지 확인
    expect(screen.getByText('2025년 5월')).toBeInTheDocument();

    // 테이블 요소 찾기 (월별 뷰 내의 테이블)
    const monthTable = screen.getByRole('table');

    // 월별 뷰의 테이블 내에서 이벤트 확인
    expect(within(monthTable).getByText('월간 테스트 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const prevButton = screen.getByLabelText('Previous');

    const months = [4, 3, 2, 1]; // 이동하려는 월 (5월에서 시작)

    for (const month of months) {
      await user.click(prevButton);
      await waitFor(() => {
        expect(screen.getByText(`2025년 ${month}월`)).toBeInTheDocument();
      });
    }

    // 1일이 표시된 셀 찾기
    const cells = screen.getAllByRole('cell');
    const firstDayCell = Array.from(cells).find((cell) => {
      // 셀 안에 '1'이라는 텍스트가 있고, 다른 숫자가 아닌지 확인 (예: '10', '11' 등과 구분)
      const dayTextElement = within(cell).queryByText(/^1$/); // 정확히 '1'만 있는 텍스트
      return dayTextElement !== null;
    });
    // 셀이 존재하는지 확인
    expect(firstDayCell).toBeDefined();

    // 1일 셀에 '신정' 텍스트가 있는지 확인
    const holidayText = within(firstDayCell!).getByText('신정');
    expect(holidayText).toBeInTheDocument();

    // 공휴일은 빨간색으로 표시되는지 확인
    expect(holidayText).toHaveStyle('color: var(--chakra-colors-red-500)');
  });
});

describe('검색 기능', () => {
  let user: UserEvent;
  let inMemoryEvents: Event[];

  beforeEach(async () => {
    user = userEvent.setup();
    inMemoryEvents = [
      // 기본 테스트 이벤트들 설정
      {
        id: 'event-1',
        title: '팀 회의',
        date: '2025-05-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'event-2',
        title: '점심 약속',
        date: '2025-05-21',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'event-3',
        title: '프로젝트 마감',
        date: '2025-05-25',
        startTime: '09:00',
        endTime: '18:00',
        description: '분기별 프로젝트 마감',
        location: '사무실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    // 시스템 시간 설정 (2025-05-20)
    vi.setSystemTime(new Date('2025-05-20'));

    // MSW 핸들러 설정
    server.use(
      http.get('/api/events', async () => {
        return HttpResponse.json({ events: [...inMemoryEvents] });
      })
    );

    renderWithChakra(<App />);
    await waitFor(() => expect(screen.queryByText('일정 로딩 완료!')).not.toBeInTheDocument());
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    server.resetHandlers();
  });
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    // 검색창 찾기
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    // 존재하지 않는 키워드로 검색
    await user.clear(searchInput);
    await user.type(searchInput, '존재하지 않는 일정');

    // 검색 결과가 없을 때 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    // 일정 목록에 일정이 표시되지 않는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).queryByText('팀 회의')).not.toBeInTheDocument();
    expect(within(eventList).queryByText('점심 약속')).not.toBeInTheDocument();
    expect(within(eventList).queryByText('프로젝트 마감')).not.toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    // 검색창 찾기
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    // '팀 회의' 로 검색
    await user.clear(searchInput);
    await user.type(searchInput, '팀 회의');

    // 일정 목록에서 '팀 회의' 일정만 표시되는지 확인
    const eventList = screen.getByTestId('event-list');

    // '팀 회의' 일정은 표시되어야 함
    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });

    // 다른 일정들은 표시되지 않아야 함
    expect(within(eventList).queryByText('점심 약속')).not.toBeInTheDocument();
    expect(within(eventList).queryByText('프로젝트 마감')).not.toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    // 검색창 찾기
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    // 먼저 특정 키워드로 검색
    await user.clear(searchInput);
    await user.type(searchInput, '팀 회의');

    // 검색 결과 확인 (팀 회의만 표시)
    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(eventList).queryByText('점심 약속')).not.toBeInTheDocument();
    });

    // 검색어 지우기
    await user.clear(searchInput);

    // 모든 일정이 다시 표시되는지 확인
    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('점심 약속')).toBeInTheDocument();
      expect(within(eventList).getByText('프로젝트 마감')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  let user: UserEvent;
  let inMemoryEvents: Event[];

  beforeEach(async () => {
    user = userEvent.setup();
    inMemoryEvents = [
      // 기존 일정 추가 (10:00-11:00)
      {
        id: 'existing-event',
        title: '기존 회의',
        date: '2025-05-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '기존 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    // 시스템 시간 설정
    vi.setSystemTime(new Date('2025-05-20'));

    // MSW 핸들러 설정
    server.use(
      http.get('/api/events', async () => {
        return HttpResponse.json({ events: [...inMemoryEvents] });
      })
    );

    // 포스트 핸들러 - 이벤트 저장
    server.use(
      http.post('/api/events', async ({ request }) => {
        const newEvent = (await request.json()) as Event;
        const eventWithId = { ...newEvent, id: `new-event-${Date.now()}` };
        inMemoryEvents.push(eventWithId);
        return HttpResponse.json(eventWithId, { status: 201 });
      })
    );

    renderWithChakra(<App />);
    await waitFor(() => expect(screen.queryByText('일정 로딩 완료!')).not.toBeInTheDocument());
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    server.resetHandlers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    // 1. 폼에 일정 정보 입력 (기존 일정과 시간이 겹치도록)
    await user.type(screen.getByLabelText('제목'), '새 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-05-20');
    await user.type(screen.getByLabelText('시작 시간'), '10:30'); // 기존 일정(10-11)과 겹침
    await user.type(screen.getByLabelText('종료 시간'), '11:30');
    await user.type(screen.getByLabelText('설명'), '새 미팅 설명');
    await user.type(screen.getByLabelText('위치'), '회의실 B');
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');

    // 2. 일정 추가 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 3. 일정 겹침 경고 다이얼로그가 표시되는지 확인
    // 다이얼로그 헤더 찾기
    await waitFor(() => {
      const dialogHeader = screen.getByText('일정 겹침 경고');
      expect(dialogHeader).toBeInTheDocument();
    });

    // 다이얼로그 내용 확인 (class 또는 aria 속성으로 찾기)
    // AlertDialogContent 또는 AlertDialogBody 클래스를 가진 요소 찾기
    const dialogContent =
      screen.getByText('일정 겹침 경고').closest('.chakra-alert-dialog__content') ||
      screen.getByText('일정 겹침 경고').closest('[data-testid="alert-dialog-content"]') ||
      screen.getByText('일정 겹침 경고').closest('section') ||
      screen.getByText('일정 겹침 경고').parentElement?.parentElement;

    expect(dialogContent).toBeInTheDocument();

    // 다이얼로그 내용에서 '다음 일정과 겹칩니다' 텍스트 찾기
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();

    // 다이얼로그 내에서 기존 회의가 포함된 요소 찾기
    // 정확한 형식을 찾기보다는 부분 텍스트 매칭 사용
    expect(
      screen.getByText((content) => {
        return content.includes('기존 회의') && content.includes('2025-05-20');
      })
    ).toBeInTheDocument();

    // 4. 계속 진행 및 취소 버튼 확인
    const cancelButton = screen.getByText('취소');
    const continueButton = screen.getByText('계속 진행');
    expect(cancelButton).toBeInTheDocument();
    expect(continueButton).toBeInTheDocument();

    // 5. 취소 버튼 클릭
    await user.click(cancelButton);

    // 6. 다이얼로그가 닫히는지 확인
    await waitFor(() => {
      expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    // 1. 충돌 대상이 될 두 번째 이벤트 추가
    const secondEvent: Event = {
      id: 'second-event',
      title: '두 번째 회의',
      date: '2025-05-20',
      startTime: '11:30',
      endTime: '12:30',
      description: '오후 회의',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    inMemoryEvents.push(secondEvent);

    // PUT 핸들러 추가 - 이벤트 업데이트
    server.use(
      http.put('/api/events/:id', async ({ params, request }) => {
        const id = params.id as string;
        const updatedEvent = (await request.json()) as Event;

        // 메모리 내 이벤트 업데이트
        const index = inMemoryEvents.findIndex((event) => event.id === id);
        if (index !== -1) {
          inMemoryEvents[index] = { ...updatedEvent, id };
        }

        return HttpResponse.json({ ...updatedEvent, id }, { status: 200 });
      })
    );

    cleanup();
    renderWithChakra(<App />);
    await waitFor(() => expect(screen.queryByText('일정 로딩 완료!')).not.toBeInTheDocument());

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => expect(within(eventList).getByText('기존 회의')).toBeInTheDocument());
    await waitFor(() => expect(within(eventList).getByText('두 번째 회의')).toBeInTheDocument());

    // 2. "기존 회의" 텍스트를 가진 요소를 찾습니다.
    const existingEventTitleElement = within(eventList).getByText('기존 회의');

    // 3. 해당 요소의 부모 요소들 중에서 Edit 버튼을 포함하는 컨테이너를 찾습니다.
    let parentElement = existingEventTitleElement.parentElement;
    let editButton: HTMLElement | null = null;

    // 부모 요소를 최대 5단계까지 올라가며 Edit 버튼 찾기
    for (let i = 0; i < 5 && parentElement && !editButton; i++) {
      editButton = within(parentElement).queryByRole('button', { name: 'Edit event' });
      parentElement = parentElement.parentElement;
    }

    expect(editButton).toBeInTheDocument();
    await user.click(editButton!);

    // 4. 편집 폼 확인
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '일정 수정' })).toBeInTheDocument();
      expect(screen.getByLabelText('제목')).toHaveValue('기존 회의');
    });

    // 5. '기존 회의'의 종료 시간을 '두 번째 회의'와 겹치도록 수정
    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '12:00');

    // 6. 수정(저장) 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 7. 일정 겹침 경고 다이얼로그 확인
    const alertDialog = await screen.findByRole('alertdialog', { name: /일정 겹침 경고/i });
    expect(alertDialog).toBeInTheDocument();
    expect(within(alertDialog).getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(
      within(alertDialog).getByText((content) => content.includes('두 번째 회의'))
    ).toBeInTheDocument();

    // 8. "계속 진행" 버튼 클릭
    const continueButton = within(alertDialog).getByRole('button', { name: '계속 진행' });
    await user.click(continueButton);

    // 9. 다이얼로그 닫힘 확인
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog', { name: /일정 겹침 경고/i })).not.toBeInTheDocument()
    );

    // 10. 성공 토스트 메시지 확인 - 더 유연한 방식으로 확인
    await waitFor(() => {
      const successMessages = screen.queryAllByText((content, element) => {
        return element?.textContent?.includes('일정이 수정되었습니다') || false;
      });
      expect(successMessages.length).toBeGreaterThan(0);
    });

    // 11. 폼이 "일정 추가" 모드로 변경되었는지 확인
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '일정 추가' })).toBeInTheDocument();
    });

    // 12. 이벤트 목록에서 '기존 회의'의 시간이 실제로 변경되었는지 확인
    await waitFor(() => {
      // 모든 시간 텍스트를 확인하여 수정된 시간(10:00 - 12:00)을 찾음
      const timeTexts = within(eventList).queryAllByText(/\d{2}:\d{2} - \d{2}:\d{2}/);
      const updatedTimeFound = timeTexts.some((element) => element.textContent === '10:00 - 12:00');
      expect(updatedTimeFound).toBe(true);
    });
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  // 1. 테스트를 위한 이벤트 설정
  const testEvent: Event = {
    id: 'notification-test-event',
    title: '알림 테스트 회의',
    date: '2025-05-20', // 오늘 날짜로 설정
    startTime: '10:20', // 현재 시간보다 약간 뒤로 설정
    endTime: '11:20',
    description: '알림 기능 테스트',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10, // 10분 전 알림
  };

  // 이벤트 데이터 설정 및 핸들러 구성
  const inMemoryEvents = [testEvent];
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: inMemoryEvents });
    })
  );

  // 2. 현재 시간을 이벤트 시작 시간 직전으로 설정
  // 필요하다면 이 시간을 조정하여 알림이 확실히 표시되도록 함
  vi.setSystemTime(new Date('2025-05-20T10:10:30'));

  // 3. 애플리케이션 렌더링
  cleanup();
  renderWithChakra(<App />);

  // 4. 이벤트가 로드될 때까지 대기
  await waitFor(() => {
    expect(screen.queryByText('일정 로딩 완료!')).not.toBeInTheDocument();
  });

  // 5. 알림 메시지 확인
  // 이 부분이 가장 중요한 테스트 포인트 - 알림 메시지가 화면에 표시되는지
  await waitFor(() => {
    // 알림 메시지를 포함하는 요소 찾기
    const notificationElement = screen.queryByText(
      (content) =>
        content.includes('10분 후') &&
        content.includes('알림 테스트 회의') &&
        content.includes('시작됩니다')
    );

    // 알림 메시지가 화면에 표시되어야 함
    expect(notificationElement).toBeInTheDocument();
  });

  vi.useRealTimers();
  server.resetHandlers();
});
