import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';
import { MOCK_DATA } from '../mock.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

describe('useEventOperations hook 테스트', () => {
  beforeEach(() => {
    setupMockHandlerCreation(events as Event[]);
  });

  it('저장되어있는 초기 이벤트 데이터를 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    expect(result.current.events).toEqual([]);

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(result.current.events).toEqual(events);
  });

  it('새로운 이벤트가 저장이 된다', async () => {
    const addEventData: Event = {
      id: '2',
      title: '점심 약속',
      date: '2025-05-21',
      startTime: '12:30',
      endTime: '13:30',
      description: '동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.saveEvent(addEventData);
    });

    expect(result.current.events).toEqual([...events, addEventData]);
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating();
    const { result } = renderHook(() => useEventOperations(true));
    expect(result.current.events).toEqual([]);

    const updateEvents: Event = {
      ...events[0],
      title: '한국인은 밥이 힘',
      endTime: '14:00',
      repeat: { type: 'none', interval: 0 },
    };

    await act(async () => {
      await result.current.saveEvent(updateEvents);
    });

    expect(result.current.events[0].title).toBe('한국인은 밥이 힘');
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

    await act(() => {
      result.current.saveEvent(events[0] as Event);
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

    await act(() => {
      result.current.deleteEvent(events[0].id);
    });

    expect(toastFn).toHaveBeenCalledWith({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});
