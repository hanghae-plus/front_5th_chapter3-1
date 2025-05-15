import {act, renderHook, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import {events} from '../../__mocks__/response/events.json' assert {type: 'json'};
import {useEventOperations} from '../../hooks/useEventOperations.ts';
import {server} from '../../setupTests.ts';
import {Event} from '../../types.ts';

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
  setupMockHandlerCreation(events as Event[])
  const {result} = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual(events);
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(events as Event[])

  const newEvent: Event = {
    id: String(events.length + 1),
    title: '새로운 이벤트',
    date: '2025-07-01',
    startTime: '2025-07-01',
    endTime: '2025-07-02',
    description: '새로운 이벤트 설명',
    location: '새로운 이벤트 장소',
    category: '새로운 이벤트 카테고리',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 20,
  }

  const {result} = renderHook(() => useEventOperations(false));
  act(() => {
    result.current.saveEvent(newEvent)
  })

  await waitFor(() => {
    expect(result.current.events).toEqual([...events, newEvent])
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating()
  const {result} = renderHook(() => useEventOperations(true));

  const title = '새로운 회의';
  const endTime = '12:30';

  await act(async () => {
    await result.current.saveEvent({
      id: '1',
      title,
      endTime
    } as Event)
  })

  const updatedEvent = result.current.events.find(({id}) => id === '1');
  expect(updatedEvent?.title).toBe(title)
  expect(updatedEvent?.endTime).toBe(endTime)
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion()
  const {result} = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1')
  })

  expect(result.current.events).toEqual([])
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, {status: 500})
    })
  )
  renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
      })
    );
  });

});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  setupMockHandlerUpdating()
  const {result} = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent({
      id: '9999',
      title: '없는 이벤트',
      endTime: '19:00'
    } as Event)
  })

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
      return new HttpResponse(null, {status: 500})
    })
  )
  const {result} = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1')
  })

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 삭제 실패',
      status: 'error',
    })
  );
});
