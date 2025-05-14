import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor, cleanup } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import App from '../App';
import { server } from '../setupTests';
import { Event, EventForm } from '../types';

const renderWithChakra = (ui: ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('일정 CRUD 및 기본 기능', () => {
  let user: UserEvent;
  // 각 테스트에서 사용할 메모리 내 이벤트 목록
  let inMemoryEvents: Event[];

  beforeEach(async () => {
    user = userEvent.setup();
    inMemoryEvents = []; // 각 테스트 시작 시 이벤트 목록 초기화
    vi.setSystemTime(new Date('2025-05-20'));

    server.use(
      http.get('/api/events', async () => {
        return HttpResponse.json({ events: [...inMemoryEvents] });
      })
    );

    server.use(
      http.post('/api/events', async ({ request }) => {
        const newEventData = (await request.json()) as EventForm;
        const newEventWithId: Event = {
          id: `mock-event-${Date.now()}`,
          ...newEventData,
        };
        inMemoryEvents.push(newEventWithId);
        return HttpResponse.json(newEventWithId, { status: 201 });
      })
    );

    renderWithChakra(<App />);

    await waitFor(() => expect(screen.queryByText('일정 로딩 완료!')).not.toBeInTheDocument());
    expect(
      await screen.findByText(/검색 결과가 없습니다.|일정이 없습니다./i, {})
    ).toBeInTheDocument();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    server.resetHandlers(); // 각 테스트 후 핸들러 초기화
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

    // 메모리에 초기 이벤트 추가
    inMemoryEvents.push(initialEvent);

    // PUT 핸들러 추가
    server.use(
      http.put('/api/events/:id', async ({ params, request }) => {
        const id = params.id as string;
        const updatedData = (await request.json()) as Event;

        // 메모리 내 이벤트 업데이트
        const index = inMemoryEvents.findIndex((e) => e.id === id);
        if (index !== -1) {
          inMemoryEvents[index] = { ...updatedData, id };
        }

        return HttpResponse.json({ ...updatedData, id }, { status: 200 });
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

    // 메모리에 삭제할 이벤트 추가
    inMemoryEvents.push(eventToDelete);

    // DELETE 핸들러 추가
    server.use(
      http.delete('/api/events/:id', ({ params }) => {
        const id = params.id as string;

        // 메모리 내 이벤트 삭제
        inMemoryEvents = inMemoryEvents.filter((e) => e.id !== id);

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
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {});

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {});

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {});
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {});

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {});
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});
