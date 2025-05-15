import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { createTestEvent } from '../helpers/event.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?

/**
 * vi.mock
 * - @chakra-ui/react 라이브러리를 모킹하기 위한 함수
 * - useToast 함수만 toastFn을 반환하도록 설정
 *
 * vi.fn
 * - 함수 호출에 대한 추적용 모의 함수
 */

const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

describe('이벤트 CRUD 작업 테스트', () => {
  beforeEach(() => {
    toastFn.mockClear();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const initialEvents = [
      createTestEvent({
        id: '1',
        title: '테스트 이벤트',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ];

    setupMockHandlerCreation(initialEvents);

    const editing = false;
    const { result } = renderHook(() => useEventOperations(editing));

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 로딩 완료!',
        })
      );
    });

    expect(result.current.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          title: '테스트 이벤트',
        }),
      ])
    );
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation([]);

    const editing = false;
    const onSave = vi.fn();
    const { result } = renderHook(() => useEventOperations(editing, onSave));

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 로딩 완료!',
        })
      );
    });

    toastFn.mockClear();

    const newEvent = createTestEvent({
      id: '1',
      title: '테스트 이벤트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
    });

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정이 추가되었습니다.',
          status: 'success',
        })
      );
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events).toEqual(
      expect.arrayContaining([expect.objectContaining(newEvent)])
    );
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating();

    const editing = true;
    const onSave = vi.fn();
    const { result } = renderHook(() => useEventOperations(editing, onSave));

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 로딩 완료!',
        })
      );
    });

    toastFn.mockClear();

    const [existingEvent] = result.current.events;

    expect(existingEvent).toEqual(
      expect.objectContaining({
        id: '1',
        title: '기존 회의',
        endTime: '10:00',
      })
    );
    const updatedEvent = createTestEvent({
      ...existingEvent,
      title: '수정된 회의',
      endTime: '11:00',
    });

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정이 수정되었습니다.',
        })
      );
    });

    expect(result.current.events).toHaveLength(2);
    expect(result.current.events).toContainEqual(
      expect.objectContaining({
        title: '수정된 회의',
        endTime: '11:00',
      })
    );
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion();

    const editing = false;
    const { result } = renderHook(() => useEventOperations(editing));

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 로딩 완료!',
        })
      );
    });

    toastFn.mockClear();

    expect(result.current.events).toHaveLength(1);

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정이 삭제되었습니다.',
          status: 'info',
        })
      );
    });

    expect(result.current.events).toHaveLength(0);
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.error();
      })
    );

    const editing = false;
    renderHook(() => useEventOperations(editing));

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '이벤트 로딩 실패',
          status: 'error',
        })
      );
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    setupMockHandlerUpdating();

    server.use(
      http.put('/api/events/:id', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const editing = true;
    const onSave = vi.fn();
    const { result } = renderHook(() => useEventOperations(editing, onSave));

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 로딩 완료!',
        })
      );
    });

    toastFn.mockClear();

    await act(async () => {
      await result.current.saveEvent(
        createTestEvent({
          id: `${result.current.events.length + 1}`,
        })
      );
    });

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 저장 실패',
          status: 'error',
        })
      );
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    const events = [
      createTestEvent({
        id: '1',
        title: '테스트 이벤트',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ];

    setupMockHandlerCreation(events);

    server.use(
      http.delete('/api/events/:id', () => {
        throw new Error('Network Error');
      })
    );

    const editing = false;
    const { result } = renderHook(() => useEventOperations(editing));

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 로딩 완료!',
        })
      );
    });

    expect(result.current.events).toHaveLength(1);

    toastFn.mockClear();

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 삭제 실패',
        })
      );
    });

    expect(result.current.events).toHaveLength(1);
  });
});
