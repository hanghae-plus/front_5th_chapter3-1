import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { makeEvents } from '../utils/event.ts';

const mockToast = vi.fn();

vi.mock('@chakra-ui/react', () => ({
  ...vi.importActual('@chakra-ui/react'),
  useToast: () => mockToast,
}));

const allEvents = makeEvents(4);
const events = allEvents.slice(0, allEvents.length - 1);
const targetEvent = allEvents.slice(-1)[0];

it('저장되어있는 초기 이벤트 데이터를 불러왔는지 확인한다.', async () => {
  setupMockHandlerCreation(events);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toStrictEqual(events);
  });
});

it('정의된 이벤트를 저장할 수 있다', async () => {
  setupMockHandlerCreation(events);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(async () => {
    await result.current.saveEvent(targetEvent);
  });

  await waitFor(() => {
    expect(result.current.events).toStrictEqual(allEvents);
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerCreation(events);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(async () => {
    await result.current.saveEvent(targetEvent);
  });

  await waitFor(() => {
    expect(result.current.events).toStrictEqual(allEvents);
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerCreation(allEvents);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(async () => {
    await result.current.deleteEvent(targetEvent.id);
  });

  await waitFor(() => {
    expect(result.current.events).toStrictEqual(events);
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  mockToast.mockClear();

  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
    })
  );

  renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(mockToast).toHaveBeenCalledWith({
      title: '이벤트 로딩 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  setupMockHandlerCreation(events);

  server.use(
    http.put('/api/events/:id', () => {
      return new HttpResponse(null, { status: 404, statusText: 'Not Found' });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(async () => {
    await result.current.saveEvent(targetEvent);
  });

  await waitFor(() => {
    expect(mockToast).toHaveBeenCalledWith({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  setupMockHandlerCreation(allEvents);

  const { result } = renderHook(() => useEventOperations(false));

  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
    })
  );

  await waitFor(async () => {
    await result.current.deleteEvent(targetEvent.id);
  });

  await waitFor(() => {
    expect(mockToast).toHaveBeenCalledWith({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});
