import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { setupMockHandlers } from '../../__mocks__/handlersUtils.ts';
import { mockEvents as events } from '../../__mocks__/response/mockEvents.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const mockEvents = events as Event[];

const mockToast = vi.fn();

vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

beforeEach(() => {
  setupMockHandlers(mockEvents);
});

describe('useEventOperations', () => {
  describe('__init__', () => {
    it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
      const { result } = renderHook(() => useEventOperations(false));

      await waitFor(() => result.current.events.length > 0);

      expect(result.current.events).toEqual(mockEvents);

      expect(mockToast).toHaveBeenCalledWith({
        duration: 1000,
        status: 'info',
        title: '일정 로딩 완료!',
      });
    });
  });

  describe('saveEvent', () => {
    it('editing이 false인 경우, 전달한 이벤트가 저장된다.', async () => {
      const newEvent: Event = {
        id: '99',
        title: '일정99',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '일정99 설명',
        location: '집',
        category: '저녁',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const { result } = renderHook(() => useEventOperations(false));

      //not save
      await waitFor(() => expect(result.current.events.length).toBe(mockEvents.length));

      //save
      await waitFor(() => result.current.saveEvent(newEvent));
      expect(result.current.events.length).toBe(mockEvents.length + 1);
    });

    it('editing이 true인 경우, 전달한 이벤트가 업데이트 된다.', async () => {
      const newEvent: Event = {
        id: '1',
        title: '일정1_1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:30',
        description: '일정1 설명',
        location: '집',
        category: '저녁',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const { result } = renderHook(() => useEventOperations(true));
      await waitFor(() => result.current.saveEvent(newEvent));
      console.log(result.current.events[0]);
      console.log(newEvent);
      await waitFor(() => expect(result.current.events[0]).toEqual(newEvent));

      // expect(result.current.events[0]).toEqual(newEvent);
    });
  });

  describe('deleteEvent', () => {
    it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
      const { result } = renderHook(() => useEventOperations(false));

      await waitFor(() => result.current.events.length > 0);

      await waitFor(() => result.current.deleteEvent('1'));
      expect(result.current.events.length).toEqual(mockEvents.length - 1);

      expect(mockToast).toHaveBeenCalledWith({
        title: '일정이 삭제되었습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  describe('네트워크 에러 처리', () => {
    it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
      server.use(
        http.get('/api/events', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
      const { result } = renderHook(() => useEventOperations(false));

      await waitFor(() => result.current.events.length > 0);

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
      const newEvent: Event = {
        id: '99',
        title: '일정99',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '일정99 설명',
        location: '집',
        category: '저녁',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const { result } = renderHook(() => useEventOperations(true));

      await waitFor(() => result.current.saveEvent(newEvent));

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
          return new HttpResponse(null, { status: 500 });
        })
      );

      const { result } = renderHook(() => useEventOperations(false));

      await waitFor(() => result.current.deleteEvent('1'));

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
});
