import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
// toastFn은 가짜 함수
const toastFn = vi.fn();

//  vi.mock은 모듈을 모킹 => @chakra-ui/react를 다르게 사용한다 모킹?
// import { useToast } from '@chakra-ui/react';
// useToast는 @chakra-ui/react의 메서드
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

it('저장되어있는 초기 이벤트 데이터를 불러온다', async () => {
  setupMockHandlerCreation(events as Event[]);
  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual([
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
    ]);
    expect(toastFn).toHaveBeenCalledWith({
      title: '일정 로딩 완료!',
      status: 'info',
      duration: 1000,
    });
  });
});

it('정의된 이벤트 정보를 기준으로 이벤트가 저장 된다', async () => {
  setupMockHandlerCreation(events as Event[]);
  const { result } = renderHook(() => useEventOperations(false));

  const newEvent: Event = {
    id: `${events.length + 1}`,
    title: '새로운 이벤트',
    date: '2025-05-15',
    startTime: '17:10',
    endTime: '18:10',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  await waitFor(() => {
    expect(result.current.events).toEqual([
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
      {
        id: `${events.length + 1}`,
        title: '새로운 이벤트',
        date: '2025-05-15',
        startTime: '17:10',
        endTime: '18:10',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);
    expect(toastFn).toHaveBeenCalledWith({
      title: '일정이 추가되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 일정이 수정된다", async () => {
  setupMockHandlerUpdating();
  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events.length).toBeGreaterThan(0);
  });

  const updatedData: Event = {
    ...result.current.events[0],
    title: '수정된 이벤트',
    endTime: '12:10',
  };

  await act(async () => {
    await result.current.saveEvent(updatedData);
  });

  await waitFor(() => {
    expect(result.current.events).toEqual([
      {
        id: '1',
        title: '수정된 이벤트',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '12:10',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '기존 회의2',
        date: '2025-10-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '기존 팀 미팅 2',
        location: '회의실 C',
        category: '업무 회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 5,
      },
    ]);
    expect(toastFn).toHaveBeenCalledWith({
      title: '일정이 수정되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();
  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events.length).toBeGreaterThan(0);
  });

  const targetId = result.current.events[0].id;

  await act(async () => await result.current.deleteEvent(targetId));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(0);
    expect(toastFn).toHaveBeenCalledWith({
      title: '일정이 삭제되었습니다.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(http.get('/api/events', () => HttpResponse.error()));

  renderHook(() => useEventOperations(false));

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
  server.use(http.put('/api/events/:id', () => HttpResponse.error()));

  const { result } = renderHook(() => useEventOperations(true));
  const updatedData: Event = {
    id: 'delete-id',
    title: '팀 회의',
    date: '2025-05-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  };

  await act(async () => {
    await result.current.saveEvent(updatedData);
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
  server.use(http.delete('/api/events/:id', () => HttpResponse.error()));

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.deleteEvent('delete-id');
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
