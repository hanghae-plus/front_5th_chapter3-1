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
import { mockTestData } from '../data/mockTestData.ts';

const mockToast = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const originalChakraUi = await vi.importActual('@chakra-ui/react');
  return {
    ...originalChakraUi,
    useToast: () => mockToast,
  };
});

describe('useEventOperations 이벤트 crud 기능 테스트', () => {
  const { handlers } = setupMockHandlerCreation(events as Event[]);
  beforeEach(() => {
    server.use(...handlers);
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(events);
    });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.saveEvent(mockTestData);
    });

    await waitFor(() => {
      expect(result.current.events).toContainEqual(mockTestData);
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    const { handlers } = setupMockHandlerDeletion(events as Event[]);
    server.use(...handlers);

    const { result } = renderHook(() => useEventOperations(false));

    const targetId = events[0].id;

    await act(async () => {
      await result.current.deleteEvent(targetId);
    });

    await waitFor(() => {
      expect(result.current.events.some((e) => e.id === targetId)).toBe(false);
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    const { handlers } = setupMockHandlerUpdating(events as Event[]);
    server.use(...handlers);

    const updatedEvent = {
      ...events[0],
      title: 'updated title',
      endTime: '12:00',
    };

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent(updatedEvent as Event);
    });

    await waitFor(() => {
      expect(result.current.events).toContainEqual(updatedEvent);
    });
  });
});

describe('useEventOperations 에러 처리', () => {
  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        throw new Error('Network error');
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    const { handlers } = setupMockHandlerUpdating(events as Event[]);
    server.use(...handlers);

    const { result } = renderHook(() => useEventOperations(true));

    const updatedEvent = {
      id: '4',
      date: '2025-05-27',
      title: 'Event D',
      startTime: '13:00',
      endTime: '14:00',
      description: '새로운 팀 미팅',
      location: '회의실 D',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 20,
    } as Event;

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        throw new Error('Network error');
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent(events[0].id);
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });
});
