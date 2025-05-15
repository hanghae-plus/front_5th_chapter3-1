// src/__tests__/hooks/useEventsByDate.spec.ts
import { renderHook } from '@testing-library/react';

import { useEventsByDate } from '@/shared/hooks/useEventsByDate';
import { Event } from '@/types';

describe('useEventsByDate 훅', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: undefined,
      notificationTime: 0,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '',
      repeat: undefined,
      notificationTime: 0,
    },
    {
      id: '3',
      title: '병원 예약',
      date: '2025-07-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: undefined,
      notificationTime: 0,
    },
  ];

  it('날짜별로 이벤트를 정확히 그룹화한다', () => {
    const { result } = renderHook(() => useEventsByDate(mockEvents));
    const grouped = result.current;

    expect(Object.keys(grouped)).toHaveLength(2);
    expect(grouped['2025-07-01']).toHaveLength(2);
    expect(grouped['2025-07-02']).toHaveLength(1);
  });

  it('빈 배열을 넘기면 빈 객체를 반환한다', () => {
    const { result } = renderHook(() => useEventsByDate([]));
    expect(result.current).toEqual({});
  });

  it('같은 날짜에 여러 이벤트가 있어도 누락되지 않는다', () => {
    const { result } = renderHook(() => useEventsByDate(mockEvents));
    expect(result.current['2025-07-01'].map((e) => e.id)).toEqual(['1', '2']);
  });
});
