import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../../entities/event/model/types.ts';
import { useEventOperations } from '../../features/event-operations/model/useEventOperations.ts';
import { server } from '../../setupTests.ts';

const mockToast = vi.fn();
const INITIAL_EVENTS = events as Event[];

vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

beforeEach(() => {
  setupMockHandlerCreation(INITIAL_EVENTS);
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toEqual(INITIAL_EVENTS);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const newEvent = {
    id: '2',
    title: 'New Event',
    date: '2025-10-16',
    startTime: '10:00',
    endTime: '11:00',
  } as Event;

  server.use(...setupMockHandlerCreation(INITIAL_EVENTS));

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toEqual([...INITIAL_EVENTS, newEvent]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  // 초기 이벤트 데이터 세팅
  // 훅 렌더링
  // 기존 이벤트의 title과 endTime을 수정
  // saveEvent 호출
  // 수정된 이벤트가 events에 포함되어 있는지 확인

  server.use(...setupMockHandlerUpdating(INITIAL_EVENTS));
  const { result } = renderHook(() => useEventOperations(true));

  const modifiedEvent = {
    ...INITIAL_EVENTS[0],
    title: '대표님 참석 미팅',
    endTime: '11:00',
  };

  await act(async () => {
    return await result.current.saveEvent(modifiedEvent);
  });
  expect(result.current.events).toContainEqual(modifiedEvent);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const { result } = renderHook(() => useEventOperations(false));
  const eventToDelete = INITIAL_EVENTS[0];
  server.use(...setupMockHandlerDeletion(INITIAL_EVENTS));

  await act(async () => {
    await result.current.deleteEvent(eventToDelete.id);
  });
  expect(result.current.events).not.toContainEqual(eventToDelete);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // fetchEvents 호출실패 시 에러 토스트가 표시되는지 확인
  // 1. API 실패를 강제로 설정
  server.use(
    http.get('api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );
  // 2. 훅 렌더링
  const { result } = renderHook(() => useEventOperations(false));
  // 3. fetchEvents 호출
  await act(async () => {
    await result.current.fetchEvents();
  });
  // 4. 에러 토스트가 표시되는지 확인
  expect(mockToast).toHaveBeenCalledWith({
    title: '이벤트 로딩 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', () => {
      return HttpResponse.json(null, { status: 404 });
    })
  );
  const { result } = renderHook(() => useEventOperations(true));
  const updateEvent: Event = {
    id: '23',
    title: '기존 미팅',
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
    await result.current.saveEvent(updateEvent);
  });

  expect(mockToast).toHaveBeenCalledWith(
    expect.objectContaining({ title: '일정 저장 실패', status: 'error' })
  );
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  const { result } = renderHook(() => useEventOperations(false));
  const eventToDelete = INITIAL_EVENTS[0];

  server.use(
    http.delete(`api/events/${eventToDelete.id}`, () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  await act(async () => {
    await result.current.deleteEvent(eventToDelete.id);
  });

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 삭제 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});
