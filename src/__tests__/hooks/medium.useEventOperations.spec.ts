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
import { Event } from '../../types.ts';

const mockToast = vi.fn();

vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

const initialEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  },
];

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { handlers } = setupMockHandlerCreation(initialEvents);
  server.use(...handlers);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual(initialEvents);
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const { handlers } = setupMockHandlerCreation();
  server.use(...handlers);

  const { result } = renderHook(() => useEventOperations(false));
  const newEvent: Event = {
    id: '2',
    title: '신규 일정',
    date: '2025-07-05',
    startTime: '09:00',
    endTime: '10:00',
    description: '설명',
    location: '장소',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  await result.current.saveEvent(newEvent);

  await waitFor(() => {
    const match = result.current.events.find((e) => e.id === newEvent.id);
    expect(match).toBeDefined();
    expect(match?.title).toBe('신규 일정');
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const { handlers, getEvents } = setupMockHandlerUpdating(initialEvents);
  server.use(...handlers);

  const { result } = renderHook(() => useEventOperations(true));
  const updated = { ...initialEvents[0], title: '변경된 제목', endTime: '12:00' };

  await act(async () => {
    await result.current.saveEvent(updated);
  });

  await waitFor(() => {
    const event = getEvents().find((e) => e.id === '1');
    expect(event?.title).toBe('변경된 제목');
    expect(event?.endTime).toBe('12:00');
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const { handlers, getEvents } = setupMockHandlerDeletion(initialEvents);
  server.use(...handlers);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await waitFor(() => {
    expect(getEvents().find((e) => e.id === '1')).toBeUndefined();
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(http.get('/api/events', () => HttpResponse.error()));

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual([]);
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', () => HttpResponse.json({ error: 'Not found' }, { status: 404 }))
  );

  const { result } = renderHook(() => useEventOperations(true));
  const invalidEvent = { ...initialEvents[0], id: '999' };

  await act(async () => {
    await result.current.saveEvent(invalidEvent);
  });

  await waitFor(() => {
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
      })
    );
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(http.delete('/api/events/:id', () => HttpResponse.error()));
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent(events[0].id);
  });

  await waitFor(() => {
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 삭제 실패',
        status: 'error',
      })
    );
  });
});
