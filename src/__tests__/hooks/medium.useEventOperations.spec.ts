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

const MOCK_EVENTS: Event[] = [
  {
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '팀 회의',
    date: '2025-05-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
    title: '점심 약속',
    date: '2025-05-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
    title: '프로젝트 마감',
    date: '2025-05-25',
    startTime: '09:00',
    endTime: '18:00',
    description: '분기별 프로젝트 마감',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'dac62941-69e5-4ec0-98cc-24c2a79a7f81',
    title: '생일 파티',
    date: '2025-05-28',
    startTime: '19:00',
    endTime: '22:00',
    description: '친구 생일 축하',
    location: '친구 집',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '80d85368-b4a4-47b3-b959-25171d49371f',
    title: '운동',
    date: '2025-05-22',
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation(MOCK_EVENTS);
  const { result } = renderHook(() => useEventOperations(false));

  // 데이터 fetch
  await waitFor(() => {
    expect(result.current.events).toEqual(MOCK_EVENTS);
  });

  // toast
  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 로딩 완료!',
    status: 'info',
    duration: 1000,
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(MOCK_EVENTS);
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

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(http.get('/api/events', () => HttpResponse.error()));

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(mockToast).toHaveBeenCalledWith({
      title: '이벤트 로딩 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  expect(result.current.events).toEqual([]);
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(...setupMockHandlerUpdating(events as Event[]));
  const { result } = renderHook(() => useEventOperations(true));

  const event = events[0] as Event;

  const updatedEvent: Event = {
    ...event,
    id: '2',
    title: '업데이트한 이벤트',
  };

  act(() => {
    result.current.saveEvent(updatedEvent);
  });

  await waitFor(() => {
    expect(mockToast).toHaveBeenCalledWith({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  expect(result.current.events).toEqual(events);
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(http.delete('/api/events/:id', () => HttpResponse.error()));
  const { result } = renderHook(() => useEventOperations(false));

  act(() => {
    result.current.deleteEvent(events[0].id);
  });

  await waitFor(() => {
    expect(mockToast).toHaveBeenCalledWith({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  expect(result.current.events).toEqual(events);
});
