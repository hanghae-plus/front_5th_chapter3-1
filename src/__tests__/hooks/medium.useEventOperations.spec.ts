import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations';
import { server } from '../../setupTests';
import { Event } from '../../types';

const toastFn = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => toastFn,
}));

describe('useEventOperations', () => {
  describe('초기 이벤트 데이터 로드', () => {
    it('초기 이벤트 데이터가 없으면 빈 배열을 반환한다', async () => {
      setupMockHandlerCreation();
      const { result } = renderHook(() => useEventOperations(false));

      expect(result.current.events).toEqual([]);
    });

    it('초기 이벤트 데이터가 있으면 그 데이터를 반환한다', async () => {
      const event: Event = {
        id: '1',
        title: '테스트 제목',
        description: '테스트 설명',
        location: '테스트 위치',
        date: '2025-05-14',
        startTime: '10:00',
        endTime: '11:00',
        category: 'event',
        repeat: {
          type: 'daily',
          interval: 1,
        },
        notificationTime: 10,
      };
      setupMockHandlerCreation([event]);
      const { result } = renderHook(() => useEventOperations(false));

      await waitFor(() => {
        expect(result.current.events).toEqual([event]);
      });

      expect(result.current.events).toHaveLength(1);
    });
  });

  describe('이벤트 저장, 수정, 삭제', () => {
    beforeEach(() => {
      setupMockHandlerCreation(events as Event[]);
    });

    it('정의된 이벤트 정보가 새로 저장이 된다', async () => {
      const event: Event = {
        id: '2',
        title: '테스트 제목',
        description: '테스트 설명',
        location: '테스트 위치',
        date: '2025-05-14',
        startTime: '10:00',
        endTime: '11:00',
        category: 'event',
        repeat: {
          type: 'daily',
          interval: 1,
        },
        notificationTime: 10,
      };
      const { result } = renderHook(() => useEventOperations(false));

      act(() => {
        result.current.saveEvent(event);
      });

      await waitFor(() => {
        expect(result.current.events[1]).toEqual(event);
      });

      expect(result.current.events).toHaveLength(2);
    });

    it("변경된 'title', 'endTime' 값으로 일정이 업데이트 된다", async () => {
      const { result } = renderHook(() => useEventOperations(true));
      const updatedEvent: Event = {
        ...events[0],
        title: '타이틀 수정 테스트',
        endTime: '11:00',
        repeat: {
          type: 'none',
          interval: 0,
        },
      };

      act(() => {
        setupMockHandlerUpdating();
        result.current.saveEvent(updatedEvent);
      });

      await waitFor(() => {
        expect(result.current.events).toHaveLength(2);
        expect(result.current.events[0]).toEqual(updatedEvent);
      });
    });

    it('존재하는 이벤트 삭제 시 에러 없이 아이템이 삭제된다.', async () => {
      const { result } = renderHook(() => useEventOperations(false));

      act(() => {
        setupMockHandlerDeletion();
        result.current.deleteEvent('1');
      });

      await waitFor(() => {
        expect(result.current.events).toEqual([]);
      });
    });
  });

  describe('이벤트 로딩 실패', () => {
    it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
      // GET 요청에 대해 강제로 실패 응답을 반환하도록 서버 핸들러를 설정
      server.use(
        http.get(
          '/api/events',
          () =>
            new HttpResponse(JSON.stringify({ error: '이벤트 로딩 실패' }), {
              status: 500,
            })
        )
      );

      const { result } = renderHook(() => useEventOperations(false));

      await waitFor(() => {
        expect(toastFn).toHaveBeenCalledWith({
          title: '이벤트 로딩 실패',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        expect(result.current.events).toEqual([]);
      });
    });

    it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
      setupMockHandlerCreation();
      const { result } = renderHook(() => useEventOperations(true));

      const nonExistentEvent: Event = {
        id: '999',
        title: 'non-existent',
        description: 'non-existent',
        location: 'test',
        date: '2025-06-01',
        startTime: '10:00',
        endTime: '11:00',
        category: 'event',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      };

      act(() => {
        result.current.saveEvent(nonExistentEvent);
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
        http.delete(
          '/api/events/:id',
          () =>
            new HttpResponse(null, {
              status: 500,
            })
        )
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
      expect(result.current.events).toHaveLength(1);
    });
  });
});
