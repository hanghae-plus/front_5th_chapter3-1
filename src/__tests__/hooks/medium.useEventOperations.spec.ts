import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-05-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-05-02',
    startTime: '12:00',
    endTime: '13:00',
    description: '팀 점심',
    location: '식당',
    category: '식사',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
];

describe('useEventOperations', () => {
  beforeEach(() => {
    vi.setSystemTime('2025-05-01');
    mockToast.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    server.use(...setupMockHandlerCreation(mockEvents));
    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
      expect(result.current.events[0].title).toBe('팀 회의');
      expect(result.current.events[1].title).toBe('점심 약속');
    });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    server.use(...setupMockHandlerCreation([]));
    const { result } = renderHook(() => useEventOperations(false));

    const newEvent: Event = {
      id: '3',
      title: '새로운 회의',
      date: '2025-05-03',
      startTime: '14:00',
      endTime: '15:00',
      description: '신규 회의',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    await waitFor(() => {
      expect(result.current.events).toHaveLength(1);
      expect(result.current.events[0].title).toBe('새로운 회의');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '일정이 추가되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    server.use(...setupMockHandlerUpdating(mockEvents));
    const { result } = renderHook(() => useEventOperations(true));

    const updatedEvent = {
      ...mockEvents[0],
      title: '수정된 회의',
      endTime: '12:00',
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      expect(result.current.events[0].title).toBe('수정된 회의');
      expect(result.current.events[0].endTime).toBe('12:00');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '일정이 수정되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    server.use(...setupMockHandlerDeletion(mockEvents));
    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    await waitFor(() => {
      expect(result.current.events).toHaveLength(1);
      expect(result.current.events.find((event) => event.id === '1')).toBeUndefined();
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '일정이 삭제되었습니다.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toHaveLength(0);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '이벤트 로딩 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    const nonExistentEvent = {
      ...mockEvents[0],
      id: 'non-existent',
    };

    await act(async () => {
      await result.current.saveEvent(nonExistentEvent);
    });

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
      expect(result.current.events[0].title).toBe('팀 회의');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.delete('/api/events/:id', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
      expect(result.current.events[0].id).toBe('1');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});
