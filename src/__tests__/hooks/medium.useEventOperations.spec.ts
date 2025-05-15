import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

beforeEach(() => {
  mockToast.mockClear();
});

it('저장되어있는 초기 이벤트 데이터를 이벤트 갯수에 맞게 불러온다', async () => {
  const initialEvent: Event = {
    category: '업무',
    date: '2025-05-10',
    id: '1',
    title: '팀 회의',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  setupMockHandlerCreation([initialEvent]);

  const { result } = renderHook(() => useEventOperations(false));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(result.current.events).toHaveLength(1);
  expect(mockToast).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 로딩 완료!',
      status: 'info',
    })
  );
});

it('저장되어있는 초기 이벤트 기준으로 다음 index에 저장이 된다', async () => {
  const initialEvent: Event = {
    category: '업무',
    date: '2025-07-04',
    id: '1',
    title: '생일',
    startTime: '10:00',
    endTime: '11:00',
    description: '생일이에여',
    location: '회의실 A',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  const newEvent: Event = {
    category: '개인',
    date: '2025-07-05',
    id: '2',
    title: '팀 회의',
    startTime: '10:00',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당"',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  setupMockHandlerCreation([initialEvent]);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toEqual([initialEvent, newEvent]);
  expect(mockToast).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 추가되었습니다.',
      status: 'success',
    })
  );
});

it("새로 정의된 'title', 'endTime' 기준 새로운 일정으로 업데이트 된다", async () => {
  const initialEvent: Event = {
    category: '업무',
    date: '2025-10-04',
    id: '1',
    title: '생일',
    startTime: '10:00',
    endTime: '11:00',
    description: '생일이에여',
    location: '회의실 A',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  const updatedEvent: Event = {
    category: '개인',
    date: '2025-10-05',
    id: '1',
    title: '팀 회의',
    startTime: '10:00',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당"',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  setupMockHandlerUpdating([initialEvent]);

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(result.current.events).toEqual([updatedEvent]);
  expect(mockToast).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 수정되었습니다.',
      status: 'success',
    })
  );
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const initialEvent: Event = {
    category: '업무',
    date: '2025-07-04',
    id: '1',
    title: '생일',
    startTime: '10:00',
    endTime: '11:00',
    description: '생일이에여',
    location: '회의실 A',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  setupMockHandlerDeletion([initialEvent]);

  const { result } = renderHook(() => useEventOperations(false));
  await act(async () => {
    await result.current.deleteEvent('1');
  });
  expect(result.current.events).toHaveLength(0);
  expect(mockToast).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 삭제되었습니다.',
      status: 'info',
    })
  );
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );
  renderHook(() => useEventOperations(false));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(mockToast).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '이벤트 로딩 실패',
      status: 'error',
    })
  );
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const emptyEvent: Event = {
    category: '업무',
    date: '2025-10-04',
    id: '-1',
    title: '존재하지 않는 이벤트',
    startTime: '10:00',
    endTime: '11:00',
    description: '생일이에여',
    location: '회의실 A',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  server.use(
    http.put('/api/events/:id', () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));
  await act(async () => {
    await result.current.saveEvent(emptyEvent);
  });

  expect(mockToast).toHaveBeenCalledWith(
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

  expect(mockToast).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 삭제 실패',
      status: 'error',
    })
  );
});
