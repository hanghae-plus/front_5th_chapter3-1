import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useOverlapModal } from '@/hooks/useOverlapModal';
import { Event } from '@/types';
import { findOverlappingEvents } from '@/utils/eventOverlap';

// * findOverlappingEvents 함수 모킹
vi.mock('@/utils/eventOverlap', () => ({
  findOverlappingEvents: vi.fn(),
}));

describe('useOverlapModal', () => {
  it('초기 상태가 올바르게 설정되어야 한다', () => {
    const { result } = renderHook(() => useOverlapModal());

    expect(result.current.isOverlapModalOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('openModal 함수가 상태를 올바르게 업데이트해야 한다', () => {
    const { result } = renderHook(() => useOverlapModal());
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-05-16',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];

    act(() => {
      result.current.openModal(mockEvents);
    });

    expect(result.current.isOverlapModalOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(mockEvents);
  });

  it('closeModal 함수가 상태를 올바르게 초기화해야 한다', () => {
    const { result } = renderHook(() => useOverlapModal());
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-05-16',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];

    // 먼저 모달 열기
    act(() => {
      result.current.openModal(mockEvents);
    });
    expect(result.current.isOverlapModalOpen).toBe(true);

    // 모달 닫기
    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isOverlapModalOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('isOverlapping 함수가 겹치는 이벤트 유무를 올바르게 반환해야 한다', () => {
    const { result } = renderHook(() => useOverlapModal());
    const mockEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-05-16',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };

    const mockEvents: Event[] = [
      {
        id: '2',
        title: '기존 이벤트',
        date: '2025-05-16',
        startTime: '10:30',
        endTime: '11:30',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];

    // * findOverlappingEvents가 겹치는 이벤트를 반환하는 경우
    vi.mocked(findOverlappingEvents).mockReturnValueOnce([mockEvents[0]]);

    const hasOverlap = result.current.isOverlapping(mockEvent, mockEvents);
    expect(hasOverlap).toBe(true);
    expect(findOverlappingEvents).toHaveBeenCalledWith(mockEvent, mockEvents);

    // * findOverlappingEvents가 빈 배열을 반환하는 경우
    vi.mocked(findOverlappingEvents).mockReturnValueOnce([]);

    const noOverlap = result.current.isOverlapping(mockEvent, mockEvents);
    expect(noOverlap).toBe(false);
  });
  it('openModal 함수를 여러 번 호출할 때 마지막 호출의 데이터로 상태가 업데이트되어야 한다', () => {
    const { result } = renderHook(() => useOverlapModal());

    const firstEvents: Event[] = [
      {
        id: '1',
        title: '첫 번째 이벤트',
        date: '2025-05-16',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];

    const secondEvents: Event[] = [
      {
        id: '2',
        title: '두 번째 이벤트',
        date: '2025-05-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 0,
      },
    ];

    // * 첫 번째 openModal 호출
    act(() => {
      result.current.openModal(firstEvents);
    });
    expect(result.current.overlappingEvents).toEqual(firstEvents);

    // * 두 번째 openModal 호출
    act(() => {
      result.current.openModal(secondEvents);
    });

    // * 마지막 호출의 데이터로 상태가 업데이트되었는지 확인
    expect(result.current.isOverlapModalOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(secondEvents);
    expect(result.current.overlappingEvents).not.toEqual(firstEvents);
  });
});
