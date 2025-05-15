import { act, renderHook, waitFor } from '@testing-library/react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
  setupMockHandlerFetchError,
  setupMockHandlerDeletionError,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';
import { getTestEvents } from '../fixtures/eventFactory.ts';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<typeof import('@chakra-ui/react')>('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

const events = getTestEvents('integration');

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  server.use(...setupMockHandlerCreation(events as Event[]));

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => expect(result.current.events).toHaveLength(5));
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  server.use(...setupMockHandlerCreation(events as Event[]));

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent({
      id: 'new-event-id',
      title: '새로운 이벤트',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 이벤트',
      location: '새로운 이벤트',
      category: '새로운 이벤트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    });
  });

  await waitFor(() => expect(result.current.events).toHaveLength(6));
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  server.use(...setupMockHandlerUpdating(events as Event[]));

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent({
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '수정된 이벤트',
      date: '2025-01-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    });
  });

  await waitFor(() => expect(result.current.events).toHaveLength(5));

  expect(result.current.events[0].title).toBe('수정된 이벤트');
  expect(result.current.events[0].startTime).toBe('11:00');
  expect(result.current.events[0].endTime).toBe('12:00');
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  server.use(...setupMockHandlerDeletion(events as Event[]));

  const { result } = renderHook(() => useEventOperations(true));

  act(() => {
    result.current.deleteEvent('2b7545a6-ebee-426c-b906-2329bc8d62bd');
  });

  await waitFor(() => expect(result.current.events).toHaveLength(4));
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(...setupMockHandlerFetchError());

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => expect(result.current.events).toHaveLength(0));

  expect(mockToast).toHaveBeenCalledWith({
    title: '이벤트 로딩 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(...setupMockHandlerUpdating(events as Event[]));

  const { result } = renderHook(() => useEventOperations(true));

  act(() => {
    result.current.saveEvent({
      id: 'non-existent-event-id',
      title: '팀 회의',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    });
  });

  await waitFor(() => expect(result.current.events).toHaveLength(5));

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 저장 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(...setupMockHandlerDeletionError(events as Event[]));

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => expect(result.current.events).toHaveLength(5));
  act(() => result.current.deleteEvent('non-existent-event-id'));

  mockToast.mockClear(); // 초기 로딩 토스트 클리어
  act(() => result.current.deleteEvent('non-existent-event-id'));

  await waitFor(() => {
    expect(mockToast).toHaveBeenCalledWith({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  expect(result.current.events).toHaveLength(5);
});
