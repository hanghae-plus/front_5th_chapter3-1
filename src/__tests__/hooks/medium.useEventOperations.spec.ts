import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { Event, EventForm } from '../../types.ts';
import { server } from '../../setupTests.ts';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

describe('useEventOperations', () => {
  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    const events: Event[] = [
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
    ];

    await waitFor(() => {
      expect(result.current.events).toEqual(events);
    });
  });

  it('정의된 이벤트 정보를 기준으로 마지막에 저장된다.', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    const eventForm: EventForm = {
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    act(() => {
      result.current.saveEvent(eventForm);
    });

    await waitFor(() => {
      const { id, ...rest } = result.current.events[result.current.events.length - 1];
      expect(rest).toEqual(eventForm);
      expect(id).toBeDefined();
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '일정이 추가되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    const { result } = renderHook(() => useEventOperations(true));
    const eventToUpdate: Event = {
      id: '1',
      title: '수정된 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '11:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    act(() => {
      result.current.saveEvent(eventToUpdate);
    });

    waitFor(() => {
      const updatedEvent = result.current.events.find((event) => event.id === eventToUpdate.id);
      expect(updatedEvent).toEqual(eventToUpdate);
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    const { result } = renderHook(() => useEventOperations(false));
    const idToDelete = '1';

    act(() => {
      result.current.deleteEvent(idToDelete);
    });

    waitFor(() => {
      expect(result.current.events.length).toBe(0);
    });
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });

    expect(result.current.events).toEqual([]);
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    const { result } = renderHook(() => useEventOperations(true));
    const eventToUpdate: Event = {
      id: '2',
      title: '수정된 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '11:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    act(() => {
      result.current.saveEvent(eventToUpdate);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
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
    const idToDelete = '1';

    act(() => {
      result.current.deleteEvent(idToDelete);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });
});
