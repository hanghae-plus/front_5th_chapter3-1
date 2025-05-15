import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const mockEvents = events as Event[];

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
// toastFn은 모의 함수로, useToast 훅을 사용하여 생성된 toast 객체를 모의합니다.
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  setupMockHandlerCreation(mockEvents);

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toEqual(mockEvents);
  expect(toastFn).toHaveBeenCalledTimes(1);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const { result } = renderHook(() => useEventOperations(true));

  const newEvent: Event = {
    id: '1',
    title: '수정된 회의',
    date: '2025-10-15',
    startTime: '13:00',
    endTime: '14:00',
    description: '수정된 팀 미팅',
    location: '회의실 D',
    category: '업무 회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  setupMockHandlerUpdating([...mockEvents, newEvent]);

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toContainEqual(newEvent);
  expect(toastFn).toHaveBeenCalledTimes(2);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const { result } = renderHook(() => useEventOperations(false));

  const newEvent: Event = {
    id: '1',
    title: '신규 회의',
    date: '2025-10-15',
    startTime: '15:00',
    endTime: '16:00',
    description: '신규 팀 미팅',
    location: '회의실 E',
    category: '업무 회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  setupMockHandlerUpdating([...mockEvents, newEvent]);

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toContainEqual(newEvent);
  expect(toastFn).toHaveBeenCalledTimes(2);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const { result } = renderHook(() => useEventOperations(true));

  const eventToDelete: Event = {
    id: '1',
    title: '삭제할 이벤트',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '삭제할 이벤트입니다',
    location: '어딘가',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  setupMockHandlerDeletion([eventToDelete]);

  await act(async () => {
    await result.current.deleteEvent(eventToDelete.id);
  });

  expect(result.current.events).not.toContainEqual(eventToDelete);
  expect(toastFn).toHaveBeenCalledTimes(2);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  const { result } = renderHook(() => useEventOperations(false));

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ error: 'Network error' }, { status: 500 });
    })
  );

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
  const { result } = renderHook(() => useEventOperations(true));

  const newEvent: Event = {
    id: '99',
    title: '수정된 회의',
    date: '2025-10-15',
    startTime: '13:00',
    endTime: '14:00',
    description: '수정된 팀 미팅',
    location: '회의실 D',
    category: '업무 회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  setupMockHandlerCreation([...mockEvents, newEvent]);

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).not.toContainEqual(newEvent);
  expect(toastFn).toHaveBeenCalledTimes(2);
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.fetchEvents();
  });

  const existingEvent = result.current.events[0];
  expect(existingEvent).toBeDefined();

  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.json({ error: 'Network error' }, { status: 500 });
    })
  );

  await act(async () => {
    await result.current.deleteEvent(existingEvent.id);
  });

  expect(result.current.events).toContainEqual(existingEvent);
  expect(toastFn).toHaveBeenCalledWith({
    title: '일정 삭제 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});
