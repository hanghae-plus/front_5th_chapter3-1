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
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

beforeEach(() => {
  toastFn.mockClear();
});

afterEach(() => {
  server.resetHandlers();
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const events: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-10-22',
      startTime: '09:00',
      endTime: '10:00',
      location: '회의실 A',
      description: '팀 미팅',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  setupMockHandlerCreation(events);
  const { result } = renderHook(() => useEventOperations(false));
  await waitFor(() => {
    expect(result.current.events).toEqual(events);
  });
  // useToast 검증
  expect(toastFn).toHaveBeenCalledWith({
    title: '일정 로딩 완료!',
    status: 'info',
    duration: 1000,
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const events: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-10-22',
      startTime: '09:00',
      endTime: '10:00',
      location: '회의실 A',
      description: '팀 미팅',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '1',
      title: '팀 회의2',
      date: '2025-10-22',
      startTime: '09:00',
      endTime: '10:00',
      location: '회의실 A',
      description: '팀 미팅',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  setupMockHandlerCreation([events[0]]);
  setupMockHandlerUpdating(events);
  const { result } = renderHook(() => useEventOperations(true));
  act(() => {
    result.current.saveEvent(events[1]);
  });
  await waitFor(() => {
    expect(result.current.events).toEqual([events[1]]);
  });
  // useToast 검증
  expect(toastFn).toHaveBeenCalledWith({
    duration: 3000,
    isClosable: true,
    status: 'success',
    title: '일정이 수정되었습니다.',
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerCreation([]);
  const newEvent: Omit<Event, 'id'> = {
    title: '팀 회의',
    date: '2025-10-22',
    startTime: '09:00',
    endTime: '10:00',
    location: '회의실 A',
    description: '팀 미팅',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  const { result } = renderHook(() => useEventOperations(false));
  act(() => {
    result.current.saveEvent(newEvent);
  });
  await waitFor(() => {
    // expect(result.current.events).toEqual([newEvent]); 이렇게해버리면 유저가 작성한 이벤트는 저장되기전까지 아이디가 존재하지않아 테스트 실패 발생. title과 endTime으로 체크
    expect(
      result.current.events.filter(
        (event) => event.title === newEvent.title && event.endTime === newEvent.endTime
      ).length
    ).toBe(1);
  });
  // useToast 검증
  expect(toastFn).toHaveBeenCalledWith({
    duration: 3000,
    isClosable: true,
    status: 'success',
    title: '일정이 추가되었습니다.',
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const events: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-10-22',
      startTime: '09:00',
      endTime: '10:00',
      location: '회의실 A',
      description: '팀 미팅',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  setupMockHandlerCreation(events);
  setupMockHandlerDeletion([
    {
      id: '1',
      title: '팀 회의',
      date: '2025-10-22',
      startTime: '09:00',
      endTime: '10:00',
      location: '회의실 A',
      description: '팀 미팅',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
  const { result } = renderHook(() => useEventOperations(false));
  act(() => {
    result.current.deleteEvent(events[0].id);
  });
  await waitFor(() => {
    expect(result.current.events.length).toBe(0);
  });
  expect(toastFn).toHaveBeenCalledWith({
    title: '일정이 삭제되었습니다.',
    status: 'info',
    duration: 3000,
    isClosable: true,
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // 여기서는 setupMockHandlerCreation을 사용하게되면 핸들러가 요청을 가로채니 직접호출해야할듯?
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.error();
    })
  );
  const { result } = renderHook(() => useEventOperations(false));
  act(() => {
    result.current.fetchEvents();
  });
  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith({
      title: '이벤트 로딩 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', () => {
      return HttpResponse.error();
    })
  );
  const { result } = renderHook(() => useEventOperations(true));
  act(() => {
    result.current.saveEvent({
      id: '1',
      title: '팀 회의',
      date: '2025-10-22',
      startTime: '09:00',
      endTime: '10:00',
      location: '회의실 A',
      description: '팀 미팅',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
  });
  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.error();
    })
  );
  const { result } = renderHook(() => useEventOperations(false));
  act(() => {
    result.current.deleteEvent('1');
  });
  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});
