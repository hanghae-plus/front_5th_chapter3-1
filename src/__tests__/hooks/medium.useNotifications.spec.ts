import { act, renderHook } from '@testing-library/react';

import realEvents from '@/__mocks__/response/realEvents.json';
import { useNotifications } from '@/hooks/useNotifications.ts';
import type { Event } from '@/types.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(realEvents.events as Event[]));

  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toHaveLength(0);
});

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

it('시작이 임박한 이벤트가 있을 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.setSystemTime(new Date('2025-05-20T09:58'));

  const { result } = renderHook(() => useNotifications(realEvents.events as Event[]));

  act(() => {
    vi.advanceTimersByTime(60 * 1_000);
  });

  expect(result.current.notifications).toEqual([
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      message: '1분 후 팀 회의 일정이 시작됩니다.',
    },
  ]);
  expect(result.current.notifiedEvents).toEqual(['2b7545a6-ebee-426c-b906-2329bc8d62bd']);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.setSystemTime(new Date('2025-05-10T16:59'));

  const { result } = renderHook(() => useNotifications(realEvents.events as Event[]));

  act(() => {
    vi.advanceTimersByTime(60 * 1_000);
  });

  expect(result.current.notifications).toEqual([
    {
      id: '5b68ee07-97ec-4011-b18f-aedbb59607ba',
      message: '10분 후 일정1 일정이 시작됩니다.',
    },
    {
      id: 'cafaa525-f054-4aeb-8f16-4d22f19084f1',
      message: '10분 후 일정2 일정이 시작됩니다.',
    },
  ]);

  act(() => {
    result.current.removeNotification(1);
  });

  expect(result.current.notifications).toEqual([
    {
      id: '5b68ee07-97ec-4011-b18f-aedbb59607ba',
      message: '10분 후 일정1 일정이 시작됩니다.',
    },
  ]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.setSystemTime(new Date('2025-05-10T16:59'));

  const { result } = renderHook(() => useNotifications(realEvents.events as Event[]));

  act(() => {
    vi.advanceTimersByTime(60 * 1_000);
  });

  expect(result.current.notifications).toEqual([
    {
      id: '5b68ee07-97ec-4011-b18f-aedbb59607ba',
      message: '10분 후 일정1 일정이 시작됩니다.',
    },
    {
      id: 'cafaa525-f054-4aeb-8f16-4d22f19084f1',
      message: '10분 후 일정2 일정이 시작됩니다.',
    },
  ]);

  act(() => {
    vi.advanceTimersByTime(60 * 1_000);
  });

  expect(result.current.notifications).toEqual([
    {
      id: '5b68ee07-97ec-4011-b18f-aedbb59607ba',
      message: '10분 후 일정1 일정이 시작됩니다.',
    },
    {
      id: 'cafaa525-f054-4aeb-8f16-4d22f19084f1',
      message: '10분 후 일정2 일정이 시작됩니다.',
    },
  ]);
});
