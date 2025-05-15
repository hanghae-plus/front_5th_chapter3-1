import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?

// Answer
// toastFn: 빈 mocking 함수를 만들어낸다. () => {} 가 생성되는 것과 비슷.
// mock: 테스트 대상 파일에서 import 해서 사용한 function이나 object를 mocking 할 수 있다. 
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

const newEvent: Event[] = [
  {
    "id": "1",
    "title": "기존 회의",
    "date": "2025-10-15",
    "startTime": "09:00",
    "endTime": "10:00",
    "description": "기존 팀 미팅",
    "location": "회의실 B",
    "category": "업무",
    "repeat": { "type": "none", "interval": 0 },
    "notificationTime": 10
  }
]

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const initialEvents: Event[] = newEvent;
  setupMockHandlerCreation(initialEvents);

  const { result } = renderHook(()=> useEventOperations(false));

  await waitFor(() => expect(result.current.events).toEqual(initialEvents));
});


it('saveEvent 호출 시 새로운 이벤트가 저장된다.', async () => {
  setupMockHandlerCreation([]);

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => result.current.saveEvent(newEvent[0]));

  expect(result.current.events[0]).toEqual(newEvent);
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 추가되었습니다.',
      status: 'success',
    })
  );

});

it("saveEvent 호출 시 기존 이벤트의 title과 endtime이 업데이트 되어야 한다. ", async () => {
  setupMockHandlerUpdating();
  const { result } = renderHook(() => useEventOperations(true));

  const updateEvents: Event = {
    "id": "2",
    "title": "업데이트 된 회의 내역",
    "date": "2025-10-15",
    "startTime": "09:00",
    "endTime": "23:00",
    "description": "업데이트 된 팀 미팅",
    "location": "회의실 B",
    "category": "업무",
    "repeat": { "type": "none", "interval": 0 },
    "notificationTime": 10
  }

  await act(() => result.current.saveEvent(updateEvents))

  expect(result.current.events[1]).toEqual(updateEvents);
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 수정되었습니다.',
      status: 'success',
    })
  );

});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();
  const { result } = renderHook(() => useEventOperations(false))
  result.current.saveEvent(newEvent[0]);

  await act(() => result.current.deleteEvent(newEvent[0].id))

  expect(result.current.events).toHaveLength(0);
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 삭제되었습니다.',
      status: 'info'
    })
  )

});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(http.get('/api/events', () => HttpResponse.error()));
  renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error'
      })
    )
  })
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const updateEvent: Event = {
    id: '?',
    title: '존재하지 않는 회의',
    date: '2025-12-22',
    startTime: '10:50',
    endTime: '11:00',
    description: '존재하지 않음',
    location: 'X',
    category: '미정',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  }

  server.use(http.put('/api/events/:id', () => HttpResponse.error()));
  const { result } = renderHook(() => useEventOperations(true));

  await act(() => result.current.saveEvent(updateEvent));

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
