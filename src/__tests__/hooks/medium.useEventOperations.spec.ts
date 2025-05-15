import { act, renderHook } from '@testing-library/react';
import { a } from 'framer-motion/client';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/realEvents.json';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';
import { MOCK_EVENTS } from '../mock.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

describe('useEventOperations', () => {
  beforeEach(() => {
    setupMockHandlerCreation(events as Event[]);
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    expect(result.current.events).toEqual([]);

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(result.current.events).toEqual(events);
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    const newEvent = MOCK_EVENTS[3];
    await act(async () => {
      result.current.saveEvent(newEvent);
    });
    expect(result.current.events).toEqual([...events, newEvent]);
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating();
    const { result } = renderHook(() => useEventOperations(true));
    expect(result.current.events).toEqual([]);

    const updateEvents: Event = {
      id: '1',
      title: '회의실에서 점심먹기',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(updateEvents);
    });

    expect(result.current.events[0].title).toBe('회의실에서 점심먹기');
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion();
    const { result } = renderHook(() => useEventOperations(false));
    expect(result.current.events).toEqual([]);

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(result.current.events[0].title).toBe('삭제할 이벤트');

    await act(async () => {
      await result.current.deleteEvent(events[0].id);
    });

    expect(result.current.events).toEqual([]);
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(toastFn).toHaveBeenCalledWith({
      title: '이벤트 로딩 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    server.use(
      http.put('/api/events/:id', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent(events[0] as Event);
    });

    expect(toastFn).toHaveBeenCalledWith({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent(events[0].id);
    });

    expect(toastFn).toHaveBeenCalledWith({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});
