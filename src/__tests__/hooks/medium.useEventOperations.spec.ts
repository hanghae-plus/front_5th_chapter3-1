import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, RepeatType } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';

//todo: Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

function makeEvent(id: string, updatedProperty: Partial<Event> = {}): Event {
  const defaultEvent = {
    id: id,
    title: `이벤트 ${id}`,
    date: formatDate(new Date()),
    startTime: '10:00',
    endTime: '11:00',
    description: `이벤트 ${id} 설명`,
    location: `이벤트 ${id} 장소`,
    category: `이벤트 ${id} 카테고리`,
    repeat: {
      type: 'none' as RepeatType,
      interval: 0,
    },
    notificationTime: 0,
  };
  return { ...defaultEvent, ...updatedProperty };
}

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledOnce();
  });

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
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledOnce();
  });

  const newEvent = makeEvent('2', {
    title: '새로운 회의',
    endTime: '11:00',
  });

  act(() => {
    result.current.saveEvent(newEvent);
  });

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith({
      title: '일정이 추가되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  });
});

it("새로 정의된 'title', 'endTime' 값으로 일정이 업데이트 된다", async () => {
  const { result } = renderHook(() => useEventOperations(true));

  const updatedEvent: Event = {
    id: '1',
    title: '새로운 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '12:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  act(() => {
    result.current.saveEvent(updatedEvent);
  });

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith({
      title: '일정이 수정되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const { result } = renderHook(() =>
    useEventOperations(true, () => {
      console.log('SAVED');
    })
  );
  act(() => {
    result.current.deleteEvent('1');
  });

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith({
      title: '일정이 삭제되었습니다.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ error: '이벤트 로딩 실패' }, { status: 500 });
    })
  );
  renderHook(() => useEventOperations(true));
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
  const { result } = renderHook(() => useEventOperations(true));

  const updatedEvent: Event = {
    id: '2',
    title: '새로운 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '12:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

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
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  // server.use(
  //   http.post(`/api/events/1`, () => {
  //     return HttpResponse.json({ error: '이벤트 로딩 실패' }, { status: 500 });
  //   })
  // );
  // await waitFor(() => {
  //   expect(toastFn).toHaveBeenCalledOnce();
  // });
  // const { result } = renderHook(() => useEventOperations(true));
  // act(() => {
  //   result.current.deleteEvent('1');
  // });
  // await waitFor(() => {
  //   expect(toastFn).toHaveBeenCalledWith({
  //     title: '일정 삭제 실패',
  //     status: 'error',
  //     duration: 3000,
  //     isClosable: true,
  //   });
  // });
});
