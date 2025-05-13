import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  server.use(...setupMockHandlerCreation(events as Event[]));
  const { result } = renderHook(() => useEventOperations(false));

  // 데이터 fetch
  await waitFor(() => {
    expect(result.current.events).toEqual(events);
  });

  // toast
  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 로딩 완료!',
    status: 'info',
    duration: 1000,
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  server.use(...setupMockHandlerCreation(events as Event[]));
  const { result } = renderHook(() => useEventOperations(false));

  const newEvent: Event = {
    id: (Number(events[events.length - 1].id) + 1).toString(),
    title: '새로운 이벤트',
    date: '2025-01-01',
    startTime: '2025-01-01',
    endTime: '2025-01-02',
    description: '새로운 이벤트 설명',
    location: '새로운 이벤트 장소',
    category: '새로운 이벤트 카테고리',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  };

  act(() => {
    result.current.saveEvent(newEvent);
  });

  await waitFor(() => {
    expect(result.current.events[result.current.events.length - 1]).toEqual(newEvent);
  });

  // toast
  expect(mockToast).toHaveBeenCalledWith({
    title: '일정이 추가되었습니다.',
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  server.use(...setupMockHandlerUpdating(events as Event[]));
  const { result } = renderHook(() => useEventOperations(true));

  const originalEvent = events[0] as Event;

  const updatedEvent: Event = {
    ...originalEvent,
    title: '업데이트한 이벤트',
    endTime: ' 13:00',
  };

  act(() => {
    result.current.saveEvent(updatedEvent);
  });

  await waitFor(() => {
    expect(result.current.events[0]).toEqual(updatedEvent);
  });

  // toast
  expect(mockToast).toHaveBeenCalledWith({
    title: '일정이 수정되었습니다.',
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  server.use(...setupMockHandlerDeletion(events as Event[]));
  const { result } = renderHook(() => useEventOperations(false));

  act(() => {
    result.current.deleteEvent(events[0].id);
  });

  await waitFor(() => {
    expect(result.current.events.length).toBe(events.length - 1);
  });

  // toast
  expect(mockToast).toHaveBeenCalledWith({
    title: '일정이 삭제되었습니다.',
    status: 'info',
    duration: 3000,
    isClosable: true,
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {});
