import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  return {
    useToast: () => mockToast,
  };
});

describe('useEventOperations 훅 테스트', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-10-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심 식사',
      location: '수원역',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const { handler, getHandler } = setupMockHandlerCreation(mockEvents);
    server.use(handler, getHandler);

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });

    expect(result.current.events[0].title).toBe('팀 회의');
    expect(result.current.events[1].title).toBe('점심 약속');
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 로딩 완료!',
        status: 'info',
      })
    );
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    const onSaveMock = vi.fn();
    const { result } = renderHook(() => useEventOperations(false, onSaveMock));

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });

    const newEvent = {
      title: '새 미팅',
      date: '2025-10-05',
      startTime: '15:00',
      endTime: '16:00',
      description: '신규 프로젝트 미팅',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 15,
    };

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    expect(onSaveMock).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 추가되었습니다.',
        status: 'success',
      })
    );
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    const onSaveMock = vi.fn();
    const { result } = renderHook(() => useEventOperations(true, onSaveMock));

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });

    const updatedEvent = {
      id: '1',
      title: '팀 회의 (수정됨)',
      date: '2025-10-01',
      startTime: '10:00',
      endTime: '12:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    expect(onSaveMock).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 수정되었습니다.',
        status: 'success',
      })
    );
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 삭제되었습니다.',
        status: 'info',
      })
    );
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.error();
      })
    );

    renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '이벤트 로딩 실패',
          status: 'error',
        })
      );
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    const { handler, getHandler } = setupMockHandlerUpdating(mockEvents);

    server.use(getHandler, handler);

    const { result } = renderHook(() => useEventOperations(true));

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });

    const nonExistentEvent = {
      id: '999',
      title: '존재하지 않는 이벤트',
      date: '2025-10-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '테스트',
      category: '테스트',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(nonExistentEvent);
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
      })
    );
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 삭제 실패',
        status: 'error',
      })
    );
  });
});
