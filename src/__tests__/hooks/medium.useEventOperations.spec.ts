import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm, RepeatType } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

describe('useEventOperations 훅 테스트', () => {
  beforeEach(() => {
    toastFn.mockClear();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    // 초기 이벤트 데이터 설정
    const initialEvents: Event[] = [
      {
        id: '1',
        title: '테스트 이벤트',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트 설명',
        location: '테스트 장소',
        category: '테스트',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    ];
    
    setupMockHandlerCreation(initialEvents);
    
    const { result } = renderHook(() => useEventOperations(false));
    
    // 비동기 작업이 완료될 때까지 대기
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    
    // 이벤트가 정상적으로 로드되었는지 확인
    expect(result.current.events).toEqual(initialEvents);
    
    // 토스트 메시지가 표시되었는지 확인
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 로딩 완료!',
        status: 'info',
      })
    );
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation([]);
    
    const onSaveMock = vi.fn();
    const { result } = renderHook(() => useEventOperations(false, onSaveMock));
    
    // 초기 이벤트 로딩을 기다림
    await vi.runAllTimersAsync();
    
    // 새 이벤트 생성
    const newEvent: EventForm = {
      title: '새 이벤트',
      date: '2025-10-20',
      startTime: '14:00',
      endTime: '15:00',
      description: '새 이벤트 설명',
      location: '새 장소',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 15,
    };
    
    await act(async () => {
      await result.current.saveEvent(newEvent);
    });
    
    // 이벤트가 추가되었는지 확인
    expect(result.current.events.length).toBeGreaterThan(0);
    expect(result.current.events[0].title).toBe('새 이벤트');
    
    // onSave 콜백이 호출되었는지 확인
    expect(onSaveMock).toHaveBeenCalled();
    
    // 토스트 메시지가 표시되었는지 확인
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 추가되었습니다.',
        status: 'success',
      })
    );
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating();
    
    const onSaveMock = vi.fn();
    const { result } = renderHook(() => useEventOperations(true, onSaveMock));
    
    // 초기 이벤트 로딩을 기다림
    await vi.runAllTimersAsync();
    
    // 기존 이벤트 업데이트 (부분 업데이트 - 필요한 필드만)
    const updatedEventFields = {
      id: '1',
      title: '업데이트된 회의',
      endTime: '11:00',
      date: '2025-10-15',
      startTime: '09:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    };
    
    await act(async () => {
      await result.current.saveEvent(updatedEventFields);
    });
    
    // 이벤트가 업데이트되었는지 확인
    const updatedEventInState = result.current.events.find(event => event.id === '1');
    expect(updatedEventInState).toBeDefined();
    expect(updatedEventInState?.title).toBe('업데이트된 회의');
    expect(updatedEventInState?.endTime).toBe('11:00');
    
    // onSave 콜백이 호출되었는지 확인
    expect(onSaveMock).toHaveBeenCalled();
    
    // 토스트 메시지가 표시되었는지 확인
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 수정되었습니다.',
        status: 'success',
      })
    );
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion();
    
    const { result } = renderHook(() => useEventOperations(false));
    
    // 초기 이벤트 로딩을 기다림
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    
    // 삭제 전 이벤트 확인
    expect(result.current.events.length).toBe(1);
    
    // 이벤트 삭제
    await act(async () => {
      await result.current.deleteEvent('1');
    });
    
    // 이벤트가 삭제되었는지 확인
    expect(result.current.events.length).toBe(0);
    
    // 토스트 메시지가 표시되었는지 확인
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 삭제되었습니다.',
        status: 'info',
      })
    );
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    // API 호출 실패 시뮬레이션
    server.use(
      http.get('/api/events', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    
    const { result } = renderHook(() => useEventOperations(false));
    
    // 초기 이벤트 로딩을 기다림
    await vi.runAllTimersAsync();
    
    // 에러 토스트가 표시되었는지 확인
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
      })
    );
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    // 존재하지 않는 이벤트 업데이트 시뮬레이션
    server.use(
      http.put('/api/events/:id', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );
    
    const { result } = renderHook(() => useEventOperations(true));
    
    // 초기 이벤트 로딩을 기다림
    await vi.runAllTimersAsync();
    
    // 존재하지 않는 이벤트 업데이트 시도
    await act(async () => {
      await result.current.saveEvent({
        id: '999',
        title: '존재하지 않는 이벤트',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '존재하지 않음',
        location: '어딘가',
        category: '기타',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      });
    });
    
    // 에러 토스트가 표시되었는지 확인
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
      })
    );
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    // 네트워크 오류 시뮬레이션
    server.use(
      http.delete('/api/events/:id', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    
    const { result } = renderHook(() => useEventOperations(false));
    
    // 초기 이벤트 로딩을 기다림
    await vi.runAllTimersAsync();
    
    // 이벤트 삭제 시도
    await act(async () => {
      await result.current.deleteEvent('1');
    });
    
    // 에러 토스트가 표시되었는지 확인
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 삭제 실패',
        status: 'error',
      })
    );
  });
});