import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { createNotificationMessage } from '../../utils/notificationUtils.ts';
import { MOCK_DATA } from '../mock.ts';

describe('useNotifications 테스트', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-05-20T09:59:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(MOCK_DATA));

    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
    const { result } = renderHook(() => useNotifications(MOCK_DATA));
    expect(result.current.notifications).toEqual([]);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual([
      {
        id: MOCK_DATA[0].id,
        message: createNotificationMessage(MOCK_DATA[0]),
      },
    ]);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
    const { result } = renderHook(() => useNotifications(MOCK_DATA));
    expect(result.current.notifications).toEqual([]);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual([
      {
        id: MOCK_DATA[0].id,
        message: createNotificationMessage(MOCK_DATA[0]),
      },
    ]);

    await act(async () => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toEqual([]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
    const { result } = renderHook(() => useNotifications(MOCK_DATA));
    expect(result.current.notifications).toEqual([]);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual([
      {
        id: MOCK_DATA[0].id,
        message: createNotificationMessage(MOCK_DATA[0]),
      },
    ]);

    await act(async () => {
      vi.advanceTimersByTime(1000 * 30);
    });

    expect(result.current.notifications).toEqual([
      {
        id: MOCK_DATA[0].id,
        message: createNotificationMessage(MOCK_DATA[0]),
      },
    ]);
  });
});
