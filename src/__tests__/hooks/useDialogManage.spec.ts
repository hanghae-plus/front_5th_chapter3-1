import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useDialogManage } from '../../hooks/useDialogManage';
import { Event } from '../../types';

const mockEvents: Event[] = [
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
  {
    id: '2',
    title: '기존 회의2',
    date: '2025-10-15',
    startTime: '09:30',
    endTime: '10:10',
    description: '팀 미팅2',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('useDialogManage', () => {
  it('초기 상태를 올바르게 반환해야 한다', () => {
    const { result } = renderHook(() => useDialogManage());

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
    expect(result.current.cancelRef.current).toBeNull();
  });

  it('openOverlapDialog가 상태를 열고 이벤트를 설정해야 한다', () => {
    const { result } = renderHook(() => useDialogManage());

    act(() => {
      result.current.openOverlapDialog(mockEvents);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(mockEvents);
  });

  it('closeOverlapDialog가 다이얼로그를 닫아야 한다', () => {
    const { result } = renderHook(() => useDialogManage());

    act(() => {
      result.current.openOverlapDialog(mockEvents);
      result.current.closeOverlapDialog();
    });

    expect(result.current.isOverlapDialogOpen).toBe(false);
  });
});
