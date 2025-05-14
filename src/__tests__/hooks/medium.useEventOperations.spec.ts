import { act, renderHook, waitFor } from '@testing-library/react';
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

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
/**
 * toastFn = vi.fn(): 모의 함수는 호출 여부, 호출 횟수, 전달된 인자 등을 추적할 수 있습니다.
 * Chakra UI의 useToast 훅을 모킹하여 toastFn 모의 함수로 대체합니다.
 * 이렇게 하면 컴포넌트나 훅이 토스트 알림을 제대로 호출하는지 테스트할 수 있습니다.
 */
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation(events as Event[]);

  const { result } = renderHook(() => useEventOperations(false));
  await waitFor(() => {
    expect(result.current.events).toEqual(events);
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(events as Event[]);

  const newEvent: Event = {
    id: String(events.length + 1),
    title: '이벤트1',
    date: '2025-05-13',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트1 설명',
    location: '이벤트1 장소',
    category: '이벤트1 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  };

  const { result } = renderHook(() => useEventOperations(false));
  await act(async () => {
    await result.current.saveEvent(newEvent);
  });
  expect(result.current.events[result.current.events.length - 1]).toEqual(newEvent);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));
  await waitFor(() => {
    expect(result.current.events[0].title).toBe('기존 회의');
  });

  const updatedEvent = {
    ...result.current.events[0],
    title: '업데이트된 기존 회의',
    endTime: '12:00',
  };
  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });
  expect(result.current.events[0]).toEqual(updatedEvent);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));
  await waitFor(() => {
    expect(result.current.events.length).toBe(1);
    expect(result.current.events[0].title).toBe('삭제할 이벤트');
  });
  await act(async () => {
    await result.current.deleteEvent(result.current.events[0].id);
  });
  expect(result.current.events.length).toBe(0);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false));
  await waitFor(() => {
    expect(result.current.events).toEqual([]);
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
      })
    );
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const { result } = renderHook(() => useEventOperations(true));
  await waitFor(() => {
    expect(result.current.events.length).toBeTruthy();
  });
  await act(async () => {
    await result.current.saveEvent({
      id: String(result.current.events.length + 1),
      title: '존재하지 않는 이벤트',
      date: '2025-05-13',
      startTime: '10:00',
      endTime: '11:00',
      description: '존재하지 않는 이벤트 설명',
      location: '존재하지 않는 이벤트 장소',
      category: '존재하지 않는 이벤트 카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    });
  });
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 저장 실패',
      status: 'error',
    })
  );
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false));
  await waitFor(() => {
    expect(result.current.events.length).toBeTruthy();
  });
  await act(async () => {
    await result.current.deleteEvent(result.current.events[0].id);
  });
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 삭제 실패',
      status: 'error',
    })
  );
});
