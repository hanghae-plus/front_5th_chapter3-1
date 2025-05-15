import { act, renderHook, waitFor } from '@testing-library/react';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { Event } from '../../types.ts';

const originalEvent: Event[] = [
  {
    id: '1',
    title: '기존 이벤트',
    date: '2021-01-01',
    startTime: '12:00',
    endTime: '12:30',
    description: '기존 이벤트 설명',
    location: '기존 이벤트 장소',
    category: '',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
];

const toast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => toast,
}));

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation(originalEvent);
  const { result } = renderHook(() => useEventOperations(false));
  await waitFor(() => {
    expect(result.current.events).toEqual(originalEvent);
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(originalEvent);
  const newEvent: Event = {
    id: '2',
    title: '새로운 이벤트',
    date: '2021-01-01',
    startTime: '12:00',
    endTime: '12:30',
    description: '새로운 이벤트 설명',
    location: '새로운 이벤트 장소',
    category: '',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  };
  const { result } = renderHook(() => useEventOperations(false));
  result.current.saveEvent(newEvent);

  await waitFor(() => {
    expect(result.current.events).toEqual([...originalEvent, newEvent]);
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const updatedEvent: Event = {
    ...originalEvent[0],
    title: '새로운 이벤트',
    endTime: '13:00',
  };

  setupMockHandlerCreation(originalEvent);
  const { result } = renderHook(() => useEventOperations(true));

  result.current.saveEvent(updatedEvent);
  await waitFor(() => {
    expect(result.current.events).toEqual([updatedEvent]);
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerCreation(originalEvent);
  const { result } = renderHook(() => useEventOperations(false));
  result.current.deleteEvent(originalEvent[0].id);
  await waitFor(() => {
    expect(result.current.events).toEqual([]);
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // GET 요청에 대해 에러 반환
  vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Failed to fetch events'));

  const { result } = renderHook(() => useEventOperations(false));
  await waitFor(() => {
    expect(result.current.events).toEqual([]);
  });

  expect(toast).toHaveBeenCalledWith({
    title: '이벤트 로딩 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const updatedEvent: Event = {
    ...originalEvent[0],
    id: '2',
    title: '새로운 이벤트',
    endTime: '13:00',
  };

  const fetchSpy = vi
    .spyOn(global, 'fetch')
    .mockResolvedValueOnce(new Response(JSON.stringify({ events: [originalEvent[0]] })))
    .mockRejectedValueOnce(new Error('Failed to save event'));

  const { result } = renderHook(() => useEventOperations(true));
  await waitFor(() => {
    expect(result.current.events).toEqual([]);
  });

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(toast).toHaveBeenCalledWith({
    title: '일정 저장 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });

  expect(fetchSpy).toHaveBeenCalledTimes(2);
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  const fetchSpy = vi
    .spyOn(global, 'fetch')
    .mockResolvedValueOnce(new Response(JSON.stringify({ events: [originalEvent[0]] })))
    .mockRejectedValueOnce(new Error('Failed to delete event'));

  const { result } = renderHook(() => useEventOperations(false));
  await waitFor(() => {
    expect(result.current.events).toEqual([originalEvent[0]]);
  });

  await act(async () => {
    await result.current.deleteEvent(originalEvent[0].id);
  });

  expect(toast).toHaveBeenCalledWith({
    title: '일정 삭제 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });

  expect(fetchSpy).toHaveBeenCalledTimes(2);
});
