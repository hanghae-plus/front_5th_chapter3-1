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

let mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const chakra = await vi.importActual('@chakra-ui/react');
  return {
    ...chakra,
    useToast: () => mockToast,
  };
});

/**
 * @description useEventOperations -> 이벤트 조회, 저장, 삭제, 수정 기능
 */
describe('이벤트 조회, 저장, 삭제, 수정 기능 (useEventOperations)', () => {
  beforeEach(() => {
    setupMockHandlerCreation(events as Event[]);
  });

  /**
   * @description 저장되어있는 초기 이벤트 데이터를 적절하게 불러온다 -> 저장되어있는 초기 이벤트 데이터 정보를 모두 불러온다.
   */
  it('저장되어있는 초기 이벤트 데이터 정보를 모두 불러온다.', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(events);
    });

    expect(result.current.events).toHaveLength(1);
  });

  /**
   * @description 정의된 이벤트 정보를 기준으로 적절하게 저장이 된다 -> 새로운 이벤트 정보가 저장이 된다.
   */
  it('새로운 이벤트 정보가 저장이 된다.', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    const newEvent: Event = {
      ...events[0],
      id: '2',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '2021-01-01',
      },
    };

    await act(() => {
      result.current.saveEvent(newEvent);
    });

    expect(result.current.events).toHaveLength(2);
  });

  /**
   * @description 새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다 -> 'title', 'endTime'이 변경된 값으로 일정이 업데이트 된다.
   */
  it("'title', 'endTime'이 변경된 값으로 일정이 업데이트 된다.", async () => {
    const { result } = renderHook(() => useEventOperations(true));
    const updateEvent: Event = {
      ...events[0],
      title: '기존 회의 변경',
      endTime: '11:00',
      repeat: {
        type: 'none' as const,
        interval: 1,
        endDate: '2021-01-01',
      },
    };

    await act(() => {
      setupMockHandlerUpdating(events[0].id, updateEvent);
      result.current.saveEvent(updateEvent);
    });

    expect(result.current.events).toEqual([updateEvent]);
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    await act(() => {
      setupMockHandlerDeletion(events[0].id);
      result.current.deleteEvent(events[0].id);
    });

    expect(result.current.events).toEqual([]);
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => {
      result.current.fetchEvents();
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '이벤트 로딩 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    server.use(
      http.put('/api/events/:id', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(() => {
      result.current.saveEvent(events[0] as Event);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => {
      result.current.deleteEvent(events[0].id);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});
