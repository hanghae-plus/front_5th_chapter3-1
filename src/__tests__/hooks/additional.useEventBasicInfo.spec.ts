import { act, renderHook } from '@testing-library/react';

import { useEventBasicInfo } from '../../hooks/useEventBasicInfo';
import { Event } from '../../types';

const mockEvent: Event = {
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
};

it('초기 상태에서는 이벤트 데이터가 없다.', () => {
  const { result } = renderHook(() => useEventBasicInfo());
  expect(result.current).toEqual(
    expect.objectContaining({
      category: '',
      date: '',
      description: '',
      location: '',
      title: '',
    })
  );
});

it('기본 이벤트 정보를 저장할 수 있다.', () => {
  const { result } = renderHook(() => useEventBasicInfo());

  act(() => result.current.setBasicInfo(mockEvent));

  expect(result.current).toEqual(
    expect.objectContaining({
      title: '기존 회의',
      date: '2025-10-15',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
    })
  );
});

it('이벤트 정보를 리셋할 수 있다.', () => {
  const { result } = renderHook(() => useEventBasicInfo());

  act(() => result.current.setBasicInfo(mockEvent));

  expect(result.current).toEqual(
    expect.objectContaining({
      title: '기존 회의',
      date: '2025-10-15',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
    })
  );

  act(() => result.current.resetBasicInfo());

  expect(result.current).toEqual(
    expect.objectContaining({
      category: '',
      date: '',
      description: '',
      location: '',
      title: '',
    })
  );
});
