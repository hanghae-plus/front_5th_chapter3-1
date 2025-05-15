import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toHaveLength(0); // 초기 mock 데이터가 없으므로 0
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent({
      title: '새로운 이벤트',
      date: '2025-10-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 이벤트 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    });
  });

  expect(result.current.events).toHaveLength(1);
  expect(result.current.events[0].title).toBe('새로운 이벤트');
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent({
      id: '1',
      title: '업데이트된 회의',
      date: '2025-10-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '업데이트된 설명',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    });
  });

  expect(result.current.events[0].title).toBe('업데이트된 회의');
  expect(result.current.events[0].endTime).toBe('11:00');
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(result.current.events).toHaveLength(0);
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

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '이벤트 로딩 실패',
      status: 'error',
    })
  );
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent({
      id: '999',
      title: '존재하지 않는 이벤트',
      date: '2025-10-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
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
