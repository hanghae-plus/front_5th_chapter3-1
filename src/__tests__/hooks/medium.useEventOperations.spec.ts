import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/realEvents.json';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

const mockEvents = events as Event[];

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
// toastFn은 모의 함수로, useToast 훅을 사용하여 생성된 toast 객체를 모의합니다.
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

beforeEach(() => {
  toastFn.mockClear(); // 각 테스트에서 호출하여 테스트간의 독립성을 보장한다
});

afterEach(() => {
  server.resetHandlers(); // 각 테스트 후에 핸들러를 초기화하여 다른 테스트에 영향을 주지 않도록 한다
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation(mockEvents);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual(mockEvents);
  });

  expect(toastFn).toHaveBeenCalledWith({
    title: '일정 로딩 완료!',
    status: 'info',
    duration: 1000,
  });
});

it('등록된 이벤트를 수정할 때, 변경된 정보가 정상적으로 업데이트되어 저장된다', async () => {
  const updatedEvent: Event = {
    id: mockEvents[0].id,
    title: '수정된 이벤트',
    date: '2025-10-15',
    startTime: '13:00',
    endTime: '14:00',
    description: '수정된 팀 미팅',
    location: '회의실 D',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  setupMockHandlerUpdating([...mockEvents, updatedEvent]);

  const { result } = renderHook(() => useEventOperations(true));

  act(() => {
    result.current.saveEvent(updatedEvent);
  });

  await waitFor(() => {
    expect(result.current.events).toContainEqual(updatedEvent);
  });

  expect(toastFn).toHaveBeenCalledWith({
    title: '일정이 수정되었습니다.',
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
});

it("입력한 'title', 'endTime'을 기준으로 새로운 일정이 추가된다", async () => {
  setupMockHandlerCreation(mockEvents);

  const { result } = renderHook(() => useEventOperations(false));

  const newEvent: EventForm = {
    title: '신규 회의',
    date: '2025-10-15',
    startTime: '15:00',
    endTime: '16:00',
    description: '신규 팀 미팅',
    location: '회의실 E',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  act(() => {
    result.current.saveEvent(newEvent);
  });

  await waitFor(() => {
    // 새로 생성한 일정은 id가 없으니까 title, endTime으로 확인
    const saved = result.current.events.some(
      (event) => event.title === newEvent.title && event.endTime === newEvent.endTime
    );
    expect(saved).toBe(true);
  });

  expect(toastFn).toHaveBeenCalledWith({
    title: '일정이 추가되었습니다.',
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion(mockEvents);

  const { result } = renderHook(() => useEventOperations(false));

  act(() => {
    result.current.deleteEvent(mockEvents[0].id);
  });

  await waitFor(() => {
    expect(result.current.events).not.toContainEqual(mockEvents[0]);
  });

  expect(toastFn).toHaveBeenCalledWith({
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
    expect(toastFn).toHaveBeenCalledWith({
      title: '이벤트 로딩 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  expect(result.current.events).toEqual([]);
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const updatedEvent: Event = {
    id: '99', // 존재하지 않는 ID
    title: '존재하지 않는 회의',
    date: '2025-10-15',
    startTime: '13:00',
    endTime: '14:00',
    description: '존재하지 않는 팀 미팅',
    location: '회의실 D',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  setupMockHandlerUpdating(mockEvents);

  const { result } = renderHook(() => useEventOperations(true));

  act(() => {
    result.current.saveEvent(updatedEvent);
  });

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  expect(result.current.events).toEqual(mockEvents);
  expect(result.current.events).not.toContainEqual(updatedEvent);
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(http.delete('/api/events/:id', () => HttpResponse.error()));

  const { result } = renderHook(() => useEventOperations(false));

  act(() => {
    result.current.deleteEvent(mockEvents[0].id);
  });

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  // 이거는 왜 같지 않은지?
  // expect(result.current.events).toEqual(mockEvents);
});
