import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import eventsData from '../../__mocks__/response/realEvents.json';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요? =
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

const newEvent: Event = {
  id: `${eventsData.events.length + 1}`,
  title: '공연',
  date: '2025-07-22',
  startTime: '20:00',
  endTime: '21:00',
  description: '뮤지컬 관람',
  location: '예술의 전당',
  category: '개인',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 1,
};

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation(eventsData.events as Event[]);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual(eventsData.events);
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(eventsData.events as Event[]);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toEqual([...eventsData.events, newEvent]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  const updatedEvent: Event = {
    id: '1',
    title: '수정된 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '11:00',
    description: '수정된 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  const updated = result.current.events.find((e) => e.id === '1');

  expect(updated).toMatchObject({
    title: '수정된 회의',
    endTime: '11:00',
  });
  expect(result.current.events).toHaveLength(2);
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
  server.use(http.get('/api/events', () => HttpResponse.error()));

  renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({ title: '이벤트 로딩 실패', status: 'error' })
    );
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(http.put('/api/events/:id', () => HttpResponse.json({}, { status: 404 })));

  const { result } = renderHook(() => useEventOperations(true));

  const fakeEvent: Event = {
    id: '999',
    title: '없는 일정',
    date: '2025-12-31',
    startTime: '12:00',
    endTime: '13:00',
    description: '존재하지 않음',
    location: '가짜 장소',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  await act(async () => {
    await result.current.saveEvent(fakeEvent);
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({ title: '일정 저장 실패', status: 'error' })
  );
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(http.delete('/api/events/:id', () => HttpResponse.error()));

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({ title: '일정 삭제 실패', status: 'error' })
  );
});
