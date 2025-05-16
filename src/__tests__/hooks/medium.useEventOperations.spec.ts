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

let idCounter = 1;

const createMockEvent = (override: Partial<Event> = {}): Event => {
  return {
    id: `${idCounter++}`,
    title: '테스트 일정',
    date: '2025-10-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '기본 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    ...override,
  };
};

const toastSpy = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<typeof import('@chakra-ui/react')>('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastSpy,
  };
});

beforeEach(() => {
  toastSpy.mockClear();
});

it('초기 렌더링 시 서버에서 기존 일정을 불러온다', async () => {
  const mockEvent = createMockEvent({ title: '회의', date: '2025-10-15' });
  setupMockHandlerCreation([mockEvent]);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toHaveLength(1);
  expect(result.current.events[0].title).toBe('회의');
});

it('새로운 일정을 저장하면 목록에 추가되고 onSave가 호출된다', async () => {
  setupMockHandlerCreation([]);
  const onSaveMock = vi.fn();
  const { result } = renderHook(() => useEventOperations(false, onSaveMock));

  const newEvent = createMockEvent({ title: '신규 일정', date: '2025-11-01' });

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toHaveLength(1);
  expect(result.current.events[0].title).toBe('신규 일정');
  expect(onSaveMock).toHaveBeenCalled();
});

it('기존 일정을 수정하면 변경된 title과 endTime이 반영된다', async () => {
  const original = createMockEvent({ id: '1', title: '기존 일정', endTime: '10:00' });
  setupMockHandlerUpdating([original]);

  const { result } = renderHook(() => useEventOperations(true));
  const updated = { ...original, title: '수정된 제목', endTime: '11:00' };

  await act(async () => {
    await result.current.saveEvent(updated);
  });

  expect(result.current.events[0].title).toBe('수정된 제목');
  expect(result.current.events[0].endTime).toBe('11:00');
});

it('기존 일정을 삭제하면 목록에서 제거된다', async () => {
  const eventToDelete = createMockEvent({ id: '1', title: '삭제될 일정', date: '2025-10-20' });
  setupMockHandlerDeletion([eventToDelete]);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(result.current.events).toHaveLength(0);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 토스트가 표시되어야 한다", async () => {
  server.use(http.get('/api/events', () => new HttpResponse(null, { status: 500 })));

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toHaveLength(0);
  expect(toastSpy).toHaveBeenCalledWith(
    expect.objectContaining({ title: '이벤트 로딩 실패', status: 'error' })
  );
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패' 토스트가 표시되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', () => new HttpResponse(null, { status: 404 })),
    http.get('/api/events', () => HttpResponse.json({ events: [] }))
  );

  const { result } = renderHook(() => useEventOperations(true));
  const invalidUpdate = createMockEvent({ id: '999', title: '없는 일정' });

  await act(async () => {
    await result.current.saveEvent(invalidUpdate);
  });

  await waitFor(() => {
    expect(result.current.events).toHaveLength(0);
  });

  expect(toastSpy).toHaveBeenCalledWith(
    expect.objectContaining({ title: '일정 저장 실패', status: 'error' })
  );
});

it("네트워크 오류 시 '일정 삭제 실패'라는 토스트가 표시되어야 한다", async () => {
  const initialEvent = createMockEvent({ id: '123', title: '삭제 실패 테스트' });

  server.use(
    http.get('/api/events', () => HttpResponse.json({ events: [initialEvent] })),
    http.delete('/api/events/:id', () => new HttpResponse(null, { status: 500 }))
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
    await result.current.deleteEvent('123');
  });

  await waitFor(() => {
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].id).toBe('123');
  });

  expect(toastSpy).toHaveBeenCalledWith(
    expect.objectContaining({ title: '일정 삭제 실패', status: 'error' })
  );
});
