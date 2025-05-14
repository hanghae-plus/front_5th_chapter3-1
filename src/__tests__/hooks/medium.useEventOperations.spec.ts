import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  cleanupMockHandler,
  setupMockHandlerAppend,
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events as mockEventsData } from '../../__mocks__/response/realEvents.json';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';
const mockEvents = mockEventsData as Event[];
// 새 이벤트 데이터
const newEvent: Omit<Event, 'id'> = {
  title: '새 회의',
  date: '2025-10-16',
  startTime: '11:00',
  endTime: '12:00',
  description: '새 미팅',
  location: '회의실 B',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};
const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe('useEventOperations', () => {
  // 각 테스트 전에 목 이벤트 데이터 설정
  let testId: string;

  beforeEach(() => {
    // 각 테스트마다 고유한 ID와 초기 데이터로 설정
    testId = setupMockHandlerCreation([...mockEvents]);
    mockToast.mockClear();
  });

  afterEach(() => {
    if (testId) {
      cleanupMockHandler(testId);
    }
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      // events 배열이 채워질 때까지 기다림
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    await expect(result.current.events).toHaveLength(mockEvents.length);

    expect(result.current.events[0].id).toBe(mockEvents[0].id);
    expect(result.current.events[0].title).toBe(mockEvents[0].title);
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    // 상태 업데이트 대기
    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    const initialLength = result.current.events.length;
    server.use(
      http.post('/api/events', async () => {
        const createdEvent = { id: 'new-test-id', ...newEvent };
        setupMockHandlerAppend(createdEvent);
        return HttpResponse.json(createdEvent, { status: 201 });
      })
    );
    // 이벤트 저장 작업 수행
    await act(async () => {
      await result.current.saveEvent(newEvent);
    });
    // 상태 업데이트 대기
    await waitFor(() => {
      expect(result.current.events.length).toBe(initialLength + 1);
    });

    // 새 이벤트 검증
    const savedEvent = result.current.events.find((event) => event.title === newEvent.title);
    expect(savedEvent).toBeTruthy();
    expect(savedEvent?.date).toBe(newEvent.date);
    expect(savedEvent?.startTime).toBe(newEvent.startTime);
    expect(savedEvent?.endTime).toBe(newEvent.endTime);
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    const { result } = renderHook(() => useEventOperations(true));

    // 상태 업데이트 대기
    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    const targetEvent = result.current.events[0];
    const updatedEvent = {
      ...targetEvent,
      title: '수정된 회의',
      endTime: '11:00',
    };

    const updatedEvents = result.current.events.map((event) =>
      event.id === targetEvent.id ? updatedEvent : event
    );

    // 서버 응답 모의(mock) 설정
    server.use(
      http.put(`/api/events/${targetEvent.id}`, async () => {
        // MSW 핸들러 내에서 이벤트 저장소 업데이트
        setupMockHandlerUpdating(updatedEvents);
        return HttpResponse.json(updatedEvent);
      })
    );

    // 이벤트 업데이트 (비동기)
    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    // 상태 업데이트 대기 - fetchEvents가 호출되어 업데이트된 데이터를 가져올 때까지
    await waitFor(() => {
      const updatedEventInList = result.current.events.find((e) => e.id === targetEvent.id);
      expect(updatedEventInList?.title).toBe('수정된 회의');
    });

    // 업데이트된 이벤트 검증
    const updatedEventInList = result.current.events.find((event) => event.id === targetEvent.id);
    expect(updatedEventInList?.title).toBe('수정된 회의');
    expect(updatedEventInList?.endTime).toBe('11:00');
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    // 상태 업데이트 대기
    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    const initialLength = result.current.events.length;
    const eventToDelete = result.current.events[0];

    // 서버 응답 모의(mock) 설정 및 이벤트 저장소 업데이트
    server.use(
      http.delete(`/api/events/${eventToDelete.id}`, () => {
        // MSW 핸들러 내에서 이벤트 저장소 업데이트
        setupMockHandlerDeletion(eventToDelete.id);
        return new HttpResponse(null, { status: 204 });
      })
    );

    // 이벤트 삭제
    await act(async () => {
      await result.current.deleteEvent(eventToDelete.id);
    });

    // 상태 업데이트 대기
    await waitFor(() => {
      expect(result.current.events.length).toBe(initialLength - 1);
    });

    // 이벤트가 삭제되었는지 확인
    expect(result.current.events.find((event) => event.id === eventToDelete.id)).toBeUndefined();
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        // 서버 에러 (500) 반환
        return new HttpResponse(null, { status: 500 });
      })
    );

    // 2. 훅 렌더링 및 실행
    const { result } = renderHook(() => useEventOperations(false));

    // 3. 에러 처리 확인
    await waitFor(() => {
      // toast가 호출되었는지 확인
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '이벤트 로딩 실패',
          status: 'error',
        })
      );
    });

    // 4. events 배열이 빈 상태로 유지되는지 확인
    expect(result.current.events).toHaveLength(0);
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    // 1. 초기 렌더링
    const { result } = renderHook(() => useEventOperations(true));

    // 2. 데이터 로딩 대기
    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    // 3. 존재하지 않는 이벤트 ID로 업데이트 요청 설정
    const nonExistentId = 'non-existent-id';
    const updatedEvent: Event = {
      id: nonExistentId,
      title: '존재하지 않는 이벤트',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '에러 테스트',
      location: '테스트',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    // 4. PUT 요청 실패 모의 설정
    server.use(
      http.put(`/api/events/${nonExistentId}`, () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    // 5. 이벤트 업데이트 시도
    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    // 6. 에러 토스트 확인
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 저장 실패',
          status: 'error',
        })
      );
    });

    // 7. 원래 이벤트 목록이 변경되지 않았는지 확인
    expect(result.current.events).not.toContainEqual(
      expect.objectContaining({ id: nonExistentId })
    );
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    // 1. 초기 렌더링
    const { result } = renderHook(() => useEventOperations(false));

    // 2. 데이터 로딩 대기
    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    const initialLength = result.current.events.length;
    const eventToDelete = result.current.events[0];

    // 3. DELETE 요청 실패 모의 설정 (네트워크 오류)
    server.use(
      http.delete(`/api/events/${eventToDelete.id}`, () => {
        // 네트워크 오류 상태 코드 사용
        return new HttpResponse(null, { status: 500 });
      })
    );

    // 4. 이벤트 삭제 시도
    await act(async () => {
      await result.current.deleteEvent(eventToDelete.id);
    });

    // 5. 에러 토스트 확인
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 삭제 실패',
          status: 'error',
        })
      );
    });

    // 6. 이벤트가 삭제되지 않고 여전히 목록에 있는지 확인
    expect(result.current.events.length).toBe(initialLength);
    expect(result.current.events.find((event) => event.id === eventToDelete.id)).toBeDefined();
  });
});
