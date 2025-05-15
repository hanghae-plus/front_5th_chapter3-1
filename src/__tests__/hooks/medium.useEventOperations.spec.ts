import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const initEvents = [...events] as Event[];
  setupMockHandlerCreation(initEvents);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toEqual(initEvents);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const initEvents = [...events] as Event[];
  setupMockHandlerCreation(initEvents);

  const { result } = renderHook(() => useEventOperations(false));

  const newEvent: EventForm = {
    title: '새로운 이벤트',
    date: '2025-08-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '새로운 이벤트 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  // 전체 이벤트 개수가 1 증가했는지 확인
  expect(result.current.events.length).toBe(initEvents.length + 1);

  // 새로 저장된 이벤트 찾기
  const savedEvent = result.current.events.find(
    (event) => event.title === newEvent.title && event.date === newEvent.date
  );

  // 새 이벤트가 존재하는지 확인
  expect(savedEvent).toBeDefined();

  // ID가 자동 생성되었는지 확인
  expect(savedEvent?.id).toBeDefined();
  expect(typeof savedEvent?.id).toBe('string');

  // 나머지 필드들이 입력한 값과 일치하는지 확인
  expect(savedEvent).toMatchObject(newEvent);

  // 기존 이벤트들이 그대로 유지되었는지 확인
  const existingEvents = result.current.events.filter((event) => event.id !== savedEvent?.id);
  expect(existingEvents).toEqual(initEvents);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const initEvents = [...events] as Event[];
  setupMockHandlerCreation(initEvents);

  const { result } = renderHook(() => useEventOperations(true));

  const targetEvent = initEvents[0];

  const updateData = {
    ...targetEvent,
    title: '수정된 제목',
    endTime: '11:00',
  };

  await act(async () => {
    await result.current.saveEvent(updateData);
  });

  const updatedEvent = result.current.events.find((event) => event.id === targetEvent.id);

  // 업데이트된 이벤트가 존재하는지 확인
  expect(updatedEvent).toBeDefined();

  // 변경된 필드가 정확히 업데이트되었는지 확인
  expect(updatedEvent?.title).toBe('수정된 제목');
  expect(updatedEvent?.endTime).toBe('11:00');

  // 변경되지 않은 필드들이 그대로 유지되었는지 확인
  expect(updatedEvent?.date).toBe(targetEvent.date);
  expect(updatedEvent?.startTime).toBe(targetEvent.startTime);
  expect(updatedEvent?.description).toBe(targetEvent.description);
  expect(updatedEvent?.location).toBe(targetEvent.location);
  expect(updatedEvent?.category).toBe(targetEvent.category);
  expect(updatedEvent?.repeat).toEqual(targetEvent.repeat);
  expect(updatedEvent?.notificationTime).toBe(targetEvent.notificationTime);

  // 다른 이벤트들이 변경되지 않았는지 확인
  const otherEvents = result.current.events.filter((event) => event.id !== targetEvent.id);
  const expectedOtherEvents = initEvents.filter((event) => event.id !== targetEvent.id);
  expect(otherEvents).toEqual(expectedOtherEvents);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const initEvents = [...events] as Event[];
  setupMockHandlerCreation(initEvents);

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.deleteEvent(initEvents[0].id);
  });

  expect(result.current.events.length).toBe(initEvents.length - 1);
  expect(result.current.events).not.toContain(initEvents[0]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  const initEvents = [...events] as Event[];
  setupMockHandlerCreation(initEvents);

  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(mockToast).toHaveBeenCalledWith({
    title: '이벤트 로딩 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });

  expect(result.current.events).toEqual([]);
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const initEvents = [...events] as Event[];
  setupMockHandlerCreation(initEvents);

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent({ ...initEvents[0], id: 'non-existent-id' });
  });

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 저장 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });

  expect(result.current.events).toEqual(initEvents);
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  const initEvents = [...events] as Event[];
  setupMockHandlerCreation(initEvents);

  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.deleteEvent(initEvents[0].id);
  });

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 삭제 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });

  expect(result.current.events).toEqual(initEvents);
});
