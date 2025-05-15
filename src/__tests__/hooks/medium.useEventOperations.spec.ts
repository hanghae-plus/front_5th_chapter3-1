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

const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Event 1',
    date: '2025-12-31',
    startTime: '12:00',
    endTime: '13:00',
    description: 'Event 1 description',
    location: 'Location 1',
    category: 'Category 1',
    repeat: {
      type: 'daily',
      interval: 1,
      endDate: '2026-12-31',
    },
    notificationTime: 15,
  },
  {
    id: '2',
    title: 'Event 2',
    date: '2025-12-31',
    startTime: '14:00',
    endTime: '15:00',
    description: 'Event 2 description',
    location: 'Location 2',
    category: 'Category 2',
    repeat: {
      type: 'weekly',
      interval: 1,
    },
    notificationTime: 30,
  },
];

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation(initialEvents);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => expect(result.current.events).toHaveLength(2));
  expect(result.current.events).toEqual(initialEvents);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const newEvent: Event = {
    id: '3',
    title: 'New Event',
    date: '2025-12-31',
    startTime: '16:00',
    endTime: '17:00',
    description: 'New Event description',
    location: 'New Location',
    category: 'New Category',
    repeat: {
      type: 'monthly',
      interval: 1,
    },
    notificationTime: 45,
  };

  setupMockHandlerCreation(initialEvents);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  await waitFor(() => expect(result.current.events).toHaveLength(3));

  const savedEvent = result.current.events.find((e) => e.title === newEvent.title);
  expect(savedEvent).toMatchObject({
    title: newEvent.title,
    description: newEvent.description,
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const updatedEvent: Event = {
    ...initialEvents[0],
    title: 'Updated Event',
    endTime: '14:00',
  };

  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  const updated = result.current.events.find((e) => e.id === updatedEvent.id);
  expect(updated).toMatchObject({
    title: 'Updated Event',
    endTime: '14:00',
  });
});

it('존재하는 이벤트 삭제 시 에러 없이 해당 아이템이 삭제된다', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => expect(result.current.events).toHaveLength(1));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await waitFor(() => expect(result.current.events).toHaveLength(0));
  expect(result.current.events).not.toContainEqual(expect.objectContaining({ id: '1' }));
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  toastFn.mockClear();
  setupMockHandlerCreation();

  const { result } = renderHook(() => useEventOperations(false));

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json(null, { status: 500 });
    })
  );

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '이벤트 로딩 실패',
      status: 'error',
    })
  );
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const nonExistentEvent: Event = {
    id: '999',
    title: 'Non-existent Event',
    date: '2025-12-31',
    startTime: '16:00',
    endTime: '17:00',
    description: 'This event does not exist',
    location: 'Unknown Location',
    category: 'Unknown Category',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 10,
  };

  setupMockHandlerCreation(initialEvents);

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  await waitFor(() => {
    expect(result.current.events).not.toContainEqual(nonExistentEvent);
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
      })
    );
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  setupMockHandlerCreation(initialEvents);

  const { result } = renderHook(() => useEventOperations(false));

  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.json(null, { status: 500 });
    })
  );

  await act(async () => {
    await result.current.deleteEvent('1');
  });
  await waitFor(() => {
    expect(result.current.events).toHaveLength(2);
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 삭제 실패',
        status: 'error',
      })
    );
  });

  consoleErrorSpy.mockRestore();
});
