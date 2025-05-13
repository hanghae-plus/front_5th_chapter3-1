import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { vi, it, describe, expect, beforeEach } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, RepeatType } from '../../types.ts';

// Chakra UI useToast 훅을 모킹하여 테스트에서 호출 여부를 검증할 수 있도록 함
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

describe('useEventOperations 훅 테스트', () => {
  describe('이벤트 조회 기능', () => {
    beforeEach(() => {
      // 테스트 실행 전 모의 이벤트 데이터 설정
      setupMockHandlerCreation();
      toastFn.mockClear();
    });

    it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
      // Arrange: 모의 데이터 명시적 설정
      const mockEvents = [
        {
          id: '1',
          title: '테스트 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '테스트 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none' as RepeatType, interval: 0 },
          notificationTime: 10,
        },
      ];
      setupMockHandlerCreation(mockEvents);

      // 테스트 상태 확인을 위한 모의 응답 직접 설정
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        })
      );

      // 훅 렌더링
      const { result } = renderHook(() => useEventOperations(false));

      // Act & Assert: 비동기 작업이 완료될 때까지 대기하면서 결과 확인
      await waitFor(
        () => {
          expect(result.current.events.length).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );

      // 로드된 데이터의 구조 확인
      expect(result.current.events[0]).toHaveProperty('id', '1');
      expect(result.current.events[0]).toHaveProperty('title', '테스트 회의');

      // 토스트 메시지가 표시되었는지 확인
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 로딩 완료!',
          status: 'info',
        })
      );
    });
  });

  describe('이벤트 생성 기능', () => {
    beforeEach(() => {
      setupMockHandlerCreation();
      toastFn.mockClear();
    });

    it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
      // Arrange: 저장할 새 이벤트 데이터와 훅 렌더링
      const { result } = renderHook(() => useEventOperations(false));
      const newEvent = {
        title: '새 회의',
        date: '2025-10-20',
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 계획 논의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 15,
      };

      // Act: 이벤트 저장 메서드 호출
      await act(async () => {
        await result.current.saveEvent(newEvent);
      });

      // Assert: 이벤트가 추가되었는지 확인
      expect(result.current.events).toContainEqual(
        expect.objectContaining({
          ...newEvent,
          id: expect.any(String),
        })
      );
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정이 추가되었습니다.',
          status: 'success',
        })
      );
    });
  });

  describe('이벤트 수정 기능', () => {
    beforeEach(() => {
      setupMockHandlerUpdating();
      toastFn.mockClear();
    });

    it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
      // Arrange: 훅 렌더링 및 초기 데이터 로드
      const { result } = renderHook(() => useEventOperations(true));

      // 데이터 로드 대기
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // 기존 이벤트 가져오기
      const eventToUpdate = { ...result.current.events[0] };

      // 업데이트할 내용 정의
      const updatedEventData = {
        ...eventToUpdate,
        title: '수정된 회의 제목',
        endTime: '11:30',
      };

      // Act: 이벤트 업데이트
      await act(async () => {
        await result.current.saveEvent(updatedEventData);
      });

      // Assert: 이벤트가 올바르게 업데이트되었는지 확인
      const updatedEvent = result.current.events.find((e) => e.id === eventToUpdate.id);
      expect(updatedEvent?.title).toBe('수정된 회의 제목');
      expect(updatedEvent?.endTime).toBe('11:30');
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정이 수정되었습니다.',
          status: 'success',
        })
      );
    });
  });

  describe('이벤트 삭제 기능', () => {
    beforeEach(() => {
      setupMockHandlerDeletion();
      toastFn.mockClear();
    });

    it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
      // Arrange: 훅 렌더링 및 초기 데이터 로드
      const { result } = renderHook(() => useEventOperations(false));

      // 데이터 로드 대기
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // 삭제 전 이벤트 수 확인
      const initialEventCount = result.current.events.length;
      expect(initialEventCount).toBeGreaterThan(0);

      // Act: 첫 번째 이벤트 삭제
      await act(async () => {
        await result.current.deleteEvent('1');
      });

      // Assert: 이벤트가 삭제되었는지 확인
      expect(result.current.events.length).toBe(initialEventCount - 1);
      expect(result.current.events.find((e) => e.id === '1')).toBeUndefined();
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정이 삭제되었습니다.',
          status: 'info',
        })
      );
    });
  });

  describe('에러 처리 기능', () => {
    it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
      // Arrange: fetch 함수를 모킹하여 에러 발생 시나리오 설정
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
      toastFn.mockClear();

      // Act: 훅 렌더링으로 자동 데이터 로드 시도
      renderHook(() => useEventOperations(false));

      // Assert: 에러 토스트가 표시되었는지 확인
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '이벤트 로딩 실패',
          status: 'error',
        })
      );
    });

    it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
      // Arrange: 서버 응답 모킹하여 404 에러 발생 시나리오 설정
      server.use(
        http.put('/api/events/999', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      const { result } = renderHook(() => useEventOperations(true));
      toastFn.mockClear();

      // Act: 존재하지 않는 이벤트 수정 시도
      await act(async () => {
        await result.current.saveEvent({ id: '999', title: '존재하지 않는 이벤트' } as Event);
      });

      // Assert: 에러 토스트가 표시되었는지 확인
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 저장 실패',
          status: 'error',
        })
      );
    });

    it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
      // Arrange: fetch 함수를 모킹하여 네트워크 오류 시나리오 설정
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ events: [{ id: '1' }] }) }) // 초기 fetchEvents 성공
        .mockRejectedValueOnce(new Error('Network failure')); // deleteEvent 실패

      const { result } = renderHook(() => useEventOperations(false));
      toastFn.mockClear();

      // 초기 데이터 로드 대기
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Act: 삭제 시도
      await act(async () => {
        await result.current.deleteEvent('1');
      });

      // Assert: 에러 토스트가 표시되었는지 확인
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 삭제 실패',
          status: 'error',
        })
      );
    });
  });
});
