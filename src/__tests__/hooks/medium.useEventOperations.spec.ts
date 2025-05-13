import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, RepeatType } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
// ! Medium: toastFn 에 가짜 함수를 넣어줌으로써 실제 토스트 알림이 화면에 표시되는 것을 방지해서 토스트가 호출되었는지 등을 테스트할 수 있음.

const toastFn = vi.fn();

// ! Medium: useToast 를 제외한 모든 함수는 기능을 그대로 유지하도록 설정함.
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

// 에러 메세지 정리
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

afterAll(() => {
  consoleSpy.mockRestore();
});

const initialEvents: Event[] = events.map((event) => ({
  ...event,
  repeat: {
    ...event.repeat,
    type: event.repeat.type as RepeatType, // 타입 변환: string -> RepeatType
  },
}));

it("저장되어있는 초기 이벤트 데이터를 불러오고 '일정 로딩 완료!' 라는 텍스트와 함께 안내 토스트가 표시되어야 한다", async () => {
  setupMockHandlerCreation(initialEvents);
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });
  expect(result.current.events).toEqual(initialEvents);

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 로딩 완료!',
      status: 'info',
    })
  );
});

it("정의된 이벤트 정보를 기준으로 일정이 추가되고 '일정이 추가되었습니다.' 라는 텍스트와 함께 성공 알림 토스트가 표시되어야 한다", async () => {
  setupMockHandlerCreation(initialEvents);
  const { result } = renderHook(() => useEventOperations(false));

  const newEvent: Event = {
    id: '2',
    title: '팀 발표',
    date: '2025-10-15',
    startTime: '16:00',
    endTime: '17300',
    description: '개발팀',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  };

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });
  expect(result.current.events).toEqual([...initialEvents, newEvent]);

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 추가되었습니다.',
      status: 'success',
    })
  );
});

it("새로 정의된 'title', 'endTime' 기준으로 일정이 업데이트 되고 '일정이 수정되었습니다.' 라는 텍스트와 함께 알림 토스트가 표시되어야 한다", async () => {
  setupMockHandlerUpdating();
  const { result } = renderHook(() => useEventOperations(true));

  const updatedEvent: Event = {
    id: '1',
    title: '기존 회의, 자료 프린트',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '11:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  waitFor(() => {
    expect(result.current.events).toEqual([updatedEvent]);
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 수정되었습니다.',
      status: 'success',
    })
  );
});

it("존재하는 이벤트 삭제 시 에러없이 아이템이 삭제되고 '일정이 삭제되었습니다.' 라는 텍스트와 함께 안내 토스트가 표시되어야 한다", async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));
  result.current.deleteEvent('1');

  await waitFor(() => {
    expect(result.current.events).toEqual(initialEvents.filter((event) => event.id !== '1'));
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 삭제되었습니다.',
      status: 'info',
    })
  );
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  setupMockHandlerCreation(initialEvents);
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );
  const { result } = renderHook(() => useEventOperations(false));
  await act(async () => {
    result.current.fetchEvents();
  });
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '이벤트 로딩 실패',
      status: 'error',
    })
  );
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  setupMockHandlerUpdating();
  server.use(
    http.put('/api/events/:id', () => {
      return HttpResponse.json(null, { status: 404 });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));
  await act(async () => {
    await result.current.saveEvent({
      id: '3',
      title: '팀 발표',
      date: '2025-10-15',
      startTime: '16:00',
      endTime: '17300',
      description: '개발팀',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
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
  setupMockHandlerDeletion();
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));
  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 삭제 실패',
      status: 'error',
    })
  );
});
