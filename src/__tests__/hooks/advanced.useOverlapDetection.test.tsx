import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useOverlapDetection } from '../../hooks/useOverlapDetection';
import { Event } from '../../types';

describe('useOverlapDetection', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '미팅',
      date: '2023-10-20',
      startTime: '10:00',
      endTime: '11:00',
      category: 'work',
      description: '',
      location: '',
      notificationTime: 0,
      repeat: { type: 'none', interval: 0 },
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2023-10-20',
      startTime: '12:00',
      endTime: '13:00',
      category: 'personal',
      description: '',
      location: '',
      notificationTime: 0,
      repeat: { type: 'none', interval: 0 },
    },
  ];

  it('중첩되지 않는 이벤트를 확인할 때 중첩 다이얼로그가 뜨지 않아야 한다', () => {
    const { result } = renderHook(() => useOverlapDetection({ events: mockEvents }));

    const newEvent: Event = {
      id: '3',
      title: '새 약속',
      date: '2023-10-20',
      startTime: '14:00',
      endTime: '15:00',
      category: 'personal',
      description: '',
      location: '',
      notificationTime: 0,
      repeat: { type: 'none', interval: 0 },
    };

    let hasOverlap;
    act(() => {
      hasOverlap = result.current.checkEventOverlap(newEvent);
    });

    expect(hasOverlap).toBe(false);
    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toHaveLength(0);
  });

  it('중첩되는 이벤트를 확인할 때 중첩 다이얼로그가 떠야한다', () => {
    const { result } = renderHook(() => useOverlapDetection({ events: mockEvents }));

    const overlappingEvent: Event = {
      id: '4',
      title: '중첩 약속',
      date: '2023-10-20',
      startTime: '10:00',
      endTime: '11:00',
      category: 'personal',
      description: '',
      location: '',
      notificationTime: 0,
      repeat: { type: 'none', interval: 0 },
    };

    let hasOverlap;
    act(() => {
      hasOverlap = result.current.checkEventOverlap(overlappingEvent);
    });

    expect(hasOverlap).toBe(true);
    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toHaveLength(1);
    expect(result.current.overlappingEvents[0].id).toBe('1');
  });

  it('동일한 ID를 가진 이벤트를 편집할 때는 해당 이벤트와의 중첩을 무시해야 한다', () => {
    const { result } = renderHook(() => useOverlapDetection({ events: mockEvents }));

    const editedEvent: Event = {
      id: '1',
      title: '미팅 수정',
      date: '2023-10-20',
      startTime: '10:00',
      endTime: '11:30',
      category: 'work',
      description: '',
      location: '',
      notificationTime: 0,
      repeat: { type: 'none', interval: 0 },
    };

    let hasOverlap;
    act(() => {
      hasOverlap = result.current.checkEventOverlap(editedEvent, '1');
    });

    expect(hasOverlap).toBe(false);
    expect(result.current.isOverlapDialogOpen).toBe(false);
  });
});
