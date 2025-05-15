import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils';
import { useEventOperations } from '../../hooks/useEventOperations';
import { server } from '../../setupTests';
import type { Event } from '../../types';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
// ? A) vi.fn()은 스파이 함수이며, 이 함수를 사용하면 함수 호출을 추적해 함수 호출 횟수, 시점, 인자, 반환값 등을 확인할 수 있습니다.
// ? vi.fn()에서 사용할 수 있는 내장 함수는 toHaveBeenCalledTimes(호출횟수), toHaveBeenCalledWith(호출시 인자값), toHaveReturnedWith(반환값) 등이 있습니다.
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

const newEvent: Event = {
  id: '1',
  title: '신규 회의',
  date: '2025-11-01',
  startTime: '14:00',
  endTime: '15:00',
  description: '신규 회의 설명',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 5,
};

it('훅 선언시, 이벤트 초기 데이터가 로드되어야 한다', async () => {
  const initialEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  setupMockHandlerCreation(initialEvents);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => expect(result.current.events).toEqual(initialEvents));
});

it('saveEvent 호출 시, 해당 이벤트가 추가되어야 한다', async () => {
  setupMockHandlerCreation([]);

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => result.current.saveEvent(newEvent));

  expect(result.current.events[0]).toEqual(newEvent);
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 추가되었습니다.',
      status: 'success',
    })
  );
});

it('saveEvent 호출 시, 기존 이벤트의 title과 endTime이 업데이트되어야 한다', async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  const updatedEvent: Event = {
    id: '2',
    title: '수정된 회의 제목',
    date: '2025-10-15',
    startTime: '11:00',
    endTime: '13:00',
    description: '업데이트된 내용',
    location: '회의실 C',
    category: '업무 회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  await act(() => result.current.saveEvent(updatedEvent));

  expect(result.current.events[1]).toEqual(updatedEvent);
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 수정되었습니다.',
      status: 'success',
    })
  );
});

it('deleteEvent 호출 시, id에 해당하는 이벤트가 삭제되어야 한다', async () => {
  setupMockHandlerDeletion();
  const { result } = renderHook(() => useEventOperations(false));
  result.current.saveEvent(newEvent);

  await act(() => result.current.deleteEvent(newEvent.id));

  expect(result.current.events).toHaveLength(0);
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 삭제되었습니다.',
      status: 'info',
    })
  );
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(http.get('/api/events', () => HttpResponse.error()));

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

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되어야 한다", async () => {
  const updatedEvent: Event = {
    id: '?????',
    title: '없는 회의',
    date: '2025-10-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '존재하지 않음',
    location: 'X',
    category: '미정',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  server.use(http.put('/api/events/:id', () => HttpResponse.error()));
  const { result } = renderHook(() => useEventOperations(true));

  await act(() => result.current.saveEvent(updatedEvent));

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 저장 실패',
      status: 'error',
    })
  );
});

it("네트워크 오류 시 '일정 삭제 실패'라는 토스트가 노출되어야 한다", async () => {
  server.use(http.delete('/api/events/:id', () => HttpResponse.error()));
  const { result } = renderHook(() => useEventOperations(false));

  await act(() => result.current.deleteEvent('1'));

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 삭제 실패',
      status: 'error',
    })
  );
});
